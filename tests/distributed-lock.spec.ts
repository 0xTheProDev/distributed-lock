import { Test, TestingModule } from "@nestjs/testing";
import Redis, { RedisKey } from "ioredis";
import { lastValueFrom } from "rxjs";

import { DistributedLock } from "../src/_distributed-lock";

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

    async get(key: RedisKey): Promise<any> {
      return this.store.get(key)?.value;
    }

    async pttl(key: RedisKey): Promise<number | void> {
      const t = this.store.get(key);

      if (t?.ttl) {
        return t.now + t.ttl - performance.now();
      }
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
    ): Promise<void> {
      this.store.set(key, {
        exclusive,
        now: performance.now(),
        ttlKey,
        ttl,
        value,
      });
    }

    async ttl(key: RedisKey): Promise<number | void> {
      return this.store.get(key)?.ttl;
    }
  }

  let distributedLock: DistributedLock;
  let redisClient: Redis;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DistributedLock,
        {
          provide: Redis,
          useClass: RedisClient,
        },
      ],
    }).compile();

    distributedLock = module.get<DistributedLock>(DistributedLock);
    redisClient = module.get<Redis>(Redis);
  });

  afterEach(async () => {
    await redisClient.quit();
  });

  it("should be defined", () => {
    expect(distributedLock).toBeDefined();
  });

  describe("#isLocked", () => {
    it("should return true if there is a lock", async () => {
      const lockId = Math.round(Math.random() * 1000).toLocaleString();
      await redisClient.set("testApp:lock", lockId);
      expect(await lastValueFrom(distributedLock.isLocked("testApp"))).toBe(
        true,
      );
    });

    it("should return false if there is no lock", async () => {
      expect(await lastValueFrom(distributedLock.isLocked("testApp"))).toBe(
        false,
      );
    });
  });

  describe("#lock", () => {
    it("should acquire a lock", async () => {
      const lockId = await lastValueFrom(distributedLock.lock("testApp"));
      expect(await redisClient.get("testApp:lock")).toBe(lockId);
    });

    it("should allow time to live", async () => {
      const ttl = Math.round(Math.random() * 1000) + 5000;
      await lastValueFrom(distributedLock.lock("testApp", { ttl }));
      expect(await redisClient.ttl("testApp:lock")).toBe(ttl);
    });
  });

  describe("#timeToUnlock", () => {
    it("should return remaining time to live", async () => {
      const lockId = Math.round(Math.random() * 1000).toLocaleString();
      const ttl = Math.round(Math.random() * 1000);
      await redisClient.set("testApp:lock", lockId, "PX", ttl);
      expect(
        await lastValueFrom(distributedLock.timeToUnlock("testApp")),
      ).toBeLessThan(ttl);
    });
  });

  describe("#unlock", () => {
    it("should release a lock", async () => {
      const lockId = Math.round(Math.random() * 1000).toLocaleString();
      await redisClient.set("testApp:lock", lockId);
      await lastValueFrom(distributedLock.unlock("testApp", lockId));
      expect(await redisClient.get("testApp:lock")).toBeUndefined();
    });

    it("should not release a lock that it does not own", async () => {
      const lockId = Math.round(Math.random() * 1000).toLocaleString();
      const differentLockId = Math.round(Math.random() * 1000).toLocaleString();
      await redisClient.set("testApp:lock", lockId);
      await lastValueFrom(distributedLock.unlock("testApp", differentLockId));
      expect(await redisClient.get("testApp:lock")).toBe(lockId);
    });
  });
});
