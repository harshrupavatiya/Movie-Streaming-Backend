import express, { Request, Response } from "express";
import connectDB from "./config/db";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./routes/auth";
import { PORT } from "./utils/envProvider";
import { Frontend_Base_URL } from "./utils/constants";
import movieRouter from "./routes/movie";

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

// Define a route handler for the root route
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.use("/auth", authRouter);
app.use("/movie", movieRouter);

const port = PORT || 3000;

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
