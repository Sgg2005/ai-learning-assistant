import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, FileText, User, BrainCircuit, BookOpen, X, LogOut } from 'lucide-react';

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {

  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  }

  const navLinks = [
    { to: '/dashboard', icon: LayoutDashboard, text: 'Dashboard' },
    { to: '/documents', icon: FileText, text: 'Documents' },
    { to: '/flashcards', icon: BookOpen, text: 'Flashcards' },
    { to: '/profile', icon: User, text: 'Profile' },
  ];

  return <>

    <div
      className={`fixed inset-0 bg-black/30 z-40 md:hidden transition-opacity duration-300 ${
        isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={toggleSidebar}
      aria-hidden="true"
    />

    <aside
      className={`fixed top-0 left-0 h-full w-64 bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg border-r border-slate-200/60 dark:border-slate-700/60 z-50 transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Logo and Close button for mobile */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-slate-200/60 dark:border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
            <BrainCircuit className="text-white" size={20} strokeWidth={2.5} />
          </div>
          <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100">AI Learning Assistant</h1>
        </div>
        <button onClick={toggleSidebar} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-200 md:hidden">
          <X size={24} />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={toggleSidebar}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-lg shadow-orange-500/25'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <link.icon
                  size={18}
                  strokeWidth={2.5}
                  className={`transition-transform duration-200 ${
                    isActive ? '' : 'group-hover:scale-110'
                  }`}
                />
                {link.text}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="px-3 py-4 border-t border-slate-200/60 dark:border-slate-700/60">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-all duration-200"
        >
          <LogOut size={18} strokeWidth={2.5} />
          Logout
        </button>
      </div>
    </aside>

  </>
};

export default Sidebar;