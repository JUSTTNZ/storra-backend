import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./src/config/db/db.js";
// import { connectRedis} from './src/config/redis/redis';
// import { initCountryCounter } from './src/config/redis/redisCountryCounter';
// import { initSchoolCounter } from './src/config/redis/redisSchoolCounter';
// import { initStudentCounter } from './src/config/redis/redisStudentCounter';
// import { initIndividualCounter, checkCounterHealth } from './src/config/redis/redisIndividualCounter'
// import { initChildCounter } from "./src/config/redis/redisChildCounter";
import { logger } from "./src/utils/logger.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({path: join(__dirname, ".env")});

const PORT = Number(process.env.PORT) || 7001;


const startup = async () => {
  try {

    await connectDB();
    logger.info('✅ MongoDB connected');

    // await connectRedis();
    // logger.info('✅ Redis connected');

    // await initCountryCounter();
    // logger.info('✅ Country counter initialized');

    // await initSchoolCounter();
    // logger.info('✅ School counter initialized');

    // await initStudentCounter();
    // logger.info('✅ Student counter initialized');

    // await checkCounterHealth();
    
    // await initIndividualCounter();
    // logger.info('✅ Individual counter initialized')

    // await initChildCounter();
    // logger.info('✅ Individual counter initialized')

    app.listen(PORT, "0.0.0.0", () => {
      logger.info(`🚀 Server running on port ${PORT}`);
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