import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";


const connectDB = async (res, rej) => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`MongoDB connected | Host : ${connectionInstance.connection.host}`);
    } catch(error) {
        console.log("Error while connecting MongoDB : ", error);
        process.exit(1);
    }
}

export default connectDB;