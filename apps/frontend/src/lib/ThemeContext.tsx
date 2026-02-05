import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getTheme, setTheme as persistTheme, Theme } from "./theme";

// ─── Theme Definitions ──────────────────────────────────────────────────────
export const themes = {
  light: {
    bg: {
      app: "#f8f9fb",
      sidebar: "#ffffff",
      card: "#ffffff",
      cardHover: "#f1f5f9",
      elevated: "#f1f5f9",
      input: "#f8f9fb",
      badge: "rgba(14, 116, 210, 0.06)",
    },
    border: {
      subtle: "rgba(15, 23, 42, 0.06)",
      default: "rgba(15, 23, 42, 0.1)",
      focus: "rgba(14, 116, 210, 0.45)",
    },
    text: {
      primary: "#0f172a",
      secondary: "#475569",
      tertiary: "#94a3b8",
      accent: "#0e74d2",
      success: "#059669",
      warning: "#d97706",
      danger: "#dc2626",
    },
    accent: {
      primary: "#0e74d2",
      primaryHover: "#0c63b3",
      gradient: "linear-gradient(135deg, #0e74d2 0%, #3b93e8 100%)",
      glow: "0 2px 12px rgba(14, 116, 210, 0.1)",
      subtle: "rgba(14, 116, 210, 0.05)",
    },
    shadow: {
      card: "0 1px 3px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.02)",
      cardHover: "0 4px 16px rgba(15, 23, 42, 0.08)",
      button: "0 2px 8px rgba(14, 116, 210, 0.2)",
      buttonHover: "0 4px 16px rgba(14, 116, 210, 0.25)",
    },
    misc: {
      sidebarShadow: "1px 0 0 rgba(15,23,42,0.06)",
      avatarGradient: "linear-gradient(135deg, #0e74d2 0%, #6366f1 100%)",
      logoGradient: "linear-gradient(135deg, #0e74d2 0%, #3b93e8 100%)",
      scrollThumb: "rgba(15, 23, 42, 0.12)",
      selection: "rgba(14, 116, 210, 0.15)",
      statusGlow: "0 0 6px rgba(5,150,105,0.3)",
      ctaText: "#ffffff",
    },
  },
  dark: {
    bg: {
      app: "#0a0e17",
      sidebar: "#0d1220",
      card: "#111827",
      cardHover: "#151d2e",
      elevated: "#1a2332",
      input: "#0f1624",
      badge: "rgba(56, 189, 248, 0.08)",
    },
    border: {
      subtle: "rgba(148, 163, 184, 0.06)",
      default: "rgba(148, 163, 184, 0.1)",
      focus: "rgba(56, 189, 248, 0.4)",
    },
    text: {
      primary: "#f1f5f9",
      secondary: "#94a3b8",
      tertiary: "#64748b",
      accent: "#38bdf8",
      success: "#34d399",
      warning: "#fbbf24",
      danger: "#f87171",
    },
    accent: {
      primary: "#38bdf8",
      primaryHover: "#7dd3fc",
      gradient: "linear-gradient(135deg, #0ea5e9 0%, #38bdf8 50%, #7dd3fc 100%)",
      glow: "0 0 20px rgba(56, 189, 248, 0.15)",
      subtle: "rgba(56, 189, 248, 0.06)",
    },
    shadow: {
      card: "none",
      cardHover: "0 0 20px rgba(56, 189, 248, 0.08)",
      button: "0 4px 16px rgba(56,189,248,0.2)",
      buttonHover: "0 6px 24px rgba(56,189,248,0.3)",
    },
    misc: {
      sidebarShadow: "none",
      avatarGradient: "linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)",
      logoGradient: "linear-gradient(135deg, #0ea5e9 0%, #38bdf8 50%, #7dd3fc 100%)",
      scrollThumb: "rgba(148, 163, 184, 0.1)",
      selection: "rgba(56,189,248,0.2)",
      statusGlow: "0 0 6px rgba(52,211,153,0.4)",
      ctaText: "#0a0e17",
    },
  },
};

export type ThemeTokens = typeof themes.light;

// ─── Theme Context ──────────────────────────────────────────────────────────
interface ThemeContextValue {
  theme: ThemeTokens;
  mode: Theme;
  toggleTheme: () => void;
  setMode: (mode: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// Convenience hook to get just the theme tokens
export function useThemeTokens(): ThemeTokens {
  return useTheme().theme;
}

// ─── Theme Provider ─────────────────────────────────────────────────────────
interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setModeState] = useState<Theme>(() => getTheme());

  const setMode = (newMode: Theme) => {
    setModeState(newMode);
    persistTheme(newMode);
  };

  const toggleTheme = () => {
    setMode(mode === "light" ? "dark" : "light");
  };

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      // Only update if no explicit preference is stored
      const stored = localStorage.getItem("rbm-theme");
      if (!stored) {
        setModeState(mediaQuery.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const value: ThemeContextValue = {
    theme: themes[mode],
    mode,
    toggleTheme,
    setMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
