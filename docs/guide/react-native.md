# React Native

Luach runs on Hermes, React Native's engine, with the same output as Node.

- Install with `npm install luach`; Metro uses the ESM build.
- **Time zones:** current React Native builds of Hermes include `Intl` with time zones; pass
  the device's IANA zone (for example from `expo-localization`). On an engine without them,
  pass `fixedOffsetZone(-new Date().getTimezoneOffset())`, which is right for the current
  day but not across a DST change.
- **Location** comes from the platform (`expo-location`) and stays on the device. See
  [Places](./places.md).

See `examples/react-native/DayScreen.tsx` in the repository.
