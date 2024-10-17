process.env["TEST_ENV"] = "true";

/**
 * Mock `fs.readFile` to Avoid Actually Reading Server Scripts during Test.
 */
vi.mock("node:fs/promises", async (importOriginal) => {
  const actual = (await importOriginal()) as object;

  return {
    ...actual,
    readFile: () => Promise.resolve("FILE CONTENT"),
  };
});
