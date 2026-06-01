# Security Policy

Vibe Utility Pack is a local-first static app. It does not require a backend, database, analytics, or external API keys.

## Supported versions

The `main` branch is the supported development line.

## Reporting a vulnerability

Please open a private security advisory on GitHub if available, or create an issue with non-sensitive details and mark it as security-related.

Do not include secrets, private data, exploit payloads, or personal information in public issues.

## Security goals

- Keep all user data local unless the user explicitly exports it.
- Avoid third-party runtime dependencies by default.
- Treat imported CSV, Markdown, and text as untrusted input.
- Keep generated output transparent and copyable.
