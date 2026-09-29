const { getRedisClient, isRedisAvailable } = require('../config/redis');

const DEFAULT_TTL = parseInt(process.env.REDIS_CACHE_TTL, 10) || 300; // 5 minutes default

class RedisService {
  /**
   * Fetch item from Redis cache
   * Logs HIT or MISS
   */
  static async get(key) {
    if (!isRedisAvailable()) {
      return null;
    }

    try {
      const client = getRedisClient();
      const cached = await client.get(key);

      if (cached) {
        console.log(`Redis cache HIT: ${key}`);
        try {
          return JSON.parse(cached);
        } catch (parseErr) {
          console.warn(`Redis parse error for key ${key}: ${parseErr.message}`);
          return null;
        }
      }

      console.log(`Redis cache MISS: ${key}`);
      return null;
    } catch (error) {
      console.warn(`Redis GET error for key ${key}: ${error.message}. Proceeding with MongoDB.`);
      return null;
    }
  }

  /**
   * Set item in Redis cache with expiration TTL
   */
  static async set(key, value, ttl = DEFAULT_TTL) {
    if (!isRedisAvailable()) {
      return false;
    }

    try {
      const client = getRedisClient();
      const stringified = JSON.stringify(value);
      await client.set(key, stringified, { EX: ttl });
      return true;
    } catch (error) {
      console.warn(`Redis SET error for key ${key}: ${error.message}`);
      return false;
    }
  }

  /**
   * Delete specific key from Redis
   */
  static async del(key) {
    if (!isRedisAvailable()) {
      return false;
    }

    try {
      const client = getRedisClient();
      await client.del(key);
      console.log(`Redis cache invalidated: ${key}`);
      return true;
    } catch (error) {
      console.warn(`Redis DEL error for key ${key}: ${error.message}`);
      return false;
    }
  }

  /**
   * Invalidate multiple keys matching a pattern (e.g. todos:user:123*)
   */
  static async delByPattern(pattern) {
    if (!isRedisAvailable()) {
      return false;
    }

    try {
      const client = getRedisClient();
      const keys = [];

      for await (const key of client.scanIterator({ MATCH: pattern, COUNT: 50 })) {
        keys.push(key);
      }

      if (keys.length > 0) {
        await client.del(keys);
        console.log(`Redis cache invalidated: pattern "${pattern}" (${keys.length} key${keys.length > 1 ? 's' : ''} removed)`);
      } else {
        console.log(`Redis cache invalidation check: pattern "${pattern}" (0 active keys)`);
      }
      return true;
    } catch (error) {
      console.warn(`Redis delByPattern error for pattern ${pattern}: ${error.message}`);
      return false;
    }
  }

  /**
   * Helper to invalidate all Todo list queries and dashboard stats for a user
   */
  static async invalidateUserTodosCache(userId) {
    await Promise.all([
      this.delByPattern(`todos:user:${userId}*`),
      this.del(`todos:stats:user:${userId}`),
    ]);
  }

  /**
   * Helper to invalidate a single Todo cache and the user's Todo list cache
   */
  static async invalidateTodoAndUserCache(todoId, userId) {
    await Promise.all([
      this.del(`todo:${todoId}`),
      this.invalidateUserTodosCache(userId),
    ]);
  }
}

module.exports = RedisService;
