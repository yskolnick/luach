# Security

## Supported versions

Fixes go into the latest release. Before 1.0, only the newest 0.x version is supported.

## Reporting a problem

Please report security problems privately, through GitHub: on the repository page, open
**Security → Report a vulnerability**. Do not open a public issue for them.

You should hear back within a week. When a fix is ready it is released and the report is
published with credit to you, unless you prefer otherwise.

## What counts

Luach makes no network requests, runs no `eval` or generated code, and has no runtime
dependencies, so most problems will be in one of these:

- input that makes a function hang, use unbounded memory or crash the process (for example
  a date string, place name or CLI argument);
- output that could inject content when shown as HTML or in a calendar file (`toICalendar`);
- anything in the published package that is not built from this repository's source.

A wrong zman or date is a bug, not a security problem, but it can matter a great deal to
the people who rely on it: please open an issue for it straight away.
