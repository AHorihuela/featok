import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const MONGODB_URI: string = process.env.MONGODB_URI;

interface ConnectionState {
  isConnecting: boolean;
  retries: number;
  lastError: Error | null;
  healthCheckInterval: NodeJS.Timeout | null;
}

const state: ConnectionState = {
  isConnecting: false,
  retries: 3,
  lastError: null,
  healthCheckInterval: null,
};

const RETRY_INTERVAL = 1000; // 1 second
const MAX_RETRIES = 3;
const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds
const CONNECTION_TIMEOUT = 10000; // 10 seconds

function startHealthCheck() {
  if (state.healthCheckInterval) {
    clearInterval(state.healthCheckInterval);
  }

  state.healthCheckInterval = setInterval(async () => {
    try {
      const readyState = mongoose.connection.readyState as mongoose.ConnectionStates;
      if (readyState !== mongoose.ConnectionStates.connected) {
        console.warn('MongoDB connection lost, attempting to reconnect...');
        await connectDB();
      }
    } catch (error) {
      console.error('Health check failed:', error);
    }
  }, HEALTH_CHECK_INTERVAL);
}

export default async function connectDB() {
  try {
    // If already connected, return early
    const readyState = mongoose.connection.readyState as mongoose.ConnectionStates;
    if (readyState === mongoose.ConnectionStates.connected) {
      return mongoose.connection;
    }

    // If connecting, wait
    if (state.isConnecting) {
      let waitTime = 0;
      while (state.isConnecting && waitTime < CONNECTION_TIMEOUT) {
        await new Promise(resolve => setTimeout(resolve, 100));
        waitTime += 100;
        
        const currentState = mongoose.connection.readyState as mongoose.ConnectionStates;
        if (currentState === mongoose.ConnectionStates.connected) {
          return mongoose.connection;
        }
      }
      
      if (state.isConnecting) {
        throw new Error('Connection attempt timed out');
      }
    }

    state.isConnecting = true;

    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      connectTimeoutMS: 10000,
      heartbeatFrequencyMS: 10000,
    };

    try {
      const conn = await Promise.race([
        mongoose.connect(MONGODB_URI, opts),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), CONNECTION_TIMEOUT)
        )
      ]) as mongoose.Connection;
      
      // Reset state on successful connection
      state.isConnecting = false;
      state.retries = MAX_RETRIES;
      state.lastError = null;
      
      // Start health check
      startHealthCheck();
      
      // Handle connection events
      mongoose.connection.on('error', (error) => {
        console.error('MongoDB connection error:', error);
        state.lastError = error;
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('MongoDB disconnected');
        if (state.retries > 0) {
          state.retries--;
          setTimeout(() => connectDB(), RETRY_INTERVAL);
        }
      });

      return conn;
    } catch (error) {
      state.isConnecting = false;
      state.lastError = error as Error;
      
      if (state.retries > 0) {
        state.retries--;
        console.log(`Connection failed. Retrying... (${state.retries} attempts left)`);
        return new Promise((resolve) => {
          setTimeout(() => resolve(connectDB()), RETRY_INTERVAL);
        });
      }
      
      throw new Error(`Failed to connect to MongoDB: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  } catch (error) {
    state.isConnecting = false;
    state.lastError = error as Error;
    throw error;
  }
}
