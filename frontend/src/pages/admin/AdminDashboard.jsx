import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Building2,
  Users,
  ShieldCheck,
  AlertTriangle,
  Activity,
  Layers,
  ArrowRight,
  MessageSquare,
  Sparkles,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';

const ADMIN_MODULES = [
  {
    title: 'Schemes Portfolio Management',
    desc: 'Create new schemes, edit descriptions, manage benefits, documents, and activation status.',
    path: '/admin/schemes',
    icon: FileText,
  },
  {
    title: 'Department & Ministry Directory',
    desc: 'Register and update government departments, official URLs, and view linked scheme counts.',
    path: '/admin/departments',
    icon: Building2,
  },
  {
    title: 'Visual Eligibility Rule Builder',
    desc: 'Configure criteria rules (income limits, age, category) with live evaluation logic previews.',
    path: '/admin/rules',
    icon: Sliders,
  },
  {
    title: 'Citizen User Accounts',
    desc: 'View registered citizens, review persistent demographic profiles, and manage account statuses.',
    path: '/admin/users',
    icon: Users,
  },
  {
    title: 'Citizen Feedback Desk',
    desc: 'Review discrepancy reports, submit replies, and update feedback resolution statuses.',
    path: '/admin/feedback',
    icon: MessageSquare,
  },
  {
    title: 'Source Verification & Quality',
    desc: 'Audit official government source URLs, update verification stamps, and review public links.',
    path: '/admin/verification',
    icon: ShieldCheck,
  },
  {
    title: 'Audit Logs & System Events',
    desc: 'Inspect immutable records of administrative actions, system events, and registration alerts.',
    path: '/admin/audit-logs',
    icon: Activity,
  },
  {
    title: 'Citizen Portal Hub',
    desc: 'Switch to citizen view to test automated eligibility assessments and catalog features.',
    path: '/dashboard',
    icon: Layers,
  },
];

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api
      .get('/admin/dashboard')
      .then((res) => {
        if (res.data.success) {
          setData(res.data.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading || !data) {
    return <LoadingSpinner label="Loading administrative statistics..." size="lg" className="py-24" />;
  }

  const { stats, recentUsers, recentSchemes, recentFeedback, systemNotifications } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              System Live & Operational
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Administrator Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            All administrative management modules and system controls are listed below.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/admin/schemes">
            <Button variant="primary" size="sm" className="gap-1.5 shadow-sm">
              <FileText className="w-4 h-4" />
              <span>Add / Manage Schemes</span>
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="outline" size="sm" className="gap-1.5">
              <span>Citizen View</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="p-5">
          <div className="flex items-center justify-between text-gov-muted mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Schemes</span>
            <FileText className="w-4 h-4 text-gov-secondary" />
          </div>
          <div className="text-3xl font-black text-slate-900">{stats.totalSchemes}</div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
            <span className="text-emerald-700 font-semibold">{stats.activeSchemes} Active</span>
            <span>•</span>
            <span className="text-slate-400">{stats.inactiveSchemes} Inactive</span>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-gov-muted mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Departments</span>
            <Building2 className="w-4 h-4 text-gov-primary" />
          </div>
          <div className="text-3xl font-black text-slate-900">{stats.totalDepartments}</div>
          <div className="text-xs text-slate-500 mt-2">Executive ministries active</div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-gov-muted mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Verified Schemes</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-700">{stats.verifiedSchemes}</div>
          <div className="text-xs text-amber-700 font-medium mt-2">
            {stats.needsVerificationSchemes} needing review
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-gov-muted mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Registered Citizens</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">{stats.totalUsers}</div>
          <div className="text-xs text-slate-500 mt-2">Persistent profiles stored</div>
        </Card>
      </div>

      {/* ALL ADMIN MODULES LISTED */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          All Administrator Modules
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {ADMIN_MODULES.map((m, i) => {
            const Icon = m.icon;
            return (
              <Link key={i} to={m.path} className="group block">
                <div className="h-full p-4 rounded-xl border border-gov-border bg-white hover:border-gov-secondary hover:shadow-card transition-all flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 text-gov-primary flex items-center justify-center group-hover:bg-gov-primary group-hover:text-white transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-xs text-slate-900 group-hover:text-gov-secondary transition-colors">
                      {m.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                      {m.desc}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-gov-secondary">
                    <span>Manage</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Schemes Table Preview */}
        <div className="bg-white rounded-2xl border border-gov-border p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gov-border">
            <h3 className="font-bold text-sm text-gov-primary flex items-center gap-2">
              <FileText className="w-4 h-4 text-gov-secondary" />
              <span>Recent Schemes Portfolio</span>
            </h3>
            <Link to="/admin/schemes" className="text-xs font-semibold text-gov-secondary hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {recentSchemes.map((s) => (
              <div
                key={s._id}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3"
              >
                <div className="truncate">
                  <span className="font-bold text-xs text-gov-primary truncate block">{s.schemeName}</span>
                  <div className="flex items-center gap-2 text-[10px] text-gov-muted mt-0.5">
                    <span>{s.category}</span>
                    <span>•</span>
                    <Badge variant={s.verificationStatus === 'VERIFIED' ? 'success' : 'warning'} size="xs">
                      {s.verificationStatus}
                    </Badge>
                  </div>
                </div>

                <Link to={`/admin/schemes`}>
                  <Button variant="outline" size="sm" className="text-xs py-1 px-2.5">
                    Manage
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* System Events & Audit Feed */}
        <div className="bg-white rounded-2xl border border-gov-border p-6 shadow-subtle space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gov-border">
            <h3 className="font-bold text-sm text-gov-primary flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>System Notifications & Events</span>
            </h3>
            <Link to="/admin/audit-logs" className="text-xs font-semibold text-gov-secondary hover:underline">
              All Logs
            </Link>
          </div>

          <div className="space-y-3 max-h-[320px] overflow-y-auto">
            {systemNotifications.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No system notifications on record.</p>
            ) : (
              systemNotifications.map((sn) => (
                <div key={sn._id} className="p-3 rounded-xl border border-slate-100 bg-white text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400 text-[10px]">
                    <span className="font-bold text-gov-secondary">{sn.eventType}</span>
                    <span>{new Date(sn.createdAt).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="font-semibold text-slate-800">{sn.title}</div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{sn.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
