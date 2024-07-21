import Redis, { RedisKey } from "ioredis";
import fs from "node:fs";
import { DistributedLock } from "../src/distributed-lock";
import * as Client from "../src/redis.client";

describe("DistributedLock", () => {
  // Mock implementation of the Redis interface.
  class RedisClient {
    private readonly store = new Map<RedisKey, any>();

    async evalsha(
      _src: unknown,
      _numKeys: unknown,
      key: RedisKey,
      value: any,
    ): Promise<void> {
      const t = this.store.get(key);

      if (t?.value === value) {
        this.store.delete(key);
      }
    }

    async exists(key: RedisKey): Promise<boolean> {
      return this.store.has(key);
    }

    async get(key: RedisKey): Promise<any> {
      return this.store.get(key)?.value;
    }

    async pttl(key: RedisKey): Promise<number> {
      const t = this.store.get(key);

      if (t?.ttl) {
        return t.now + t.ttl - performance.now();
      }

      return Number.POSITIVE_INFINITY;
    }

    async quit() {
      return this.store.clear();
    }

    async set(
      key: RedisKey,
      value: any,
      ttlKey?: string,
      ttl?: number,
      exclusive?: string,
    ): Promise<"OK"> {
      this.store.set(key, {
        exclusive,
        now: performance.now(),
        ttlKey,
        ttl,
        value,
      });
      return "OK";
    }

    async ttl(key: RedisKey): Promise<number> {
      return this.store.get(key)?.ttl ?? Number.POSITIVE_INFINITY;
    }
  }

  let distributedLock: DistributedLock;
  let redisClient: Redis;

  beforeAll(async () => {
    // Mock File System to ensure that the Lua scripts do not load in test environment.
    vi.spyOn(fs, "readFileSync").mockReturnValue("");

    // Mock Redis Client factory to use Test implementation.
    vi.spyOn(Client, "createRedisClient").mockImplementation(
      () => new RedisClient() as unknown as Redis,
    );

    distributedLock = new DistributedLock({
      host: "redis://example.com",
    });
    redisClient = distributedLock["redisClient"];
  });

  afterEach(async () => {
    await redisClient.quit();
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  describe("#dispose", () => {
    it("should close Redis connection", async () => {
      const quitFn = vi.spyOn(redisClient, "quit");
      await distributedLock.dispose();
      expect(quitFn).toBeCalled();
    });
  });

  describe("#expiry", () => {
    it("should return remaining time to live", async () => {
      const lockId = Math.round(Math.random() * 1000).toLocaleString();
      const ttl = Math.round(Math.random() * 1000);
      await redisClient.set("testApp:lock", lockId, "PX", ttl);
      expect(await distributedLock.expiry("testApp")).toBeLessThan(ttl);
    });
  });

  describe("#isLocked", () => {
    it("should return true if there is a lock", async () => {
      const lockId = Math.round(Math.random() * 1000).toLocaleString();
      await redisClient.set("testApp:lock", lockId);
      expect(await distributedLock.isLocked("testApp")).toBe(true);
    });

    it("should return false if there is no lock", async () => {
      expect(await distributedLock.isLocked("testApp")).toBe(false);
    });
  });

  describe("#lock", () => {
    it("should acquire a lock", async () => {
      const lockId = await distributedLock.lock("testApp");
      expect(await redisClient.get("testApp:lock")).toBe(lockId);
    });

    it("should allow time to live", async () => {
      const ttl = Math.round(Math.random() * 1000) + 5000;
      await distributedLock.lock("testApp", { ttl });
      expect(await redisClient.ttl("testApp:lock")).toBe(ttl);
    });
  });

  describe("#unlock", () => {
    it("should release a lock", async () => {
      const lockId = Math.round(Math.random() * 1000).toLocaleString();
      await redisClient.set("testApp:lock", lockId);
      await distributedLock.unlock("testApp", lockId);
      expect(await redisClient.get("testApp:lock")).toBeUndefined();
    });

    it("should not release a lock that it does not own", async () => {
      const lockId = Math.round(Math.random() * 1000).toLocaleString();
      const differentLockId = Math.round(Math.random() * 1000).toLocaleString();
      await redisClient.set("testApp:lock", lockId);
      await distributedLock.unlock("testApp", differentLockId);
      expect(await redisClient.get("testApp:lock")).toBe(lockId);
    });
  });
});
