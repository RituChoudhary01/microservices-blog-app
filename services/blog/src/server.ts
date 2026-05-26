import express from "express"
import dotenv from "dotenv"
import blogRoutes from "./routes/blog.js"
import { startCacheConsumer } from "./utils/consumer.js";
import {createClient} from "redis"
import cors from "cors"
dotenv.config();
const app = express()
app.use(express.json());
app.use(cors());
startCacheConsumer()
app.use("/api/v1",blogRoutes);

const port = process.env.PORT;
export const redisClient = createClient({url: process.env.REDIS_URL!});
redisClient.connect().then(()=>console.log("Connected to redis")).catch(console.error);
app.listen(port,()=>{
  console.log(`Server is running on http://localhost:${port}`);
})