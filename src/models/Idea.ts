import mongoose from 'mongoose';

export interface IIdea {
  text: string;
  collection: mongoose.Types.ObjectId;
  votes: {
    up: number;
    down: number;
  };
  userVotes: Map<string, 'up' | 'down'>;
}

const IdeaSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
  },
  collection: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection',
    required: true,
  },
  votes: {
    up: {
      type: Number,
      default: 0,
    },
    down: {
      type: Number,
      default: 0,
    },
  },
  userVotes: {
    type: Map,
    of: String,
    default: new Map(),
  },
});

export default mongoose.models.Idea || mongoose.model('Idea', IdeaSchema); 