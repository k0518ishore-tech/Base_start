import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Bookmark,
  Bell,
  CheckCircle2,
  MessageSquare,
  Clock,
  Sparkles,
} from 'lucide-react';

const UserSidebar = () => {
  const links = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard, end: true },
    { label: 'Citizen Profile', path: '/dashboard/profile', icon: User },
    { label: 'Saved Schemes', path: '/dashboard/bookmarks', icon: Bookmark },
    { label: 'Reminders', path: '/dashboard/reminders', icon: Clock },
    { label: 'Eligibility History', path: '/dashboard/eligibility-history', icon: CheckCircle2 },
    { label: 'Notifications', path: '/dashboard/notifications', icon: Bell },
    { label: 'Support & Feedback', path: '/dashboard/feedback', icon: MessageSquare },
  ];

  return (
    <aside className="w-full md:w-64 bg-white border-r border-gov-border shrink-0 py-6 px-4">
      <div className="mb-6 px-3">
        <h3 className="text-xs font-bold text-gov-muted uppercase tracking-wider">
          Citizen Portal
        </h3>
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
                    ? 'bg-blue-50 text-gov-secondary font-semibold border-l-4 border-gov-secondary'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-gov-primary'
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

export default UserSidebar;
