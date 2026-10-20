import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Building2,
  Sliders,
  Users,
  MessageSquare,
  ShieldCheck,
  Activity,
  Sparkles,
  Bell,
} from 'lucide-react';

const AdminSidebar = () => {
  const links = [
    { label: 'Admin Dashboard', path: '/admin', icon: LayoutDashboard, end: true },
    { label: 'Schemes Management', path: '/admin/schemes', icon: FileText },
    { label: 'Departments', path: '/admin/departments', icon: Building2 },
    { label: 'Eligibility Rules', path: '/admin/rules', icon: Sliders },
    { label: 'Citizen Accounts', path: '/admin/users', icon: Users },
    { label: 'Feedback Desk', path: '/admin/feedback', icon: MessageSquare },
    { label: 'Recommendations', path: '/admin/recommendations', icon: Sparkles },
    { label: 'Notifications', path: '/admin/notifications', icon: Bell },
    { label: 'Quality Verification', path: '/admin/verification', icon: ShieldCheck },
  ];

  return (
    <aside className="w-full md:w-64 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0 py-6 px-4">
      <div className="mb-6 px-3">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Admin Console
          </h3>
        </div>
        <p className="text-[11px] text-slate-500">Government Portal Administration</p>
      </div>
      <nav className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gov-secondary text-white font-semibold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
