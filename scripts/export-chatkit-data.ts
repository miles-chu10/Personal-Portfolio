import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { earlier, footerLinks, impactRows, latest, miscLinks, profile, skillRows } from "../src/data/portfolio";

const target = fileURLToPath(new URL("../backend/portfolio.json", import.meta.url));
const snapshot = JSON.stringify({ profile, timeline: { latest, earlier }, impact: impactRows, skills: skillRows, links: { misc: miscLinks, footer: footerLinks } }, null, 2) + "\n";

if (process.argv.includes("--check")) {
  if (readFileSync(target, "utf8") !== snapshot) throw new Error("ChatKit portfolio snapshot is stale. Run npm run export:chatkit.");
} else {
  mkdirSync(fileURLToPath(new URL("../backend/", import.meta.url)), { recursive: true });
  writeFileSync(target, snapshot);
}
