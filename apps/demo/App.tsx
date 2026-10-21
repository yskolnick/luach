import { useMemo, useState } from 'react';
import { Platform, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useCalendars } from 'expo-localization';
import { civilDateAt, parseIsoDate, getPlace } from 'luach';
import { useTheme } from './src/theme';
import { DEFAULT_PLACE, UI, type LocaleId, type Settings } from './src/settings';
import { SettingsScreen, TodayScreen, WeekScreen, ZmanimScreen } from './src/screens';

type Tab = 'today' | 'zmanim' | 'week' | 'settings';
const TABS: Tab[] = ['today', 'zmanim', 'week', 'settings'];

/** On the web, ?tab=…&locale=…&date=YYYY-MM-DD&city=… open a given screen (used for screenshots). */
function webParams(): URLSearchParams {
  return Platform.OS === 'web' && typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
}

export default function App() {
  const theme = useTheme();
  const deviceZone = useCalendars()[0]?.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  const q = webParams();
  const [tab, setTab] = useState<Tab>((TABS as string[]).includes(q.get('tab') ?? '') ? (q.get('tab') as Tab) : 'today');
  const city = getPlace(q.get('city') ?? '') ?? DEFAULT_PLACE;
  const [settings, setSettings] = useState<Settings>({
    where: city,
    localeId: (['ashkenazi', 'sephardi', 'he', 'en'].includes(q.get('locale') ?? '') ? q.get('locale') : 'ashkenazi') as LocaleId,
    israel: null,
  });
  const date = useMemo(() => (q.get('date') ? parseIsoDate(q.get('date')!) : civilDateAt(Date.now(), settings.where.timeZone)), [settings.where.timeZone]);
  const t = settings.localeId === 'he' ? UI.he : UI.en;
  const rtl = settings.localeId === 'he';
  const props = { theme, t, settings, date };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar style="auto" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 96, direction: rtl ? 'rtl' : 'ltr' }}>
        <Text accessibilityRole="header" style={{ fontSize: 22, fontWeight: '700', color: theme.text, marginBottom: 12, textAlign: rtl ? 'right' : 'left' }}>
          {t[tab]}
        </Text>
        {tab === 'today' && <TodayScreen {...props} />}
        {tab === 'zmanim' && <ZmanimScreen {...props} />}
        {tab === 'week' && <WeekScreen {...props} />}
        {tab === 'settings' && <SettingsScreen {...props} onChange={setSettings} deviceZone={deviceZone} />}
      </ScrollView>
      <View accessibilityRole="tablist" style={{ flexDirection: rtl ? 'row-reverse' : 'row', borderTopWidth: 1, borderColor: theme.border, backgroundColor: theme.surface }}>
        {TABS.map((id) => (
          <Pressable
            key={id}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === id }}
            onPress={() => setTab(id)}
            style={{ flex: 1, paddingVertical: 14, alignItems: 'center', minHeight: 48 }}
          >
            <Text style={{ fontSize: 15, fontWeight: tab === id ? '700' : '400', color: tab === id ? theme.accent : theme.muted }}>{t[id]}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}
