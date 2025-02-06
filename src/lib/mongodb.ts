import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const MONGODB_URI: string = process.env.MONGODB_URI;

let isConnecting = false;
let retries = 3;

export default async function connectDB() {
  try {
    // If already connected, return early
    if (mongoose.connection.readyState === mongoose.ConnectionStates.connected) {
      return;
    }

    // If already trying to connect, wait
    if (isConnecting) {
      while (isConnecting && retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        retries--;
      }
      if (mongoose.connection.readyState === mongoose.ConnectionStates.connected) return;
    }

    isConnecting = true;

    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(MONGODB_URI, opts);
    console.log('Connected to MongoDB');
    isConnecting = false;
    retries = 3;
  } catch (error) {
    isConnecting = false;
    console.error('MongoDB connection error:', error);
    if (retries > 0) {
      retries--;
      console.log(`Retrying connection... (${retries} attempts left)`);
      return connectDB();
    }
    throw new Error('Failed to connect to MongoDB after multiple attempts');
  }
}
