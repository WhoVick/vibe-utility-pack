# Maintainer Workflows

Vibe Utility Pack is organized around repeatable tasks that small OSS maintainers do every week.

## README Review

Use **README Fixer** before publishing a new repository or reviewing a documentation PR.

- Check for a project title, problem statement, install steps, usage example, visual demo, license, and contribution notes.
- Generate a stronger README outline when the project is too vague.
- Use the result as a PR review checklist instead of rewriting everything manually.

## Issue Triage

Use **Screenshot Issue** when a bug report needs visual context.

- Upload a screenshot.
- Draw numbered annotations around the broken UI.
- Download `annotated-screenshot.png`.
- Generate GitHub-friendly issue markdown with labels, attachment hints, steps, expected behavior, actual behavior, environment, and annotation coordinates.

## Release Preparation

Use **Changelog Bot** before tagging a release.

- Paste `git log --oneline` output or conventional commits.
- Generate grouped release notes for features, fixes, docs, and maintenance.
- Copy the result into `CHANGELOG.md` or a GitHub Release draft.

## Contributor Onboarding

Use **Dev Doctor** and **Repo Health** when preparing a repository for contributors.

- Check whether common tools are present in pasted diagnostics.
- Score readiness signals such as README, license, tests, CI, examples, `.env.example`, issue templates, and changelog.
- Convert missing signals into issues or a release checklist.

## Project Coordination

Use **Meeting Notes** after planning calls or async notes.

- Extract decisions, action items, owners, due dates, and risks.
- Turn messy notes into issue comments, release checklists, or maintainer follow-up tasks.

## Optional Codex/API Layer

The planned API layer should automate the parts where maintainers repeatedly summarize, classify, and rewrite context:

- Pull request summaries.
- Issue label suggestions.
- README gap review.
- Release note drafting.
- Security questions for parser, export, cache, and storage changes.

The default app should remain usable without API keys or remote services.
