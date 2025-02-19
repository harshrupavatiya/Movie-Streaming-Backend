import mongoose from "mongoose";
import { DB_URL } from "../utils/envProvider";

async function connectDB() {
  try {
    await mongoose.connect(DB_URL as string);
  } catch (err) {
    throw new Error("Database connection failed.");
  }
}

export default connectDB;