# Releasing Dayspan

This document is the maintainer checklist for beta and Community Plugins releases.

## First-time setup

1. Create a free GitHub account.
2. Create a public repository named `dayspan`.
3. Add the repository as this local project's remote:

   ```bash
   git remote add origin https://github.com/<github-username>/dayspan.git
   ```

4. Commit and push the `main` branch.
5. Confirm that the CI workflow passes on GitHub.

Never commit `data.json`, `main.js`, `node_modules`, or real Dayspan records. They are excluded by `.gitignore`, but always review `git status` before committing.

## Prepare a version

For the existing `0.1.0` beta, verify that these values already match:

- `package.json` version: `0.1.0`
- `manifest.json` version: `0.1.0`
- `versions.json`: `"0.1.0": "1.13.0"`

For later versions, run one of the following:

```bash
npm version patch
npm version minor
npm version major
```

The version script updates `manifest.json` and `versions.json`. Obsidian release tags must be exact semantic versions such as `0.1.0`, without a `v` prefix.

## Verify locally

```bash
npm ci
npm run check
```

This runs the Obsidian plugin lint rules, unit tests, TypeScript checks, and production build.

Before releasing, also test in a separate Obsidian vault:

- Editing-view and reading-view selection registration
- Manual registration, editing, opening source notes, and deletion
- Past, today, and future grouping
- All five date-span formats, including month ends and leap years
- Color settings and section reordering
- Restart and reload persistence
- Light and dark themes
- Desktop and mobile layouts

Use fictional notes and records for screenshots and public test vaults.

## Create a beta release

1. Push the exact version tag, for example `0.1.0`.
2. GitHub Actions runs tests and creates a draft release.
3. Review the draft and add release notes.
4. Confirm that these three files are attached individually:
   - `main.js`
   - `manifest.json`
   - `styles.css`
5. Publish the release.
6. Ask beta testers to install the repository with BRAT or use the three release files manually.

## Submit to Obsidian Community Plugins

After beta testing:

1. Sign in at <https://community.obsidian.md/> with an Obsidian account.
2. Connect the GitHub account from the community profile.
3. Select **Plugins → New plugin**.
4. Enter the public GitHub repository URL and select the owner.
5. Accept the developer policies and submit.
6. Review automated scan results for the manifest, release assets, source code, and build verification.
7. Fix errors, increment the version, and publish another release when required.

Only the initial version needs to be submitted. Later updates are discovered from GitHub releases.
