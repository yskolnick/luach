# Security

## Reporting a problem

Please report security issues privately through GitHub: on the repository's **Security** tab, choose **Report a
vulnerability**. Don't open a public issue for them. You'll get a reply within a week.

## Scope

Luach makes no network calls, sends no telemetry, runs no `eval` and has no runtime dependencies. Things we treat as
security issues:

- any network access, data collection or dynamic code execution in the published package;
- a dependency or file in the published package that shouldn't be there;
- a crash or hang an attacker could trigger with crafted input (for example a pathological date or city name).

A wrong zman or date is not a security issue, but we treat it as urgent: please open a "Wrong time or date" issue with
the source you compared against.
