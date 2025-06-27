import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";

type Theme = "matcha" | "sparkles" | "coffee";

interface ThemeContextType {
  theme: Theme;
  darkMode: boolean;
  setTheme: (theme: Theme) => void;
  setDarkMode: (dark: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("matcha");
  const [darkMode, setDarkModeState] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Initialize theme from user preferences or localStorage
  useEffect(() => {
    if (isAuthenticated && user) {
      setThemeState(user.currentTheme as Theme || "matcha");
      setDarkModeState(user.darkMode || false);
    } else {
      // Load from localStorage for non-authenticated users
      const savedTheme = localStorage.getItem("aviva-theme") as Theme;
      const savedDarkMode = localStorage.getItem("aviva-dark-mode") === "true";
      
      if (savedTheme) setThemeState(savedTheme);
      setDarkModeState(savedDarkMode);
    }
  }, [user, isAuthenticated]);

  // Apply theme to document
  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    document.documentElement.classList.toggle("dark", darkMode);
  }, [theme, darkMode]);

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    
    if (isAuthenticated) {
      try {
        await apiRequest("PUT", "/api/user/preferences", {
          currentTheme: newTheme,
          darkMode,
          notificationsEnabled: user?.notificationsEnabled ?? true,
          mascotName: user?.mascotName ?? "Kiwi"
        });
      } catch (error) {
        console.error("Failed to save theme preference:", error);
      }
    } else {
      localStorage.setItem("aviva-theme", newTheme);
    }
  };

  const setDarkMode = async (dark: boolean) => {
    setDarkModeState(dark);
    
    if (isAuthenticated) {
      try {
        await apiRequest("PUT", "/api/user/preferences", {
          currentTheme: theme,
          darkMode: dark,
          notificationsEnabled: user?.notificationsEnabled ?? true,
          mascotName: user?.mascotName ?? "Kiwi"
        });
      } catch (error) {
        console.error("Failed to save dark mode preference:", error);
      }
    } else {
      localStorage.setItem("aviva-dark-mode", dark.toString());
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, darkMode, setTheme, setDarkMode }}>
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
