# Luach demo app

A small Expo (React Native) app that shows what the `luach` library does: today's Hebrew
date, holidays, parsha and daf; the day's zmanim with a choice of opinion and the source of
each; the coming week; and settings for place and language. Hebrew and English, light and
dark. It is a demo, not a product, and is not published.

> Ask your rav. This library calculates; it does not rule.

**Privacy.** "Use my location" asks for permission and uses the position on the device to
pick the nearest city. Nothing is sent anywhere; the app makes no network requests.

## Run it

```sh
npm ci && npm run build          # at the repository root: builds the library
cd apps/demo
npm ci
npm start                        # Expo: press i, a or w for iOS, Android or web
```

## Check it

```sh
npm run typecheck
CI=1 npm run export:web          # writes web-build/
CHROMIUM_PATH=/path/to/chromium npm run screenshots -- screenshots
```

The screenshot script renders all 16 screens (four tabs × English/Hebrew × light/dark) at
phone size for Lakewood on 4 December 2026 and fails on any page error. CI runs it and
uploads the images.
