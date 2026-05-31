#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const cwd = process.cwd();
const args = new Set(process.argv.slice(2));
const ignore = new Set([".git", "node_modules", "dist", "build", "coverage", ".next", "venv", "__pycache__"]);

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (ignore.has(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path, acc);
    else acc.push(path);
  }
  return acc;
}

function hasFile(name) {
  return existsSync(join(cwd, name));
}

function hasAny(patterns, files) {
  return files.some((file) => patterns.some((pattern) => pattern.test(file.replaceAll("\\", "/"))));
}

const files = walk(cwd);
const packageJson = hasFile("package.json") ? JSON.parse(readFileSync(join(cwd, "package.json"), "utf8")) : {};

const checks = [
  { key: "readme", label: "README", ok: hasFile("README.md"), fix: "Add a README with problem, install, usage, and demo sections." },
  { key: "license", label: "License", ok: hasFile("LICENSE"), fix: "Add MIT, Apache-2.0, or another explicit license." },
  { key: "gitignore", label: ".gitignore", ok: hasFile(".gitignore"), fix: "Ignore dependencies, logs, local env files, and generated output." },
  { key: "tests", label: "Tests", ok: Boolean(packageJson.scripts?.test) || hasAny([/\/test\//, /\/tests\//, /\.test\./, /\.spec\./], files), fix: "Add a small smoke test or a test script." },
  { key: "ci", label: "CI", ok: hasAny([/\.github\/workflows\/.+\.ya?ml$/], files), fix: "Add a GitHub Actions workflow for checks." },
  { key: "examples", label: "Examples", ok: hasAny([/\/examples\//, /\/demo\//, /screenshot/i], files), fix: "Add example input/output or screenshots." },
  { key: "env", label: "Env sample", ok: hasFile(".env.example") || /env/i.test(readmeText()), fix: "Document environment variables without committing secrets." },
  { key: "changelog", label: "Changelog", ok: hasFile("CHANGELOG.md"), fix: "Generate a starter CHANGELOG.md from commits." }
];

function readmeText() {
  try {
    return readFileSync(join(cwd, "README.md"), "utf8");
  } catch {
    return "";
  }
}

const score = Math.round((checks.filter((check) => check.ok).length / checks.length) * 100);
const report = `# Repository Health

Score: ${score}/100

## Checks

${checks.map((check) => `- ${check.ok ? "[x]" : "[ ]"} ${check.label}${check.ok ? "" : ` - ${check.fix}`}`).join("\n")}

## Badge

![repo health](https://img.shields.io/badge/repo_health-${score}%25-${score >= 75 ? "green" : score >= 45 ? "yellow" : "red"})
`;

if (args.has("--json")) {
  console.log(JSON.stringify({ cwd, score, checks }, null, 2));
} else {
  console.log(report);
}

if (args.has("--write")) {
  writeFileSync(join(cwd, "HEALTH.md"), report);
  console.error("Wrote HEALTH.md");
}

if (args.has("--strict") && score < 75) process.exit(1);
