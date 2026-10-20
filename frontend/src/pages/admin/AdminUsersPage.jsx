import React, { useState, useEffect } from 'react';
import { Users, Search, ShieldCheck, UserCheck, UserX, Eye } from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const { showToast } = useToast();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/users', {
        params: { search, role: roleFilter !== 'All' ? roleFilter : undefined, limit: 100 },
      });
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  const handleToggleStatus = async (user) => {
    try {
      const res = await api.patch(`/users/${user._id}/status`);
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === user._id ? { ...u, isActive: res.data.data.isActive } : u))
        );
        showToast(res.data.message, 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to toggle user status', 'error');
    }
  };

  const handleViewUser = async (userId) => {
    try {
      const res = await api.get(`/users/${userId}`);
      if (res.data.success) {
        setSelectedUserDetail(res.data.data);
      }
    } catch (err) {
      showToast('Failed to load user profile', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Citizen User Accounts</h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Manage citizen access, roles, and review submitted demographic records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-gov-border bg-white focus:outline-none focus:ring-2 focus:ring-gov-secondary"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs rounded-lg border border-gov-border p-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-gov-secondary"
          >
            <option value="All">All Roles</option>
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner label="Loading users directory..." size="lg" />
      ) : users.length === 0 ? (
        <EmptyState title="No users found" description="No accounts matched your criteria." />
      ) : (
        <div className="bg-white rounded-2xl border border-gov-border overflow-hidden shadow-subtle">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-gov-border text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="px-5 py-3.5">User</th>
                <th className="px-4 py-3.5">Contact</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-4 py-3.5">Registered On</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-slate-900">{u.fullName}</div>
                    <div className="text-[11px] text-slate-500">{u.email}</div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">{u.phone || '—'}</td>
                  <td className="px-4 py-3.5">
                    <Badge variant={u.role === 'ADMIN' ? 'secondary' : 'neutral'} size="xs">
                      {u.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500">
                    {new Date(u.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        u.isActive
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {u.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleViewUser(u._id)}
                        className="p-1.5 text-slate-400 hover:text-gov-secondary rounded-lg hover:bg-slate-100"
                        title="View Profile Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {u.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            u.isActive
                              ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                              : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={u.isActive ? 'Suspend Account' : 'Activate Account'}
                        >
                          {u.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUserDetail && (
        <Modal
          isOpen={!!selectedUserDetail}
          onClose={() => setSelectedUserDetail(null)}
          title={`Citizen Profile: ${selectedUserDetail.user.fullName}`}
          maxWidth="max-w-lg"
          footer={
            <Button variant="outline" size="sm" onClick={() => setSelectedUserDetail(null)}>
              Close
            </Button>
          }
        >
          <div className="space-y-4 text-xs text-slate-700">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Email:</span>
                <span className="font-bold text-slate-900">{selectedUserDetail.user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Phone:</span>
                <span>{selectedUserDetail.user.phone || 'Not provided'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Account Role:</span>
                <span className="font-bold">{selectedUserDetail.user.role}</span>
              </div>
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-3">
              <h4 className="font-bold text-gov-primary uppercase text-[10px] tracking-wider">
                Demographic Profile Data
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block">State:</span>
                  <span className="font-semibold">{selectedUserDetail.profile?.state || 'Not set'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">District:</span>
                  <span className="font-semibold">{selectedUserDetail.profile?.district || 'Not set'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Annual Family Income:</span>
                  <span className="font-semibold text-gov-secondary">
                    {selectedUserDetail.profile?.annualFamilyIncome !== null &&
                    selectedUserDetail.profile?.annualFamilyIncome !== undefined
                      ? `₹${Number(selectedUserDetail.profile.annualFamilyIncome).toLocaleString('en-IN')}`
                      : 'Not set'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Occupation:</span>
                  <span className="font-semibold">{selectedUserDetail.profile?.occupation || 'Not set'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Community / Category:</span>
                  <span className="font-semibold">{selectedUserDetail.profile?.community || 'Not set'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Disability Status:</span>
                  <span className="font-semibold">
                    {selectedUserDetail.profile?.disabilityStatus ? 'Yes (PwD)' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminUsersPage;
