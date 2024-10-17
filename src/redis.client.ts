import Redis, { RedisOptions } from "ioredis";

/**
 * @public
 * Configuration for Distributed Lock.
 */
export type DistributedLockConfig = Omit<RedisOptions, "host"> & {
  /** Host Address of the Redis Node (either Cloud Native or Self-Hosted). */
  host: Exclude<RedisOptions["host"], undefined>;
};

/**
 * @internal
 * Default Configuration for the Distributed Lock.
 */
const defaultConfiguration: Partial<DistributedLockConfig> = {
  enableOfflineQueue: false,
  enableReadyCheck: true,
  keepAlive: 1,
  keyPrefix: "<distributed-lock>",
  lazyConnect: true,
  maxRetriesPerRequest: 0,
};

/**
 * @internal
 * Factory function for creating a new instance of the Redis Client for the Distributed Lock.
 *
 * @param configuration - Distributed Lock Configuration.
 * @returns Redis Client Instance.
 */
export const createRedisClient = (
  configuration: DistributedLockConfig,
): Redis =>
  new Redis({
    ...defaultConfiguration,
    ...configuration,
  });
