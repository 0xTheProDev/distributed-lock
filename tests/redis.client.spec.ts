import { OnApplicationShutdown } from "@nestjs/common";
import Redis from "ioredis";

import { createRedisClient } from "../src/redis.client";

import type { AuthModuleOptions } from "../src/auth.module-options";

describe("createRedisClient", () => {
  let redisClient: Redis;

  beforeAll(async () => {
    const mockOptions: AuthModuleOptions = {
      auth: {
        appId: "testAppId",
        appName: "testAppName",
        appSecret: "testAppSecret",
      },
      gateway: {
        origin: "https://test-gateway.hackerrank.com",
      },
      redis: {
        host: "https://test-redis.hackerrank.com",
        port: 6379,
      },
    };

    redisClient = createRedisClient(mockOptions);
  });

  it("should create a Redis client", () => {
    const redisClient = createRedisClient({
      redis: {
        host: "https://test-redis.hackerrank.com",
        port: 6379,
      },
    } as AuthModuleOptions);

    expect(redisClient).toBeInstanceOf(Redis);
  });

  it("should configure Redis Client with appropriate settings", () => {
    const redisClient = createRedisClient({
      redis: {
        host: "https://test-redis.hackerrank.com",
        port: 6379,
      },
    } as AuthModuleOptions);

    expect(redisClient.options).toEqual(
      expect.objectContaining({
        enableOfflineQueue: false,
        enableReadyCheck: true,
        host: "https://test-redis.hackerrank.com",
        keepAlive: 1,
        lazyConnect: true,
        maxRetriesPerRequest: 0,
        port: 6379,
      }),
    );
  });

  it("should gracefully close connections during shutdown", () => {
    const redisClient = createRedisClient({
      redis: {
        host: "https://test-redis.hackerrank.com",
        port: 6379,
      },
    } as AuthModuleOptions);
    const quitSpy = vi.spyOn(redisClient, "quit").mockResolvedValue(null);

    (redisClient as unknown as OnApplicationShutdown).onApplicationShutdown();
    expect(quitSpy).toHaveBeenCalled();
  });
});
