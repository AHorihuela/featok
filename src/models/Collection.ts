import mongoose from 'mongoose';
import { IIdea } from './Idea';

export interface ICollection {
  name: string;
  description?: string;
  ideas: IIdea[];
  createdAt: Date;
}

const CollectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  ideas: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Idea'
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Collection || mongoose.model('Collection', CollectionSchema);

 