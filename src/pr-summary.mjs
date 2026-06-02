const DEFAULT_MODEL = "gpt-5-mini";

export function readFlag(args, name) {
  const index = args.indexOf(name);
  if (index === -1) return "";
  return args[index + 1] && !args[index + 1].startsWith("--") ? args[index + 1] : "";
}

export function hasFlag(args, name) {
  return args.includes(name);
}

export function parsePullRequestContext(text) {
  const source = String(text || "").trim();
  const lines = source.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const title = lines.find((line) => /^title\s*:/i.test(line))?.replace(/^title\s*:\s*/i, "") || "";
  const body = lines.find((line) => /^body\s*:/i.test(line))?.replace(/^body\s*:\s*/i, "") || "";
  const files = lines
    .filter((line) => /^(modified|added|deleted|renamed|file)\s*:/i.test(line))
    .map((line) => line.replace(/^(modified|added|deleted|renamed|file)\s*:\s*/i, ""));
  const commits = lines
    .filter((line) => /^(commit|feat|fix|docs|test|refactor|chore|ci|build)(\(|:|\s)/i.test(line))
    .map((line) => line.replace(/^commit\s*:\s*/i, ""));
  const diffLines = lines.filter((line) => /^(\+|-|@@)/.test(line));
  const riskHints = lines.filter((line) => /(auth|token|secret|storage|cache|parser|html|xss|csv|api|security|permission|workflow|release)/i.test(line));

  return {
    source,
    title,
    body,
    files,
    commits,
    diffLines,
    riskHints,
    lineCount: lines.length
  };
}

export function buildLocalPrSummary(context) {
  const scope = context.files.length
    ? context.files.slice(0, 8).join(", ")
    : "No changed files listed.";
  const likelyRisks = context.riskHints.length
    ? context.riskHints.slice(0, 6)
    : ["No obvious risk hints found in the provided context."];
  const commits = context.commits.length
    ? context.commits.slice(0, 8)
    : ["No commit lines provided."];

  return `# Pull Request Summary

## One-line summary

${context.title || context.body || "Summarize the PR title/body here."}

## Scope

${scope}

## Commit / change signals

${commits.map((item) => `- ${item}`).join("\n")}

## Risk hints

${likelyRisks.map((item) => `- ${item}`).join("\n")}

## Suggested maintainer checklist

- [ ] Confirm the changed files match the PR title.
- [ ] Run relevant tests or parser checks.
- [ ] Check documentation updates for user-facing changes.
- [ ] Review security/privacy impact if storage, HTML, API, parser, or workflow files changed.
- [ ] Prepare release-note wording if this affects users.
`;
}

export function buildOpenAiPrompt(context) {
  const clipped = context.source.length > 14000
    ? `${context.source.slice(0, 14000)}\n\n[Input clipped at 14000 characters for this prototype.]`
    : context.source;

  return `You are helping an open-source maintainer review a pull request.

Return concise Markdown with these sections:

1. One-line summary
2. What changed
3. Maintainer risks
4. Tests to run
5. Suggested review comment

Focus on practical maintainer value. Do not invent facts that are not present in the PR context. If information is missing, say what is missing.

PR context:

${clipped}`;
}

export function buildPrivacyNotice(model = DEFAULT_MODEL) {
  return `Privacy notice:
- This command only sends PR context to OpenAI when --send-to-openai is present.
- The browser app remains local-first and does not use this API path.
- API key comes from OPENAI_API_KEY and is never printed.
- Model defaults to ${model}; override with OPENAI_MODEL or --model.`;
}

export function resolveModel(args, env = process.env) {
  return readFlag(args, "--model") || env.OPENAI_MODEL || DEFAULT_MODEL;
}

export async function createOpenAiSummary({ apiKey, model, prompt, fetchImpl = fetch }) {
  if (!apiKey) throw new Error("OPENAI_API_KEY is required when --send-to-openai is used.");
  const response = await fetchImpl("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      input: prompt,
      max_output_tokens: 900
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data.error?.message || `OpenAI API request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data.output_text
    || data.output?.flatMap((item) => item.content || []).map((item) => item.text || "").join("").trim()
    || JSON.stringify(data, null, 2);
}
