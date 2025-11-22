import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

// Set test environment
process.env.NODE_ENV = 'test';

// Mock Redis for tests
jest.mock('@/services/redis.service', () => {
  return class MockRedisService {
    async setValue() { return true; }
    async getValue() { return null; }
    async deleteValue() { return true; }
    async exists() { return false; }
    async expire() { return true; }
    async ttl() { return -1; }
    async flushAll() { return true; }
    async hset() { return true; }
    async hget() { return null; }
    async hgetall() { return {}; }
    async hdel() { return 0; }
    async lpush() { return 0; }
    async rpush() { return 0; }
    async lrange() { return []; }
    async lpop() { return null; }
    async rpop() { return null; }
    async connect() { return; }
    async disconnect() { return; }
    getClient() { return {}; }
  };
});

// Global test utilities
global.testUtils = {
  createMockRequest: (overrides = {}) => ({
    body: {},
    params: {},
    query: {},
    headers: {},
    user: null,
    ...overrides,
  }),

  createMockResponse: () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
  },

  createMockNext: () => jest.fn(),
};