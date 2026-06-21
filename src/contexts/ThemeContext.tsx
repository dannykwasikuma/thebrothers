import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';
type ColorPalette = 'Royal Gold' | 'Midnight Blue' | 'Forest Green' | 'Deep Purple' | 'Classic Crimson';

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  palette: ColorPalette;
  setPalette: (palette: ColorPalette) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const PALETTES = {
  'Royal Gold': { primary: '44 55% 54%', accent: '0 100% 27%' }, // #C9A84C, #8B0000
  'Midnight Blue': { primary: '214 52% 24%', accent: '44 55% 54%' }, // #1E3A5F, #C9A84C
  'Forest Green': { primary: '100 57% 20%', accent: '44 55% 54%' }, // #2D5016, #C9A84C
  'Deep Purple': { primary: '268 82% 31%', accent: '44 55% 54%' }, // #4A0E8F, #C9A84C
  'Classic Crimson': { primary: '0 100% 27%', accent: '44 55% 54%' }, // #8B0000, #C9A84C
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('brothers-theme-mode');
    return (saved as ThemeMode) || 'system';
  });

  const [palette, setPalette] = useState<ColorPalette>(() => {
    const saved = localStorage.getItem('brothers-color-palette');
    return (saved as ColorPalette) || 'Royal Gold';
  });

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    localStorage.setItem('brothers-theme-mode', mode);
    
    const applyTheme = () => {
      const root = window.document.documentElement;
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      const shouldBeDark = mode === 'dark' || (mode === 'system' && systemDark);
      
      if (shouldBeDark) {
        root.classList.add('dark');
        setIsDark(true);
      } else {
        root.classList.remove('dark');
        setIsDark(false);
      }
    };

    applyTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme();
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem('brothers-color-palette', palette);
    const root = window.document.documentElement;
    const colors = PALETTES[palette];
    
    if (colors) {
      root.style.setProperty('--primary', colors.primary);
      root.style.setProperty('--accent', colors.accent);
    }
  }, [palette]);

  return (
    <ThemeContext.Provider value={{ mode, setMode, palette, setPalette, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
