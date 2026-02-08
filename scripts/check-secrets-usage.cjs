const fs = require("fs");
const path = require("path");

const root = process.cwd();
const pagesDir = path.join(root, "apps", "frontend", "src", "pages");
const settingsFile = path.join(pagesDir, "SettingsPage.tsx");

const secretPatterns = [
  /OPENAI_API_KEY/i,
  /ANTHROPIC_API_KEY/i,
  /DATAFORSEO_/i,
  /PERPLEXITY/i,
];

const passwordPattern = /type=["']password["']/i;

function listTsxFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return listTsxFiles(fullPath);
    if (entry.isFile() && entry.name.endsWith(".tsx")) return [fullPath];
    return [];
  });
}

const files = listTsxFiles(pagesDir).filter((file) => file !== settingsFile);
const violations = [];

for (const file of files) {
  const contents = fs.readFileSync(file, "utf8");
  if (passwordPattern.test(contents)) {
    violations.push(`${path.relative(root, file)}: password input outside SettingsPage`);
  }
  for (const pattern of secretPatterns) {
    if (pattern.test(contents)) {
      violations.push(`${path.relative(root, file)}: secret string pattern ${pattern}`);
    }
  }
}

if (violations.length > 0) {
  console.error("Secret usage guard failed:\n" + violations.join("\n"));
  process.exit(1);
}

console.log("Secret usage guard passed.");
