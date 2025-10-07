import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

// Define the available themes (light mode removed)
export type Theme = "dark" | "retro";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

// Create the context
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// Provider component
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>("dark");

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "retro" : "dark"));
  };

  // Sync background color with theme
  useEffect(() => {
    const app = document.querySelector(".App") as HTMLElement | null;
    if (!app) return;

    // Only dark and retro supported now
    if (theme === "retro") {
      app.style.backgroundColor = "#081b08";
    } else {
      app.style.backgroundColor = "#000000";
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      <div
        className={`theme-${theme}`}
        style={{ position: "relative", width: "100vw", height: "100vh" }}
      >
        {children}

        {/* Dropdown for switching themes */}
        <div style={{ position: "absolute", top: 20, right: 20, zIndex: 999 }}>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as Theme)}
            style={{ padding: "0.5rem", fontSize: "1rem" }}
          >
            <option value="dark">Dark</option>
            <option value="retro">Retro</option>
          </select>
        </div>
      </div>
    </ThemeContext.Provider>
  );
};
