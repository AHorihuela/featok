export interface ProductIdea {
  _id: string;
  title: string;
  description: string;
  votes: {
    up: number;
    neutral: number;
    superLike: number;
  };
  shareableId: string;
  groupId: string;
  order: number;
  createdAt: string;
  creatorId?: string;
}

export type VoteType = 'superLike' | 'up' | 'neutral';

export interface VoteConfirmation {
  type: VoteType;
  idea: ProductIdea;
} 