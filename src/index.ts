import express, { Request, Response } from "express";
import connectDB from "./config/db";
import cookieParser from "cookie-parser";

import authRouter from "./routes/auth";
import OTP from "./models/otp";

// Create Express server
const app = express();

app.use(express.json());
app.use(cookieParser());

// Define a route handler for the root route
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.use("/auth", authRouter);

const port = process.env.PORT || 3000;

// Connect database
connectDB()
  .then(() => {
    console.log("Database connected successfully.");
    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.log(`something went wrong. ${err.message}`);
  });
