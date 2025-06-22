import React, { createContext, useState, useMemo } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark' || true);

  const theme = useMemo(() => ({
    isDark,
    toggleTheme: () => setIsDark((prev) => {
      localStorage.setItem('theme', !prev ? 'dark' : 'light');
      return !prev;
    }),
    colors: {
      bg: isDark ? '#121212' : '#F1F2F5',
      header: isDark ? '#1C2526' : '#FFFFFF',
      sidebar: isDark ? '#1F2A44' : '#F0F2F5',
      active: isDark ? '#2E3A59' : '#E7F3FF',
      hover: isDark ? '#28324F' : '#E4E6E9',
      text: isDark ? '#E0E6ED' : '#050505',
      inactive: isDark ? '#A3ACBF' : '#65676B',
      hoverText: isDark ? '#D3D8E8' : '#4B4D52',
      accent: '#F6643B',
      accentHover: isDark ? '#F88A5B' : '#F6643B',
    },
  }), [isDark]);

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};