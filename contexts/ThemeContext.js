import React, { createContext, useState, useEffect } from "react";
import { Appearance } from "react-native";

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
  const colorScheme = Appearance.getColorScheme();
  const [themeName, setThemeName] = useState(colorScheme || "light");

  const toggleTheme = () => {
    setThemeName((prev) => (prev === "light" ? "dark" : "light"));
  };

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setThemeName(colorScheme);
    });
    return () => subscription.remove();
  }, []);

  const theme = themeName === "light" ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};