// src/app.js

import express from "express";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/ErrorHandler.js";

import userRouter from "./routes/user.route.js";
import classRouter from "./routes/class.route.js";
import onboardingRouter from "./routes/onboarding.route.js";
import quizRouter from "./routes/quiz.route.js";
import rewardsRouter from "./routes/rewards.route.js";
import profileRouter from "./routes/profile.route.js";
import leaderboardRouter from "./routes/leadboard.route.js";
import lessonProgressRouter from "./routes/lessonProgress.routes.js";
import spinTheWheelRouter from "./routes/spinTheWheel.route.js";

const app = express();

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

// ERROR HANDLER
app.use(errorHandler);

// IMPORTANT: default export
export default app;
