import { createContext, useContext, useEffect, useRef, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark' || storedTheme === 'light') {
      return storedTheme;
    }

    // Check user preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  });

  const prevThemeRef = useRef<Theme | undefined>(undefined);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    const html = document.documentElement;
    const body = document.body;
    const themeTarget =
      (document.querySelector('[data-theme-target]') as HTMLElement | null) || body;
    const before = window.getComputedStyle(themeTarget);

    html.classList.remove('light', 'dark');
    body.classList.remove('light', 'dark');
    html.classList.add(theme);
    body.classList.add(theme);

    const after = window.getComputedStyle(themeTarget);
    const prev = prevThemeRef.current;

    if (prev) {
      console.log(`Theme changed from ${prev} to ${theme}`);
    } else {
      console.log(`Initial theme: ${theme}`);
    }

    if (before.backgroundColor !== after.backgroundColor || before.color !== after.color) {
      console.log('Computed styles changed', {
        from: { background: before.backgroundColor, color: before.color },
        to: { background: after.backgroundColor, color: after.color },
      });
    } else {
      console.log('Computed styles unchanged', {
        background: after.backgroundColor,
        color: after.color,
      });
    }

    prevThemeRef.current = theme;
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
