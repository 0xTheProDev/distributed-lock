import Redis from "ioredis";
import { v4 as uuid } from "uuid";
import { createRedisClient, DistributedLockConfig } from "./redis.client";
import { parityDel } from "./redis.utils";

/**
 * @internal
 * Functional Block to Execute in Exclusive Region.
 * The block must return an Observable.
 */
type ExclusiveCallback<T> = {
  (): T | Promise<T>;
};

/**
 * @internal
 * Mutual Exclusive Lock Identifier.
 */
type LockId = string;

/**
 * @internal
 * Time in MilliSecond unit.
 */
type TimeInMilliSecond = number;

/**
 * @internal
 * Lock Configuration Options.
 */
type LockOptions = {
  /** Time to live before the Lock expires (in Milliseconds). */
  ttl?: TimeInMilliSecond;
};

/**
 * @public
 * Error Class for Distributed Lock.
 */
export class DistributedLockError extends Error {}

/**
 * @public
 * Distributed Locking Mechanism implemented using Redis to provide Mutual Exclusion over Shared Resources in a Microservices Architecture.
 */
export class DistributedLock {
  /**
   * @private @property
   * Redis Client to connect with Redis Node that is shared across applications.
   */
  private readonly redisClient: Redis;

  /**
   * @private @property
   * NodeJS Timeout Id for the Timer Callback to release the Lock.
   */
  private timeoutId: NodeJS.Timeout | undefined;

  constructor(configuration: DistributedLockConfig) {
    this.redisClient = createRedisClient(configuration);
  }

  /**
   * Cleanup any Side-effect or Open Connections.
   */
  async dispose(): Promise<void> {
    clearTimeout(this.timeoutId);
    await this.redisClient.quit();
  }

  /**
   * Execute an Awaitable Function in a Globally Mutual Exclusive Region.
   * @param scope - Authorization Scope (e.g., Application or Resource Name).
   * @param callback - Functional Block to Execute in the Exclusive Region.
   * @param options - Lock Configuration Options.
   * @returns Return value of the callback as it were.
   */
  async execute<T>(
    scope: string,
    callback: ExclusiveCallback<T>,
    options?: LockOptions,
  ): Promise<T> {
    const executor = async () => {
      const lockId = await this.lock(scope, options);
      const result = await callback();
      await this.unlock(scope, lockId);
      return result;
    };

    if (!(await this.isLocked(scope))) {
      return executor();
    }

    const expiryInMs = await this.expiry(scope);

    if (Number.isFinite(expiryInMs)) {
      return new Promise<T>((resolve, reject) => {
        const deferredCb = () => executor().then(resolve, reject);
        this.timeoutId = setTimeout(deferredCb, expiryInMs);
      });
    }

    throw new DistributedLockError(
      `Unable to execute the function[${callback.name ?? "Function"}] within the exclusive region for the resource "${scope}"`,
    );
  }

  /**
   * Countdown a Shared Exclusive Lock.
   * @param scope - Authorization Scope (e.g., Application or Resource Name).
   * @returns Time to live for the lock.
   */
  async expiry(scope: string) {
    try {
      const ttl = await this.redisClient.pttl(this.getKey(scope));
      return ttl > 0 ? ttl : 0;
    } catch (err) {
      throw new DistributedLockError(
        `Failed to retrieve expiry duration for the resource "${scope}"`,
        { cause: err },
      );
    }
  }

  /**
   * Check if the resource is locked.
   * @param scope - Authorization Scope (e.g., Application or Resource Name).
   * @returns True, iff the resource is locked by a consumer, False otherwise.
   */
  async isLocked(scope: string): Promise<boolean> {
    try {
      const lockId = await this.redisClient.get(this.getKey(scope));
      return lockId != null;
    } catch (err) {
      throw new DistributedLockError(
        `Failed to retrieve lock info for the resource "${scope}"`,
        { cause: err },
      );
    }
  }

  /**
   * Acquire a Shared Exclusive Lock.
   * @param scope - Authorization Scope (e.g., Application or Resource Name).
   * @param options - Lock Configuration Options.
   * @returns Globally Unique Lock Id.
   */
  async lock(scope: string, options?: LockOptions): Promise<LockId> {
    const lockId = this.getUniqueId();

    try {
      if (options?.ttl) {
        this.redisClient.set(
          this.getKey(scope),
          lockId,
          "PX",
          options.ttl,
          "NX",
        );
      } else {
        this.redisClient.set(this.getKey(scope), lockId, "NX");
      }
    } catch (err) {
      throw new DistributedLockError(
        `Failed to acquire lock for the resource "${scope}"`,
        { cause: err },
      );
    }

    return lockId;
  }

  /**
   * Release a Shared Exclusive Lock.
   * @param scope - Authorization Scope (e.g., Application or Resource Name).
   * @param lockId - Globally Unique Lock Id.
   * @returns True, iff the lock was released successfully.
   */
  async unlock(scope: string, lockId: LockId): Promise<true> {
    try {
      await parityDel(this.redisClient, this.getKey(scope), lockId);
      return true;
    } catch (err) {
      throw new DistributedLockError(
        `Failed to release lock for the resource "${scope}"`,
        { cause: err },
      );
    }
  }

  /**
   * @private
   * Produce Key to Hold the Lock after Acquiring.
   * @param scope - Authorization Scope (e.g., Application or Resource Name).
   * @returns Redis Key to hold the Lock.
   */
  private getKey(scope: string): `${string}:lock` {
    return `${scope}:lock`;
  }

  /**
   * @private
   * Generate Globally Unique Lock Identifier.
   * @returns The Lock Id Generated.
   */
  private getUniqueId(): LockId {
    return uuid(null, Buffer.alloc(16)).toString("base64");
  }
}
