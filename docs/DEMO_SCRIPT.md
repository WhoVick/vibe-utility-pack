# Demo Script

This is a 60-second walkthrough for reviewers, maintainers, and first-time contributors.

## 0-10 seconds: Project Promise

Open the live demo and say:

> Vibe Utility Pack is a local-first toolkit for maintainers who need fast checks for README quality, repo health, issue reports, changelogs, meeting notes, and contributor onboarding.

Point out that it runs as a static GitHub Pages app and does not require an account, backend, analytics, or API key.

Set the first task clearly:

> Start with one maintainer win: review a README or summarize a PR in 60 seconds. The other tools support the rest of the release and contributor workflow.

## 10-25 seconds: Maintainer Quality Loop

Open **README Fixer** as the flagship browser workflow.

Paste a short README and run the analysis. Show the score, missing signals, and generated outline. The point is to show how a maintainer can quickly review a new project or pull request before publishing.

## 25-40 seconds: Issue And Release Loop

Open **Screenshot Issue**.

Upload a screenshot, draw an annotation, generate issue markdown, and download the annotated PNG. Then open **Changelog Bot** and generate release notes from a few commit messages.

## 40-55 seconds: Contributor Readiness

Open **Repo Health** and **Dev Doctor**.

Show the repo readiness checklist and diagnostics parser. The point is contributor onboarding: new contributors can understand what is missing before opening a PR.

## 55-60 seconds: Why Codex Fits

Close with:

> The core stays local-first. The PR summary CLI is local by default, shows the exact prompt with `--show-prompt`, and sends context only when `--send-to-openai` is present. Codex and API credits would expand this opt-in maintainer automation path.

## Demo Links

- Live demo: https://whovick.github.io/vibe-utility-pack/
- Repository: https://github.com/WhoVick/vibe-utility-pack
- Security model: `docs/SECURITY_MODEL.md`
- OpenAI automation plan: `docs/OPENAI_AUTOMATION_PLAN.md`
