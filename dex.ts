import dotenv from "dotenv";
import  app  from "./src/app.js";
import connectDB from "./src/config/db/db.js";
import { logger } from "./src/utils/logger.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({path: join(__dirname, ".env")});

const PORT = Number(process.env.PORT) || 7001;
const HOST = "0.0.0.0";

const startup = async () => {
  try {

    await connectDB();
    logger.info('✅ MongoDB connected');

 app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
});

  } catch (error) {
    logger.error('🔥 Startup failed:', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
};


startup();