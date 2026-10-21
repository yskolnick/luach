import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import * as Location from 'expo-location';
import {
  dayInfo, holidaysBetween, holidayName, parshaFor, parshaName, HebrewDate, ZmanimCalendar, zmanLabel,
  formatHebrewDate, searchPlaces, isInIsrael, type CivilDate, type Zman,
} from 'luach';
import type { Theme } from './theme';
import { LOCALES, type Settings, type Strings, type LocaleId } from './settings';
import { Card, Choice, Heading, Row, dir, styles } from './ui';

interface ScreenProps {
  theme: Theme;
  t: Strings;
  settings: Settings;
  date: CivilDate;
}

const isRtl = (s: Settings) => LOCALES[s.localeId].dir === 'rtl';
const israelOf = (s: Settings) => s.israel ?? s.where.israel;

export function TodayScreen({ theme, t, settings, date }: ScreenProps) {
  const locale = LOCALES[settings.localeId];
  const rtl = isRtl(settings);
  const info = useMemo(
    () => dayInfo(date, { location: settings.where, israel: israelOf(settings), locale }),
    [date, settings, locale],
  );
  const hebrew = formatHebrewDate(HebrewDate.fromCivil(date));
  return (
    <View>
      <Card theme={theme} label={`${info.weekdayName}, ${info.hebrew.formatted}, ${info.gregorian}`}>
        <Text style={{ fontSize: 30, fontWeight: '700', color: theme.text, writingDirection: 'rtl', textAlign: rtl ? 'right' : 'left' }}>{hebrew}</Text>
        <Text style={[styles.body, { color: theme.muted }, dir(rtl)]}>
          {info.weekdayName} · {rtl ? info.gregorian : `${info.hebrew.formatted} · ${info.gregorian}`}
        </Text>
        <Text style={[styles.small, { color: theme.muted }, dir(rtl)]}>{rtl && settings.where.nameHe ? settings.where.nameHe : settings.where.name}</Text>
      </Card>
      <Card theme={theme}>
        {info.events.length ? (
          info.events.map((e) => (
            <Text key={e.id + (e.day ?? '')} style={[styles.body, { color: theme.holiday, fontWeight: '600' }, dir(rtl)]}>
              {e.name}
              {e.candlesTonight ? ` · 🕎 ${e.candlesTonight}` : ''}
            </Text>
          ))
        ) : (
          <Text style={[styles.body, { color: theme.muted }, dir(rtl)]}>{t.noEvents}</Text>
        )}
      </Card>
      {(info.candleLighting || info.havdala || info.fast) && (
        <Card theme={theme}>
          {info.candleLighting && <Row theme={theme} rtl={rtl} left={t.candles} right={info.candleLighting.local ?? '—'} />}
          {info.havdala && <Row theme={theme} rtl={rtl} left={t.havdala} right={info.havdala.local ?? '—'} />}
          {info.fast && <Row theme={theme} rtl={rtl} left={`${t.fast} ${t.begins}`} right={info.fast.begins.local ?? '—'} />}
          {info.fast && <Row theme={theme} rtl={rtl} left={`${t.fast} ${t.ends}`} right={info.fast.ends.local ?? '—'} />}
        </Card>
      )}
      <Card theme={theme}>
        <Heading theme={theme} rtl={rtl}>{t.parsha}</Heading>
        <Text style={[styles.body, { color: theme.text }, dir(rtl)]}>{info.parsha?.name ?? info.parsha?.holiday ?? '—'}</Text>
        <Heading theme={theme} rtl={rtl}>{t.daf}</Heading>
        <Text style={[styles.body, { color: theme.text }, dir(rtl)]}>{info.learning.dafYomi ?? '—'}</Text>
        {info.omer && (
          <>
            <Heading theme={theme} rtl={rtl}>{t.omer}</Heading>
            <Text style={[styles.body, { color: theme.text, writingDirection: 'rtl', textAlign: 'right' }]}>{info.omer.text}</Text>
          </>
        )}
      </Card>
      <Text style={[styles.small, { color: theme.muted, marginTop: 4 }, dir(rtl)]}>{t.disclaimer}</Text>
    </View>
  );
}

// Opinion choices: [method, English label, Hebrew label].
const ALOS = [['alos72', '72 min', '72 דקות'], ['alos16Point1', '16.1°', '16.1°\u200E'], ['alos90', '90 min', '90 דקות']] as const;
const SHEMA = [['sofZmanShemaGra', 'Gra', 'גר״א'], ['sofZmanShemaMga72', 'MGA 72', 'מג״א 72'], ['sofZmanShemaMga16Point1', 'MGA 16.1°', 'מג״א 16.1°\u200E'], ['sofZmanShemaBaalHaTanya', 'Baal HaTanya', 'בעל התניא']] as const;
const TZEIS = [['tzeis8Point5', '8.5°', '8.5°\u200E'], ['tzeis7Point083', '7.083°', '7.083°\u200E'], ['tzeis50', '50 min', '50 דקות'], ['tzeisRabbeinuTam', 'R. Tam', 'ר״ת']] as const;
const opts = (list: readonly (readonly [string, string, string])[], rtl: boolean) => list.map(([id, en, he]) => ({ id, label: rtl ? he : en }));

export function ZmanimScreen({ theme, t, settings, date }: ScreenProps) {
  const locale = LOCALES[settings.localeId];
  const rtl = isRtl(settings);
  const [alos, setAlos] = useState<string>('alos72');
  const [shema, setShema] = useState<string>('sofZmanShemaGra');
  const [tzeis, setTzeis] = useState<string>('tzeis8Point5');
  const [open, setOpen] = useState<string | null>(null);
  const z = useMemo(() => new ZmanimCalendar(settings.where, date), [settings.where, date]);
  const call = (m: string) => (z as unknown as Record<string, () => Zman>)[m]!.call(z);
  const list: Zman[] = [call(alos), z.misheyakir11(), z.sunrise(), call(shema), z.sofZmanTefillaGra(), z.chatzos(), z.minchaGedolaGreater(), z.minchaKetanaGra(), z.plagHaminchaGra(), z.sunset(), call(tzeis)];
  return (
    <View>
      <Card theme={theme}>
        <Heading theme={theme} rtl={rtl}>{t.opinion}: {t.alos}</Heading>
        <Choice theme={theme} label={t.alos} options={opts(ALOS, rtl)} value={alos} onChange={setAlos} />
        <Heading theme={theme} rtl={rtl}>{t.opinion}: {t.shema}</Heading>
        <Choice theme={theme} label={t.shema} options={opts(SHEMA, rtl)} value={shema} onChange={setShema} />
        <Heading theme={theme} rtl={rtl}>{t.opinion}: {t.tzeis}</Heading>
        <Choice theme={theme} label={t.tzeis} options={opts(TZEIS, rtl)} value={tzeis} onChange={setTzeis} />
      </Card>
      <Card theme={theme}>
        {list.map((zm) => (
          <Pressable key={zm.id} onPress={() => setOpen(open === zm.id ? null : zm.id)} accessibilityRole="button" accessibilityHint={t.source}>
            <Row theme={theme} rtl={rtl} left={zmanLabel(zm.id, locale)} right={zm.localTime() ?? '—'} sub={zm.time ? undefined : t.doesNotOccur} />
            {open === zm.id && (
              <Text style={[styles.small, { color: theme.muted, paddingBottom: 8 }, dir(false)]}>
                {zm.opinion}. {zm.source}.
              </Text>
            )}
          </Pressable>
        ))}
      </Card>
      <Text style={[styles.small, { color: theme.muted }, dir(rtl)]}>{t.disclaimer}</Text>
    </View>
  );
}

export function WeekScreen({ theme, settings, date }: ScreenProps) {
  const locale = LOCALES[settings.localeId];
  const rtl = isRtl(settings);
  const start = HebrewDate.fromCivil(date);
  const israel = israelOf(settings);
  const events = holidaysBetween(start, start.addDays(6), { israel });
  const shabbos = start.onOrAfter(6);
  const parsha = parshaName(parshaFor(shabbos, { israel })?.parsha ?? null, locale);
  return (
    <View>
      {Array.from({ length: 7 }, (_, i) => start.addDays(i)).map((d) => {
        const day = events.filter((e) => e.date.equals(d));
        const c = d.toCivil();
        return (
          <Card key={d.toString()} theme={theme}>
            <Row theme={theme} rtl={rtl} left={formatHebrewDate(d, { locale, form: 'full' })} right={`${c.month}/${c.day}`} />
            {d.isShabbos && parsha && <Text style={[styles.body, { color: theme.text }, dir(rtl)]}>{parsha}</Text>}
            {day.map((e) => (
              <Text key={e.id + (e.day ?? '')} style={[styles.body, { color: theme.holiday }, dir(rtl)]}>{holidayName(e, locale)}</Text>
            ))}
          </Card>
        );
      })}
    </View>
  );
}

export function SettingsScreen({ theme, t, settings, onChange, deviceZone }: ScreenProps & { onChange: (s: Settings) => void; deviceZone: string }) {
  const rtl = isRtl(settings);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const results = query.length >= 2 ? searchPlaces(query, { limit: 8 }) : [];
  async function useMyLocation() {
    setStatus(t.locating);
    const perm = await Location.requestForegroundPermissionsAsync();
    if (perm.status !== 'granted') return setStatus(t.locationDenied);
    const pos = await Location.getCurrentPositionAsync({});
    const { latitude, longitude, altitude } = pos.coords;
    onChange({ ...settings, where: { latitude, longitude, elevation: altitude ?? 0, timeZone: deviceZone, name: `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`, israel: isInIsrael(latitude, longitude) } });
    setStatus(null);
  }
  const localeOptions: { id: LocaleId; label: string }[] = [
    { id: 'ashkenazi', label: 'Shabbos' }, { id: 'sephardi', label: 'Shabbat' }, { id: 'he', label: 'עברית' }, { id: 'en', label: 'English' },
  ];
  return (
    <View>
      <Card theme={theme}>
        <Heading theme={theme} rtl={rtl}>{t.place}: {rtl && settings.where.nameHe ? settings.where.nameHe : settings.where.name}</Heading>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t.search}
          placeholderTextColor={theme.muted}
          accessibilityLabel={t.search}
          style={[styles.body, { color: theme.text, borderColor: theme.border, borderWidth: 1, borderRadius: 8, padding: 10 }, dir(rtl)]}
        />
        {results.map((p) => (
          <Pressable key={p.id} accessibilityRole="button" onPress={() => { onChange({ ...settings, where: { ...p } }); setQuery(''); }}>
            <Row theme={theme} rtl={rtl} left={rtl && p.nameHe ? p.nameHe : p.name} right={p.israel ? '🇮🇱' : ''} sub={p.timeZone} />
          </Pressable>
        ))}
        <Pressable accessibilityRole="button" onPress={useMyLocation} style={[styles.choice, { borderColor: theme.accent, alignSelf: rtl ? 'flex-end' : 'flex-start' }]}>
          <Text style={[styles.small, { color: theme.accent }]}>{t.useLocation}</Text>
        </Pressable>
        {status === t.locating ? <ActivityIndicator /> : status ? <Text style={[styles.small, { color: theme.holiday }, dir(rtl)]}>{status}</Text> : null}
        <Text style={[styles.small, { color: theme.muted }, dir(rtl)]}>{t.privacy}</Text>
      </Card>
      <Card theme={theme}>
        <Heading theme={theme} rtl={rtl}>{t.language}</Heading>
        <Choice theme={theme} label={t.language} options={localeOptions} value={settings.localeId} onChange={(id) => onChange({ ...settings, localeId: id as LocaleId })} />
        <Heading theme={theme} rtl={rtl}>{t.israel}</Heading>
        <Choice
          theme={theme}
          label={t.israel}
          options={[{ id: 'auto', label: t.auto }, { id: 'il', label: t.inIsrael }, { id: 'dias', label: t.diaspora }]}
          value={settings.israel === null ? 'auto' : settings.israel ? 'il' : 'dias'}
          onChange={(id) => onChange({ ...settings, israel: id === 'auto' ? null : id === 'il' })}
        />
      </Card>
      <Text style={[styles.small, { color: theme.muted }, dir(rtl)]}>{t.disclaimer}</Text>
      <Text style={[styles.small, { color: theme.muted, marginTop: 8 }, dir(rtl)]}>{t.credit}</Text>
    </View>
  );
}
