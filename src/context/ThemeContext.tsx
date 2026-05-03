import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors } from '../theme';

type ColorSchemeOverride = 'light' | 'dark' | null;

interface ThemeContextValue {
  colors: typeof lightColors;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: lightColors,
  isDark: false,
  toggleTheme: () => {},
});

const STORAGE_KEY = 'theme_override';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [override, setOverride] = useState<ColorSchemeOverride>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val === 'light' || val === 'dark') setOverride(val);
      setLoaded(true);
    });
  }, []);

  async function toggleTheme() {
    setOverride((prev) => {
      let next: ColorSchemeOverride;
      if (prev === null) next = systemScheme === 'dark' ? 'light' : 'dark';
      else if (prev === 'dark') next = 'light';
      else next = 'dark';
      if (next === null) AsyncStorage.removeItem(STORAGE_KEY);
      else AsyncStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }

  const scheme = override ?? systemScheme ?? 'light';
  const isDark = scheme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={{ colors, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
