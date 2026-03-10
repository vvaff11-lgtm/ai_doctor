import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, History, User } from 'lucide-react';
import { cn } from '../utils';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 max-w-md mx-auto shadow-2xl relative overflow-hidden">
      <main className="flex-1 overflow-y-auto pb-20">{children}</main>

      <nav className="fixed bottom-0 w-full max-w-md bg-white/90 backdrop-blur-md border-t border-slate-200 px-10 py-3 flex justify-between items-center z-50">
        <NavItem to="/" icon={<Home size={24} />} label="首页" />
        <NavItem to="/history" icon={<History size={24} />} label="历史" />
        <NavItem to="/profile" icon={<User size={24} />} label="我的" />
      </nav>
    </div>
  );
};

const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn('flex flex-col items-center gap-1 transition-colors', isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600')
      }
    >
      {icon}
      <span className="text-[10px] font-bold">{label}</span>
    </NavLink>
  );
};
