import winston from "winston";

const isVercel = !!process.env.VERCEL;

const transports = [];

// 🚀 Vercel serverless: console logs only
if (isVercel) {
  transports.push(new winston.transports.Console());
} else {
  // 🖥 Local development: can log to file
  transports.push(
    new winston.transports.File({
      filename: "logs/app.log",
      level: "info",
    })
  );

  transports.push(new winston.transports.Console());
}

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports,
});
