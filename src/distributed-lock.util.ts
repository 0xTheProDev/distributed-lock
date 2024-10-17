import { randomUUID } from "node:crypto";

import type { LockId } from "./distributed-lock.types";

/**
 * @internal
 * Produce Key to Hold the Lock after Acquiring.
 * @param scope - Authorization Scope (e.g., Application or Resource Name).
 * @returns Redis Key to hold the Lock.
 */
export const getKey = (scope: string): `${string}:lock` => {
  return `${scope}:lock`;
};

/**
 * @internal
 * Generate Globally Unique Lock Identifier.
 * @returns The Lock Id Generated.
 */
export const getUniqueId = (): LockId => {
  return Buffer.from(randomUUID()).toString("base64");
};
