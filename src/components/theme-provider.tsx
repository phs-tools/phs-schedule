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

export type StoredTheme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "phs-schedule-theme";
const STORAGE_EVENT = "phs-schedule-theme-change";

interface ThemeContextType {
  /** The theme in effect, with "system" already resolved against the OS. */
  theme: ResolvedTheme;
  /** The user's stored preference, which may be "system". */
  storedTheme: StoredTheme;
  setTheme: (theme: StoredTheme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  storedTheme: "system",
  setTheme: () => {},
});

function getStoredTheme(): StoredTheme {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === "light" || value === "dark" || value === "system") {
      return value;
    }
  } catch {}
  return "system";
}

function resolveTheme(stored: StoredTheme): ResolvedTheme {
  if (stored !== "system") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
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

function getSystemTheme(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function subscribeToSystemTheme(onStoreChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function applyTheme(theme: ResolvedTheme) {
  const html = document.documentElement;
  html.classList.remove("light", "dark");
  html.classList.add(theme);
}

export function ThemeProvider({ children }: PropsWithChildren) {
  // `useSyncExternalStore` reads the stored preference and the OS preference
  // without a setState-in-effect round trip, and keeps the OS preference live
  // while the stored one is "system".
  const storedTheme = useSyncExternalStore(
    subscribeToStoredTheme,
    getStoredTheme,
    () => "system" as const,
  );
  const prefersDark = useSyncExternalStore(
    subscribeToSystemTheme,
    getSystemTheme,
    () => false,
  );

  const theme: ResolvedTheme =
    storedTheme === "system" ? (prefersDark ? "dark" : "light") : storedTheme;

  // The pre-paint script in the root layout applies the theme class before the
  // first paint, so the class is deliberately never derived from a render
  // value here: during hydration the resolved theme is still the server
  // snapshot, and applying it would fight the script. The class is written
  // imperatively instead, where the current value is known to be fresh.
  useEffect(() => {
    const html = document.documentElement;
    // Fill in only if the pre-paint script could not run.
    if (!html.classList.contains("light") && !html.classList.contains("dark")) {
      applyTheme(resolveTheme(getStoredTheme()));
    }
  }, []);

  // Follow the OS while the preference is "system", and pick up changes made
  // in another tab.
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemChange = () => {
      if (getStoredTheme() === "system") {
        applyTheme(resolveTheme("system"));
      }
    };
    // A change in another tab may set any preference, so always re-apply.
    const onStorageChange = () => {
      applyTheme(resolveTheme(getStoredTheme()));
    };
    media.addEventListener("change", onSystemChange);
    window.addEventListener("storage", onStorageChange);
    return () => {
      media.removeEventListener("change", onSystemChange);
      window.removeEventListener("storage", onStorageChange);
    };
  }, []);

  const setTheme = useCallback((next: StoredTheme) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
    // Apply immediately so the change is not deferred to the next render.
    applyTheme(resolveTheme(next));
    window.dispatchEvent(new Event(STORAGE_EVENT));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, storedTheme, setTheme }}>
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
