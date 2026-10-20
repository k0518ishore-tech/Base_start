import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Building2,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

const CATEGORIES = [
  'Agriculture',
  'Healthcare',
  'Housing',
  'Finance & Loans',
  'Education',
  'Social Welfare',
  'Skill & Livelihood',
];

const AdminSchemesPage = () => {
  const [schemes, setSchemes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  // Create/Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchemeId, setEditingSchemeId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    schemeName: '',
    departmentId: '',
    category: 'Agriculture',
    schemeLevel: 'Central',
    shortDescription: '',
    fullDescription: '',
    ministry: '',
    eligibilitySummary: '',
    benefitTitle: '',
    benefitAmount: '',
    benefitDescription: '',
    officialWebsite: '',
    officialApplicationUrl: '',
    verificationStatus: 'VERIFIED',
    isActive: true,
  });

  // Delete Confirmation State
  const [schemeToDelete, setSchemeToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSchemes = async () => {
    setIsLoading(true);
    try {
      const [schemesRes, deptsRes] = await Promise.all([
        api.get('/schemes', { params: { search, includeInactive: 'true', limit: 100 } }),
        api.get('/departments?includeInactive=true'),
      ]);

      if (schemesRes.data.success) setSchemes(schemesRes.data.data);
      if (deptsRes.data.success) {
        setDepartments(deptsRes.data.data);
        if (!formData.departmentId && deptsRes.data.data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            departmentId: deptsRes.data.data[0]._id,
            ministry: deptsRes.data.data[0].ministryName,
          }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, [search]);

  const handleOpenCreateModal = () => {
    setEditingSchemeId(null);
    setFormData({
      schemeName: '',
      departmentId: departments[0]?._id || '',
      category: 'Agriculture',
      schemeLevel: 'Central',
      shortDescription: '',
      fullDescription: '',
      ministry: departments[0]?.ministryName || '',
      eligibilitySummary: '',
      benefitTitle: '',
      benefitAmount: '',
      benefitDescription: '',
      officialWebsite: '',
      officialApplicationUrl: '',
      verificationStatus: 'VERIFIED',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (scheme) => {
    setEditingSchemeId(scheme._id);
    const pBenefit = scheme.benefits?.[0] || {};
    setFormData({
      schemeName: scheme.schemeName,
      departmentId: scheme.departmentId?._id || scheme.departmentId || '',
      category: scheme.category,
      schemeLevel: scheme.schemeLevel,
      shortDescription: scheme.shortDescription,
      fullDescription: scheme.fullDescription,
      ministry: scheme.ministry,
      eligibilitySummary: scheme.eligibilitySummary || '',
      benefitTitle: pBenefit.title || '',
      benefitAmount: pBenefit.amount || '',
      benefitDescription: pBenefit.description || '',
      officialWebsite: scheme.officialWebsite || '',
      officialApplicationUrl: scheme.officialApplicationUrl || '',
      verificationStatus: scheme.verificationStatus || 'VERIFIED',
      isActive: Boolean(scheme.isActive),
    });
    setIsModalOpen(true);
  };

  const handleSaveScheme = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const selectedDept = departments.find((d) => d._id === formData.departmentId);
      const ministryName = formData.ministry || selectedDept?.ministryName || 'Government of India';

      const payload = {
        schemeName: formData.schemeName,
        departmentId: formData.departmentId,
        category: formData.category,
        schemeLevel: formData.schemeLevel,
        shortDescription: formData.shortDescription,
        fullDescription: formData.fullDescription,
        ministry: ministryName,
        eligibilitySummary: formData.eligibilitySummary,
        benefits: formData.benefitTitle
          ? [
              {
                title: formData.benefitTitle,
                amount: formData.benefitAmount,
                description: formData.benefitDescription,
              },
            ]
          : [],
        officialWebsite: formData.officialWebsite,
        officialApplicationUrl: formData.officialApplicationUrl,
        verificationStatus: formData.verificationStatus,
        isActive: formData.isActive,
      };

      if (editingSchemeId) {
        await api.put(`/schemes/${editingSchemeId}`, payload);
        showToast('Scheme updated successfully', 'success');
      } else {
        await api.post('/schemes', payload);
        showToast('New scheme published successfully', 'success');
      }

      setIsModalOpen(false);
      fetchSchemes();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save scheme', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (scheme) => {
    try {
      const res = await api.put(`/schemes/${scheme._id}`, {
        isActive: !scheme.isActive,
      });
      if (res.data.success) {
        setSchemes((prev) =>
          prev.map((s) => (s._id === scheme._id ? { ...s, isActive: !scheme.isActive } : s))
        );
        showToast(`Scheme ${!scheme.isActive ? 'activated' : 'deactivated'}`, 'success');
      }
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleDeleteScheme = async () => {
    if (!schemeToDelete) return;
    setIsDeleting(true);
    try {
      const res = await api.delete(`/schemes/${schemeToDelete._id}`);
      if (res.data.success) {
        setSchemes((prev) => prev.filter((s) => s._id !== schemeToDelete._id));
        showToast('Scheme deleted successfully', 'success');
        setSchemeToDelete(null);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete scheme', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Scheme Management</h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Create, update, verify, and activate government schemes across ministries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search schemes..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-gov-border bg-white focus:outline-none focus:ring-2 focus:ring-gov-secondary"
            />
          </div>

          <Button variant="primary" size="sm" onClick={handleOpenCreateModal} className="gap-1.5">
            <Plus className="w-4 h-4" />
            <span>Add Scheme</span>
          </Button>
        </div>
      </div>

      {/* Schemes DataTable */}
      {isLoading ? (
        <LoadingSpinner label="Loading schemes database..." size="lg" />
      ) : schemes.length === 0 ? (
        <EmptyState
          title="No schemes found"
          description="Click Add Scheme above to publish your first government welfare program."
          actionLabel="Add Scheme"
          onAction={handleOpenCreateModal}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-gov-border overflow-hidden shadow-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-gov-border text-slate-500 uppercase tracking-wider text-[11px] font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Scheme Details</th>
                  <th className="px-4 py-3.5">Department</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Verification</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schemes.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 max-w-xs">
                      <div className="font-bold text-slate-900 text-xs">{s.schemeName}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {s.shortDescription}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 truncate max-w-[180px]">
                      {s.departmentId?.departmentName || s.ministry}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant="neutral" size="xs">
                        {s.category}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge
                        variant={s.verificationStatus === 'VERIFIED' ? 'success' : 'warning'}
                        size="xs"
                      >
                        {s.verificationStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => handleToggleActive(s)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          s.isActive
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {s.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEditModal(s)}
                          className="p-1.5 text-slate-400 hover:text-gov-secondary rounded-lg hover:bg-slate-100"
                          title="Edit Scheme"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSchemeToDelete(s)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                          title="Delete Scheme"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSchemeId ? 'Edit Government Scheme' : 'Add New Government Scheme'}
        maxWidth="max-w-2xl"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveScheme} isLoading={isSaving}>
              {editingSchemeId ? 'Update Scheme' : 'Publish Scheme'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveScheme} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Scheme Official Title <span className="text-gov-error">*</span>
            </label>
            <input
              type="text"
              value={formData.schemeName}
              onChange={(e) => setFormData({ ...formData, schemeName: e.target.value })}
              placeholder="e.g. Pradhan Mantri Kisan Samman Nidhi"
              className="w-full text-xs rounded-lg border border-gov-border p-2.5 focus:outline-none focus:ring-2 focus:ring-gov-secondary"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Administering Department <span className="text-gov-error">*</span>
              </label>
              <select
                value={formData.departmentId}
                onChange={(e) => {
                  const d = departments.find((dept) => dept._id === e.target.value);
                  setFormData({
                    ...formData,
                    departmentId: e.target.value,
                    ministry: d?.ministryName || formData.ministry,
                  });
                }}
                className="w-full text-xs rounded-lg border border-gov-border p-2 bg-white focus:outline-none focus:ring-2 focus:ring-gov-secondary"
                required
              >
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.departmentName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full text-xs rounded-lg border border-gov-border p-2 bg-white focus:outline-none focus:ring-2 focus:ring-gov-secondary"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Short Description (Brief summary on cards) <span className="text-gov-error">*</span>
            </label>
            <textarea
              rows={2}
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              className="w-full text-xs rounded-lg border border-gov-border p-2 focus:outline-none focus:ring-2 focus:ring-gov-secondary"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Full Detailed Description <span className="text-gov-error">*</span>
            </label>
            <textarea
              rows={4}
              value={formData.fullDescription}
              onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
              className="w-full text-xs rounded-lg border border-gov-border p-2 focus:outline-none focus:ring-2 focus:ring-gov-secondary"
              required
            />
          </div>

          {/* Primary Benefit Section */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">
              Primary Benefit Callout
            </span>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Benefit Title (e.g. Annual Income Support)"
                value={formData.benefitTitle}
                onChange={(e) => setFormData({ ...formData, benefitTitle: e.target.value })}
                className="w-full text-xs rounded-lg border border-gov-border p-2 bg-white"
              />
              <input
                type="text"
                placeholder="Amount / Scope (e.g. ₹6,000 / year)"
                value={formData.benefitAmount}
                onChange={(e) => setFormData({ ...formData, benefitAmount: e.target.value })}
                className="w-full text-xs rounded-lg border border-gov-border p-2 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Official Website
              </label>
              <input
                type="url"
                value={formData.officialWebsite}
                onChange={(e) => setFormData({ ...formData, officialWebsite: e.target.value })}
                placeholder="https://..."
                className="w-full text-xs rounded-lg border border-gov-border p-2 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Official Application Portal URL
              </label>
              <input
                type="url"
                value={formData.officialApplicationUrl}
                onChange={(e) => setFormData({ ...formData, officialApplicationUrl: e.target.value })}
                placeholder="https://..."
                className="w-full text-xs rounded-lg border border-gov-border p-2 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Verification Status
              </label>
              <select
                value={formData.verificationStatus}
                onChange={(e) => setFormData({ ...formData, verificationStatus: e.target.value })}
                className="w-full text-xs rounded-lg border border-gov-border p-2 bg-white"
              >
                <option value="VERIFIED">VERIFIED</option>
                <option value="PARTIALLY_VERIFIED">PARTIALLY VERIFIED</option>
                <option value="NEEDS_VERIFICATION">NEEDS VERIFICATION</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="activeSchemeCheck"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded text-gov-secondary"
              />
              <label htmlFor="activeSchemeCheck" className="text-xs font-bold text-slate-700">
                Scheme Active & Discoverable
              </label>
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      {schemeToDelete && (
        <Modal
          isOpen={!!schemeToDelete}
          onClose={() => setSchemeToDelete(null)}
          title="Confirm Delete Scheme"
          maxWidth="max-w-md"
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setSchemeToDelete(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteScheme}
                isLoading={isDeleting}
              >
                Confirm Delete
              </Button>
            </>
          }
        >
          <div className="space-y-3 text-xs text-slate-600">
            <p>
              Are you sure you want to permanently delete{' '}
              <strong className="text-slate-900">{schemeToDelete.schemeName}</strong>?
            </p>
            <p className="text-rose-600 font-medium">
              This action will permanently delete all associated eligibility rules and saved user bookmarks.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminSchemesPage;
