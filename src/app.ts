// src/app.js

import express from "express";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/ErrorHandler.js";
import "../src/cron/dailySpinReset.js"
import userRouter from "./routes/user.route.js";
import classRouter from "./routes/class.route.js";
import onboardingRouter from "./routes/onboarding.route.js";
import quizRouter from "./routes/quiz.route.js";
import rewardsRouter from "./routes/rewards.route.js";
import profileRouter from "./routes/profile.route.js";
import leaderboardRouter from "./routes/leadboard.route.js";
import lessonProgressRouter from "./routes/lessonProgress.routes.js";
import spinTheWheelRouter from "./routes/spinTheWheel.route.js";
import dailyRouter from "./routes/daily.route.js";
import cors from "cors";
const app = express();
// CORS Configuration - Add this before other middleware
const corsOptions = {
  origin: [
    // Development origins
    'http://localhost:5173',
    'http://localhost:5174', 
    'http://localhost:3000',
    'http://localhost:8081', // React Native Metro bundler
    'http://localhost:19006', // Expo web
    'http://localhost:19000', // Expo dev tools
    'http://localhost:19001',
    'http://localhost:19002',
    
    // Expo mobile app origins
    /^https?:\/\/.*\.exp\.direct$/i, // Expo direct URLs
    /^https?:\/\/.*\.exp\.app$/i,    // Expo app URLs
    /^https?:\/\/.*\.expo\.dev$/i,   // Expo dev URLs
    
    // Mobile app origins
    'exp://*', // Expo scheme
    'http://10.0.2.2:*', // Android emulator
    'http://10.0.3.2:*', // Genymotion emulator
    'http://localhost:*', // Localhost for mobile
    
    // Production origins
    'https://storra-backend.vercel.app',
    'https://storra.vercel.app',
    'https://storra-app.vercel.app',
    'https://storra-frontend.vercel.app',
    'https://*.vercel.app', // All Vercel deployments
    
    // Add your custom domains here
    'https://storra.com',
    'https://www.storra.com',
    'https://app.storra.com',
    
    // For testing - be careful in production
    /\.storra\.com$/, // All subdomains of storra.com
  ],
  credentials: true, // Allow cookies/credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
    'X-API-Key',
    'X-Device-ID',
    'X-App-Version',
    'X-Platform' // For mobile: ios/android/web
  ],
  exposedHeaders: [
    'Content-Range', 
    'X-Content-Range',
    'X-Total-Count',
    'X-Rate-Limit-Limit',
    'X-Rate-Limit-Remaining',
    'X-Rate-Limit-Reset'
  ],
  maxAge: 86400, // Cache preflight for 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests explicitly for all routes

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("Storra Backend is live 🚀");
});

// ROUTES
app.use("/api/v1/student", userRouter);
app.use("/api/v1/classes", classRouter);
app.use("/api/v1/onboarding", onboardingRouter);
app.use("/api/v1/quiz", quizRouter);
app.use("/api/v1/rewards", rewardsRouter);
app.use("/api/v1/profile", profileRouter);
app.use("/api/v1/leaderboard", leaderboardRouter);
app.use("/api/v1/progress", lessonProgressRouter);
app.use("/api/v1/spin", spinTheWheelRouter);
app.use("/api/v1/daily", dailyRouter);
// ERROR HANDLER
app.use(errorHandler);

// IMPORTANT: default export
export default app;
