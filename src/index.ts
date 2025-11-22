import "./config/moduleAlias";
import app from "./app";
import { logger } from "./config/logger";
import config from "./config";
import { db, redis } from "./config/database";

const server = app.listen(config.port, () => {
	logger.info(`[SERVER] backend is live on http://localhost:${config.port}`);
	logger.info(`[SERVER] Environment: ${config.nodeEnv}`);
	logger.info(`[SERVER] Health check: http://localhost:${config.port}/health`);
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
	logger.info(`[SERVER] Received ${signal}, shutting down gracefully...`);

	server.close(async () => {
		logger.info('[SERVER] HTTP server closed.');

		try {
			// Close database connections
			await db.$disconnect();
			logger.info('[DATABASE] Disconnected successfully.');

			// Close Redis connection
			await redis.disconnect();
			logger.info('[REDIS] Disconnected successfully.');

			logger.info('[SERVER] Graceful shutdown completed.');
			process.exit(0);
		} catch (error) {
			logger.error('[SERVER] Error during shutdown:', error);
			process.exit(1);
		}
	});

	// Force shutdown after 30 seconds
	setTimeout(() => {
		logger.error('[SERVER] Forced shutdown after timeout.');
		process.exit(1);
	}, 30000);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
	logger.error('[SERVER] Uncaught Exception:', error);
	process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
	logger.error('[SERVER] Unhandled Rejection at:', promise, 'reason:', reason);
	process.exit(1);
});

export default server;