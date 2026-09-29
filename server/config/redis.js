const { createClient } = require('redis');

let redisClient = null;
let isRedisConnected = false;
let hasLoggedFailure = false;

const initRedis = async () => {
  const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

  try {
    redisClient = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          // If Redis is not available, stop retrying immediately to prevent console log spam
          if (retries >= 1) {
            return false; // Stop reconnect attempts
          }
          return 500;
        },
        connectTimeout: 2000,
      },
    });

    redisClient.on('ready', () => {
      isRedisConnected = true;
      hasLoggedFailure = false;
      console.log(`[Redis] Connected successfully to ${redisUrl}`);
    });

    redisClient.on('error', (err) => {
      isRedisConnected = false;
      if (!hasLoggedFailure) {
        hasLoggedFailure = true;
        console.warn(`[Redis] Server not detected on ${redisUrl} (${err.message}). Bypassing Redis cache; running in Direct MongoDB mode.`);
      }
    });

    redisClient.on('end', () => {
      isRedisConnected = false;
    });

    // Attempt initial connection without blocking app startup if Redis is down
    await redisClient.connect().catch((err) => {
      isRedisConnected = false;
      if (!hasLoggedFailure) {
        hasLoggedFailure = true;
        console.warn(`[Redis] Connection failed: ${err.message}. Running in Direct MongoDB mode.`);
      }
    });

    return redisClient;
  } catch (err) {
    isRedisConnected = false;
    if (!hasLoggedFailure) {
      hasLoggedFailure = true;
      console.warn(`[Redis] Initialization warning: ${err.message}. Running in Direct MongoDB mode.`);
    }
    return null;
  }
};

const getRedisClient = () => redisClient;

const isRedisAvailable = () => isRedisConnected && redisClient && redisClient.isReady;

module.exports = {
  initRedis,
  getRedisClient,
  isRedisAvailable,
};
