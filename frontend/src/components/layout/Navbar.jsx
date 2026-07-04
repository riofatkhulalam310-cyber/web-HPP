import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { LogOut, Sun, Moon, Menu } from 'lucide-react';

const Navbar = ({ setMobileOpen }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button 
          className="mobile-menu-btn" 
          onClick={() => setMobileOpen(true)}
        >
          <Menu size={24} />
        </button>
        <div className="navbar-greeting">
          Halo, <span>{user?.nama || 'Admin'}</span> 👋
        </div>
      </div>

      <div className="navbar-right">
        <button 
          className="theme-toggle" 
          onClick={toggleTheme} 
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        <button className="btn btn-ghost" onClick={logout} title="Logout">
          <LogOut size={18} />
          <span className="hide-on-mobile">Keluar</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
