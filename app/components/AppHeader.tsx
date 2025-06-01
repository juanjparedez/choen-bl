"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";

const MenuIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const ThemeToggleIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

function AppHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/series", label: "Catálogo" },
    { href: "/reviews", label: "Reseñas" },
    { href: "/recommendations", label: "Recomendaciones" },
  ];

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-sm dark:shadow-slate-700">
      <div className="container mx-auto flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center text-violet-700 dark:text-violet-300 hover:text-violet-800 dark:hover:text-violet-400 transition-colors">
            <Image
              src="/logo.png"
              alt="Mundo BL Logo"
              width={40}
              height={40}
              className="h-8 w-auto mr-2 md:h-10"
            />
            <span className="text-2xl font-bold">Mundo BL</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-slate-600 dark:text-slate-300 hover:text-violet-700 dark:hover:text-violet-400 font-medium transition-colors duration-300"
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-violet-700 dark:hover:text-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500 rounded-md"
            aria-label="Toggle theme between light and dark mode" // Static aria-label
          >
            <ThemeToggleIcon />
          </button>
        </nav>
        <button
          className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-violet-700 dark:hover:text-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500 rounded-md"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
        >
          <MenuIcon />
        </button>
      </div>
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-800 shadow-lg pb-4">
          <nav className="flex flex-col space-y-2 px-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 dark:text-slate-300 hover:bg-violet-100 dark:hover:bg-violet-900 hover:text-violet-700 dark:hover:text-violet-400 transition-colors duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={toggleTheme}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-600 dark:text-slate-300 hover:bg-violet-100 dark:hover:bg-violet-900 hover:text-violet-700 dark:hover:text-violet-400 transition-colors duration-300 text-left"
              aria-label="Toggle theme between light and dark mode" // Static aria-label
            >
              {theme === "light" ? "Dark Mode" : "Light Mode"}
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}

export default AppHeader;