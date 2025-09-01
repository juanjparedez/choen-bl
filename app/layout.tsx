import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "./providers/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Mundo BL",
    template: "%s | Mundo BL",
  },
  description: "Un espacio dedicado al Boys Love - Series, reseñas y comunidad",
  keywords: ["BL", "Boys Love", "series", "drama", "asiático", "LGBTQ+"],
  authors: [{ name: "Mundo BL", url: "https://mundobl.com" }],
  creator: "Mundo BL",
  publisher: "Mundo BL",

  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://mundobl.com",
    title: "Mundo BL",
    description: "Un espacio dedicado al Boys Love",
    siteName: "Mundo BL",
  },

  twitter: {
    card: "summary_large_image",
    title: "Mundo BL",
    description: "Un espacio dedicado al Boys Love",
  },

  robots: {
    index: true,
    follow: true,
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },

  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
