# Releasing Luach

Only Yosef publishes `luach` to npm, from his own account, with his own login. Nobody
else (no contributor, bot or CI job) holds an npm token for this package. These are the
exact steps.

The name `luach` is already registered to Yosef's account with placeholder versions
(`0.0.0-stage`, `0.0.1`). The first real release is **0.1.0**.

## Once, before the first release

1. Install Node 22 and git.
2. Make sure two-factor authentication is on for the npm account, for logging in and
   publishing (npmjs.com → Account → Two-Factor Authentication).
3. Log in on your own computer: `npm login`. The login lives in your `~/.npmrc`; never
   commit that file, paste it anywhere or put it in CI.

## Every release

### 1. Start from a green `main`

```sh
git checkout main
git pull
npm ci
```

Check that the latest CI run on `main` is green on GitHub (Actions tab).

### 2. Choose the version

Luach follows [Semantic Versioning](https://semver.org/). Before 1.0:

- **0.x.y → 0.x.(y+1)** for fixes that change no API and no calculated result except to
  correct a bug.
- **0.x → 0.(x+1)** for new features, or any change to an API, a default, or a calculated
  result that someone may depend on.

After 1.0: patch for fixes, minor for new features, major for anything that breaks
existing code or changes a default.

Read the `## Unreleased` section of `CHANGELOG.md`; it should describe everything since the
last release. Edit it now if anything is missing.

### 3. Set the version

```sh
git checkout -b release-0.1.0
npm run release:version -- 0.1.0
```

This writes the version into `package.json`, `package-lock.json` and the command line's
`--version`, and turns `## Unreleased` in the changelog into `## 0.1.0 — <today>`.

### 4. Check everything

```sh
npm run check
npm pack --dry-run
```

`npm run check` type-checks, lints, checks imports and licences, builds, runs every test
and checks bundle sizes. `npm pack --dry-run` lists what will be uploaded: it should be
`dist/`, `LICENSE`, `NOTICE`, `README.md`, `CHANGELOG.md` and `package.json`, about 2 MB.

### 5. Merge the release commit

```sh
git commit -am "Release 0.1.0"
git push -u origin release-0.1.0
```

Open a pull request, wait for CI to pass, and merge it. Then:

```sh
git checkout main
git pull
```

### 6. Publish

From the up-to-date `main`:

```sh
npm publish
```

`npm publish` runs `npm run check` again first (`prepublishOnly`) and stops if anything
fails. npm asks for your two-factor code.

For a pre-release (for example `0.2.0-rc.1`), publish under a separate tag so that
`npm install luach` does not pick it up:

```sh
npm publish --tag next
```

### 7. Tag and announce

```sh
git tag v0.1.0
git push origin v0.1.0
```

On GitHub, create a release from the tag (Releases → Draft a new release) and paste the
version's section of `CHANGELOG.md`.

### 8. Check the published package

In an empty folder:

```sh
npm init -y
npm install luach@0.1.0
node -e "import('luach').then(l => console.log(l.formatHebrewDate(l.HebrewDate.fromGregorian(2026, 10, 21))))"
npx luach today --city jerusalem
```

### After the first release only

Mark the placeholder versions as such:

```sh
npm deprecate luach@"<0.1.0" "Placeholder; use 0.1.0 or later."
```

## If something goes wrong

- **A mistake is found right after publishing:** fix it on `main` and publish a patch
  release. Do not unpublish; others may already depend on the version.
- **A broken version must be hidden:** `npm deprecate luach@0.1.1 "Broken: use 0.1.2"`.
- **`npm publish` says the version exists:** that version is already published; bump the
  version and repeat from step 3.
