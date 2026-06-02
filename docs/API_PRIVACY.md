# API Privacy

The browser app is local-first and does not send data to OpenAI or any other API.

API-powered features live in explicit CLI commands. They only send data when the user runs a command with an opt-in flag such as `--send-to-openai`.

## Current API Prototype

`vibe-pr-summary` can summarize pull request context.

Default behavior:

- Reads PR context from a file or stdin.
- Generates a local deterministic maintainer checklist.
- Prints a privacy notice.
- Does not call OpenAI.

Opt-in API behavior:

- Requires `--send-to-openai`.
- Requires `OPENAI_API_KEY`.
- Uses `OPENAI_MODEL` or `--model`; default is `gpt-5-mini`.
- Sends the provided PR context and prompt to the OpenAI Responses API.

## What May Be Sent

When `--send-to-openai` is used, the request can include:

- PR title and body.
- Changed file names.
- Commit messages.
- Diff snippets or copied review context.
- Any text the user pipes or passes through `--from-file`.

Users should not include secrets, private customer data, credentials, or proprietary code unless they are authorized to send that content to the API provider.

## Maintainer Rules

- API calls must remain opt-in.
- API keys must come from environment variables and must never be printed.
- Every API command must have a non-API fallback or dry-run mode.
- Every API command must document what content it sends.
- Browser tools must remain usable without API keys.
