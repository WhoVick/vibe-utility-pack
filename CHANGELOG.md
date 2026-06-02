# Changelog

## 0.3.0 - 2026-06-02

- Added `vibe-pr-summary`, the first optional OpenAI-powered maintainer CLI prototype.
- Added local fallback output, prompt preview, and explicit `--send-to-openai` opt-in.
- Added API privacy documentation and tests for PR context parsing, prompt construction, model selection, and Responses API request shape.

## 0.2.1 - 2026-06-01

- Improved screenshot-to-issue export with annotated PNG download.
- Added GitHub-friendly issue markdown metadata, image attachment hint, and labels.

## 0.2.0 - 2026-06-01

- Added installable/offline support with `manifest.webmanifest` and a service worker.
- Extracted core parser logic into `src/core.mjs`.
- Added Node regression tests for CSV, finance summaries, README checks, meeting notes, diagnostics, and changelog generation.
- Added a short demo GIF and real screenshot for README evaluation.
- Added a security model and OpenAI automation plan for maintainer workflows.
- Updated the README with a real screenshot slot and stronger OSS readiness notes.

## 0.1.0 - 2026-05-31

- Added the first static browser app with ten local-first MVP tools.
- Added CLI scripts for environment checks, repository health, and changelog generation.
- Added examples, CI, README, and license files for GitHub publishing.
