import { Test, TestingModule } from '@nestjs/testing';
import { BillingService, CreateInvoiceDto } from './billing.service';
import { PrismaService } from '../../database/prisma.service';
import { PaymentMethod } from '@calyvia/shared';

describe('BillingService (Financial Integrity & M-Pesa)', () => {
  let service: BillingService;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = {
      invoice: {
        create: jest.fn().mockImplementation((args) =>
          Promise.resolve({
            id: 'inv-test-1',
            invoiceNumber: args.data.invoiceNumber,
            totalAmountKES: args.data.totalAmountKES,
            balanceKES: args.data.balanceKES,
            paidAmountKES: args.data.paidAmountKES,
          })
        ),
        findMany: jest.fn().mockResolvedValue([]),
      },
      payment: {
        create: jest.fn().mockImplementation((args) =>
          Promise.resolve({
            id: 'pay-test-1',
            ...args.data,
          })
        ),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<BillingService>(BillingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should accurately calculate totalAmountKES from item quantities and unit prices', async () => {
    const dto: CreateInvoiceDto = {
      patientId: 'patient-uuid-1',
      items: [
        { description: 'Medical Detox Inpatient Daily Fee (7 days)', quantity: 7, unitPriceKES: 15000 },
        { description: 'Comprehensive Psychiatric Intake Assessment', quantity: 1, unitPriceKES: 12000 },
      ],
    };

    const invoice = await service.createInvoice(dto);
    expect(invoice).toBeDefined();
    // 7 * 15000 + 1 * 12000 = 105000 + 12000 = 117000 KES
    expect(invoice.totalAmountKES).toBe(117000);
    expect(mockPrisma.invoice.create).toHaveBeenCalled();
  });

  it('should trigger M-Pesa STK Push handshake without failure', async () => {
    const res = await service.triggerDarajaStk({
      invoiceId: 'inv-test-1',
      phoneNumber: '+254712345678',
      amountKES: 45000,
    });

    expect(res).toBeDefined();
    expect(res.ResponseCode).toBe('0');
    expect(res.CustomerMessage).toContain('STK Push prompt initiated');
  });
});
