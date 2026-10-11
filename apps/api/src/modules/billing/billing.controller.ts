import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BillingService, CreateInvoiceDto, RecordPaymentDto, TriggerMpesaStkDto } from './billing.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuditLog } from '../../common/decorators/audit-log.decorator';
import { UserRole } from '@calyvia/shared';

@ApiTags('07. Billing & Payments (Daraja M-Pesa)')
@Controller('billing')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('invoices')
  @Roles(UserRole.SUPER_ADMIN, UserRole.FINANCE_BILLING, UserRole.FACILITY_ADMIN)
  @AuditLog({ action: 'CREATE_INVOICE', resource: 'INVOICE' })
  @ApiOperation({ summary: 'Create patient invoice with line items (detox, bed, counselling)' })
  async createInvoice(@Body() dto: CreateInvoiceDto) {
    return this.billingService.createInvoice(dto);
  }

  @Post('payments')
  @Roles(UserRole.SUPER_ADMIN, UserRole.FINANCE_BILLING, UserRole.ADMISSIONS_FRONT_DESK)
  @AuditLog({ action: 'RECORD_PAYMENT', resource: 'PAYMENT' })
  @ApiOperation({ summary: 'Record manual or bank payment against invoice' })
  async recordPayment(@Body() dto: RecordPaymentDto) {
    return this.billingService.recordPayment(dto);
  }

  @Post('mpesa/stk-push')
  @Roles(UserRole.SUPER_ADMIN, UserRole.FINANCE_BILLING, UserRole.ADMISSIONS_FRONT_DESK)
  @AuditLog({ action: 'TRIGGER_MPESA_STK_PUSH', resource: 'PAYMENT' })
  @ApiOperation({ summary: 'Trigger Safaricom Lipa Na M-Pesa Online STK Push directly to phone' })
  async triggerMpesaStk(@Body() dto: TriggerMpesaStkDto) {
    return this.billingService.triggerDarajaStk(dto);
  }

  @Get('invoices')
  @Roles(UserRole.SUPER_ADMIN, UserRole.FINANCE_BILLING, UserRole.FACILITY_ADMIN)
  @ApiOperation({ summary: 'List patient invoices' })
  async getInvoices() {
    return this.billingService.getInvoices();
  }

  @Get('payments')
  @Roles(UserRole.SUPER_ADMIN, UserRole.FINANCE_BILLING, UserRole.FACILITY_ADMIN)
  @ApiOperation({ summary: 'List payments recorded' })
  async getPayments() {
    return this.billingService.getPayments();
  }
}
