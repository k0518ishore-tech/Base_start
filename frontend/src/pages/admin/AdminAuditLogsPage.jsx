import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Clock, User, CheckCircle2 } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import api from '../../services/api';

const AdminAuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [systemNotifications, setSystemNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([api.get('/admin/audit-logs'), api.get('/admin/system-notifications')])
      .then(([logsRes, notifsRes]) => {
        if (logsRes.data.success) setLogs(logsRes.data.data);
        if (notifsRes.data.success) setSystemNotifications(notifsRes.data.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          System Events & Audit Trails
        </h1>
        <p className="text-xs text-slate-600 mt-0.5">
          Immutable audit trails of scheme updates, rule changes, and system lifecycle notifications.
        </p>
      </div>

      {isLoading ? (
        <LoadingSpinner label="Loading audit logs..." size="lg" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Admin Audit Actions */}
          <div className="bg-white rounded-2xl border border-gov-border p-6 shadow-subtle space-y-4">
            <h3 className="font-bold text-sm text-gov-primary flex items-center gap-2 pb-3 border-b border-gov-border">
              <ShieldCheck className="w-4 h-4 text-gov-secondary" />
              <span>Administrative Action Log ({logs.length})</span>
            </h3>

            {logs.length === 0 ? (
              <EmptyState title="No audit logs" description="No administrative changes recorded yet." />
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {logs.map((log) => (
                  <div
                    key={log._id}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-bold text-gov-primary bg-white px-2 py-0.5 rounded border border-slate-200">
                        {log.action}
                      </span>
                      <span>{new Date(log.createdAt).toLocaleString('en-IN')}</span>
                    </div>

                    <div className="font-medium text-slate-700">
                      Entity: <span className="font-bold">{log.entityType}</span>
                    </div>

                    {log.details && (
                      <pre className="text-[11px] bg-white p-2 rounded border border-slate-200 text-slate-600 font-mono overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* System Notifications */}
          <div className="bg-white rounded-2xl border border-gov-border p-6 shadow-subtle space-y-4">
            <h3 className="font-bold text-sm text-gov-primary flex items-center gap-2 pb-3 border-b border-gov-border">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Automated System Events ({systemNotifications.length})</span>
            </h3>

            {systemNotifications.length === 0 ? (
              <EmptyState title="No system events" description="No system events generated." />
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {systemNotifications.map((sn) => (
                  <div
                    key={sn._id}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-bold text-gov-secondary uppercase tracking-wider">
                        {sn.eventType}
                      </span>
                      <span>{new Date(sn.createdAt).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="font-bold text-slate-900">{sn.title}</div>
                    <p className="text-slate-600 text-xs leading-relaxed">{sn.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAuditLogsPage;
