import mongoose from 'mongoose';

export interface IIdea {
  text: string;
  votes: {
    up: number;
    down: number;
  };
  userVotes: {
    [key: string]: 'up' | 'down';
  };
  createdAt: Date;
  updatedAt: Date;
}

const ideaSchema = new mongoose.Schema<IIdea>(
  {
    text: {
      type: String,
      required: [true, 'Please provide the idea text'],
      maxlength: [500, 'Idea text cannot be more than 500 characters'],
    },
    votes: {
      up: { type: Number, default: 0 },
      down: { type: Number, default: 0 },
    },
    userVotes: {
      type: Map,
      of: String,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Idea || mongoose.model<IIdea>('Idea', ideaSchema); 