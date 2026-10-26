import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = () => {
  return mongoose
    .connect(process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/ats')
    .then(() => console.log("Database connected"))
    .catch((error) => {
      console.log("Error connecting database");
      console.error(error.message);
      process.exit(1);
    });
};
export default connectDB;