import { Redis } from "ioredis";
import crypto from "node:crypto";
import fs from "node:fs/promises";
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
const getScript = async (fileName: string): Promise<string> => {
  const srcPath = path.resolve(__dirname, fileName);
  const script = await fs.readFile(srcPath, "utf8");
  return crypto.createHash("sha1").update(script).digest("hex");
};

/**
 * @internal
 * Deletes a key specified in the argument if the value it holds matches expectation.
 * @param client - Redis Client instance.
 * @param key - Shared Key.
 * @param value - Expected Value.
 * @returns Number of keys deleted, 0 for none.
 */
export const parityDel = async (
  client: Redis,
  key: string,
  value: string,
): Promise<number> => {
  const digest = await getScript("./parity-del.lua");
  const numKeys = (await client.evalsha(digest, 1, key, value)) as number;
  return numKeys;
};
