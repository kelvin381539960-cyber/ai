import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const schemaPath = join(__dirname, "..", "openapi.yaml");

const content = readFileSync(schemaPath, "utf8");

const requiredFragments = [
  "openapi: 3.1.0",
  "/messages/search:",
  "/messages/summary:",
  "/messages/tasks:",
  "/threads/search:",
  "/threads/{thread_key}:",
  "/threads/summary:",
  "/threads/tasks:",
  "bearerAuth:",
  "operationId: searchMessages",
  "operationId: searchThreads"
];

const missing = requiredFragments.filter((fragment) => !content.includes(fragment));

if (missing.length > 0) {
  console.error(`OpenAPI scaffold validation failed. Missing: ${missing.join(", ")}`);
  process.exit(1);
}

const forbiddenFragments = [
  "unbounded",
  "dumpAll",
  "exportAll"
];

const forbidden = forbiddenFragments.filter((fragment) => content.includes(fragment));

if (forbidden.length > 0) {
  console.error(`OpenAPI scaffold validation failed. Forbidden fragments: ${forbidden.join(", ")}`);
  process.exit(1);
}

console.log("OpenAPI scaffold validation passed.");
