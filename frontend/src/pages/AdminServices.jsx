import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Wrench, Plus, Edit2, CheckCircle2, AlertCircle, Clock, DollarSign } from 'lucide-react';

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
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

  useEffect(() => {
    fetchServicesAndCategories();
  }, []);

  const fetchServicesAndCategories = async () => {
    try {
      setLoading(true);
      const [svcRes, catRes] = await Promise.allSettled([
        api.get('/services'),
        api.get('/categories'),
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
    } catch (err) {
      console.error('Failed to load catalog:', err);
      setError('Could not load service catalog.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingService(null);
    setFormData({
      name: '',
      categoryId: categories[0]?.id?.toString() || '',
      description: '',
      basePrice: '75.00',
      estimatedDurationMinutes: 90,
      isActive: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (svc) => {
    setEditingService(svc);
    setFormData({
      name: svc.name,
      categoryId: svc.categoryId?.toString() || categories[0]?.id?.toString(),
      description: svc.description,
      basePrice: svc.basePrice?.toString(),
      estimatedDurationMinutes: svc.estimatedDurationMinutes,
      isActive: svc.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
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

      if (editingService) {
        await api.put(`/admin/services/${editingService.id}`, payload);
        setSuccess('Service updated successfully.');
      } else {
        await api.post('/admin/services', payload);
        setSuccess('Service created successfully.');
      }

      setShowModal(false);
      fetchServicesAndCategories();
    } catch (err) {
      console.error('Submit service error:', err);
      setError('Failed to save service.');
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="badge bg-danger bg-opacity-10 text-danger px-3 py-1 rounded-pill fw-semibold mb-1">
            Service Catalog Management
          </span>
          <h2 className="fw-bold mb-1">Service Offerings &amp; Pricing</h2>
          <p className="text-muted mb-0">Configure standard repair categories, base labor rates, and duration models</p>
        </div>
        <button className="btn btn-primary d-inline-flex align-items-center gap-2" onClick={handleOpenCreate}>
          <Plus size={18} /> Add New Service
        </button>
      </div>

      {success && (
        <div className="alert alert-success d-flex align-items-center gap-2 mb-4" role="alert">
          <CheckCircle2 size={18} />
          <div>{success}</div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
          <AlertCircle size={18} />
          <div>{error}</div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading services...</span>
          </div>
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">Service Name</th>
                  <th>Category</th>
                  <th>Base Labor Price</th>
                  <th>Est. Duration</th>
                  <th>Standard Materials Required</th>
                  <th>Status</th>
                  <th className="text-end pe-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {services.map((svc) => (
                  <tr key={svc.id}>
                    <td className="ps-4">
                      <div className="fw-bold text-dark">{svc.name}</div>
                      <div className="small text-muted text-truncate" style={{ maxWidth: 280 }}>
                        {svc.description}
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">{svc.categoryName}</span>
                    </td>
                    <td className="fw-bold text-success">
                      ${parseFloat(svc.basePrice).toFixed(2)}
                    </td>
                    <td>
                      <div className="small text-muted d-flex align-items-center gap-1">
                        <Clock size={14} /> {svc.estimatedDurationMinutes} mins
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-primary bg-opacity-10 text-primary">
                        {svc.materialRequirements?.length || 0} pre-configured parts
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${svc.isActive ? 'bg-success' : 'bg-secondary'}`}>
                        {svc.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="text-end pe-4">
                      <button
                        className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1"
                        onClick={() => handleOpenEdit(svc)}
                      >
                        <Edit2 size={14} /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Service Create/Edit Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  {editingService ? 'Edit Service Offering' : 'Create New Service Offering'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label fw-semibold">Service Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Category</label>
                      <select
                        className="form-select"
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        required
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Base Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={formData.basePrice}
                        onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Estimated Duration (Minutes)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.estimatedDurationMinutes}
                        onChange={(e) => setFormData({ ...formData, estimatedDurationMinutes: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Service Description</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                      ></textarea>
                    </div>

                    <div className="col-12">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="activeChk"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        />
                        <label className="form-check-label" htmlFor="activeChk">
                          Service is Active for Customer Bookings
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4">
                    {editingService ? 'Update Service' : 'Create Service'}
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
