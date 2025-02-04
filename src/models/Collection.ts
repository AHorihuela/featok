import mongoose from 'mongoose';

export interface ICollection {
  name: string;
  ideas: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const collectionSchema = new mongoose.Schema<ICollection>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name for this collection'],
      maxlength: [60, 'Name cannot be more than 60 characters'],
    },
    ideas: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Idea'
    }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Collection || mongoose.model<ICollection>('Collection', collectionSchema); 