import React, { useContext } from 'react';
import { ThemeContext } from './ThemeContext';

const ThemedContent = ({ children }) => {
  const { colors } = useContext(ThemeContext);

  return (
    <div className="themed-content" style={{ color: colors.text }}>
      {children}
    </div>
  );
};

export default ThemedContent;