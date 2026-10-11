import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

export interface SubmitFeedbackDto {
  patientId?: string;
  rating: number; // 1-5
  cleanlinessScore?: number;
  counsellingScore?: number;
  foodQualityScore?: number;
  nursingScore?: number;
  comments?: string;
}

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  async submitFeedback(dto: SubmitFeedbackDto) {
    try {
      if (this.prisma && this.prisma.feedbackSurvey) {
        return await this.prisma.feedbackSurvey.create({
          data: {
            patientId: dto.patientId || null,
            rating: dto.rating,
            cleanlinessScore: dto.cleanlinessScore || null,
            counsellingScore: dto.counsellingScore || null,
            foodQualityScore: dto.foodQualityScore || null,
            nursingScore: dto.nursingScore || null,
            comments: dto.comments || null,
          },
        });
      }
      throw new Error('Database service unavailable');
    } catch (err: any) {
      throw new Error(`Failed to submit feedback: ${err.message}`);
    }
  }

  async getFeedbackSummary() {
    try {
      if (this.prisma && this.prisma.feedbackSurvey) {
        const surveys = await this.prisma.feedbackSurvey.findMany();
        if (surveys.length === 0) {
          return {
            totalSurveys: 0,
            averageRating: 0,
            categoryAverages: { cleanliness: 0, counselling: 0, nursing: 0, foodQuality: 0 },
            npsScore: 0,
          };
        }
        const totalSurveys = surveys.length;
        const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
        return {
          totalSurveys,
          averageRating: Number(avg(surveys.map((s: any) => s.rating || 0)).toFixed(1)),
          categoryAverages: {
            cleanliness: Number(avg(surveys.filter((s: any) => s.cleanlinessScore).map((s: any) => s.cleanlinessScore)).toFixed(1)),
            counselling: Number(avg(surveys.filter((s: any) => s.counsellingScore).map((s: any) => s.counsellingScore)).toFixed(1)),
            nursing: Number(avg(surveys.filter((s: any) => s.nursingScore).map((s: any) => s.nursingScore)).toFixed(1)),
            foodQuality: Number(avg(surveys.filter((s: any) => s.foodQualityScore).map((s: any) => s.foodQualityScore)).toFixed(1)),
          },
          npsScore: Math.round((surveys.filter((s: any) => s.rating >= 4).length / totalSurveys) * 100),
        };
      }
    } catch (err) {
      console.warn('Feedback summary fetch error:', err);
    }
    return {
      totalSurveys: 0,
      averageRating: 0,
      categoryAverages: { cleanliness: 0, counselling: 0, nursing: 0, foodQuality: 0 },
      npsScore: 0,
    };
  }
}
