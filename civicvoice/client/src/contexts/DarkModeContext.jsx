import { createContext, useContext, useState, useEffect } from 'react';

const DarkModeContext = createContext();

export const DarkModeProvider = ({ children }) => {
  const [dark, setDark] = useState(() => localStorage.getItem('cv_dark') === 'true');

  useEffect(() => {
    if (dark) document.documentElement.classList.add('dark');
    else       document.documentElement.classList.remove('dark');
    localStorage.setItem('cv_dark', dark);
  }, [dark]);

  return (
    <DarkModeContext.Provider value={{ dark, toggle: () => setDark(d => !d) }}>
      {children}
    </DarkModeContext.Provider>
  );
};

export const useDarkMode = () => useContext(DarkModeContext);
