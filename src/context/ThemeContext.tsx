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
  const prevComputedRef = useRef<{ bg: string; color: string } | undefined>(undefined);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    const target = document.body;
    target.classList.remove('light', 'dark');
    target.classList.add(theme);

    const computed = window.getComputedStyle(target);
    const current = { bg: computed.backgroundColor, color: computed.color };
    const prev = prevThemeRef.current;
    const prevComputed = prevComputedRef.current;

    if (prev) {
      console.log(`Theme changed from ${prev} to ${theme}`);
    } else {
      console.log(`Initial theme: ${theme}`);
    }

    if (prevComputed) {
      console.log(
        `Computed bg ${prevComputed.bg} -> ${current.bg}, color ${prevComputed.color} -> ${current.color}`
      );
    } else {
      console.log(`Initial computed values`, { background: current.bg, color: current.color });
    }

    prevThemeRef.current = theme;
    prevComputedRef.current = current;
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
