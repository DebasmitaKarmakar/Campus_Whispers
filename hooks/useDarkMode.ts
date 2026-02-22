import { useState, useEffect } from 'react';

export const useDarkMode = () => {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('cw_theme') === 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('cw_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('cw_theme', 'light');
    }
  }, [isDark]);

  return { isDark, toggle: () => setIsDark(p => !p) };
};