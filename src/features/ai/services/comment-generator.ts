// TODO: Implement comment generator

import type { PromptTemplate } from '../types/ai.types';
import type { Mascot, CommentContext, CommentType } from '../../mascot/types/mascot.types';

export class CommentGenerator {
  /**
   * Build prompt for commit comment
   */
  buildCommitPrompt(commit: unknown, mascot: Mascot): string {
    // TODO: Implement commit prompt building
    throw new Error('Not implemented');
  }

  /**
   * Build prompt for streak achievement
   */
  buildStreakPrompt(streak: number, mascot: Mascot): string {
    // TODO: Implement streak prompt building
    throw new Error('Not implemented');
  }

  /**
   * Build prompt for level up
   */
  buildLevelUpPrompt(level: number, mascot: Mascot): string {
    // TODO: Implement level up prompt building
    throw new Error('Not implemented');
  }

  /**
   * Apply tone to comment
   */
  applyTone(comment: string, tone: string): string {
    // TODO: Implement tone application
    throw new Error('Not implemented');
  }

  /**
   * Select appropriate template
   */
  selectTemplate(commentType: CommentType): PromptTemplate {
    // TODO: Implement template selection
    throw new Error('Not implemented');
  }
}

export const commentGenerator = new CommentGenerator();
