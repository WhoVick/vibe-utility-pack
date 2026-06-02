import assert from "node:assert/strict";
import test from "node:test";
import {
  buildLocalPrSummary,
  buildOpenAiPrompt,
  buildPrivacyNotice,
  createOpenAiSummary,
  parsePullRequestContext,
  resolveModel
} from "../src/pr-summary.mjs";

const sample = `Title: Add offline support and parser regression tests
Body: Adds service worker and parser tests.
Modified: app.js
Added: tests/core.test.mjs
commit: feat: add offline install support
commit: test: cover parser edge cases
@@ app.js
+ registerServiceWorker();`;

test("parsePullRequestContext extracts title, files, commits, and risk hints", () => {
  const context = parsePullRequestContext(sample);
  assert.equal(context.title, "Add offline support and parser regression tests");
  assert.deepEqual(context.files, ["app.js", "tests/core.test.mjs"]);
  assert.equal(context.commits.length, 2);
  assert.ok(context.riskHints.some((line) => /parser/i.test(line)));
});

test("buildLocalPrSummary creates maintainer checklist markdown", () => {
  const summary = buildLocalPrSummary(parsePullRequestContext(sample));
  assert.match(summary, /Pull Request Summary/);
  assert.match(summary, /app\.js/);
  assert.match(summary, /Suggested maintainer checklist/);
});

test("buildOpenAiPrompt clips long context and avoids inventing facts", () => {
  const context = parsePullRequestContext(`${sample}\n${"x".repeat(15000)}`);
  const prompt = buildOpenAiPrompt(context);
  assert.match(prompt, /Do not invent facts/);
  assert.match(prompt, /Input clipped/);
  assert.ok(prompt.length < 15000);
});

test("privacy notice makes external sending explicit", () => {
  const notice = buildPrivacyNotice("gpt-5-mini");
  assert.match(notice, /--send-to-openai/);
  assert.match(notice, /OPENAI_API_KEY/);
});

test("resolveModel honors CLI override before environment default", () => {
  assert.equal(resolveModel(["--model", "gpt-test"], { OPENAI_MODEL: "env-model" }), "gpt-test");
  assert.equal(resolveModel([], { OPENAI_MODEL: "env-model" }), "env-model");
});

test("createOpenAiSummary parses output_text from Responses API", async () => {
  const text = await createOpenAiSummary({
    apiKey: "test-key",
    model: "gpt-test",
    prompt: "Summarize this",
    fetchImpl: async (url, options) => {
      assert.equal(url, "https://api.openai.com/v1/responses");
      assert.equal(JSON.parse(options.body).model, "gpt-test");
      return {
        ok: true,
        json: async () => ({ output_text: "summary" })
      };
    }
  });
  assert.equal(text, "summary");
});
