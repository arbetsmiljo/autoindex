import { initKysely, latestDocuments } from "@/lib/database";
import { writeFile, stat } from "fs/promises";
import path from "path";

if (process.argv.length < 3) {
  console.log("Usage: pnpm latest <src> <dst>");
  process.exit(1);
}

(async function () {
  const [src, dst] = process.argv.slice(2).map((p) => path.resolve(p));
  const db = initKysely(src);
  const latest = await latestDocuments(db);
  console.log(`Writing ${latest.length} documents to ${dst}`);
  await writeFile(dst, JSON.stringify(latest));
  const { size } = await stat(dst);
  console.log(`Wrote ${size} bytes`);
})();
