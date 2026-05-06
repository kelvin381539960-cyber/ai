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
  "/threads/search:",
  "/threads/{thread_key}:",
  "bearerAuth:"
];

const missing = requiredFragments.filter((fragment) => !content.includes(fragment));

if (missing.length > 0) {
  console.error(`OpenAPI scaffold validation failed. Missing: ${missing.join(", ")}`);
  process.exit(1);
}

console.log("OpenAPI scaffold validation passed.");
