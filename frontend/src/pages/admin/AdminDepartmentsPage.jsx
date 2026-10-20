import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Layers,
  AlertTriangle,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

const AdminDepartmentsPage = () => {
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeptId, setEditingDeptId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    departmentName: '',
    ministryName: '',
    description: '',
    officialWebsite: '',
    contactEmail: '',
    contactPhone: '',
    isActive: true,
  });

  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/departments?includeInactive=true');
      if (res.data.success) {
        setDepartments(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingDeptId(null);
    setFormData({
      departmentName: '',
      ministryName: '',
      description: '',
      officialWebsite: '',
      contactEmail: '',
      contactPhone: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (dept) => {
    setEditingDeptId(dept._id);
    setFormData({
      departmentName: dept.departmentName,
      ministryName: dept.ministryName,
      description: dept.description || '',
      officialWebsite: dept.officialWebsite || '',
      contactEmail: dept.contactInformation?.email || '',
      contactPhone: dept.contactInformation?.phone || '',
      isActive: Boolean(dept.isActive),
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.departmentName || !formData.ministryName) {
      showToast('Please provide both department name and ministry name', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        departmentName: formData.departmentName,
        ministryName: formData.ministryName,
        description: formData.description,
        officialWebsite: formData.officialWebsite,
        contactInformation: {
          email: formData.contactEmail,
          phone: formData.contactPhone,
        },
        isActive: formData.isActive,
      };

      if (editingDeptId) {
        await api.put(`/departments/${editingDeptId}`, payload);
        showToast('Department updated successfully', 'success');
      } else {
        await api.post('/departments', payload);
        showToast('New department created successfully', 'success');
      }

      setIsModalOpen(false);
      fetchDepartments();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save department', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (dept) => {
    try {
      const res = await api.put(`/departments/${dept._id}`, {
        isActive: !dept.isActive,
      });
      if (res.data.success) {
        setDepartments((prev) =>
          prev.map((d) => (d._id === dept._id ? { ...d, isActive: !dept.isActive } : d))
        );
        showToast(`Department ${!dept.isActive ? 'activated' : 'deactivated'}`, 'success');
      }
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const filteredDepts = departments.filter((d) => {
    const q = search.toLowerCase();
    return (
      d.departmentName.toLowerCase().includes(q) ||
      d.ministryName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Department Management</h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Configure ministry structures and view linked schemes to avoid orphaned records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search departments..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-gov-border bg-white focus:outline-none focus:ring-2 focus:ring-gov-secondary"
            />
          </div>

          <Button variant="primary" size="sm" onClick={handleOpenCreateModal} className="gap-1.5">
            <Plus className="w-4 h-4" />
            <span>Add Department</span>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner label="Loading departments..." size="lg" />
      ) : filteredDepts.length === 0 ? (
        <EmptyState
          title="No departments found"
          description="Create a department to group schemes under respective ministries."
          actionLabel="Add Department"
          onAction={handleOpenCreateModal}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-gov-border overflow-hidden shadow-subtle">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-gov-border text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="px-5 py-3.5">Department Name</th>
                <th className="px-4 py-3.5">Ministry</th>
                <th className="px-4 py-3.5">Schemes</th>
                <th className="px-4 py-3.5">Official Website</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDepts.map((d) => (
                <tr key={d._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-900 max-w-xs">{d.departmentName}</td>
                  <td className="px-4 py-3.5 text-slate-600">{d.ministryName}</td>
                  <td className="px-4 py-3.5 font-semibold text-gov-secondary">
                    {d.activeSchemeCount || 0} scheme(s)
                  </td>
                  <td className="px-4 py-3.5">
                    {d.officialWebsite ? (
                      <a
                        href={d.officialWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gov-secondary hover:underline truncate max-w-xs inline-block"
                      >
                        {d.officialWebsite.replace(/^https?:\/\//, '')}
                      </a>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => handleToggleActive(d)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        d.isActive
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {d.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => handleOpenEditModal(d)}
                      className="p-1.5 text-slate-400 hover:text-gov-secondary rounded-lg hover:bg-slate-100"
                      title="Edit Department"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDeptId ? 'Edit Department' : 'Create Department'}
        maxWidth="max-w-lg"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave} isLoading={isSaving}>
              {editingDeptId ? 'Update Department' : 'Create Department'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <Input
            label="Department Name"
            value={formData.departmentName}
            onChange={(e) => setFormData({ ...formData, departmentName: e.target.value })}
            placeholder="e.g. Department of Agriculture & Farmers Welfare"
            required
          />

          <Input
            label="Parent Ministry Name"
            value={formData.ministryName}
            onChange={(e) => setFormData({ ...formData, ministryName: e.target.value })}
            placeholder="e.g. Ministry of Agriculture and Farmers Welfare"
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full text-xs rounded-lg border border-gov-border p-2"
              placeholder="Mandate and public policy scope..."
            />
          </div>

          <Input
            label="Official Website URL"
            type="url"
            value={formData.officialWebsite}
            onChange={(e) => setFormData({ ...formData, officialWebsite: e.target.value })}
            placeholder="https://..."
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Contact Email"
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
            />
            <Input
              label="Contact Phone"
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="deptActiveCheck"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded text-gov-secondary"
            />
            <label htmlFor="deptActiveCheck" className="text-xs font-bold text-slate-700">
              Department Active
            </label>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDepartmentsPage;
