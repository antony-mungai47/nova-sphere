import { prisma } from '@/lib/prisma';
import { SafetyEngine } from '../../Intelligence/SafetyEngine/SafetyEngine';

export class ReviewModerationService {
  /**
   * Processes an incoming review through toxicity and spam filters before publishing.
   */
  static async submitReview(data: { userId: string, productId: string, rating: number, title?: string, content: string }) {
    
    // In a real implementation, call OpenAI Moderation or an internal ML model
    const isSafe = SafetyEngine.scanPrompt(data.content);
    
    const status = isSafe ? 'APPROVED' : 'PENDING'; // PENDING implies manual review required
    const aiRiskScore = isSafe ? 0.0 : 0.85;

    return prisma.review.create({
      data: {
        userId: data.userId,
        productId: data.productId,
        rating: data.rating,
        title: data.title,
        content: data.content,
        status,
        aiRiskScore
      }
    });
  }
}
