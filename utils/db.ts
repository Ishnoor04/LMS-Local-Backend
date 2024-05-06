import mongoose from "mongoose";
require("dotenv").config();
const dbUrl: string = process.env.DB_URI || "";

export const connectDB = async () => {
  try {
    await mongoose.connect(dbUrl, { dbName: "Lms" }).then((data: any) => {
      console.log(
        `Database connected successfully to port ${process.env.PORT}`
      );
    });
  } catch (error: any) {
    console.log(error.message);
    setTimeout(connectDB, 3000 );
  }
};
