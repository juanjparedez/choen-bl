"use client";

import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes";

/**
 * Wrapper que re-exporta ThemeProvider de next-themes
 * ─ acepta todas las props de ThemeProviderProps
 * ─ aplica unos valores por defecto y permite sobreescribirlos
 */
export function ThemeProvider({
  children,
  attribute = "class",
  defaultTheme = "light",
  enableSystem = true,
  ...rest
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute={attribute}
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
      {...rest}
    >
      {children}
    </NextThemesProvider>
  );
}
