import { createClient } from "redis";

const client = createClient({
  url: process.env.REDIS_URL,
});

client.on("error", (err) => console.error("Redis error:", err));

export const getRedis = async () => {
  if (!client.isOpen) {
    await client.connect();
  }
  return client;
};

