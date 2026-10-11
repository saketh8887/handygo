import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { 
  Wrench, Plus, Edit2, CheckCircle2, AlertCircle, Clock, 
  DollarSign, Sparkles, Check, Trash2, ShieldCheck, X,
  Layers, Users, Power, AlertTriangle, Eye
} from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

export default function AdminServices() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('SERVICES'); // 'SERVICES' or 'CATEGORIES'
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Service Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    description: '',
    basePrice: '75.00',
    estimatedDurationMinutes: 90,
    isActive: true,
  });
  const [serviceSkills, setServiceSkills] = useState([]);

  // Category Modal State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    code: '',
    description: '',
    iconName: 'Wrench',
    displayOrder: 1,
    isActive: true,
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [svcRes, catRes, skillsRes] = await Promise.allSettled([
        api.get('/services'),
        api.get('/admin/categories'),
        api.get('/skills'),
      ]);

      if (svcRes.status === 'fulfilled') {
        setServices(svcRes.value.data.data || []);
      }
      if (catRes.status === 'fulfilled') {
        const cats = catRes.value.data.data || [];
        setCategories(cats);
        if (cats.length > 0 && !formData.categoryId) {
          setFormData((prev) => ({ ...prev, categoryId: cats[0].id.toString() }));
        }
      }
      if (skillsRes.status === 'fulfilled') {
        setAllSkills(skillsRes.value.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load catalog data:', err);
      setError('Could not load service catalog.');
      showToast('Could not load service catalog.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- Service Actions ---
  const handleOpenCreateService = () => {
    setEditingService(null);
    setFormData({
      name: '',
      categoryId: categories[0]?.id?.toString() || '',
      description: '',
      basePrice: '75.00',
      estimatedDurationMinutes: 90,
      isActive: true,
    });
    setServiceSkills([]);
    setShowModal(true);
  };

  const handleOpenEditService = async (svc) => {
    setEditingService(svc);
    setFormData({
      name: svc.name,
      categoryId: svc.categoryId?.toString() || categories[0]?.id?.toString(),
      description: svc.description,
      basePrice: svc.basePrice?.toString() || svc.indicativeBasePrice?.toString() || '75.00',
      estimatedDurationMinutes: svc.estimatedDurationMinutes || 60,
      isActive: svc.isActive !== false,
    });

    try {
      const skillsRes = await api.get(`/services/${svc.id}/required-skills`);
      setServiceSkills(skillsRes.data.data || []);
    } catch (err) {
      setServiceSkills(svc.requiredSkillsList || []);
    }

    setShowModal(true);
  };

  const handleToggleSkill = (skill) => {
    const exists = serviceSkills.find(s => s.skillId === skill.id);
    if (exists) {
      setServiceSkills(serviceSkills.filter(s => s.skillId !== skill.id));
    } else {
      setServiceSkills([
        ...serviceSkills,
        {
          skillId: skill.id,
          skillName: skill.name,
          isMandatory: true,
          minProficiencyLevel: 'INTERMEDIATE',
        }
      ]);
    }
  };

  const handleUpdateSkillConfig = (skillId, field, value) => {
    setServiceSkills(serviceSkills.map(s => {
      if (s.skillId === skillId) {
        return { ...s, [field]: value };
      }
      return s;
    }));
  };

  const handleSubmitService = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const payload = {
        name: formData.name,
        categoryId: parseInt(formData.categoryId, 10),
        description: formData.description,
        basePrice: parseFloat(formData.basePrice),
        estimatedDurationMinutes: parseInt(formData.estimatedDurationMinutes, 10),
        isActive: formData.isActive,
      };

      let savedId;
      if (editingService) {
        await api.put(`/admin/services/${editingService.id}`, payload);
        savedId = editingService.id;
        setSuccess('Service updated successfully.');
      } else {
        const createRes = await api.post('/admin/services', payload);
        savedId = createRes.data.data.id;
        setSuccess('Service created successfully.');
      }

      if (savedId) {
        const skillsPayload = serviceSkills.map(s => ({
          skillId: s.skillId,
          isMandatory: s.isMandatory !== false,
          minProficiencyLevel: s.minProficiencyLevel || 'INTERMEDIATE',
        }));
        await api.put(`/admin/services/${savedId}/required-skills`, skillsPayload);
      }

      showToast('Service offering and required skills saved!', 'success');
      setShowModal(false);
      fetchInitialData();
    } catch (err) {
      console.error('Submit service error:', err);
      const msg = err.response?.data?.message || 'Failed to save service.';
      setError(msg);
      showToast(msg, 'error');
    }
  };

  // --- Category Actions ---
  const handleOpenCreateCategory = () => {
    setEditingCategory(null);
    setCategoryFormData({
      name: '',
      code: '',
      description: '',
      iconName: 'Wrench',
      displayOrder: categories.length + 1,
      isActive: true,
    });
    setShowCategoryModal(true);
  };

  const handleOpenEditCategory = (cat) => {
    setEditingCategory(cat);
    setCategoryFormData({
      name: cat.name,
      code: cat.code || '',
      description: cat.description || '',
      iconName: cat.iconName || 'Wrench',
      displayOrder: cat.displayOrder || 1,
      isActive: cat.isActive !== false,
    });
    setShowCategoryModal(true);
  };

  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    try {
      setError('');
      if (editingCategory) {
        await api.put(`/admin/categories/${editingCategory.id}`, categoryFormData);
        showToast(`Category "${categoryFormData.name}" updated successfully.`, 'success');
      } else {
        await api.post('/admin/categories', categoryFormData);
        showToast(`New category "${categoryFormData.name}" created!`, 'success');
      }
      setShowCategoryModal(false);
      fetchInitialData();
    } catch (err) {
      console.error('Category save error:', err);
      const msg = err.response?.data?.message || 'Failed to save category.';
      setError(msg);
      showToast(msg, 'error');
    }
  };

  const handleToggleCategoryStatus = async (cat) => {
    try {
      setError('');
      const newStatus = !cat.isActive;
      await api.patch(`/admin/categories/${cat.id}/status`, { isActive: newStatus });
      showToast(`Category "${cat.name}" is now ${newStatus ? 'Active' : 'Inactive'}.`, 'success');
      fetchInitialData();
    } catch (err) {
      console.error('Category status toggle error:', err);
      const msg = err.response?.data?.message || 'Failed to update category status.';
      setError(msg);
      showToast(msg, 'error');
    }
  };

  const handleDeleteCategory = async (cat) => {
    if (!window.confirm(`Are you sure you want to delete category "${cat.name}"? Note that categories with linked services or bookings cannot be deleted and must be deactivated.`)) {
      return;
    }
    try {
      setError('');
      await api.delete(`/admin/categories/${cat.id}`);
      showToast(`Category "${cat.name}" removed successfully.`, 'success');
      fetchInitialData();
    } catch (err) {
      console.error('Category deletion error:', err);
      const msg = err.response?.data?.message || 'Cannot delete category because it is referenced by existing services or booking history. Please deactivate it instead.';
      setError(msg);
      showToast(msg, 'error');
    }
  };

  return (
    <div className="container py-4">
      <Breadcrumb
        items={[
          { label: 'Admin Command', path: '/admin' },
          { label: 'Service Offerings & Categories' }
        ]}
      />

      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-primary bg-opacity-10 text-primary px-2.5 py-1 rounded-pill fw-semibold" style={{ fontSize: '0.75rem' }}>
              SERVICE CATALOG &amp; SPECIALIZATION ARCHITECTURE
            </span>
          </div>
          <h2 className="fw-bold text-dark mb-0" style={{ letterSpacing: '-0.02em' }}>
            Service Offerings &amp; Specializations
          </h2>
          <p className="text-secondary small mb-0 mt-0.5">
            Manage specialized trade categories, standardized repair services, and trade skill verification criteria
          </p>
        </div>

        <div className="d-flex gap-2">
          {activeTab === 'SERVICES' ? (
            <button className="btn btn-primary btn-sm px-3 py-2 rounded-3 d-inline-flex align-items-center gap-2 fw-medium shadow-sm" onClick={handleOpenCreateService}>
              <Plus size={16} /> Add New Service
            </button>
          ) : (
            <button className="btn btn-primary btn-sm px-3 py-2 rounded-3 d-inline-flex align-items-center gap-2 fw-medium shadow-sm" onClick={handleOpenCreateCategory}>
              <Plus size={16} /> Add Trade Category
            </button>
          )}
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="d-flex gap-2 mb-4 border-bottom pb-2">
        <button
          className={`btn btn-sm px-3 py-2 rounded-pill fw-medium d-inline-flex align-items-center gap-2 transition-all ${
            activeTab === 'SERVICES' 
              ? 'btn-primary text-white shadow-sm' 
              : 'btn-light text-secondary border'
          }`}
          onClick={() => setActiveTab('SERVICES')}
        >
          <Wrench size={15} />
          <span>Service Catalog ({services.length})</span>
        </button>

        <button
          className={`btn btn-sm px-3 py-2 rounded-pill fw-medium d-inline-flex align-items-center gap-2 transition-all ${
            activeTab === 'CATEGORIES' 
              ? 'btn-primary text-white shadow-sm' 
              : 'btn-light text-secondary border'
          }`}
          onClick={() => setActiveTab('CATEGORIES')}
        >
          <Layers size={15} />
          <span>Specialized Categories ({categories.length})</span>
        </button>
      </div>

      {success && (
        <div className="alert alert-success d-flex align-items-center gap-2 mb-4 small rounded-3" role="alert">
          <CheckCircle2 size={16} />
          <div>{success}</div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4 small rounded-3" role="alert">
          <AlertCircle size={16} />
          <div>{error}</div>
        </div>
      )}

      {loading ? (
        <div className="hc-card p-4">
          <Skeleton height="40px" className="mb-3" />
          <Skeleton height="55px" className="mb-2" />
          <Skeleton height="55px" className="mb-2" />
          <Skeleton height="55px" />
        </div>
      ) : activeTab === 'SERVICES' ? (
        /* TAB 1: SERVICES */
        services.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title="No services found"
            description="Create your first catalog service offering to allow customer bookings."
            actionLabel="Add Service"
            onAction={handleOpenCreateService}
          />
        ) : (
          <div className="hc-card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-secondary small">
                  <tr>
                    <th className="ps-4">Service Offering</th>
                    <th>Category</th>
                    <th>Mandatory Trade Skills</th>
                    <th>Base Labor Price</th>
                    <th>Est. Duration</th>
                    <th>Status</th>
                    <th className="text-end pe-4">Action</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {services.map((svc) => (
                    <tr key={svc.id}>
                      <td className="ps-4">
                        <div className="fw-bold text-dark">{svc.name}</div>
                        <div className="text-secondary text-truncate" style={{ maxWidth: 260, fontSize: '0.74rem' }}>
                          {svc.description}
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light text-primary border">
                          {svc.categoryName}
                        </span>
                      </td>
                      <td>
                        {svc.requiredSkillsList && svc.requiredSkillsList.length > 0 ? (
                          <div className="d-flex flex-wrap gap-1" style={{ maxWidth: 260 }}>
                            {svc.requiredSkillsList.map((rs, idx) => (
                              <span 
                                key={idx} 
                                className={`badge border ${rs.isMandatory ? 'bg-danger bg-opacity-10 text-danger border-danger border-opacity-25' : 'bg-light text-secondary'}`}
                                style={{ fontSize: '0.68rem' }}
                              >
                                {rs.skillName} ({rs.minProficiencyLevel})
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted" style={{ fontSize: '0.75rem' }}>General Skills</span>
                        )}
                      </td>
                      <td className="fw-bold text-dark">
                        ${parseFloat(svc.basePrice || svc.indicativeBasePrice || 0).toFixed(2)}
                      </td>
                      <td className="text-secondary">
                        <span className="d-inline-flex align-items-center gap-1">
                          <Clock size={13} className="text-primary" /> {svc.estimatedDurationMinutes} mins
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${svc.isActive !== false ? 'bg-success bg-opacity-10 text-success border border-success border-opacity-25' : 'bg-secondary bg-opacity-10 text-secondary border'}`}>
                          {svc.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="text-end pe-4">
                        <button 
                          className="btn btn-outline-secondary btn-sm px-2.5 py-1 rounded-2"
                          onClick={() => handleOpenEditService(svc)}
                        >
                          <Edit2 size={13} className="me-1" /> Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        /* TAB 2: SPECIALIZED CATEGORIES */
        <div className="hc-card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-secondary small">
                <tr>
                  <th className="ps-4">Specialized Category</th>
                  <th>Code</th>
                  <th>Description &amp; Example Services</th>
                  <th>Qualified Specialists</th>
                  <th>Active Services</th>
                  <th>Bookings Count</th>
                  <th>Status</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody className="small">
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center gap-2.5">
                        <div className="p-2 rounded-3 bg-light text-primary border flex-shrink-0">
                          <Wrench size={18} />
                        </div>
                        <div>
                          <div className="fw-bold text-dark">{cat.name}</div>
                          <span className="text-muted" style={{ fontSize: '0.7rem' }}>Order: #{cat.displayOrder || 1}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-light text-secondary border font-monospace">
                        {cat.code}
                      </span>
                    </td>
                    <td>
                      <div className="text-secondary small text-truncate mb-1" style={{ maxWidth: 280, fontSize: '0.75rem' }}>
                        {cat.description}
                      </div>
                      {cat.exampleServices && cat.exampleServices.length > 0 && (
                        <div className="d-flex flex-wrap gap-1">
                          {cat.exampleServices.slice(0, 2).map((ex, i) => (
                            <span key={i} className="badge bg-white text-muted border" style={{ fontSize: '0.65rem' }}>
                              {ex}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25">
                        <Users size={12} className="me-1" />
                        {cat.qualifiedHandymenCount || 0} Technicians
                      </span>
                    </td>
                    <td>
                      <span className="fw-medium text-dark">{cat.servicesCount || 0} Services</span>
                    </td>
                    <td>
                      <div className="text-secondary" style={{ fontSize: '0.74rem' }}>
                        <div>Pending: <strong>{cat.pendingBookingsCount || 0}</strong></div>
                        <div>Completed: <strong>{cat.completedBookingsCount || 0}</strong></div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${cat.isActive ? 'bg-success bg-opacity-10 text-success border border-success border-opacity-25' : 'bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25'}`}>
                        {cat.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="text-end pe-4">
                      <div className="d-inline-flex gap-1.5">
                        <button 
                          className="btn btn-outline-secondary btn-sm px-2 py-1 rounded-2"
                          title="Edit Category"
                          onClick={() => handleOpenEditCategory(cat)}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button 
                          className={`btn btn-sm px-2 py-1 rounded-2 ${cat.isActive ? 'btn-outline-warning' : 'btn-outline-success'}`}
                          title={cat.isActive ? 'Deactivate Category' : 'Activate Category'}
                          onClick={() => handleToggleCategoryStatus(cat)}
                        >
                          <Power size={13} />
                        </button>
                        <button 
                          className="btn btn-outline-danger btn-sm px-2 py-1 rounded-2"
                          title="Delete Category (Guarded)"
                          onClick={() => handleDeleteCategory(cat)}
                        >
                          <Trash2 size={13} />
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

      {/* Service Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow rounded-4">
              <form onSubmit={handleSubmitService}>
                <div className="modal-header border-bottom px-4 py-3">
                  <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                    <Wrench className="text-primary" size={20} />
                    {editingService ? 'Edit Service Offering' : 'Create New Service Offering'}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>

                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-7">
                      <label className="form-label small fw-semibold text-dark">Service Name *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. AC Refrigerant Leak Diagnostic"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-5">
                      <label className="form-label small fw-semibold text-dark">Trade Category *</label>
                      <select
                        className="form-select form-select-sm"
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        required
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold text-dark">Service Description</label>
                      <textarea
                        className="form-control form-control-sm"
                        rows="2"
                        placeholder="Detailed scope of diagnostic inspection, standard repair, and safety checks..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      ></textarea>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-dark">Base Labor Rate ($) *</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control form-control-sm"
                        value={formData.basePrice}
                        onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-dark">Est. Duration (mins) *</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={formData.estimatedDurationMinutes}
                        onChange={(e) => setFormData({ ...formData, estimatedDurationMinutes: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-4 d-flex align-items-center mt-4">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="svcActiveSwitch"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        />
                        <label className="form-check-label small fw-semibold text-dark" htmlFor="svcActiveSwitch">
                          Active Offering
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Required Trade Skills Section */}
                  <div className="mt-4 pt-3 border-top">
                    <h6 className="fw-bold text-dark mb-1 small d-flex align-items-center gap-1.5">
                      <ShieldCheck size={16} className="text-primary" /> Mandatory Technician Skill Gates
                    </h6>
                    <p className="text-secondary small mb-3" style={{ fontSize: '0.78rem' }}>
                      Select the verified trade skills required for technicians to be eligible to accept or be auto-dispatched to this job.
                    </p>

                    <div className="d-flex flex-wrap gap-1.5 mb-3">
                      {allSkills.map((sk) => {
                        const isSelected = serviceSkills.some(s => s.skillId === sk.id);
                        return (
                          <button
                            key={sk.id}
                            type="button"
                            className={`btn btn-sm px-2.5 py-1 rounded-pill transition-all ${
                              isSelected 
                                ? 'btn-primary text-white shadow-sm' 
                                : 'btn-light text-secondary border'
                            }`}
                            style={{ fontSize: '0.74rem' }}
                            onClick={() => handleToggleSkill(sk)}
                          >
                            {isSelected && <Check size={12} className="me-1" />}
                            {sk.name}
                          </button>
                        );
                      })}
                    </div>

                    {serviceSkills.length > 0 && (
                      <div className="p-3 bg-light rounded-3 border">
                        <div className="fw-semibold text-dark small mb-2">Configure Minimum Gate Proficiency:</div>
                        <div className="d-flex flex-column gap-2">
                          {serviceSkills.map((sk) => (
                            <div key={sk.skillId} className="p-2.5 bg-white rounded-2 border d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
                              <div className="fw-bold text-dark small">{sk.skillName}</div>
                              <div className="d-flex align-items-center gap-3">
                                <div className="form-check mb-0">
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id={`mandatory-${sk.skillId}`}
                                    checked={sk.isMandatory !== false}
                                    onChange={(e) => handleUpdateSkillConfig(sk.skillId, 'isMandatory', e.target.checked)}
                                  />
                                  <label className="form-check-label small" htmlFor={`mandatory-${sk.skillId}`}>
                                    Mandatory Gate
                                  </label>
                                </div>

                                <div className="d-flex align-items-center gap-1.5">
                                  <span className="text-secondary small">Min Level:</span>
                                  <select
                                    className="form-select form-select-sm py-0.5"
                                    style={{ fontSize: '0.74rem' }}
                                    value={sk.minProficiencyLevel || 'INTERMEDIATE'}
                                    onChange={(e) => handleUpdateSkillConfig(sk.skillId, 'minProficiencyLevel', e.target.value)}
                                  >
                                    <option value="BEGINNER">Beginner</option>
                                    <option value="INTERMEDIATE">Intermediate</option>
                                    <option value="ADVANCED">Advanced</option>
                                    <option value="EXPERT">Expert</option>
                                  </select>
                                </div>

                                <button
                                  type="button"
                                  className="btn btn-link text-danger p-0"
                                  onClick={() => setServiceSkills(serviceSkills.filter(s => s.skillId !== sk.skillId))}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="modal-footer border-top px-4 py-3 bg-light rounded-bottom-4">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary px-4 py-2 fw-medium shadow-sm btn-sm">
                    {editingService ? 'Save Service & Skills' : 'Create Service'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow rounded-4">
              <form onSubmit={handleSubmitCategory}>
                <div className="modal-header border-bottom px-4 py-3">
                  <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                    <Layers className="text-primary" size={20} />
                    {editingCategory ? 'Edit Specialized Category' : 'Create Specialized Category'}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setShowCategoryModal(false)}></button>
                </div>

                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-dark">Category Name *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. Smart Automation & Security"
                        value={categoryFormData.name}
                        onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-dark">Category Code</label>
                      <input
                        type="text"
                        className="form-control form-control-sm text-uppercase"
                        placeholder="e.g. SMART_AUTO"
                        value={categoryFormData.code}
                        onChange={(e) => setCategoryFormData({ ...categoryFormData, code: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-dark">Display Order</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={categoryFormData.displayOrder}
                        onChange={(e) => setCategoryFormData({ ...categoryFormData, displayOrder: parseInt(e.target.value, 10) || 1 })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold text-dark">Description</label>
                      <textarea
                        className="form-control form-control-sm"
                        rows="3"
                        placeholder="Explain the trade focus and scope of technicians qualified in this category..."
                        value={categoryFormData.description}
                        onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                      ></textarea>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-dark">Icon Identifier</label>
                      <select
                        className="form-select form-select-sm"
                        value={categoryFormData.iconName}
                        onChange={(e) => setCategoryFormData({ ...categoryFormData, iconName: e.target.value })}
                      >
                        <option value="Wrench">Wrench (Plumbing / General)</option>
                        <option value="Zap">Zap (Electrical)</option>
                        <option value="Hammer">Hammer (Carpentry)</option>
                        <option value="Wind">Wind (HVAC &amp; Appliance)</option>
                        <option value="Paintbrush">Paintbrush (Painting &amp; Civil)</option>
                        <option value="Tool">Tool (General Maintenance)</option>
                      </select>
                    </div>

                    <div className="col-md-6 d-flex align-items-center mt-4">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="catActiveSwitch"
                          checked={categoryFormData.isActive}
                          onChange={(e) => setCategoryFormData({ ...categoryFormData, isActive: e.target.checked })}
                        />
                        <label className="form-check-label small fw-semibold text-dark" htmlFor="catActiveSwitch">
                          Active Status
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top px-4 py-3 bg-light rounded-bottom-4">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowCategoryModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary px-4 py-2 fw-medium shadow-sm btn-sm">
                    {editingCategory ? 'Update Category' : 'Create Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
