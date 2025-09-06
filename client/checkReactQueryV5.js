import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.join(__dirname, "src");

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const regex = /use(Query|Mutation)\(\s*\[/g; // matches useQuery([ or useMutation([
  if (regex.test(content)) {
    console.log(`⚠️  Potential old v4 syntax found in: ${filePath}`);
  }
}

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      scanDir(fullPath);
    } else if (
      fullPath.endsWith(".js") ||
      fullPath.endsWith(".jsx") ||
      fullPath.endsWith(".ts") ||
      fullPath.endsWith(".tsx")
    ) {
      scanFile(fullPath);
    }
  });
}

scanDir(SRC_DIR);
console.log("✅ Scan complete.");
