import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type { Redis } from "ioredis";
import type { PromiseLike } from "./distributed-lock.types";

/**
 * @internal
 * Current Directory Absolute Path from ESM Import URL.
 */
const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * @internal
 * Object Representation of Lua Server Scripts.
 */
type Script = {
  /** Script content in UTF-8 Encoding. */
  content: string;
  /** SHA Hash of the Script Content. */
  shasum: string;
};

/**
 * @internal
 * Obtain Lua Script to execute in Redis Server.
 * @param fileName - Name of the file that contains the Lua Script.
 * @returns Lua Script in UTF-8 encoding and corresponding SHAsum.
 */
const getScript = async (fileName: string): Promise<Script> => {
  const srcPath = resolve(__dirname, fileName);
  const content = await readFile(srcPath, "utf8");
  const shasum = createHash("sha1").update(content).digest("hex");
  return { content, shasum };
};

/**
 * @internal
 * Factory function to create JavaScript function that executes Redis Server Script.
 * @param script - Lua Script to run in Redis Server, could be wrapped inside a Promise.
 * @returns Pure JavaScript Function to invoke with Redis Client.
 */
const exec = (script: PromiseLike<Script>) => {
  let executionCounter = 0;
  let program: Script | null = null;

  return async (client: Redis, key: string, value: string): Promise<number> => {
    program ||= await script;

    if (executionCounter) {
      return (await client.evalsha(program.shasum, 1, key, value)) as number;
    }

    executionCounter++;
    return (await client.eval(program.content, 1, key, value)) as number;
  };
};

/**
 * @internal
 * Deletes a key specified in the argument if the value it holds matches expectation.
 * @param client - Redis Client instance.
 * @param key - Shared Key.
 * @param value - Expected Value.
 * @returns Number of keys deleted, 0 for none.
 */
export const parityDel = exec(getScript("./parity-del.lua"));
