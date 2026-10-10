import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { MapPin, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SavedAddresses() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAddr, setNewAddr] = useState({
    streetLine: '',
    city: 'Metropolis',
    state: 'State',
    postalCode: '10001',
    isDefault: false,
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/customer/addresses');
      setAddresses(res.data.data || []);
    } catch (err) {
      console.error('Failed to load addresses:', err);
      setError('Could not load saved addresses.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await api.post('/customer/addresses', newAddr);
      setShowAddModal(false);
      setSuccess('Address added successfully.');
      setNewAddr({ streetLine: '', city: 'Metropolis', state: 'State', postalCode: '10001', isDefault: false });
      fetchAddresses();
    } catch (err) {
      console.error('Failed to add address:', err);
      setError('Failed to add address.');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await api.delete(`/customer/addresses/${id}`);
      setSuccess('Address deleted.');
      fetchAddresses();
    } catch (err) {
      console.error('Failed to delete address:', err);
      setError('Failed to delete address.');
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Saved Addresses</h2>
          <p className="text-muted mb-0">Manage service dispatch locations for quick booking</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => setShowAddModal(true)}>
          <Plus size={18} /> Add Address
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
            <span className="visually-hidden">Loading addresses...</span>
          </div>
        </div>
      ) : addresses.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 text-center py-5">
          <div className="card-body">
            <MapPin size={48} className="text-muted mb-3" />
            <h5 className="fw-bold">No saved addresses</h5>
            <p className="text-muted">Save home, office, or rental properties for 1-click booking.</p>
            <button className="btn btn-primary mt-2" onClick={() => setShowAddModal(true)}>
              Add First Address
            </button>
          </div>
        </div>
      ) : (
        <div className="row g-3">
          {addresses.map((addr) => (
            <div key={addr.id} className="col-md-6">
              <div className="card border-0 shadow-sm rounded-4 p-4 h-100 position-relative">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <MapPin className="text-primary" size={20} />
                    <h5 className="fw-bold mb-0">{addr.streetLine}</h5>
                  </div>
                  {addr.isDefault && <span className="badge bg-primary">Default</span>}
                </div>
                <p className="text-muted mb-3">
                  {addr.city}, {addr.state} {addr.postalCode}
                </p>
                <div className="mt-auto d-flex justify-content-end">
                  <button
                    className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
                    onClick={() => handleDeleteAddress(addr.id)}
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Address Modal */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Add Service Address</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <form onSubmit={handleAddAddress}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Street Address</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 500 Park Avenue, Apt 12C"
                      required
                      value={newAddr.streetLine}
                      onChange={(e) => setNewAddr({ ...newAddr, streetLine: e.target.value })}
                    />
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label fw-semibold">City</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={newAddr.city}
                        onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-semibold">Postal Code</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={newAddr.postalCode}
                        onChange={(e) => setNewAddr({ ...newAddr, postalCode: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="defCheck"
                      checked={newAddr.isDefault}
                      onChange={(e) => setNewAddr({ ...newAddr, isDefault: e.target.checked })}
                    />
                    <label className="form-check-label" htmlFor="defCheck">
                      Set as default service address
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4">Save Address</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
