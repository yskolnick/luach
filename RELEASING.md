# Releasing Luach

Only Yosef publishes, because publishing needs his npm account. Agents and contributors never ask for, handle or store
an npm token.

## Before the release

1. Merge the release pull request into `main` once CI is green.
2. On your machine:

   ```sh
   git checkout main && git pull
   npm ci
   npm run check          # typecheck, lint, unit tests, build, Hermes, licence check, size budget
   npm run test:oracle    # the long accuracy comparisons (a few minutes)
   npm run accuracy-report
   npm run docs:build
   npm pack --dry-run     # check the file list: dist/, schema/, NOTICE, LICENSE, README.md, CHANGELOG.md
   ```

3. In `CHANGELOG.md`, replace "unreleased" with today's date, and commit.

## Publish

```sh
npm login                       # once; use your own account and two-factor authentication
npm version 1.0.0               # sets the version, commits, and tags v1.0.0
npm publish --access public     # runs `npm run check` first (prepublishOnly)
git push --follow-tags
```

Then create a GitHub release from the `v1.0.0` tag and paste the changelog section into it.

## Later releases

- Bug fixes: `npm version patch`. New features: `npm version minor`. Breaking changes: `npm version major`.
- Every user-visible change gets a line in `CHANGELOG.md` under a new version heading before publishing.
- A change to a zman, holiday or date result is a breaking change unless it fixes a documented error.

## If something goes wrong

- Published a broken version: `npm deprecate luach@X.Y.Z "reason"` and publish a fix. Avoid `npm unpublish`.
- Wrong tag: `git tag -d vX.Y.Z && git push origin :refs/tags/vX.Y.Z`, then tag again.
