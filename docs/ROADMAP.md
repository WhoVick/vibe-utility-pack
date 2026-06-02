# Roadmap

## Near term

- Publish the CLI tools as an npm package when command output is stable.
- Run an accessibility and keyboard navigation pass across the browser app.
- Add import/export flows for each tool.
- Add labels and issue triage workflow.
- Expand parser tests as each import/export format grows.

## Completed in 0.3.0

- Added the first optional OpenAI-powered maintainer workflow as `vibe-pr-summary`.
- Added API privacy documentation for opt-in CLI calls.
- Added tests for PR context parsing, prompt construction, model selection, and Responses API request shape.

## Completed in 0.2.1

- Improved screenshot-to-issue export with annotated PNG download.
- Added GitHub-friendly issue markdown metadata and attachment hints.

## Completed in 0.2.0

- Added a hosted GitHub Pages demo screenshot to the README.
- Added a short demo GIF for README evaluation.
- Added unit-level parser tests for CSV, changelog, README, meeting notes, finance summaries, and diagnostics.
- Added installable/offline support with a manifest and service worker.
- Added security and OpenAI automation planning docs.

## Maintainer automation

- Use Codex to review pull requests for parser regressions and documentation gaps.
- Use Codex to summarize new issues and propose labels.
- Use Codex to generate release notes from merged commits.
- Use Codex Security for dependency and static-app threat review when eligible.

## Project direction

The project is intentionally local-first and dependency-light. Features should remain fast to inspect, easy to fork, and understandable to new contributors.
