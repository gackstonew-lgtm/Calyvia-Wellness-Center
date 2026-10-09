import { Injectable } from '@nestjs/common';

export interface AiSummarizationContract {
  patientId: string;
  notesToAggregate: string[];
  outputFormat: 'SOAP_SUMMARY' | 'DISCHARGE_BRIEF' | 'RISK_SYNTHESIS';
}

export interface AiFollowUpSuggestionContract {
  patientId: string;
  withdrawalTrend: string;
  counsellingEngagementScore: number;
}

@Injectable()
export class AiExtensionService {
  private readonly isAiEnabled = process.env.ENABLE_AI_EXTENSIONS === 'true';

  async generatePatientRecordSummary(contract: AiSummarizationContract) {
    if (!this.isAiEnabled) {
      return {
        isAvailable: false,
        featureStatus: 'DEFERRED_FUTURE_PHASE',
        message: 'AI extension point active. Underlying LLM orchestration provider disabled by configuration.',
        stubData: {
          patientId: contract.patientId,
          suggestedSummary: 'Structured clinical aggregation ready for AI pipeline attachment.',
        },
      };
    }
    return { isAvailable: true };
  }

  async getFollowUpSuggestions(contract: AiFollowUpSuggestionContract) {
    return {
      isAvailable: false,
      featureStatus: 'DEFERRED_FUTURE_PHASE',
      message: 'AI recommendation extension point mounted. Ready for custom trained clinical model.',
      contractPayload: contract,
    };
  }
}
