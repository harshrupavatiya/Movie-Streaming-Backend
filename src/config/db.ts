import mongoose from 'mongoose';
import { MONGODB_URL } from './config';

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URL as string);
  } catch {
    throw new Error('Database connection failed.');
  }
}

export default connectDB;
