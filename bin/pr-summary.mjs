#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import {
  buildLocalPrSummary,
  buildOpenAiPrompt,
  buildPrivacyNotice,
  createOpenAiSummary,
  hasFlag,
  parsePullRequestContext,
  readFlag,
  resolveModel
} from "../src/pr-summary.mjs";

const args = process.argv.slice(2);

function stdinText() {
  try {
    if (process.stdin.isTTY) return "";
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function fileInput() {
  const path = readFlag(args, "--from-file");
  if (!path || !existsSync(path)) return "";
  return readFileSync(path, "utf8");
}

function help() {
  return `Vibe PR Summary

Usage:
  vibe-pr-summary --from-file examples/pr-context.txt
  type pr-context.txt | vibe-pr-summary
  vibe-pr-summary --from-file pr.txt --show-prompt
  vibe-pr-summary --from-file pr.txt --send-to-openai

Options:
  --from-file <path>   Read PR context from a file
  --show-prompt        Print the prompt that would be sent to OpenAI
  --send-to-openai     Send context to OpenAI Responses API
  --model <id>         Override OPENAI_MODEL
  --privacy            Print privacy notice
  --help               Print this help
`;
}

if (hasFlag(args, "--help")) {
  console.log(help());
  process.exit(0);
}

const model = resolveModel(args);

if (hasFlag(args, "--privacy")) {
  console.log(buildPrivacyNotice(model));
  process.exit(0);
}

const input = fileInput() || stdinText();
if (!input.trim()) {
  console.log(help());
  console.log("No PR context found. Provide --from-file or pipe text into the command.");
  process.exit(1);
}

const context = parsePullRequestContext(input);
const prompt = buildOpenAiPrompt(context);

if (hasFlag(args, "--show-prompt")) {
  console.log(buildPrivacyNotice(model));
  console.log("");
  console.log(prompt);
  process.exit(0);
}

if (!hasFlag(args, "--send-to-openai")) {
  console.log(buildLocalPrSummary(context));
  console.log("");
  console.log(buildPrivacyNotice(model));
  console.log("");
  console.log("Run again with --show-prompt to inspect the API prompt, or --send-to-openai to call OpenAI.");
  process.exit(0);
}

try {
  console.log(await createOpenAiSummary({
    apiKey: process.env.OPENAI_API_KEY,
    model,
    prompt
  }));
} catch (error) {
  console.error(`OpenAI summary failed: ${error.message}`);
  process.exit(1);
}
