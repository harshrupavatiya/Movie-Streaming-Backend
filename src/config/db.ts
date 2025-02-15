import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function connectDB() {
  // try {
    await mongoose.connect(process.env.DB_URL as string);
  // } catch (err) {
  //   throw new Error("Database connection failed.");
  // }
}

export default connectDB;