import mongoose from 'mongoose';

const ProductIdeaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  votes: {
    superLike: {
      type: Number,
      default: 0,
    },
    up: {
      type: Number,
      default: 0,
    },
    neutral: {
      type: Number,
      default: 0,
    },
  },
  views: {
    type: Number,
    default: 0,
  },
  shareableId: {
    type: String,
    required: true,
    unique: true,
  },
  groupId: {
    type: String,
    required: true,
    index: true,
  },
  groupTitle: {
    type: String,
    required: true,
    default: 'My Ideas',
  },
  creatorId: {
    type: String,
    required: true,
    index: true,
  },
  order: {
    type: Number,
    required: true,
    default: 0,
  },
}, {
  timestamps: true,
});

export default mongoose.models.ProductIdea ||
  mongoose.model('ProductIdea', ProductIdeaSchema);
