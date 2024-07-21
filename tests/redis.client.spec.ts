import Redis from "ioredis";

import { createRedisClient } from "../src/redis.client";

describe("createRedisClient", () => {
  it("should create a Redis Client", () => {
    const redisClient = createRedisClient({
      host: "redis://example.com",
    });

    expect(redisClient).toBeInstanceOf(Redis);
  });

  it("should configure Redis Client with appropriate default settings", () => {
    const redisClient = createRedisClient({
      host: "redis://example.com",
    });

    expect(redisClient.options).toEqual(
      expect.objectContaining({
        enableOfflineQueue: false,
        enableReadyCheck: true,
        host: "redis://example.com",
        keepAlive: 1,
        lazyConnect: true,
        maxRetriesPerRequest: 0,
      }),
    );
  });
});
