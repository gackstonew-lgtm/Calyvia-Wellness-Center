import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CrmService } from '../crm/crm.service';

@Injectable()
export class IntegrationsService {
  constructor(
    private prisma: PrismaService,
    private crmService: CrmService,
  ) {}

  async handleMpesaCallback(payload: any) {
    const stkCallback = payload?.Body?.stkCallback;
    if (!stkCallback) {
      return { ResultCode: 1, ResultDesc: 'Rejected. Malformed payload' };
    }

    const checkoutRequestId = stkCallback.CheckoutRequestID;
    const resultCode = stkCallback.ResultCode;
    const resultDesc = stkCallback.ResultDesc;

    let mpesaReceiptNumber = null;
    let amount = 0;
    let phoneNumber = '';

    if (resultCode === 0 && stkCallback.CallbackMetadata?.Item) {
      for (const item of stkCallback.CallbackMetadata.Item) {
        if (item.Name === 'MpesaReceiptNumber') mpesaReceiptNumber = item.Value;
        if (item.Name === 'Amount') amount = Number(item.Value);
        if (item.Name === 'PhoneNumber') phoneNumber = String(item.Value);
      }
    }

    try {
      if (this.prisma && this.prisma.mpesaTransaction) {
        await this.prisma.mpesaTransaction.create({
          data: {
            merchantRequestId: stkCallback.MerchantRequestID || 'N/A',
            checkoutRequestId,
            phoneNumber: phoneNumber || 'N/A',
            amount,
            mpesaReceiptNumber,
            resultCode,
            resultDesc,
            rawCallbackJson: payload,
          },
        });
      }
    } catch {
      // Fallback
    }

    return {
      ResultCode: 0,
      ResultDesc: 'Callback processed successfully',
      receipt: mpesaReceiptNumber,
    };
  }

  async handleWebsiteEnquiry(leadPayload: {
    fullName: string;
    phone: string;
    email?: string;
    substancesUsed?: string;
    message?: string;
  }) {
    return this.crmService.createLead({
      fullName: leadPayload.fullName,
      phone: leadPayload.phone,
      email: leadPayload.email,
      channel: 'WEBSITE_FORM_WEBHOOK',
      substancesUsed: leadPayload.substancesUsed,
      notes: leadPayload.message,
    });
  }
}
