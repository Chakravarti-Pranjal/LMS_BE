import mongoose from "mongoose";
import { config } from "dotenv";
config();

mongoose.set("strictQuery", false);

const connectToDB = async () => {
  try {
    const { connection } = await mongoose.connect(process.env.MONGO_URI);

    if (connection) {
      console.log("DB connected successfully!");
    }
  } catch (error) {
    console.log("Error: ", error);
    process.exit(1);
  }
};

export default connectToDB;
