import dotenv from "dotenv";
import { swaggerUi, swaggerSpec } from './src/swagger.js';
dotenv.config({ path: './.env' });

import express from 'express';
import { errorHandler } from './src/middlewares/ErrorHandler.js'
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api-docs-json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

import userRouter from './src/routes/user.route.js'
import classRouter from './src/routes/class.route.js'
import onboardingRouter from './src/routes/onboarding.route.js'
import quizRouter from './src/routes/quiz.route.js'
import rewardsRouter from './src/routes/rewards.route.js'
import profileRouter from './src/routes/profile.route.js';
import leadboardRouter from './src/routes/leadboard.route.js';
import lessonProgress from './src/routes/lessonProgress.routes.js'
// import healthcheckRouter from './src/HealthCheck/healthcheck.route.js';
// import countryRouter from './src/Country/countryRoute.js'
// import schoolRouter from './src/School/schoolRoute.js';
// import studentRouter from './src/Student/studentRoute.js'
// import individualRouter from './src/Individual/individualRoute.js'
// import parentRouter from './src/Parent/parentRoute.js'
import cookieParser from 'cookie-parser';

app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

app.get("/", (req, res) => {
  res.send("Hello World 🌍, my name is Nz i dey owe billie 1k");
});

app.get("/api/v1/test", (req, res) => {
  res.status(200).json({ message: "Test OK!" });
});

// Health check route
app.use("/api/v1/student", userRouter);
app.use("/api/v1/classes", classRouter);
app.use("/api/v1/onboarding", onboardingRouter)
app.use("/api/v1/quiz", quizRouter)
app.use("/api/v1/rewards", rewardsRouter)
app.use("/api/v1/profile", profileRouter)
app.use("/api/v1/leaderboard", leadboardRouter)
app.use("/api/v1/progress", lessonProgress)
// app.use("/api/v1", healthcheckRouter);
// app.use("/api/v1/country", countryRouter);
// app.use("/api/v1/school", schoolRouter);
// app.use("/api/v1/student", studentRouter)
// app.use("/api/v1/individual", individualRouter)
// app.use("/api/v1/parent", parentRouter)
app.use( errorHandler )
export { app };
