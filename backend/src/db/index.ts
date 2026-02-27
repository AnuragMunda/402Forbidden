import mongoose from "mongoose";
import { DB_NAME } from "../constants/index.js";

const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error");
    process.exit(1);
  }
};
export default connectDB;
