import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { MapPin, Plus, Trash2, CheckCircle2, AlertCircle, Building2, Home } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import EmptyState from '../components/EmptyState';
import Skeleton from '../components/Skeleton';

export default function SavedAddresses() {
  const { showToast } = useToast();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
      showToast('Could not load addresses.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await api.post('/customer/addresses', newAddr);
      setShowAddModal(false);
      showToast('Address added successfully.', 'success');
      setNewAddr({ streetLine: '', city: 'Metropolis', state: 'State', postalCode: '10001', isDefault: false });
      fetchAddresses();
    } catch (err) {
      console.error('Failed to add address:', err);
      const msg = err.response?.data?.message || 'Failed to add address.';
      setError(msg);
      showToast(msg, 'error');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Delete this saved address?')) return;
    try {
      await api.delete(`/customer/addresses/${id}`);
      showToast('Address deleted.', 'info');
      fetchAddresses();
    } catch (err) {
      console.error('Failed to delete address:', err);
      const msg = err.response?.data?.message || 'Failed to delete address.';
      setError(msg);
      showToast(msg, 'error');
    }
  };

  return (
    <div className="container py-4">
      <Breadcrumb items={[{ label: 'Saved Addresses' }]} />

      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-0" style={{ letterSpacing: '-0.02em' }}>
            Saved Addresses
          </h2>
          <p className="text-secondary small mb-0 mt-0.5">
            Manage your service locations for fast, one-click appointment dispatch
          </p>
        </div>
        <button 
          className="btn btn-primary btn-sm px-3 py-2 rounded-3 d-inline-flex align-items-center gap-1.5 fw-medium shadow-sm"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={16} /> Add New Address
        </button>
      </div>

      {error && (
        <div className="alert alert-danger rounded-3 border-0 shadow-sm mb-4 small">
          {error}
        </div>
      )}

      {loading ? (
        <div className="row g-3">
          {[1, 2, 3].map(n => (
            <div key={n} className="col-md-6 col-lg-4">
              <div className="hc-card p-4">
                <Skeleton height="100px" />
              </div>
            </div>
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No saved addresses yet"
          description="Save your home, office, or investment property to book tradespeople without typing your address each time."
          actionLabel="Add Your First Address"
          onAction={() => setShowAddModal(true)}
        />
      ) : (
        <div className="row g-3">
          {addresses.map((a) => (
            <div key={a.id} className="col-md-6 col-lg-4">
              <div className="hc-card h-100 p-4 border-0 shadow-sm d-flex flex-column justify-content-between transition-all">
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-2.5">
                    <div className="p-2 rounded-circle bg-primary bg-opacity-10 text-primary">
                      <Home size={18} />
                    </div>
                    {a.isDefault && (
                      <span className="hc-badge hc-badge-success" style={{ fontSize: '0.72rem' }}>
                        Default Address
                      </span>
                    )}
                  </div>
                  <h6 className="fw-bold text-dark mb-1">{a.streetLine}</h6>
                  <p className="text-secondary small mb-0">
                    {a.city}, {a.state} {a.postalCode}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-top d-flex justify-content-end">
                  <button
                    className="btn btn-outline-danger btn-sm px-2.5 py-1 rounded-3 d-inline-flex align-items-center gap-1"
                    style={{ fontSize: '0.75rem' }}
                    onClick={() => handleDeleteAddress(a.id)}
                  >
                    <Trash2 size={13} /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Address Modal */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-bottom px-4 pt-4 pb-3">
                <h5 className="modal-title fw-bold">Add Service Address</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <form onSubmit={handleAddAddress}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Street Address</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 742 Evergreen Terrace, Apt 4B"
                      value={newAddr.streetLine}
                      onChange={(e) => setNewAddr({ ...newAddr, streetLine: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-dark">City</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newAddr.city}
                        onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-dark">Postal Code</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newAddr.postalCode}
                        onChange={(e) => setNewAddr({ ...newAddr, postalCode: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="defaultAddrCheck"
                      checked={newAddr.isDefault}
                      onChange={(e) => setNewAddr({ ...newAddr, isDefault: e.target.checked })}
                    />
                    <label className="form-check-label small text-secondary" htmlFor="defaultAddrCheck">
                      Set as default service address
                    </label>
                  </div>
                </div>

                <div className="modal-footer border-top px-4 py-3 bg-light rounded-bottom-4">
                  <button type="button" className="btn btn-outline-secondary px-3 py-2" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary px-4 py-2 fw-medium shadow-sm">
                    Save Address
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
