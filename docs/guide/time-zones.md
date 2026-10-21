# Time zones and React Native

Luach works with IANA time-zone ids (`"America/New_York"`) and asks for the UTC offset in force **at each instant**.
It never derives a "standard offset" for a zone. That shortcut is the cause of a known bug in another zmanim library
(kosher-zmanim issue #37): zmanim in Sydney, Auckland and Chatham end up on the wrong day. Luach's own tests check
every day of four years in those cities.

## Where Intl is available (Node, browsers, Deno, Bun, modern React Native)

Nothing to do. Luach uses `Intl.DateTimeFormat` with the `timeZone` option.

## Where it is not

Some JavaScript engines lack time-zone support in `Intl`. Older Hermes builds and the Hermes command-line build are
examples. On those, give Luach a provider: a function that returns the offset in minutes for a zone at an instant.

```ts
import { setDefaultTimeZoneProvider } from 'luach';

// For example, using a time-zone library you already ship:
setDefaultTimeZoneProvider((timeZone, epochMs) => myZoneLib.offsetMinutes(timeZone, epochMs));
```

Or pass `{ timeZoneProvider }` in the options of a single call. If neither `Intl` nor a provider is available, Luach
throws a clear error instead of guessing.

## React Native

Hermes in current React Native releases gets `Intl` from the platform, so no setup is needed. Luach avoids `class`
syntax and other features that need Babel transforms, and CI runs the whole calculation suite on the Hermes engine and
compares the results with Node's, bit for bit.
