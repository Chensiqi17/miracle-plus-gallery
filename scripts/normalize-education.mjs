#!/usr/bin/env node
/**
 * 将 data/batches/*.json 中 founders[].education[] 统一为中文规范名
 * 使用 scripts/education-canonical.mjs 的映射表
 */
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { toCanonicalEducation } from "./education-canonical.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const batchesDir = join(__dirname, "../data/batches");

const batchFiles = ["2021F.json", "2021S.json", "2022F.json", "2022S.json", "2023F.json", "2023S.json", "2024F.json", "2024S.json", "2025F.json", "2025S.json"];

let totalReplaced = 0;
let totalLeft = 0;

for (const file of batchFiles) {
  const path = join(batchesDir, file);
  let data;
  try {
    data = JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    console.warn("Skip (read error):", file, e.message);
    continue;
  }
  const projects = data.projects || data;
  const list = Array.isArray(projects) ? projects : [projects];
  let fileReplaced = 0;
  let fileLeft = 0;
  for (const project of list) {
    const founders = project.founders || [];
    for (const founder of founders) {
      const edu = founder.education;
      if (!Array.isArray(edu)) continue;
      for (let i = 0; i < edu.length; i++) {
        const raw = edu[i];
        const canon = toCanonicalEducation(raw);
        if (canon !== raw) {
          edu[i] = canon;
          fileReplaced++;
        } else {
          fileLeft++;
        }
      }
    }
  }
  if (fileReplaced > 0) {
    writeFileSync(path, JSON.stringify(data, null, 2), "utf8");
    console.log(file, "-> normalized", fileReplaced, "entries, left as-is", fileLeft);
  }
  totalReplaced += fileReplaced;
  totalLeft += fileLeft;
}

console.log("Done. Total normalized:", totalReplaced, "| left as-is:", totalLeft);
