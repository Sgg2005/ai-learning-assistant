import React from 'react'
import { useAuth } from '../../context/AuthContext';
import { Bell, User, Menu } from 'lucide-react';

const Header = ({ toggleSidebar }) => {
    const { user } = useAuth();

    return (
        <header className="bg-white border-b border-slate-200 px-4 py-3">
            <div className="flex items-center justify-between">
                
                {/* Mobile menu button */}
                <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors duration-200"
                    aria-label="Toggle sidebar"
                >
                    <Menu size={24} />
                </button>

                <div className="flex-1" />

                <div className="flex items-center gap-3 relative">
                    <Bell size={20} strokeWidth={2} className="text-slate-500" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full" />
                </div>

                {/* User profile */}
                <div className="ml-4">
                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white shadow-sm shadow-orange-500/25">
                            <User size={18} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-900 leading-tight">
                                {user?.username || 'User'}
                            </p>
                            <p className="text-xs text-slate-500 leading-tight">
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