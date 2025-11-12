import { mkdir, rm, cp } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const OUT = ".vercel/output";
const STATIC_DIR = join(OUT, "static");

(async () => {
  if (existsSync(OUT)) await rm(OUT, { recursive: true, force: true });

  await mkdir(STATIC_DIR, { recursive: true });
  if (existsSync("public")) {
    await cp("public", STATIC_DIR, { recursive: true });
  }

  console.log("✅ Build Output static .vercel/output");
})();
