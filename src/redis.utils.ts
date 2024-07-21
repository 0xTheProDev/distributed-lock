import { Redis } from "ioredis";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * @internal
 * Current Directory Absolute Path from ESM Import URL.
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * @internal
 * Create JavaScript Function that executes a given Lua Script.
 * @param fileName - Name of the file that contains the Lua Script.
 * @returns SHA Digest of the Script in Hexadecimal encoding.
 */
const getScript = (fileName: string): string => {
  const srcPath = path.resolve(__dirname, fileName);
  const script = fs.readFileSync(srcPath, "utf8");
  return crypto.createHash("sha1").update(script).digest("hex");
};

/**
 * @internal
 * Deletes a key specified in the argument if the value it holds matches expectation.
 * @param client - Redis Client instance.
 * @param key - Shared Key.
 * @param value - Expected Value.
 * @returns Status Code 0 for successful evaluation.
 */
export const parityDel = (
  client: Redis,
  key: string,
  value: string,
): Promise<0> => {
  const digest = getScript("./parity-del.lua");
  return client.evalsha(digest, 1, key, value) as Promise<0>;
};
