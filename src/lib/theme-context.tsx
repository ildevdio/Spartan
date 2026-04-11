import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "corporate" | "light";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem("spartan-theme");
    return (saved as Theme) || "corporate";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("theme-corporate", "theme-light");
    root.classList.add(`theme-${theme}`);
    localStorage.setItem("spartan-theme", theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => setThemeState(newTheme);
  const toggleTheme = () => setThemeState(prev => prev === "corporate" ? "light" : "corporate");

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
