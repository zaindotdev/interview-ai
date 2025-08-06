import { createClient } from "redis";

// Redis client for caching
const redisClient = createClient({
  url: process.env.REDIS_URL,
  name: "redis",
  socket: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || "6379"),
  },
});

export default redisClient;