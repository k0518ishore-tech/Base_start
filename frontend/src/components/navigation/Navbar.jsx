import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Landmark,
  Bell,
  Bookmark,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Bot,
  Compass,
  Lock,
  Unlock,
  Layers,
} from 'lucide-react';
import Button from '../common/Button';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      api
        .get('/notifications/unread-count')
        .then((res) => {
          if (res.data.success) {
            setUnreadCount(res.data.unreadCount);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated, location.pathname]);

  const handleLogout = () => {
    logout();
    setIsUserDropdownOpen(false);
    navigate('/login');
  };

  const navLinks = [
    { label: 'Explore Schemes', path: '/schemes', icon: Layers },
    { label: 'Departments', path: '/departments' },
    { label: 'Check Eligibility', path: '/eligibility', highlight: true },
    { label: 'Recommendations', path: '/recommendations', icon: Sparkles },
    { label: 'Assistant', path: '/assistant', icon: Bot },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gov-border shadow-xs">
      {/* Top tricolor stripe */}
      <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-white to-emerald-600" />

      {/* Main navigation container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo / Branding */}
          <Link
            to={!isAuthenticated ? '/login' : isAdmin ? '/admin' : '/dashboard'}
            className="flex items-center gap-2.5 sm:gap-3 group shrink-0 pr-4 lg:pr-5 border-r border-gov-border/80"
          >
            <div className="w-9 h-9 rounded-lg bg-gov-primary flex items-center justify-center text-white shadow-xs group-hover:bg-gov-primary-hover transition-colors">
              <Landmark className="w-5 h-5 text-amber-300" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-gov-primary whitespace-nowrap">
                  SchemeEngine
                </span>
                <span className="text-[10px] font-semibold bg-blue-100 text-gov-secondary px-1.5 py-0.2 rounded uppercase tracking-wider whitespace-nowrap">
                  National
                </span>
              </div>
              <span className="text-[10px] font-medium text-gov-muted hidden 2xl:inline whitespace-nowrap">
                Government Scheme Eligibility Engine
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links (Visible ONLY when logged in) */}
          {isAuthenticated ? (
            <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink-0">
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 transition-colors whitespace-nowrap shrink-0 mr-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  <span>Admin Console</span>
                </Link>
              )}
              <Link
                to="/dashboard"
                className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 text-xs xl:text-sm font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors ${
                  isActive('/dashboard')
                    ? 'bg-blue-50 text-gov-secondary font-semibold'
                    : 'text-slate-600 hover:text-gov-primary hover:bg-slate-50'
                }`}
              >
                Citizen Hub
              </Link>
              {navLinks.map((link) => {
                const active = isActive(link.path);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 text-xs xl:text-sm font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors ${
                      active
                        ? 'bg-blue-50 text-gov-secondary font-semibold'
                        : link.highlight
                        ? 'text-gov-primary hover:bg-slate-50 font-semibold'
                        : 'text-slate-600 hover:text-gov-primary hover:bg-slate-50'
                    }`}
                  >
                    {Icon && <Icon className="w-3.5 h-3.5" />}
                    <span>{link.label}</span>
                    {link.highlight && (
                      <span className="w-1.5 h-1.5 rounded-full bg-gov-secondary animate-pulse" />
                    )}
                  </Link>
                );
              })}
            </nav>
          ) : (
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Authentication Gateway: Sign In to access portal modules</span>
            </div>
          )}

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
            {isAuthenticated ? (
              <>
                {/* Bookmarks shortcut */}
                <Link
                  to="/dashboard/bookmarks"
                  className="p-2 text-slate-500 hover:text-gov-primary hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                  title="My Bookmarks"
                >
                  <Bookmark className="w-5 h-5" />
                </Link>

                {/* Notifications icon */}
                <Link
                  to="/dashboard/notifications"
                  className="relative p-2 text-slate-500 hover:text-gov-primary hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* User menu dropdown */}
                <div className="relative shrink-0">
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-gov-border hover:bg-slate-50 text-left transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-gov-primary text-white flex items-center justify-center text-xs font-semibold shrink-0">
                      {user?.fullName?.charAt(0) || 'U'}
                    </div>
                    <div className="hidden lg:block">
                      <div className="text-xs font-semibold text-gov-primary truncate max-w-[110px]">
                        {user?.fullName}
                      </div>
                      <div className="text-[9px] text-gov-muted uppercase tracking-wider font-semibold leading-none">
                        {user?.role}
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </button>

                  {/* Dropdown menu */}
                  {isUserDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-elevated border border-gov-border py-1.5 z-50 animate-scale-in"
                      onMouseLeave={() => setIsUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-gov-border">
                        <p className="text-sm font-semibold text-gov-primary">{user?.fullName}</p>
                        <p className="text-xs text-gov-muted truncate">{user?.email}</p>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/dashboard"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-gov-text hover:bg-slate-50"
                        >
                          <UserIcon className="w-4 h-4 text-slate-400" />
                          Citizen Dashboard
                        </Link>
                        <Link
                          to="/dashboard/profile"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-gov-text hover:bg-slate-50"
                        >
                          <ShieldCheck className="w-4 h-4 text-slate-400" />
                          Manage Profile
                        </Link>
                        <Link
                          to="/dashboard/reminders"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-gov-text hover:bg-slate-50"
                        >
                          <Bell className="w-4 h-4 text-slate-400" />
                          My Reminders
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-gov-secondary font-semibold hover:bg-blue-50 border-t border-slate-100"
                          >
                            <ShieldCheck className="w-4 h-4 text-gov-secondary" />
                            Admin Console
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-gov-border pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Register
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            {isAuthenticated && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu (Authenticated) */}
      {isAuthenticated && isMobileMenuOpen && (
        <div className="lg:hidden border-t border-gov-border bg-white px-4 pt-2 pb-6 space-y-1">
          <Link
            to="/dashboard"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-lg text-base font-medium ${
              isActive('/dashboard') ? 'bg-blue-50 text-gov-secondary font-semibold' : 'text-slate-600'
            }`}
          >
            All Modules Hub
          </Link>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-base font-medium ${
                isActive(link.path)
                  ? 'bg-blue-50 text-gov-secondary font-semibold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};

export default Navbar;
