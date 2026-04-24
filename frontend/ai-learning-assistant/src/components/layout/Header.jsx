import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Bell, User, Menu, Sun, Moon } from 'lucide-react';

const Header = ({ toggleSidebar }) => {
    const { user } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();

    return (
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3 transition-colors duration-300">
            <div className="flex items-center justify-between">

                {/* Mobile menu button */}
                <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200"
                    aria-label="Toggle sidebar"
                >
                    <Menu size={24} />
                </button>

                <div className="flex-1" />

                <div className="flex items-center gap-3">

                    {/* Dark mode toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200"
                        aria-label="Toggle dark mode"
                    >
                        {isDarkMode ? <Sun size={20} strokeWidth={2} /> : <Moon size={20} strokeWidth={2} />}
                    </button>

                    {/* Notifications */}
                    <div className="relative">
                        <Bell size={20} strokeWidth={2} className="text-slate-500 dark:text-slate-400" />
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full" />
                    </div>
                </div>

                {/* User profile */}
                <div className="ml-4">
                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 transition-colors duration-300">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white shadow-sm shadow-orange-500/25">
                            <User size={18} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                                {user?.username || 'User'}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">
                                {user?.email || 'user@example.com'}
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </header>
    );
};

export default Header;