/**
 * @internal
 * An Object optionally wrapped inside a Promise.
 */
export type PromiseLike<T> = T | Promise<T>;

/**
 * @internal
 * Functional Block to Execute in Exclusive Region.
 * The block must return an Observable.
 */
export type ExclusiveCallback<T> = {
  (): PromiseLike<T>;
};

/**
 * @internal
 * Mutual Exclusive Lock Identifier.
 */
export type LockId = string;

/**
 * @internal
 * Time in MilliSecond unit.
 */
type TimeInMilliSecond = number;

/**
 * @public
 * Lock Configuration Options.
 */
export type LockOptions = {
  /** Time to live before the Lock expires (in Milliseconds). */
  ttl?: TimeInMilliSecond;
};
