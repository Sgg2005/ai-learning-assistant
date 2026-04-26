import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { Bell, User, Menu, Sun, Moon } from "lucide-react";

const Header = ({ toggleSidebar }) => {
  const { user } = useAuth();
  const themeCtx = useTheme();

  // supports either { theme } or { isDarkMode } context shapes
  const themeFromCtx =
    typeof themeCtx?.theme === "string"
      ? themeCtx.theme
      : themeCtx?.isDarkMode
      ? "dark"
      : "light";

  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    setIsDarkMode(
      themeFromCtx === "dark" || document.documentElement.classList.contains("dark")
    );
  }, [themeFromCtx]);

  const handleToggleTheme = () => {
    if (typeof themeCtx?.toggleTheme === "function") {
      themeCtx.toggleTheme();
    } else {
      // hard fallback
      document.documentElement.classList.toggle("dark");
      localStorage.setItem(
        "theme",
        document.documentElement.classList.contains("dark") ? "dark" : "light"
      );
    }

    // immediate visual sync
    setTimeout(() => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    }, 0);
  };

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3 transition-colors duration-300">
      <div className="flex items-center justify-between">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200"
          aria-label="Toggle sidebar"
        >
          <Menu size={24} />
        </button>

        <div className="flex-1" />

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleTheme}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun size={20} strokeWidth={2} /> : <Moon size={20} strokeWidth={2} />}
          </button>

          <div className="relative">
            <Bell size={20} strokeWidth={2} className="text-slate-500 dark:text-slate-400" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full" />
          </div>
        </div>

        <div className="ml-4">
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 transition-colors duration-300">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white shadow-sm shadow-orange-500/25">
              <User size={18} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                {user?.username || "User"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">
                {user?.email || "user@example.com"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;