import { initKysely, latestDocuments } from "@/lib/database";
import fs from "fs";
import path from "path";

if (process.argv.length < 3) {
  console.log("Usage: pnpm latest <src> <dst>");
  process.exit(1);
}

(async function () {
  const [src, dst] = process.argv.slice(2).map((p) => path.resolve(p));
  const db = initKysely(src);
  const latest = await latestDocuments(db);
  fs.writeFileSync(dst, JSON.stringify(latest));
})();
