export const readmeChecks = [
  ["Project title", /^#\s+.+/m, "Add a single clear H1 with the project name."],
  ["Problem statement", /problem|why|purpose|for .+ who/i, "Explain who this helps and why it exists."],
  ["Install steps", /install|setup|getting started/i, "Include exact installation or startup commands."],
  ["Usage example", /usage|example|quickstart|demo/i, "Show the first successful command or workflow."],
  ["Screenshot or GIF", /screenshot|demo|\.png|\.gif|\.webp/i, "Add a visual proof of what the project does."],
  ["License", /license/i, "State the license so people know how they can use it."],
  ["Contributing", /contributing|pull request|issues/i, "Add a tiny contribution note or issue policy."]
];

export function assessReadme(text) {
  const source = String(text || "").trim();
  const checks = readmeChecks.map(([name, pattern, fix]) => ({
    name,
    ok: pattern.test(source),
    fix
  }));
  const passed = checks.filter((check) => check.ok).length;
  const title = (source.match(/^#\s+(.+)/m) || [null, "Project Name"])[1];
  return {
    passed,
    total: checks.length,
    checks,
    outline: `# ${title}

One-sentence promise: what this does, for whom, and why it is better than doing it manually.

## Demo

Add a screenshot, GIF, or short terminal example here.

## Features

- Fast local workflow
- Clear input and output
- No hidden setup

## Install

\`\`\`bash
npm install
npm start
\`\`\`

## Usage

\`\`\`bash
npm run example
\`\`\`

## Roadmap

- Add tests around the core parser
- Publish a hosted demo
- Package the CLI

## License

MIT`
  };
}

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  const source = String(text || "");
  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    const next = source[i + 1];
    if (char === '"' && quoted && next === '"') {
      cell += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}

export function categorize(description) {
  const value = String(description || "").toLowerCase();
  if (/rent|mortgage|lease/.test(value)) return "Housing";
  if (/grocery|market|food|supermarket/.test(value)) return "Groceries";
  if (/coffee|restaurant|cafe|bar/.test(value)) return "Dining";
  if (/metro|uber|taxi|fuel|parking|train/.test(value)) return "Transport";
  if (/aws|openai|github|netflix|spotify|subscription|bill/.test(value)) return "Subscriptions";
  if (/salary|payroll|invoice|client/.test(value)) return "Income";
  return "Other";
}

function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function summarizeFinanceCsv(text) {
  const rows = parseCsv(text);
  const headers = rows.shift()?.map((item) => item.trim().toLowerCase()) || [];
  const dateIndex = headers.indexOf("date");
  const descIndex = headers.indexOf("description");
  const amountIndex = headers.indexOf("amount");
  const records = rows.map((row) => {
    const amount = Number(String(row[amountIndex] || "0").replace(/\s/g, ""));
    const description = row[descIndex] || "";
    return {
      date: row[dateIndex] || "",
      description,
      amount,
      category: categorize(description)
    };
  }).filter((record) => Number.isFinite(record.amount));

  const income = roundMoney(records.filter((record) => record.amount > 0).reduce((sum, record) => sum + record.amount, 0));
  const expense = roundMoney(records.filter((record) => record.amount < 0).reduce((sum, record) => sum + Math.abs(record.amount), 0));
  const byCategory = records.reduce((map, record) => {
    if (record.amount < 0) map[record.category] = roundMoney((map[record.category] || 0) + Math.abs(record.amount));
    return map;
  }, {});
  const cleanCsv = ["date,description,amount,category", ...records.map((record) => [
    record.date,
    `"${record.description.replaceAll('"', '""')}"`,
    record.amount.toFixed(2),
    record.category
  ].join(","))].join("\n");

  return { records, income, expense, net: roundMoney(income - expense), byCategory, cleanCsv };
}

export function parseMeetingNotes(text) {
  const lines = String(text || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const decisions = [];
  const risks = [];
  const actions = [];
  lines.forEach((line) => {
    if (/^decision\s*:/i.test(line)) {
      decisions.push(line.replace(/^decision\s*:\s*/i, ""));
      return;
    }
    if (/^risk\s*:/i.test(line)) {
      risks.push(line.replace(/^risk\s*:\s*/i, ""));
      return;
    }
    if (/todo|action|follow up|follow-up|next/i.test(line)) {
      const owner = (line.match(/@([a-z0-9_-]+)/i) || line.match(/(?:todo|action)\s+([A-Z][a-z0-9_-]+)/i) || [null, "Unassigned"])[1];
      const exactDate = line.match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0];
      const due = exactDate || line.match(/\bby\s+(.+)$/i)?.[1] || "No due date";
      actions.push({ owner, due, task: line.replace(/^(todo|action)\s*:?\s*/i, "").replace(/@\w+/, "").trim() });
    }
  });

  return {
    decisions,
    risks,
    actions,
    markdown: `# Meeting Summary

## Decisions

${decisions.map((item) => `- ${item}`).join("\n") || "- None found."}

## Action Items

${actions.map((item) => `- [ ] ${item.task} | owner: ${item.owner} | due: ${item.due}`).join("\n") || "- None found."}

## Risks / Follow-ups

${risks.map((item) => `- ${item}`).join("\n") || "- None found."}`
  };
}

export function parseDoctorDiagnostics(input) {
  const checks = [
    ["Node.js", /node[^\n]*?v?(\d+)\./i, 18],
    ["npm", /npm[^\n]*?(\d+)\./i, 8],
    ["Git", /git version\s+(\d+)\./i, 2],
    ["Python", /python[^\n]*?(\d+)\.(\d+)/i, 3],
    ["Docker", /docker version\s+(\d+)\./i, 20]
  ];
  const results = checks.map(([name, pattern, minimum]) => {
    const match = String(input || "").match(pattern);
    if (!match) return { name, ok: false, detail: "not found in pasted diagnostics" };
    const major = Number(match[1]);
    return { name, ok: major >= minimum, detail: `detected major ${major}, recommended ${minimum}+` };
  });

  return {
    results,
    markdown: `# Dev Environment Report

${results.map((result) => `- ${result.ok ? "[x]" : "[ ]"} ${result.name}: ${result.detail}`).join("\n")}

## Suggested next step

Install or expose missing tools on PATH, then rerun the doctor.`
  };
}

export function buildChangelogNotes(text, date = new Date().toISOString().slice(0, 10)) {
  const groups = {
    Features: [],
    Fixes: [],
    Docs: [],
    Maintenance: [],
    Other: []
  };
  String(text || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).forEach((line) => {
    const cleaned = line.replace(/^[a-f0-9]{7,40}\s+/i, "");
    const match = cleaned.match(/^(\w+)(\(.+\))?!?:\s+(.+)/);
    const type = match?.[1] || "";
    const message = match?.[3] || cleaned;
    if (type === "feat") groups.Features.push(message);
    else if (type === "fix") groups.Fixes.push(message);
    else if (type === "docs") groups.Docs.push(message);
    else if (["chore", "refactor", "test", "build", "ci"].includes(type)) groups.Maintenance.push(message);
    else groups.Other.push(message);
  });

  const body = Object.entries(groups)
    .filter(([, items]) => items.length)
    .map(([name, items]) => `## ${name}

${items.map((item) => `- ${item}`).join("\n")}`)
    .join("\n\n") || "No changes found.";

  return {
    groups,
    markdown: `# Release Notes - ${date}

${body}`
  };
}
