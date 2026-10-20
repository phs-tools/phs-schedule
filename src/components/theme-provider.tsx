"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
  type PropsWithChildren,
} from "react";
import { FAVICON_DARK, FAVICON_LIGHT } from "@/lib/favicon";

export type Theme = "light" | "dark";

const STORAGE_KEY = "phs-schedule-theme";
const STORAGE_EVENT = "phs-schedule-theme-change";

interface ThemeContextType {
  /** The theme in effect. */
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  setTheme: () => {},
});

/**
 * The stored preference, defaulting to light. Anything unrecognised — a
 * value written by an older version, say — falls back to light too.
 */
function getStoredTheme(): Theme {
  try {
    if (localStorage.getItem(STORAGE_KEY) === "dark") return "dark";
  } catch {}
  return "light";
}

function subscribeToStoredTheme(onStoreChange: () => void) {
  // "storage" fires in other tabs; the custom event fires in this one.
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(STORAGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(STORAGE_EVENT, onStoreChange);
  };
}

function applyTheme(theme: Theme) {
  const html = document.documentElement;
  html.classList.remove("light", "dark");
  html.classList.add(theme);
}

export function ThemeProvider({ children }: PropsWithChildren) {
  // `useSyncExternalStore` reads the stored preference without a
  // setState-in-effect round trip. The server snapshot is light, which is
  // also the default, so the first render agrees with the server.
  const theme = useSyncExternalStore(
    subscribeToStoredTheme,
    getStoredTheme,
    () => "light" as const,
  );

  // The pre-paint script in the root layout applies the theme class before the
  // first paint, so the class is deliberately never derived from a render
  // value here: during hydration the theme is still the server snapshot, and
  // applying it would fight the script. The class is written imperatively
  // instead, where the current value is known to be fresh.
  useEffect(() => {
    const html = document.documentElement;
    // Fill in only if the pre-paint script could not run.
    if (!html.classList.contains("light") && !html.classList.contains("dark")) {
      applyTheme(getStoredTheme());
    }
  }, []);

  // Pick up a change made in another tab.
  useEffect(() => {
    const onStorageChange = () => applyTheme(getStoredTheme());
    window.addEventListener("storage", onStorageChange);
    return () => window.removeEventListener("storage", onStorageChange);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
    // Apply immediately so the change is not deferred to the next render.
    applyTheme(next);
    window.dispatchEvent(new Event(STORAGE_EVENT));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {/*
        The favicon follows the app's theme, which is driven by a class on
        <html> rather than the OS preference, so it cannot be selected with a
        `media` query. Rendering the link here lets React own it and keep it
        in sync with the theme, rather than having the theme script and
        React fight over the same element.
      */}
      <link rel="icon" href={theme === "dark" ? FAVICON_DARK : FAVICON_LIGHT} />
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
