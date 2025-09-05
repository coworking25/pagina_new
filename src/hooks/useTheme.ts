import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'system';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme') as Theme;
    return stored || 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const root = document.documentElement;
    
    const updateTheme = () => {
      let newTheme: 'light' | 'dark';
      
      if (theme === 'system') {
        newTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } else {
        newTheme = theme;
      }
      
      setResolvedTheme(newTheme);
      root.classList.remove('light', 'dark');
      root.classList.add(newTheme);
    };

    updateTheme();
    localStorage.setItem('theme', theme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    if (theme === 'system') {
      mediaQuery.addEventListener('change', updateTheme);
      return () => mediaQuery.removeEventListener('change', updateTheme);
    }
  }, [theme]);

  return { theme, setTheme, resolvedTheme };
};