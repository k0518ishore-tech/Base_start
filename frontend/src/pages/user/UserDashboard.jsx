import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bookmark,
  Bell,
  Clock,
  CheckCircle2,
  ArrowRight,
  User,
  ShieldCheck,
  Building2,
  Layers,
  Compass,
  Bot,
  MessageSquare,
  Activity,
  Sliders,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const ALL_PORTAL_MODULES = [
  {
    title: 'Government Schemes Catalog',
    desc: 'Browse, search, and filter all verified Central & State welfare initiatives, grants, and subsidies.',
    path: '/schemes',
    icon: Layers,
    badge: 'Core Directory',
    badgeVariant: 'primary',
  },
  {
    title: 'Department Directory',
    desc: 'Explore welfare schemes organized by executive ministries (Agriculture, Health, Housing, Finance, etc.).',
    path: '/departments',
    icon: Building2,
    badge: 'Portfolio View',
    badgeVariant: 'secondary',
  },
  {
    title: 'Rule-Based Eligibility Checker',
    desc: 'Automated evaluation checking income limits, age, occupation, and category with clear explanation breakdowns.',
    path: '/eligibility',
    icon: CheckCircle2,
    badge: 'Rule Engine',
    badgeVariant: 'success',
  },
  {
    title: 'Recommended Schemes',
    desc: 'View welfare initiatives recommended specifically for you based on your citizen profile and eligibility criteria.',
    path: '/recommendations',
    icon: Sparkles,
    badge: 'Recommended',
    badgeVariant: 'warning',
  },
  {
    title: 'AI Scheme Assistant',
    desc: 'Chat with the National Scheme Assistant powered by Qwen AI to verify eligibility rules and required documents.',
    path: '/assistant',
    icon: Bot,
    badge: 'Qwen AI',
    badgeVariant: 'primary',
  },
  {
    title: 'Citizen Profile Management',
    desc: 'Manage your persistent demographics, annual family income, occupation, community, and disability status.',
    path: '/dashboard/profile',
    icon: User,
    badge: 'Criteria Store',
    badgeVariant: 'primary',
  },
  {
    title: 'Saved Schemes & Bookmarks',
    desc: 'Quickly access saved schemes, track requirements, and schedule date reminders.',
    path: '/dashboard/bookmarks',
    icon: Bookmark,
    badge: 'Personal',
    badgeVariant: 'secondary',
  },
  {
    title: 'Scheduled Application Reminders',
    desc: 'Monitor background cron deadline reminders and scheduled alerts.',
    path: '/dashboard/reminders',
    icon: Clock,
    badge: 'Cron Powered',
    badgeVariant: 'warning',
  },
  {
    title: 'Notifications Feed',
    desc: 'In-portal notification center for deadline alerts, scheme updates, and feedback replies.',
    path: '/dashboard/notifications',
    icon: Bell,
    badge: 'Real-Time',
    badgeVariant: 'danger',
  },
  {
    title: 'Citizen Support & Grievance Desk',
    desc: 'Report scheme discrepancies or submit inquiries and receive administrator responses.',
    path: '/dashboard/feedback',
    icon: MessageSquare,
    badge: 'Grievance',
    badgeVariant: 'secondary',
  },
  {
    title: 'Eligibility Evaluation History',
    desc: 'Review past automated criteria assessment logs and detailed rule breakdowns.',
    path: '/dashboard/eligibility-history',
    icon: Activity,
    badge: 'Audit Log',
    badgeVariant: 'neutral',
  },
];

const UserDashboard = () => {
  const { user, profile, isAdmin } = useAuth();

  const [bookmarks, setBookmarks] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [bookmarksRes, remindersRes, notifsRes] = await Promise.all([
          api.get('/bookmarks'),
          api.get('/reminders/upcoming'),
          api.get('/notifications?limit=5'),
        ]);

        if (bookmarksRes.data.success) setBookmarks(bookmarksRes.data.data);
        if (remindersRes.data.success) setReminders(remindersRes.data.data);
        if (notifsRes.data.success) setNotifications(notifsRes.data.data);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const calculateProfileCompletion = () => {
    if (!profile) return 30;
    const fields = [
      profile.dateOfBirth,
      profile.gender,
      profile.state,
      profile.district,
      profile.annualFamilyIncome !== null,
      profile.occupation,
      profile.employmentStatus,
      profile.community,
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  };

  const completionPct = calculateProfileCompletion();

  if (isLoading) {
    return <LoadingSpinner label="Loading citizen dashboard & modules..." size="lg" className="py-24" />;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-gov-primary via-[#163863] to-[#1d4d87] rounded-2xl p-6 sm:p-8 text-white shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.fullName || 'Citizen'}
          </h1>
        </div>

        <div className="flex flex-wrap gap-3 shrink-0">
          <Link
            to="/eligibility"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-slate-900 font-bold text-sm shadow-sm hover:bg-blue-50 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-slate-900">Check Eligibility</span>
          </Link>
          <Link
            to="/schemes"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/15 hover:bg-white/25 text-white font-semibold text-sm border border-white/40 transition-colors shadow-xs"
          >
            <span className="text-white">Browse Schemes</span>
          </Link>
        </div>
      </div>

      {/* Profile Completion Meter */}
      <div className="bg-white rounded-xl border border-gov-border p-5 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-gov-primary flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-gov-secondary" />
              Citizen Profile Completeness
            </span>
            <span className="text-gov-secondary font-bold">{completionPct}% Completed</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gov-secondary h-full rounded-full transition-all duration-500"
              style={{ width: `${completionPct}%` }}
            />
          </div>
          <p className="text-[11px] text-gov-muted">
            {completionPct < 100
              ? 'Complete your income, community, and occupation fields to enable instant, 100% accurate eligibility evaluations.'
              : 'Your profile is fully configured. All scheme evaluation rules can be evaluated automatically.'}
          </p>
        </div>

        <Link to="/dashboard/profile" className="shrink-0">
          <Button variant="outline" size="sm">
            {completionPct < 100 ? 'Complete Profile' : 'Edit Profile'}
          </Button>
        </Link>
      </div>

      {/* PRIMARY SECTION: ALL PORTAL MODULES LISTED */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-gov-secondary" />
              <span className="text-xs font-bold text-gov-secondary uppercase tracking-wider">
                Full Service Directory
              </span>
            </div>
            <h2 className="text-xl font-bold text-gov-primary tracking-tight">
              All Government Scheme Modules
            </h2>
            <p className="text-xs text-gov-muted mt-0.5">
              Click any module to access its features and services.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ALL_PORTAL_MODULES.map((mod, idx) => {
            const Icon = mod.icon;
            return (
              <Link key={idx} to={mod.path} className="group block">
                <div className="h-full p-5 rounded-2xl border border-gov-border bg-white hover:border-gov-secondary hover:shadow-card transition-all flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-gov-secondary flex items-center justify-center group-hover:bg-gov-primary group-hover:text-white transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                      <Badge variant={mod.badgeVariant} size="xs">
                        {mod.badge}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="font-bold text-sm text-gov-primary group-hover:text-gov-secondary transition-colors">
                        {mod.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {mod.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-gov-secondary group-hover:text-blue-800">
                    <span>Open Module</span>
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}

          {/* Admin Management Suite Card (if Admin) */}
          {isAdmin && (
            <Link to="/admin" className="group block">
              <div className="h-full p-5 rounded-2xl border border-amber-300 bg-amber-50/50 hover:border-amber-500 hover:shadow-card transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                      <Sliders className="w-5 h-5" />
                    </div>
                    <Badge variant="warning" size="xs">
                      Admin Suite
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-amber-800 transition-colors">
                      Administrator Console
                    </h3>
                    <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                      Manage schemes CRUD, departments, rule builder, user directories, and feedback desk.
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-2 border-t border-amber-200/60 flex items-center justify-between text-xs font-bold text-amber-900">
                  <span>Open Admin Console</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Metrics Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Link to="/dashboard/bookmarks">
          <Card hover className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-gov-secondary flex items-center justify-center shrink-0">
              <Bookmark className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-gov-primary">{bookmarks.length}</div>
              <div className="text-xs text-gov-muted font-medium">Saved Schemes</div>
            </div>
          </Card>
        </Link>

        <Link to="/dashboard/reminders">
          <Card hover className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-gov-primary">{reminders.length}</div>
              <div className="text-xs text-gov-muted font-medium">Upcoming Reminders</div>
            </div>
          </Card>
        </Link>

        <Link to="/dashboard/notifications">
          <Card hover className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-gov-primary">
                {notifications.filter((n) => !n.isRead).length}
              </div>
              <div className="text-xs text-gov-muted font-medium">Unread Notifications</div>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default UserDashboard;
