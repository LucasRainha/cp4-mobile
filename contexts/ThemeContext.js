import React, { createContext, useState, useEffect } from "react";
import { Appearance } from "react-native";
import { Platform } from "react-native";

export const ThemeContext = createContext();

export const lightTheme = {
  background: "#FFFFFF",
  text: "#000000",
  primary: "#27C8E3",
  inputBackground: "#F0F0F0",
};

export const darkTheme = {
  background: "#0E1B35",
  text: "#FFFFFF",
  primary: "#27C8E3",
  inputBackground: "#1A2A4D",
};

export const ThemeProvider = ({ children }) => {
  // Funções utilitárias para persistência
  const storageKey = "themeName";
  const isWeb = typeof window !== "undefined" && typeof window.localStorage !== "undefined";

  // Função para obter tema salvo
  const getStoredTheme = () => {
    if (isWeb) {
      return window.localStorage.getItem(storageKey);
    } else {
      try {
        const value = global?.localStorage?.getItem(storageKey);
        return value;
      } catch {
        return null;
      }
    }
  };

  // Função para salvar tema
  const setStoredTheme = (value) => {
    if (isWeb) {
      window.localStorage.setItem(storageKey, value);
    } else {
      try {
        global?.localStorage?.setItem(storageKey, value);
      } catch {}
    }
  };

  const colorScheme = Appearance.getColorScheme();
  const [themeName, setThemeName] = useState(() => getStoredTheme() || colorScheme || "light");

  const toggleTheme = () => {
    setThemeName((prev) => {
      const next = prev === "light" ? "dark" : "light";
      setStoredTheme(next);
      return next;
    });
  };

  useEffect(() => {
    // Atualiza tema se mudar no sistema
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setThemeName((prev) => {
        const stored = getStoredTheme();
        if (stored) return stored;
        return colorScheme;
      });
    });
    // Ao montar, busca tema salvo
    const stored = getStoredTheme();
    if (stored) setThemeName(stored);
    return () => subscription.remove();
  }, []);

  const theme = themeName === "light" ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, themeName }}>
      {children}
    </ThemeContext.Provider>
  );
};