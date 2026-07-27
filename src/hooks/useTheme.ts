import { useEffect, useState } from 'react';

const THEME_KEY = 'glosas-theme';

function temaInicial(): boolean {
  const guardado = localStorage.getItem(THEME_KEY);
  if (guardado === 'dark') return true;
  if (guardado === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/** Modo oscuro con persistencia en localStorage y detección de preferencia del sistema. */
export function useTheme() {
  const [isDark, setIsDark] = useState(temaInicial);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  return { isDark, toggleTheme };
}
