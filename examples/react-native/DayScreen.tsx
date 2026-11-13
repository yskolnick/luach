// React Native (Expo or bare). Hermes runs Luach; see the note on time zones below.
import { useMemo } from 'react';
import { FlatList, Text, View } from 'react-native';
import { Zmanim, dayInfo, ashkenazi, fixedOffsetZone, type GeoLocation } from 'luach';

/**
 * Time zones: on current React Native, Hermes ships Intl with time-zone support, so pass the
 * IANA zone (e.g. from expo-localization's getCalendars()[0].timeZone). On an engine without
 * Intl time zones, pass fixedOffsetZone(-new Date().getTimezoneOffset()) — correct for today,
 * not across a DST change.
 */
export function DayScreen({ place }: { place: GeoLocation }) {
  // The civil day at the place, not on the phone's clock.
  const info = useMemo(() => dayInfo(new Zmanim(place).at(new Date()).date, { location: place, locale: ashkenazi }), [place]);
  return (
    <View accessible accessibilityLabel={`${info.weekdayName}, ${info.hebrewDate.formatted}`}>
      <Text style={{ fontSize: 22 }}>{info.hebrewDate.formatted}</Text>
      <FlatList
        data={info.zmanim}
        keyExtractor={(z) => z.id}
        renderItem={({ item }) => (
          <Text accessibilityLabel={`${item.opinion}: ${item.local ?? 'does not occur today'}`}>
            {item.local ?? '—'}  {item.id}
          </Text>
        )}
      />
    </View>
  );
}

export const exampleWithoutIntl: GeoLocation = { latitude: 40.08, longitude: -74.21, timeZone: fixedOffsetZone(-300) };
