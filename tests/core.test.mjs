import assert from "node:assert/strict";
import test from "node:test";
import {
  assessReadme,
  buildChangelogNotes,
  categorize,
  parseCsv,
  parseDoctorDiagnostics,
  parseMeetingNotes,
  summarizeFinanceCsv
} from "../src/core.mjs";

test("parseCsv handles quoted commas, escaped quotes, and CRLF rows", () => {
  const rows = parseCsv('date,description,amount\r\n2026-05-01,"Coffee, large",-4.90\r\n2026-05-02,"He said ""thanks""",12');
  assert.deepEqual(rows, [
    ["date", "description", "amount"],
    ["2026-05-01", "Coffee, large", "-4.90"],
    ["2026-05-02", 'He said "thanks"', "12"]
  ]);
});

test("summarizeFinanceCsv categorizes expenses and calculates totals", () => {
  const report = summarizeFinanceCsv(`date,description,amount
2026-05-01,Coffee shop,-4.90
2026-05-02,Salary,4200
2026-05-03,Rent payment,-1500
2026-05-04,AWS bill,-21.20`);
  assert.equal(report.income, 4200);
  assert.equal(report.expense, 1526.1);
  assert.equal(report.byCategory.Dining, 4.9);
  assert.equal(report.byCategory.Housing, 1500);
  assert.equal(report.byCategory.Subscriptions, 21.2);
  assert.match(report.cleanCsv, /Coffee shop/);
});

test("categorize recognizes common maintainer-tool spending labels", () => {
  assert.equal(categorize("OpenAI subscription"), "Subscriptions");
  assert.equal(categorize("Client invoice"), "Income");
  assert.equal(categorize("Parking downtown"), "Transport");
});

test("assessReadme reports missing signals and preserves the title", () => {
  const report = assessReadme(`# Tiny Tool

## Install

npm start

## License

MIT`);
  assert.equal(report.total, 7);
  assert.ok(report.passed >= 3);
  assert.ok(report.checks.some((check) => check.name === "Usage example" && !check.ok));
  assert.match(report.outline, /^# Tiny Tool/m);
});

test("parseMeetingNotes extracts decisions, action owners, due dates, and risks", () => {
  const report = parseMeetingNotes(`Decision: Ship beta invite page this week.
@maya follow up with legal by 2026-06-04
TODO Sam update pricing copy
Risk: onboarding emails still feel too generic`);
  assert.deepEqual(report.decisions, ["Ship beta invite page this week."]);
  assert.equal(report.actions[0].owner, "maya");
  assert.equal(report.actions[0].due, "2026-06-04");
  assert.equal(report.actions[1].owner, "Sam");
  assert.match(report.markdown, /onboarding emails/);
});

test("parseDoctorDiagnostics flags present and missing tools", () => {
  const report = parseDoctorDiagnostics(`node --version: v24.11.1
npm --version: 11.6.2
git --version: not found`);
  assert.equal(report.results.find((item) => item.name === "Node.js").ok, true);
  assert.equal(report.results.find((item) => item.name === "Git").ok, false);
  assert.match(report.markdown, /Dev Environment Report/);
});

test("buildChangelogNotes groups conventional commits", () => {
  const report = buildChangelogNotes(`feat: add CSV importer
fix: handle empty amount values
docs: update README quickstart
refactor: simplify parser`, "2026-06-01");
  assert.deepEqual(report.groups.Features, ["add CSV importer"]);
  assert.deepEqual(report.groups.Fixes, ["handle empty amount values"]);
  assert.deepEqual(report.groups.Docs, ["update README quickstart"]);
  assert.deepEqual(report.groups.Maintenance, ["simplify parser"]);
  assert.match(report.markdown, /Release Notes - 2026-06-01/);
});
