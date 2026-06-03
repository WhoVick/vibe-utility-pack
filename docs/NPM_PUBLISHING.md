# npm Publishing Checklist

This repository is prepared for npm publishing, but the first public publish should be done intentionally by the package owner.

## Package Name

Current package name:

```text
vibe-utility-pack
```

Before publishing, verify that the name is available or choose a scoped package such as:

```text
@whovick/vibe-utility-pack
```

## Included Files

The package uses the `files` field in `package.json` to include:

- CLI entry points in `bin/`
- shared logic in `src/`
- examples
- docs
- static app files
- README, license, changelog, security, support, contributing, and code-of-conduct files

## Local Verification

Run:

```bash
npm test
npm run repo-health -- --strict
npm run pack:check
```

Expected result:

- tests pass
- repository health is 100/100
- `npm pack --dry-run` lists only intentional project files

## CLI Smoke Test

After packing locally:

```bash
npm pack
npm install -g ./vibe-utility-pack-*.tgz
vibe-doctor --markdown
vibe-health --strict
vibe-changelog --from-file examples/commit-log.txt
vibe-pr-summary --from-file examples/pr-context.txt
```

## Publish

Only after verifying the package contents:

```bash
npm login
npm publish --access public
```

## Post-Publish

- Add npm install instructions to the README.
- Add an npm version badge.
- Create a GitHub Release that links to the npm package.
- Ask maintainers in issue #12 whether the CLI install path is clear.
