import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  Layers,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Eye,
  Sliders,
  FileText,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

const AdminDepartmentsPage = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const [expandedDeptId, setExpandedDeptId] = useState(null);
  const [deptSchemesMap, setDeptSchemesMap] = useState({});
  const [loadingDeptSchemes, setLoadingDeptSchemes] = useState({});
  const [selectedSchemeForAction, setSelectedSchemeForAction] = useState(null);

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

  const handleToggleDepartment = async (dept) => {
    if (expandedDeptId === dept._id) {
      setExpandedDeptId(null);
      return;
    }
    setExpandedDeptId(dept._id);
    if (!deptSchemesMap[dept._id]) {
      setLoadingDeptSchemes((prev) => ({ ...prev, [dept._id]: true }));
      try {
        const res = await api.get(`/departments/${dept._id}/schemes?limit=50`);
        if (res.data.success) {
          setDeptSchemesMap((prev) => ({ ...prev, [dept._id]: res.data.data }));
        }
      } catch (err) {
        showToast('Failed to load department schemes', 'error');
      } finally {
        setLoadingDeptSchemes((prev) => ({ ...prev, [dept._id]: false }));
      }
    }
  };

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
                <React.Fragment key={d._id}>
                  <tr
                    className={`transition-colors ${
                      expandedDeptId === d._id ? 'bg-blue-50/50' : 'hover:bg-slate-50/70'
                    }`}
                  >
                    <td className="px-5 py-3.5 max-w-xs">
                      <button
                        type="button"
                        onClick={() => handleToggleDepartment(d)}
                        className="flex items-center gap-2.5 font-bold text-slate-900 hover:text-gov-secondary text-left transition-colors group cursor-pointer"
                        title="Click to view schemes under this department"
                      >
                        <span
                          className={`p-1 rounded-md transition-all shrink-0 ${
                            expandedDeptId === d._id
                              ? 'bg-gov-secondary text-white'
                              : 'bg-slate-100 group-hover:bg-blue-100 text-slate-500 group-hover:text-gov-secondary'
                          }`}
                        >
                          {expandedDeptId === d._id ? (
                            <ChevronDown className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                          )}
                        </span>
                        <span className="group-hover:underline">{d.departmentName}</span>
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{d.ministryName}</td>
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => handleToggleDepartment(d)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          expandedDeptId === d._id
                            ? 'bg-gov-secondary text-white shadow-xs'
                            : 'bg-blue-50 text-gov-secondary hover:bg-blue-100'
                        }`}
                        title="Click to view schemes under this department"
                      >
                        <FileText className="w-3 h-3" />
                        <span>{d.activeSchemeCount || 0} scheme(s)</span>
                      </button>
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

                  {/* Expanded Department Schemes Section */}
                  {expandedDeptId === d._id && (
                    <tr className="bg-slate-50/80 border-y border-blue-100">
                      <td colSpan={6} className="p-4 sm:p-6">
                        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-gov-secondary px-2 py-0.5 rounded-full">
                                  Linked Portfolio
                                </span>
                                <span className="text-xs text-slate-500 font-medium">{d.ministryName}</span>
                              </div>
                              <h3 className="text-base font-extrabold text-slate-900 mt-1">
                                Schemes under {d.departmentName}
                              </h3>
                            </div>
                            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                              Total: {deptSchemesMap[d._id]?.length || 0} Scheme(s)
                            </span>
                          </div>

                          {loadingDeptSchemes[d._id] ? (
                            <LoadingSpinner label="Fetching linked schemes..." size="sm" className="py-6" />
                          ) : !deptSchemesMap[d._id] || deptSchemesMap[d._id].length === 0 ? (
                            <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                              <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                              <p className="text-xs font-semibold text-slate-700">
                                No schemes registered under this department
                              </p>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                You can register a new scheme and link it to this department.
                              </p>
                              <Link
                                to="/admin/schemes"
                                className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 bg-gov-secondary text-white text-xs font-bold rounded-lg hover:bg-gov-primary transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add Scheme</span>
                              </Link>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {deptSchemesMap[d._id].map((scheme) => (
                                <div
                                  key={scheme._id}
                                  onClick={() => setSelectedSchemeForAction(scheme)}
                                  className="p-4 rounded-xl border border-slate-200 hover:border-gov-secondary hover:shadow-card bg-slate-50/40 hover:bg-white transition-all flex flex-col justify-between cursor-pointer group"
                                  title="Click for scheme options"
                                >
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-[10px] font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded-full uppercase">
                                        {scheme.category}
                                      </span>
                                      <span
                                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                          scheme.verificationStatus === 'VERIFIED'
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : 'bg-amber-100 text-amber-800'
                                        }`}
                                      >
                                        {scheme.verificationStatus}
                                      </span>
                                    </div>

                                    <h4 className="font-bold text-sm text-slate-900 group-hover:text-gov-secondary transition-colors">
                                      {scheme.schemeName}
                                    </h4>

                                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                                      {scheme.shortDescription}
                                    </p>
                                  </div>

                                  {/* Scheme Action Options */}
                                  <div className="pt-3 mt-3 border-t border-slate-200/80 flex items-center justify-between gap-2.5">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/schemes/${scheme._id}`);
                                      }}
                                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-gov-secondary text-xs font-bold transition-colors shadow-2xs"
                                      title="Open public scheme details"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                      <span>Show Scheme</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/admin/rules?schemeId=${scheme._id}`);
                                      }}
                                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-gov-secondary hover:text-white text-slate-800 text-xs font-bold transition-colors shadow-2xs"
                                      title="Open scheme in Rule Builder"
                                    >
                                      <Sliders className="w-3.5 h-3.5" />
                                      <span>Edit Rules</span>
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
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

      {/* Scheme Actions Modal */}
      {selectedSchemeForAction && (
        <Modal
          isOpen={Boolean(selectedSchemeForAction)}
          onClose={() => setSelectedSchemeForAction(null)}
          title="Scheme Action Options"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl">
              <span className="text-[10px] font-bold text-gov-secondary uppercase tracking-wider">
                {selectedSchemeForAction.category} • {selectedSchemeForAction.verificationStatus}
              </span>
              <h3 className="font-bold text-sm text-slate-900 mt-0.5">
                {selectedSchemeForAction.schemeName}
              </h3>
              <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                {selectedSchemeForAction.shortDescription}
              </p>
            </div>

            <p className="text-xs font-semibold text-slate-700">
              Select an action for this scheme:
            </p>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  navigate(`/schemes/${selectedSchemeForAction._id}`);
                  setSelectedSchemeForAction(null);
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-gov-secondary hover:bg-blue-50/40 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 text-gov-secondary flex items-center justify-center group-hover:bg-gov-secondary group-hover:text-white transition-colors">
                    <Eye className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-gov-secondary transition-colors">
                      Show Scheme
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Redirect to view scheme overview, benefits, and guidelines
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-gov-secondary group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                type="button"
                onClick={() => {
                  navigate(`/admin/rules?schemeId=${selectedSchemeForAction._id}`);
                  setSelectedSchemeForAction(null);
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-gov-secondary hover:bg-blue-50/40 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center group-hover:bg-gov-secondary group-hover:text-white transition-colors">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 group-hover:text-gov-secondary transition-colors">
                      Edit Rules for that Scheme
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Redirect into Rule Builder and open this scheme
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-gov-secondary group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminDepartmentsPage;
