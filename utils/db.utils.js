import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const dbConnect = async () => {
  console.log("inside db connection function");
  try {
    const dbConnection = await mongoose.connect(process.env.MONGODB_URI);
    console.log("Database connected Successfully");
    return true;
  } catch (error) {
    console.log("error", error);
    return false;
  }
};
