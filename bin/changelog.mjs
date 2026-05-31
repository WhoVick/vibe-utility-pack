#!/usr/bin/env node
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const args = process.argv.slice(2);
const today = new Date().toISOString().slice(0, 10);

function stdinText() {
  try {
    if (process.stdin.isTTY) return "";
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function gitLog() {
  try {
    return execSync("git log --pretty=format:%s -n 80", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      timeout: 5000
    });
  } catch {
    return "";
  }
}

function fileInput() {
  const index = args.indexOf("--from-file");
  if (index === -1 || !args[index + 1] || !existsSync(args[index + 1])) return "";
  return readFileSync(args[index + 1], "utf8");
}

function classify(line) {
  const cleaned = line.trim().replace(/^[a-f0-9]{7,40}\s+/i, "");
  const match = cleaned.match(/^(\w+)(\(.+\))?!?:\s+(.+)/);
  const type = match?.[1] || "";
  const message = match?.[3] || cleaned;
  if (type === "feat") return ["Features", message];
  if (type === "fix") return ["Fixes", message];
  if (type === "docs") return ["Docs", message];
  if (["chore", "refactor", "test", "build", "ci", "perf"].includes(type)) return ["Maintenance", message];
  return ["Other", message];
}

const input = fileInput() || stdinText() || gitLog();
const lines = input.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
const groups = new Map([
  ["Features", []],
  ["Fixes", []],
  ["Docs", []],
  ["Maintenance", []],
  ["Other", []]
]);

for (const line of lines) {
  const [group, message] = classify(line);
  groups.get(group).push(message);
}

const output = `# Release Notes - ${today}

${Array.from(groups.entries()).filter(([, items]) => items.length).map(([group, items]) => `## ${group}

${items.map((item) => `- ${item}`).join("\n")}`).join("\n\n") || "No commit messages found. Pipe commit lines into this command or run it inside a Git repository."}
`;

console.log(output);
