# Security Model

Vibe Utility Pack is local-first: user data is processed in the browser, stored in `localStorage`, and never sent to a server by the core app.

## Trusted Boundaries

- The static app shell is served from GitHub Pages or a local web server.
- User-provided content is treated as untrusted input, including Markdown, CSV, meeting notes, prompt text, issue text, and generated HTML.
- The CLI tools read local files only when a user explicitly passes a path or pipes data into the command.
- Future API-powered features must be opt-in and require a user-owned API key.

## Primary Risks

- XSS from README, prompt, meeting-note, issue, or generated website content.
- CSV formula injection when exported data is opened in a spreadsheet.
- Unsafe HTML generation in the Small Business Website Starter.
- Accidental persistence of private notes, prompts, links, or diagnostics in browser storage.
- Future automation leaking repository or issue data to an API without clear consent.

## Current Mitigations

- Browser-rendered user content uses text nodes or `escapeHtml()` before insertion into generated HTML surfaces.
- The app has no runtime dependencies, no analytics, no remote tracking, and no backend.
- Exported state is explicit: users click the export button before local data leaves browser storage.
- The service worker caches only static app assets and same-origin GET responses.
- Regression tests cover the highest-risk parser paths: CSV, README checks, meeting notes, changelog generation, and diagnostics parsing.

## Future Codex Security Scope

Codex Security would be most useful for reviewing:

- DOM insertion paths that touch untrusted input.
- CSV and generated HTML escaping edge cases.
- Offline cache behavior and stale asset invalidation.
- Planned OpenAI API workflows before they can process repository metadata.
- Pull requests that modify parser logic, export formats, or browser storage.

## Maintainer Rules For New Features

- Keep the default app usable without accounts, API keys, telemetry, or remote services.
- Ask for explicit consent before sending repository, issue, prompt, or note content to any API.
- Add parser regression tests for every new import/export format.
- Prefer escaping and text rendering over raw HTML insertion.
- Document any new storage key, cache entry, or data-sharing behavior.
