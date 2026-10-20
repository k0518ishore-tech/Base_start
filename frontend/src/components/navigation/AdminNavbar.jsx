import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Landmark,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  FileText,
  Building2,
  Sliders,
  Users,
  MessageSquare,
  Activity,
  Eye,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';

const AdminNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminNavLinks = [
    { label: 'Dashboard', path: '/admin', end: true },
    { label: 'Schemes', path: '/admin/schemes' },
    { label: 'Departments', path: '/admin/departments' },
    { label: 'Rule Builder', path: '/admin/rules' },
    { label: 'Users', path: '/admin/users' },
    { label: 'Feedback', path: '/admin/feedback' },
    { label: 'Verification', path: '/admin/verification' },
    { label: 'Audit Logs', path: '/admin/audit-logs' },
  ];

  const isActive = (path, end) => {
    if (end) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
      {/* Top tricolor stripe */}
      <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-white to-emerald-600" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Branding */}
          <Link
            to="/admin"
            className="flex items-center gap-2.5 sm:gap-3 group shrink-0 pr-4 lg:pr-5 border-r border-slate-800/80"
          >
            <div className="w-9 h-9 rounded-lg bg-gov-secondary flex items-center justify-center text-white shadow-xs">
              <Landmark className="w-5 h-5 text-amber-300" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white whitespace-nowrap">
                  SchemeEngine
                </span>
                <span className="text-[10px] font-bold bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded uppercase tracking-wider whitespace-nowrap">
                  Admin
                </span>
              </div>
              <span className="text-[10px] font-medium text-slate-400 hidden 2xl:inline whitespace-nowrap">
                National Portal Administration
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink-0">
            {adminNavLinks.map((link) => {
              const active = isActive(link.path, link.end);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-2.5 xl:px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors ${
                    active
                      ? 'bg-gov-secondary text-white font-semibold shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
            {/* Switch to Citizen View shortcut */}
            <Link
              to="/dashboard"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700/80 transition-colors whitespace-nowrap shrink-0"
              title="Open Citizen Portal View"
            >
              <Eye className="w-3.5 h-3.5 text-blue-400" />
              <span>Citizen View</span>
            </Link>

            {/* Admin User dropdown */}
            <div className="relative shrink-0">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-750 text-left transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-extrabold shrink-0">
                  {user?.fullName?.charAt(0) || 'A'}
                </div>
                <div className="hidden lg:block">
                  <div className="text-xs font-bold text-white truncate max-w-[110px]">
                    {user?.fullName || 'National Admin'}
                  </div>
                  <div className="text-[9px] text-amber-400 uppercase tracking-wider font-semibold leading-none">
                    Administrator
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {isDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-white text-slate-800 shadow-elevated border border-slate-200 py-1.5 z-50 animate-scale-in"
                  onMouseLeave={() => setIsDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{user?.fullName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                    <span className="mt-1 inline-block text-[10px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded uppercase">
                      Portal Administrator
                    </span>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/admin"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <LayoutDashboard className="w-4 h-4 text-slate-400" />
                      Admin Dashboard
                    </Link>
                    <Link
                      to="/admin/schemes"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <FileText className="w-4 h-4 text-slate-400" />
                      Manage Schemes
                    </Link>
                    <Link
                      to="/admin/rules"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Sliders className="w-4 h-4 text-slate-400" />
                      Rule Builder
                    </Link>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-gov-secondary hover:bg-blue-50 border-t border-slate-100"
                    >
                      <Eye className="w-4 h-4 text-gov-secondary" />
                      Switch to Citizen View
                    </Link>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg lg:hidden"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-900 px-4 pt-2 pb-4 space-y-1">
          {adminNavLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-xs font-semibold ${
                isActive(link.path, link.end)
                  ? 'bg-gov-secondary text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/dashboard"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-xs font-semibold text-blue-400 hover:bg-slate-800 border-t border-slate-800 mt-2"
          >
            Switch to Citizen Portal View &rarr;
          </Link>
        </div>
      )}
    </header>
  );
};

export default AdminNavbar;
