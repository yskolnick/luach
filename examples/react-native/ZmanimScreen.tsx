// A React Native screen (code only; there is no demo app in this repo). `npm install luach`.
// Hermes in current React Native has Intl time-zone support; on older engines call setDefaultTimeZoneProvider()
// once at start-up (see the docs, "Time zones and React Native").
import { FlatList, SafeAreaView, Text, View } from 'react-native';
import { getDay, findCity, dayNumberInZone } from 'luach';

const city = findCity('Brooklyn')!;

export function ZmanimScreen() {
  const day = getDay(dayNumberInZone(Date.now(), city.timeZone), { location: city, calendar: city.israel ? 'israel' : 'diaspora' });
  const rows = Object.entries(day.zmanim);
  return (
    <SafeAreaView>
      <Text accessibilityRole="header" style={{ fontSize: 22 }}>
        {day.hebrew.text}
      </Text>
      <Text style={{ writingDirection: 'rtl' }}>{day.hebrew.textHebrew}</Text>
      <FlatList
        data={rows}
        keyExtractor={([key]) => key}
        renderItem={({ item: [, z] }) => (
          <View accessible accessibilityLabel={`${z.opinion}: ${z.local ?? 'not today'}`} style={{ flexDirection: 'row', gap: 12 }}>
            <Text style={{ fontVariant: ['tabular-nums'] }}>{z.local ?? '—'}</Text>
            <Text style={{ flexShrink: 1 }}>{z.opinion}</Text>
          </View>
        )}
      />
      <Text>Built on Luach by Yosef Skolnick. Ask your rav.</Text>
    </SafeAreaView>
  );
}
