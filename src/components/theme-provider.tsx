"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";

type StoredTheme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

interface ThemeContextType {
  theme: ResolvedTheme;
  setTheme: (theme: StoredTheme) => void;
  storedTheme: StoredTheme;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  setTheme: () => {},
  storedTheme: "system",
});

function getStoredTheme(): StoredTheme {
  try {
    const val = localStorage.getItem("phs-schedule-theme");
    if (val === "light" || val === "dark" || val === "system") {
      return val;
    }
  } catch {}
  return "system";
}

function getSystemTheme(): ResolvedTheme {
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }
  return "light";
}

function resolveTheme(theme: StoredTheme): ResolvedTheme {
  if (theme === "system") {
    return getSystemTheme();
  }
  return theme;
}

interface ThemeState {
  stored: StoredTheme;
  resolved: ResolvedTheme;
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const [themeState, setThemeState] = useState<ThemeState>({
    stored: "system",
    resolved: "light",
  });
  const [isMounted, setIsMounted] = useState(false);

  // Read stored theme from localStorage on the client.
  // localStorage is unavailable during SSR, so we sync it here on mount.
  // The theme class itself is already on <html> by this point (the pre-paint
  // script in the root layout applies it), so we only need to read it here to
  // keep our state in sync.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const stored = getStoredTheme();
    setThemeState({ stored, resolved: resolveTheme(stored) });
    setIsMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Apply theme class to <html>
  useEffect(() => {
    // Skip the first run: the class was already applied before paint, and
    // re-applying it here would flash the wrong theme.
    if (!isMounted) return;
    const html = document.documentElement;
    html.classList.remove("light", "dark");
    html.classList.add(themeState.resolved);
  }, [isMounted, themeState.resolved]);

  // Listen for system preference changes when theme is set to "system"
  useEffect(() => {
    if (themeState.stored !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () =>
      setThemeState((prev) => ({ ...prev, resolved: getSystemTheme() }));
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [themeState.stored]);

  const setTheme = (newTheme: StoredTheme) => {
    setThemeState({ stored: newTheme, resolved: resolveTheme(newTheme) });
    try {
      localStorage.setItem("phs-schedule-theme", newTheme);
    } catch {}
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: themeState.resolved,
        setTheme,
        storedTheme: themeState.stored,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
