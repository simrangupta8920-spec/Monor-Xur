import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { soundController } from '../utils/audio';

export type AppTheme = 'default' | 'northeast';

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
  isNorthEast: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'monor_xur_theme';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'northeast' || stored === 'default') {
          return stored;
        }
      } catch {
        // Fallback to default
      }
    }
    return 'default'; // Existing palette is default
  });

  const applyThemeToDocument = useCallback((currentTheme: AppTheme) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const body = document.body;

    if (currentTheme === 'northeast') {
      root.setAttribute('data-theme', 'northeast');
      body.setAttribute('data-theme', 'northeast');
      root.classList.add('theme-northeast');
      body.classList.add('theme-northeast');
      
      // Update meta theme-color for mobile top browser chrome
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', '#FAF6F0');
      }
    } else {
      root.removeAttribute('data-theme');
      body.removeAttribute('data-theme');
      root.classList.remove('theme-northeast');
      body.classList.remove('theme-northeast');

      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', '#FDFBF7');
      }
    }
  }, []);

  const setTheme = useCallback((newTheme: AppTheme) => {
    setThemeState(newTheme);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, newTheme);
      }
    } catch {
      // Ignore
    }
    applyThemeToDocument(newTheme);
  }, [applyThemeToDocument]);

  const toggleTheme = useCallback(() => {
    const next = theme === 'default' ? 'northeast' : 'default';
    soundController.playClick();
    setTheme(next);
  }, [theme, setTheme]);

  // Synchronize on mount and whenever theme changes
  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme, applyThemeToDocument]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        isNorthEast: theme === 'northeast',
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
