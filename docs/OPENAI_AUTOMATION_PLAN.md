# OpenAI Automation Plan

The core project stays local-first and dependency-free. OpenAI API features should be optional maintainer workflows layered on top, with clear consent and user-owned API keys.

## Why It Fits This Project

Vibe Utility Pack already focuses on repetitive maintainer work: README review, repo health, issue writing, changelog drafting, meeting notes, and contributor onboarding. API credits would accelerate the parts where maintainers repeatedly summarize, classify, and rewrite project context.

## Proposed Workflows

1. **Pull Request Summary**
   - Input: PR title, description, file list, and selected diff snippets.
   - Output: concise maintainer summary, test-risk notes, and review checklist.

2. **Issue Triage**
   - Input: issue title/body and template fields.
   - Output: suggested labels, missing reproduction details, and duplicate-search queries.

3. **README Review**
   - Input: README text.
   - Output: scored gaps, improved quickstart, demo suggestions, and contributor clarity fixes.

4. **Release Notes**
   - Input: commit log, merged PR titles, and milestone notes.
   - Output: grouped changelog with user-facing wording.

5. **Security Review Helper**
   - Input: changed parser/export/storage files.
   - Output: XSS, injection, data-leakage, and unsafe caching questions for maintainers to review.

## Privacy Rules

- No content is sent to an API unless the user explicitly runs an API-powered action.
- API keys are not bundled, collected, or committed.
- The UI must show what content will be sent before sending it.
- Local-only fallbacks remain available for every tool.

## First Implementation Milestone

- Add a documented `OPENAI_API_KEY` path for local use only.
- Start with CLI-only PR summary and changelog drafting.
- Add tests for prompt construction so sensitive fields can be redacted consistently.
- Keep the browser app dependency-free until the workflow proves useful.
