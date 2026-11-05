// TODO: Implement AI types

/**
 * AI feature type definitions
 */

export interface AIComment {
  id: string;
  prompt: string;
  response: string;
  model: string;
  tokensUsed: number;
  cost: number;
  createdAt: Date;
}

export interface GenerationOptions {
  model?: 'gpt-3.5-turbo' | 'gpt-4';
  maxTokens?: number;
  temperature?: number;
}

export interface CostSummary {
  totalCost: number;
  totalTokens: number;
  commentCount: number;
  period: {
    start: Date;
    end: Date;
  };
}

export interface PromptTemplate {
  type: string;
  template: string;
  systemPrompt: string;
}
