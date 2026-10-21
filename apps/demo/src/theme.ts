import { useColorScheme } from 'react-native';

/** Colours chosen for WCAG AA contrast (4.5:1 for text) on both backgrounds. */
const light = {
  bg: '#FFFFFF',
  surface: '#F4F4F2',
  text: '#1B1B1B',
  muted: '#4F4F4F',
  accent: '#1D4E89',
  accentText: '#FFFFFF',
  border: '#D6D6D2',
  holiday: '#7A3E00',
};
const dark: typeof light = {
  bg: '#111214',
  surface: '#1E2024',
  text: '#F1F1EF',
  muted: '#B7B7B3',
  accent: '#9DC1F0',
  accentText: '#0B1A2C',
  border: '#34373D',
  holiday: '#F0B66B',
};

export type Theme = typeof light;

export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? dark : light;
}
