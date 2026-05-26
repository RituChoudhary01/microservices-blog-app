import express from "express";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import connectDb from "./utils/db.js";
import {userRoutes} from "./routes/user.js";
import cors from "cors"

dotenv.config();
const app = express();
app.use(cors());
// Database Connection
connectDb();
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME!,
  api_key: process.env.CLOUD_API_KEY!,
  api_secret: process.env.CLOUD_API_SECRET!,
});
// Routes
app.use("/api/v1", userRoutes);
// Default Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Server is running successfully",
  });
});
// Port
const port = process.env.PORT || 5000;
// Server
app.listen(port, () => {
  console.log(
    `Server is running on http://localhost:${port}`
  );
});