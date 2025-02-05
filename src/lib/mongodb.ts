import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const MONGODB_URI: string = process.env.MONGODB_URI;

export async function connectToDatabase() {
  try {
    const opts = {
      bufferCommands: false,
    };

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI, opts);
      console.log('Connected to MongoDB');
    }
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}
