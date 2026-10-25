import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type TextStyle } from 'react-native';
import type { Theme } from './theme';

export function Card({ theme, children, label }: { theme: Theme; children: ReactNode; label?: string }) {
  return (
    <View accessible={!!label} accessibilityLabel={label} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      {children}
    </View>
  );
}

export function Heading({ theme, children, rtl }: { theme: Theme; children: ReactNode; rtl: boolean }) {
  return (
    <Text accessibilityRole="header" style={[styles.heading, { color: theme.muted }, dir(rtl)]}>
      {children}
    </Text>
  );
}

export function Row({ theme, left, right, rtl, sub }: { theme: Theme; left: string; right: string; rtl: boolean; sub?: string }) {
  return (
    // The screen sets `direction`, so a plain row already runs right-to-left in Hebrew.
    <View style={styles.row} accessible accessibilityLabel={`${left}: ${right}`}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.body, { color: theme.text }, dir(rtl)]}>{left}</Text>
        {sub ? <Text style={[styles.small, { color: theme.muted }, dir(rtl)]}>{sub}</Text> : null}
      </View>
      <Text style={[styles.time, { color: theme.text }]}>{right}</Text>
    </View>
  );
}

export function Choice({ theme, options, value, onChange, label }: {
  theme: Theme;
  options: readonly { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
  label: string;
}) {
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label} style={styles.choices}>
      {options.map((o) => {
        const on = o.id === value;
        return (
          <Pressable
            key={o.id}
            accessibilityRole="radio"
            accessibilityState={{ checked: on }}
            accessibilityLabel={o.label}
            onPress={() => onChange(o.id)}
            style={[styles.choice, { borderColor: on ? theme.accent : theme.border, backgroundColor: on ? theme.accent : 'transparent' }]}
          >
            <Text style={[styles.small, { color: on ? theme.accentText : theme.text }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function dir(rtl: boolean): TextStyle {
  return { writingDirection: rtl ? 'rtl' : 'ltr', textAlign: rtl ? 'right' : 'left' };
}

export const styles = StyleSheet.create({
  card: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, padding: 16, marginBottom: 12, gap: 6 },
  heading: { fontSize: 13, fontWeight: '600', letterSpacing: 0.3, textTransform: 'uppercase', marginBottom: 2 },
  body: { fontSize: 17, lineHeight: 24 },
  small: { fontSize: 14, lineHeight: 20 },
  time: { fontSize: 17, fontVariant: ['tabular-nums'], fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 12 },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choice: { borderWidth: 1, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8, minHeight: 36, justifyContent: 'center' },
});
