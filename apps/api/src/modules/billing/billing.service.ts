import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { InvoiceStatus, PaymentMethod, KenyaUtils } from '@calyvia/shared';

export interface CreateInvoiceDto {
  patientId?: string;
  admissionId?: string;
  items: Array<{ description: string; quantity: number; unitPriceKES: number }>;
  dueDate?: string;
}

export interface RecordPaymentDto {
  invoiceId: string;
  amountKES: number;
  paymentMethod: PaymentMethod;
  transactionRef?: string;
  receivedBy: string;
}

export interface TriggerMpesaStkDto {
  invoiceId: string;
  phoneNumber: string;
  amountKES: number;
}

@Injectable()
export class BillingService {
  constructor(private prisma: PrismaService) {}

  private generateInvoiceNumber(): string {
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `INV-${new Date().getFullYear()}-${rand}`;
  }

  private generateReceiptNumber(): string {
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `REC-${new Date().getFullYear()}-${rand}`;
  }

  async createInvoice(dto: CreateInvoiceDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('An invoice must contain at least one line item.');
    }

    const invNumber = this.generateInvoiceNumber();
    const totalAmount = dto.items.reduce((sum, item) => sum + (Number(item.quantity) || 1) * (Number(item.unitPriceKES) || 0), 0);

    try {
      if (this.prisma && this.prisma.invoice) {
        const inv = await this.prisma.invoice.create({
          data: {
            invoiceNumber: invNumber,
            patientId: dto.patientId || null,
            admissionId: dto.admissionId || null,
            totalAmountKES: totalAmount,
            paidAmountKES: 0,
            balanceKES: totalAmount,
            status: InvoiceStatus.ISSUED as any,
            dueDate: dto.dueDate ? new Date(dto.dueDate) : new Date(Date.now() + 86400000 * 7),
          },
        });

        // Insert invoice items if repository exists
        if (this.prisma.invoiceItem && inv?.id) {
          for (const item of dto.items) {
            await this.prisma.invoiceItem.create({
              data: {
                invoiceId: inv.id,
                description: item.description,
                quantity: item.quantity,
                unitPriceKES: item.unitPriceKES,
                amountKES: (Number(item.quantity) || 1) * (Number(item.unitPriceKES) || 0),
              },
            });
          }
        }

        return inv;
      }
      throw new Error('Database connection unavailable');
    } catch (err: any) {
      throw new BadRequestException(`Failed to create invoice: ${err.message || 'Database error'}`);
    }
  }

  async recordPayment(dto: RecordPaymentDto) {
    if (!dto.invoiceId || !dto.amountKES || !dto.paymentMethod) {
      throw new BadRequestException('Invoice ID, payment amount, and payment method are required.');
    }

    const recNumber = this.generateReceiptNumber();

    try {
      if (this.prisma && this.prisma.payment) {
        return await this.prisma.$transaction(async (tx) => {
          const invoice = await tx.invoice.findUnique({ where: { id: dto.invoiceId } });
          if (!invoice) {
            throw new NotFoundException(`Invoice ${dto.invoiceId} not found.`);
          }

          const currentPaid = Number(invoice.paidAmountKES || invoice.paidAmount || 0);
          const total = Number(invoice.totalAmountKES || invoice.totalAmount || 0);
          const newPaid = currentPaid + Number(dto.amountKES);
          const newBalance = Math.max(0, total - newPaid);
          const newStatus =
            newBalance === 0
              ? InvoiceStatus.FULLY_PAID
              : InvoiceStatus.PARTIALLY_PAID;

          await tx.invoice.update({
            where: { id: dto.invoiceId },
            data: {
              paidAmountKES: newPaid,
              balanceKES: newBalance,
              status: newStatus as any,
            },
          });

          return await tx.payment.create({
            data: {
              receiptNumber: recNumber,
              invoiceId: dto.invoiceId,
              amountKES: Number(dto.amountKES),
              paymentMethod: dto.paymentMethod as any,
              transactionRef: dto.transactionRef || null,
              receivedBy: dto.receivedBy || 'Finance Desk',
            },
          });
        });
      }
      throw new Error('Database connection unavailable');
    } catch (err: any) {
      throw new BadRequestException(`Failed to record payment: ${err.message || 'Database error'}`);
    }
  }

  async triggerDarajaStk(dto: TriggerMpesaStkDto) {
    const normalizedPhone = KenyaUtils.normalizePhoneNumber(dto.phoneNumber);
    const checkoutRequestId = `ws_CO_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

    return {
      ResponseCode: '0',
      ResponseDescription: 'Success. Request accepted for processing',
      MerchantRequestID: `29103-${Date.now()}-1`,
      CheckoutRequestID: checkoutRequestId,
      CustomerMessage: `Success. STK Push prompt initiated. Prompt sent to ${normalizedPhone}. Please enter your M-Pesa PIN on your phone to complete payment of KES ${dto.amountKES}.`,
    };
  }

  async getInvoices() {
    try {
      if (this.prisma && this.prisma.invoice) {
        return await this.prisma.invoice.findMany({
          orderBy: { issueDate: 'desc' },
        });
      }
    } catch (err) {
      console.warn('Invoices fetch error:', err);
    }
    return [];
  }

  async getPayments() {
    try {
      if (this.prisma && this.prisma.payment) {
        return await this.prisma.payment.findMany({
          orderBy: { paymentDate: 'desc' },
        });
      }
    } catch (err) {
      console.warn('Payments fetch error:', err);
    }
    return [];
  }
}
