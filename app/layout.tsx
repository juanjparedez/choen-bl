// app/layout.tsx  (o app/layout.jsx)
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "./providers/ThemeProvider";
import "./globals.css";

// ――― Fuentes (con variables CSS para poder mezclarlas fácilmente) ―――
const geistSans = Geist({ subsets: ["latin"], variable: "--font-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Mundo BL",
  description: "Un espacio dedicado al Boys Love",
  authors: [{ name: "Mundo BL", url: "https://mundobl.com" }],
  creator: "Mundo BL",

  // 🔗 ← aquí mismo puedes declarar íconos si quieres referenciarlos manualmente
  // icons: {
  //   icon: "/favicon.ico",
  //   apple: "/apple-touch-icon.png",
  //   shortcut: "/favicon-16x16.png",
  // },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      {/* 
        Si usas Tailwind, puedes aprovechar las variables:
        html { font-family: var(--font-sans); }
        .code { font-family: var(--font-mono); }
      */}
      <body className="min-h-screen antialiased bg-background text-foreground">
        {/* ThemeProvider controla dark / light usando la clase `dark` en <html> */}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
