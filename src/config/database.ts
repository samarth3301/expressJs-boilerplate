import { PrismaClient } from "../../generated/prisma";
import { logger } from "./logger";
import RedisService from "@/services/redis.service";
import config from "./index";

interface CustomNodeJsGlobal extends Global {
	prisma: PrismaClient;
	redis: RedisService;
}

declare const global: CustomNodeJsGlobal;

export const db = global.prisma || new PrismaClient({
  log: config.nodeEnv === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  errorFormat: 'pretty',
});

if (!global.prisma) {
  global.prisma = db;
}

db.$connect()
	.then(() => {
		logger.info("[PRISMA] : connected to database");
	})
	.catch((error: any) => {
		logger.error("[PRISMA] : failed to connect database : ", error);
		process.exit(1);
	});

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('[PRISMA] : disconnecting from database...');
  await db.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('[PRISMA] : disconnecting from database...');
  await db.$disconnect();
  process.exit(0);
});

export const redis = global.redis || new RedisService(
  config.redis.host,
  config.redis.port,
  config.redis.db
);

if (!global.redis) {
  global.redis = redis;
}