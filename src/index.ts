import express, { Request, Response } from "express";
import connectDB from "./config/db";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./routes/auth";
import { PORT } from "./utils/envProvider";
import { Frontend_Base_URL } from "./utils/constants";
import userRouter from "./routes/user";
import movieRouter from "./routes/movie";
import reviewRouter from "./routes/review";
import likedRouter from "./routes/like";
import connectCloudinary from "./config/cloudinary";
import { uploadImageToCloudinary } from "./utils/fileUploader";

import fileUpload, { UploadedFile } from "express-fileupload";
import fs from "fs";
// import path from "path";

// Create Express server
const app = express();

const corsOptions = {
  origin: Frontend_Base_URL, // Allows requests from any origin
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // Allow common HTTP methods
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "Access-Control-Allow-Origin",
  ], // Allow necessary headers
  credentials: true, // Allow cookies & authorization headers
};

// Enable CORS with necessary headers
app.use(cors(corsOptions));

// Handle preflight requests (OPTIONS)
app.options("*", cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

// Middleware to handle file uploads
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// Define a route handler for the root route
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

// Route to handle image upload
app.post("/upload", async (req: Request, res: Response): Promise<any> => {
  try {
    console.log("file: ", req.files);
    console.log("body: ", req.body);
    if (!req.files || !req.files.image) {
      return res.status(400).json({message: "No files were uploaded."});
    }

    const file = req.files.image as UploadedFile;

    // Upload the image to Cloudinary
    const result = await uploadImageToCloudinary(file.tempFilePath, {
      folder: "uploads",
      height: 500,
      quality: 80,
    });

    // Delete the temporary file
    fs.unlink(file.tempFilePath, (err) => {
      if (err) console.error("Failed to delete temp file:", err);
    });

    // Respond with the URL of the uploaded image
    return res.status(200).json({
      message: "File uploaded successfully",
      url: result.secure_url,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `An error occurred: ${(error as Error).message}`});
  }
});

app.use("/auth", authRouter);
app.use("/movie", movieRouter);
app.use("/user", userRouter);
app.use("/review", reviewRouter);
app.use("/liked", likedRouter);

const port = PORT || 3000;

Promise.all([connectDB(), connectCloudinary()])
  .then(() => {
    console.log("Database connected ✅ \nCloudinary configured ✅");

    // start server
    app.listen(port, () => {
      console.log(`Server is running on 👉 http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.log(`something went wrong. ${err.message}`);
  });
