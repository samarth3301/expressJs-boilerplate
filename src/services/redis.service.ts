import { logger } from "@/config/logger";
import Redis from "ioredis";
import config from "@/config";

class RedisService {
	private client: Redis;

	constructor(
		host: string = config.redis.host,
		port: number = config.redis.port,
		db: number = config.redis.db,
	) {
		this.client = new Redis({
			host: host,
			port: port,
			db: db,
			enableReadyCheck: false,
			maxRetriesPerRequest: 3,
			lazyConnect: true,
			reconnectOnError: (err: any) => {
				logger.warn(`[REDIS] Reconnect on error: ${err.message}`);
				return err.message.includes('READONLY');
			},
		});

		this.client.on("connect", () => {
			logger.info("[REDIS] Connected to Redis.");
		});

		this.client.on("ready", () => {
			logger.info("[REDIS] Redis client ready.");
		});

		this.client.on("error", (err: any) => {
			logger.error("[REDIS] Redis connection error.", err);
		});

		this.client.on("close", () => {
			logger.warn("[REDIS] Redis connection closed.");
		});

		this.client.on("reconnecting", () => {
			logger.info("[REDIS] Reconnecting to Redis...");
		});
	}

	async connect(): Promise<void> {
		try {
			await this.client.connect();
		} catch (error) {
			logger.error("[REDIS] Failed to connect to Redis.", error);
			throw error;
		}
	}

	async disconnect(): Promise<void> {
		try {
			await this.client.quit();
			logger.info("[REDIS] Disconnected from Redis.");
		} catch (error) {
			logger.error("[REDIS] Error disconnecting from Redis.", error);
		}
	}

	async setValue(key: string, value: string, expiry?: number): Promise<boolean> {
		try {
			if (expiry) {
				await this.client.setex(key, expiry, value);
			} else {
				await this.client.set(key, value);
			}
			return true;
		} catch (error) {
			logger.error(`[REDIS] Error setting value for key ${key}:`, error);
			return false;
		}
	}

	async getValue(key: string): Promise<string | null> {
		try {
			const value = await this.client.get(key);
			return value;
		} catch (error) {
			logger.error(`[REDIS] Error getting value for key ${key}:`, error);
			return null;
		}
	}

	async updateValue(key: string, value: string): Promise<boolean> {
		try {
			const exists = await this.client.exists(key);
			if (exists) {
				await this.client.set(key, value);
				return true;
			} else {
				logger.warn(`[REDIS] Key ${key} not found for update.`);
				return false;
			}
		} catch (error) {
			logger.error(`[REDIS] Unexpected error updating value for key ${key}:`, error);
			return false;
		}
	}

	async deleteValue(key: string): Promise<boolean> {
		try {
			const result = await this.client.del(key);
			return result > 0;
		} catch (error) {
			logger.error(`[REDIS] Error deleting key ${key}:`, error);
			return false;
		}
	}

	async exists(key: string): Promise<boolean> {
		try {
			const result = await this.client.exists(key);
			return result === 1;
		} catch (error) {
			logger.error(`[REDIS] Error checking existence of key ${key}:`, error);
			return false;
		}
	}

	async expire(key: string, seconds: number): Promise<boolean> {
		try {
			const result = await this.client.expire(key, seconds);
			return result === 1;
		} catch (error) {
			logger.error(`[REDIS] Error setting expiry for key ${key}:`, error);
			return false;
		}
	}

	async ttl(key: string): Promise<number> {
		try {
			return await this.client.ttl(key);
		} catch (error) {
			logger.error(`[REDIS] Error getting TTL for key ${key}:`, error);
			return -1;
		}
	}

	async flushAll(): Promise<boolean> {
		try {
			await this.client.flushall();
			return true;
		} catch (error) {
			logger.error(`[REDIS] Error flushing all keys:`, error);
			return false;
		}
	}

	// Hash operations
	async hset(key: string, field: string, value: string): Promise<boolean> {
		try {
			await this.client.hset(key, field, value);
			return true;
		} catch (error) {
			logger.error(`[REDIS] Error setting hash field ${field} for key ${key}:`, error);
			return false;
		}
	}

	async hget(key: string, field: string): Promise<string | null> {
		try {
			return await this.client.hget(key, field);
		} catch (error) {
			logger.error(`[REDIS] Error getting hash field ${field} for key ${key}:`, error);
			return null;
		}
	}

	async hgetall(key: string): Promise<Record<string, string> | null> {
		try {
			return await this.client.hgetall(key);
		} catch (error) {
			logger.error(`[REDIS] Error getting all hash fields for key ${key}:`, error);
			return null;
		}
	}

	async hdel(key: string, ...fields: string[]): Promise<number> {
		try {
			return await this.client.hdel(key, ...fields);
		} catch (error) {
			logger.error(`[REDIS] Error deleting hash fields for key ${key}:`, error);
			return 0;
		}
	}

	// List operations
	async lpush(key: string, ...values: string[]): Promise<number> {
		try {
			return await this.client.lpush(key, ...values);
		} catch (error) {
			logger.error(`[REDIS] Error pushing to list ${key}:`, error);
			return 0;
		}
	}

	async rpush(key: string, ...values: string[]): Promise<number> {
		try {
			return await this.client.rpush(key, ...values);
		} catch (error) {
			logger.error(`[REDIS] Error pushing to list ${key}:`, error);
			return 0;
		}
	}

	async lrange(key: string, start: number, stop: number): Promise<string[]> {
		try {
			return await this.client.lrange(key, start, stop);
		} catch (error) {
			logger.error(`[REDIS] Error getting range from list ${key}:`, error);
			return [];
		}
	}

	async lpop(key: string): Promise<string | null> {
		try {
			return await this.client.lpop(key);
		} catch (error) {
			logger.error(`[REDIS] Error popping from list ${key}:`, error);
			return null;
		}
	}

	async rpop(key: string): Promise<string | null> {
		try {
			return await this.client.rpop(key);
		} catch (error) {
			logger.error(`[REDIS] Error popping from list ${key}:`, error);
			return null;
		}
	}

	getClient(): Redis {
		return this.client;
	}
}

export default RedisService;