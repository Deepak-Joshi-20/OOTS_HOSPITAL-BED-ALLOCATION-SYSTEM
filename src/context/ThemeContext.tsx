import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

export type AppThemeMode = 'blossom' | 'luxe';

export interface ThemePalette {
  mode: AppThemeMode;
  label: string;
  tagline: string;
  canvasBg: string;
  surfaceBg: string;
  blushSurface: string;
  lavenderSurface: string;
  peachSurface: string;
  borderSubtle: string;
  primaryStrong: string;
  primaryHover: string;
  secondaryAccent: string;
  lilacAccent: string;
  peachAccent: string;
  textMain: string;
  textMuted: string;
  chartOccupied: string;
  chartAvailable: string;
  chartTurnover: string;
  chartRisk: string;
  chartTemp: string;
  chartVibration: string;
  chartPressure: string;
  tooltipBg: string;
  tooltipBorder: string;
}

const BLOSSOM_PALETTE: ThemePalette = {
  mode: 'blossom',
  label: 'Blossom Care',
  tagline: 'Warm Boutique Editorial Healthcare',
  canvasBg: '#FAF1E8',
  surfaceBg: '#FFFDFB',
  blushSurface: '#F5E9E8',
  lavenderSurface: '#EAE2F3',
  peachSurface: '#F7E5DC',
  borderSubtle: '#C9A9B8',
  primaryStrong: '#754C68', // Berry plum
  primaryHover: '#5E3B53',
  secondaryAccent: '#8F5B7A', // Deepened mauve for AA contrast
  lilacAccent: '#6B5299', // Deepened lilac for AA contrast
  peachAccent: '#B85442', // Deepened terracotta peach for text/accents
  textMain: '#2E2532', // Deep charcoal plum (12.8:1 contrast)
  textMuted: '#564552', // Darkened muted plum (6.4:1 contrast on cream/white)
  chartOccupied: '#754C68', // Berry plum
  chartAvailable: '#8E73AC', // Rich lilac-violet (distinguishable on light bg)
  chartTurnover: '#C97A63', // Warm terracotta peach (distinguishable on light bg)
  chartRisk: '#754C68',
  chartTemp: '#C44536',
  chartVibration: '#7E5796',
  chartPressure: '#4E3145',
  tooltipBg: '#2E2532',
  tooltipBorder: '#B98CA7',
};

const LUXE_PALETTE: ThemePalette = {
  mode: 'luxe',
  label: 'Arctic Bloom',
  tagline: 'Arctic & Indigo Clinical OS Suite',
  canvasBg: '#E9EFF8',
  surfaceBg: '#FFFFFF',
  blushSurface: '#FFE3D9',
  lavenderSurface: '#E8E4FF',
  peachSurface: '#FFE3D9',
  borderSubtle: '#B8C7E0',
  primaryStrong: '#2E56D6',
  primaryHover: '#2344B5',
  secondaryAccent: '#2851C7',
  lilacAccent: '#5641A6',
  peachAccent: '#C4382B',
  textMain: '#1E2433',
  textMuted: '#434E68', // Darkened slate (7.1:1 on white, 6.0:1 on #E9EFF8)
  chartOccupied: '#355CD6',
  chartAvailable: '#4A89F3',
  chartTurnover: '#765EC9',
  chartRisk: '#355CD6',
  chartTemp: '#D94E43',
  chartVibration: '#6B54C4',
  chartPressure: '#1E294E',
  tooltipBg: '#111A35',
  tooltipBorder: '#4169E1',
};

interface ThemeContextType {
  theme: AppThemeMode;
  isBlossom: boolean;
  palette: ThemePalette;
  setTheme: (mode: AppThemeMode) => void;
  toggleTheme: () => void;
}

const THEME_STORAGE_KEY = 'hospital_visual_theme_mode_v4';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<AppThemeMode>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'blossom' || saved === 'luxe') {
        return saved;
      }
    } catch {
      // ignore storage errors
    }
    return 'blossom'; // Default to approved Blossom Care theme
  });

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore
    }
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  const setTheme = (mode: AppThemeMode) => {
    setThemeState(mode);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'blossom' ? 'luxe' : 'blossom'));
  };

  const palette = useMemo(
    () => (theme === 'blossom' ? BLOSSOM_PALETTE : LUXE_PALETTE),
    [theme]
  );

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isBlossom: theme === 'blossom',
        palette,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside a ThemeProvider');
  }
  return ctx;
}
