// server/meta-template.ts
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

/* ---------------------------------------------------------------
   Decide which index.html to read:
     • production  → server/public/index.html  (built assets)
     • development → client/index.html        (raw Vite file)
---------------------------------------------------------------- */
const isProd  = process.env.NODE_ENV === "production";
const HTML_IN_PROD = path.join(__dirname, "public", "index.html");
const HTML_IN_DEV  = path.join(__dirname, "..", "client", "index.html");

export function loadBaseHtml(): string {
  const file = isProd ? HTML_IN_PROD : HTML_IN_DEV;
  return fs.readFileSync(file, "utf8");
}
