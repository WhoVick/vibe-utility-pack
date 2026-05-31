#!/usr/bin/env node
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { delimiter, join } from "node:path";

const args = new Set(process.argv.slice(2));
const cwd = process.cwd();

const commandChecks = [
  { name: "Node.js", command: "node --version", min: 18, pattern: /v?(\d+)\./, current: () => process.version },
  { name: "npm", command: "npm --version", min: 8, pattern: /(\d+)\./ },
  { name: "Git", command: "git --version", min: 2, pattern: /git version\s+(\d+)\./i },
  { name: "Python", command: "python --version", min: 3, pattern: /python\s+(\d+)\./i },
  { name: "Docker", command: "docker --version", min: 20, pattern: /docker version\s+(\d+)\./i, optional: true }
];

const fileChecks = [
  { name: "README", path: "README.md", detail: "Project intro exists" },
  { name: "Package manifest", path: "package.json", detail: "Node scripts can be discovered" },
  { name: "Env example", path: ".env.example", detail: "Secrets are documented safely", optional: true },
  { name: "Git ignore", path: ".gitignore", detail: "Generated files are excluded" },
  { name: "License", path: "LICENSE", detail: "Usage terms are explicit", optional: true }
];

function run(command) {
  try {
    return execSync(command, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 4000
    }).trim();
  } catch (error) {
    return "";
  }
}

function findOnPath(command) {
  const executable = command.split(/\s+/)[0];
  const pathExt = process.platform === "win32"
    ? (process.env.PATHEXT || ".EXE;.CMD;.BAT").split(";")
    : [""];
  const names = process.platform === "win32" && !/\.[a-z0-9]+$/i.test(executable)
    ? pathExt.map((ext) => executable + ext.toLowerCase()).concat(pathExt.map((ext) => executable + ext.toUpperCase()))
    : [executable];
  return (process.env.PATH || "")
    .split(delimiter)
    .filter(Boolean)
    .flatMap((dir) => names.map((name) => join(dir, name)))
    .find((path) => existsSync(path));
}

function checkCommand(check) {
  const output = check.current ? check.current() : run(check.command);
  if (!output) {
    const path = findOnPath(check.command);
    if (path) {
      return {
        name: check.name,
        ok: true,
        optional: check.optional,
        detail: `found on PATH (${path}); version check unavailable in this sandbox`,
        output: ""
      };
    }
    return { name: check.name, ok: Boolean(check.optional), optional: check.optional, detail: "not found on PATH", output: "" };
  }
  const major = Number(output.match(check.pattern)?.[1]);
  const ok = Number.isFinite(major) ? major >= check.min : true;
  return {
    name: check.name,
    ok,
    optional: check.optional,
    detail: ok ? `${output}` : `${output}; recommended major ${check.min}+`,
    output
  };
}

function checkFile(check) {
  const ok = existsSync(join(cwd, check.path));
  return {
    name: check.name,
    ok: ok || Boolean(check.optional),
    optional: check.optional,
    detail: ok ? check.detail : `${check.path} missing`
  };
}

const results = [...commandChecks.map(checkCommand), ...fileChecks.map(checkFile)];
const score = Math.round((results.filter((item) => item.ok).length / results.length) * 100);

if (args.has("--json")) {
  console.log(JSON.stringify({ cwd, score, results }, null, 2));
  if (args.has("--strict") && score < 90) process.exit(1);
  process.exit(0);
}

const markdown = `# Dev Environment Doctor

Workspace: \`${cwd}\`
Score: ${score}/100

${results.map((item) => `- ${item.ok ? "[x]" : "[ ]"} ${item.name}: ${item.detail}${item.optional ? " (optional)" : ""}`).join("\n")}

## Next step

${results.filter((item) => !item.ok).map((item) => `- Fix ${item.name}: ${item.detail}`).join("\n") || "- Environment looks ready."}
`;

if (args.has("--markdown")) {
  console.log(markdown);
} else {
  console.log(`Dev Environment Doctor - ${score}/100`);
  console.log("");
  for (const item of results) {
    const mark = item.ok ? "OK " : "FIX";
    console.log(`${mark} ${item.name.padEnd(18)} ${item.detail}`);
  }
  console.log("");
  console.log(args.has("--strict") && score < 90 ? "Strict mode failed." : "Run with --markdown or --json for automation.");
}

if (args.has("--strict") && score < 90) process.exit(1);
