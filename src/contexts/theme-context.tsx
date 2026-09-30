import { createContext, useCallback, useContext, useEffect, useSyncExternalStore } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const THEME_CHANGE_EVENT = "hagicode:theme-changed";
let sessionTheme: Theme | null = null;

function subscribeToTheme(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {};

  const handleStorageChange = () => {
    sessionTheme = null;
    onStoreChange();
  };
  window.addEventListener("storage", handleStorageChange);
  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", handleStorageChange);
    window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
  };
}

function getStoredTheme(defaultTheme: Theme): Theme {
  if (sessionTheme) return sessionTheme;
  try {
    const savedTheme = window.localStorage.getItem("theme");
    return savedTheme === "light" || savedTheme === "dark" ? savedTheme : defaultTheme;
  } catch {
    return defaultTheme;
  }
}

export function ThemeProvider({
  children,
  defaultTheme = "dark",
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
}) {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    () => (typeof window === "undefined" ? defaultTheme : getStoredTheme(defaultTheme)),
    () => defaultTheme,
  );
  const setTheme = useCallback((nextTheme: Theme) => {
    sessionTheme = nextTheme;
    try {
      window.localStorage.setItem("theme", nextTheme);
    } catch {
      // Keep the in-memory theme if browser storage is unavailable.
    }
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
}