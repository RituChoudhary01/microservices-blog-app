import mongoose from "mongoose";
const connectDb = async()=>{
  try{
    mongoose.connect(process.env.MONGO_URI as string);
    console.log("connected to mongodb",{
      dbName:"blog",
    });
  }catch(error){
    console.log(error);
  }
}
export default connectDb;