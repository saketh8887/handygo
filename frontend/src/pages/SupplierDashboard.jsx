import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Truck, Package, Clock, CheckCircle2, AlertCircle, ShoppingCart, DollarSign, Plus } from 'lucide-react';

export default function SupplierDashboard() {
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Catalog Item Modal
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [catalogItem, setCatalogItem] = useState({
    itemId: '',
    supplierPartNumber: 'VEN-PART-01',
    unitCost: '18.50',
    leadTimeDays: 2,
    minimumOrderQuantity: 10,
  });

  useEffect(() => {
    fetchSupplierData();
  }, []);

  const fetchSupplierData = async () => {
    try {
      setLoading(true);
      const [profRes, ordRes, itmRes] = await Promise.allSettled([
        api.get('/suppliers/my-profile'),
        api.get('/procurement/orders'),
        api.get('/inventory/items'),
      ]);

      if (profRes.status === 'fulfilled') setProfile(profRes.value.data.data);
      if (ordRes.status === 'fulfilled') setOrders(ordRes.value.data.data || []);
      if (itmRes.status === 'fulfilled') {
        const itms = itmRes.value.data.data || [];
        setItems(itms);
        if (itms.length > 0) setCatalogItem((prev) => ({ ...prev, itemId: itms[0].id.toString() }));
      }
    } catch (err) {
      console.error('Failed to load supplier portal:', err);
      setError('Could not load supplier profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      setError('');
      await api.patch(`/procurement/orders/${orderId}/status`, { status: newStatus });
      setSuccess(`Order marked as ${newStatus}!`);
      fetchSupplierData();
    } catch (err) {
      console.error('Order update failed:', err);
      setError('Failed to update status.');
    }
  };

  const handleAddCatalogItem = async (e) => {
    e.preventDefault();
    if (!profile?.id) return;
    try {
      setError('');
      await api.post(`/suppliers/${profile.id}/catalog`, {
        itemId: parseInt(catalogItem.itemId, 10),
        supplierPartNumber: catalogItem.supplierPartNumber,
        unitCost: parseFloat(catalogItem.unitCost),
        leadTimeDays: parseInt(catalogItem.leadTimeDays, 10),
        minimumOrderQuantity: parseInt(catalogItem.minimumOrderQuantity, 10),
      });
      setShowCatalogModal(false);
      setSuccess('Item added to supplier catalog.');
      fetchSupplierData();
    } catch (err) {
      console.error('Add catalog item failed:', err);
      setError('Failed to update catalog.');
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary my-5" role="status">
          <span className="visually-hidden">Loading supplier portal...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <span className="badge bg-info bg-opacity-10 text-info px-3 py-1 rounded-pill fw-semibold mb-1">
            Supplier &amp; Vendor Portal
          </span>
          <h2 className="fw-bold mb-1">
            {profile ? profile.name : 'Apex Hardware & Industrial Supply'}
          </h2>
          <p className="text-muted mb-0">Authorized vendor fulfillment center, quotations, and freight dispatch</p>
        </div>
        <button className="btn btn-primary d-inline-flex align-items-center gap-2" onClick={() => setShowCatalogModal(true)}>
          <Plus size={18} /> Update Catalog Quotation
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

      {/* Supplier Profile Info Card */}
      <div className="card shadow-sm border-0 rounded-4 p-4 mb-4 bg-light">
        <div className="row g-3">
          <div className="col-md-3">
            <div className="small text-muted">Vendor Code</div>
            <div className="fw-bold fs-6">{profile?.code || 'SUP-APEX'}</div>
          </div>
          <div className="col-md-3">
            <div className="small text-muted">Lead Time Commitment</div>
            <div className="fw-bold fs-6">{profile?.leadTimeDays || 2} Days</div>
          </div>
          <div className="col-md-3">
            <div className="small text-muted">Contact Officer</div>
            <div className="fw-bold fs-6">{profile?.contactName || 'Corporate Dispatch'}</div>
          </div>
          <div className="col-md-3">
            <div className="small text-muted">Payment Terms</div>
            <div className="fw-bold fs-6 text-success">Net 30 Days</div>
          </div>
        </div>
      </div>

      {/* Assigned Purchase Orders */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <div className="card-header bg-white py-3">
          <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
            <ShoppingCart className="text-primary" /> Incoming Purchase Orders for Fulfillment
          </h5>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-4">PO #</th>
                <th>Destination Hub</th>
                <th>Date Issued</th>
                <th>Total Value</th>
                <th>Status</th>
                <th className="text-end pe-4">Vendor Dispatch Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((po) => (
                <tr key={po.id}>
                  <td className="ps-4 fw-bold text-primary">{po.orderNumber}</td>
                  <td><span className="badge bg-light text-dark border">{po.destinationLocationCode}</span></td>
                  <td className="small text-muted">{new Date(po.createdAt).toLocaleDateString()}</td>
                  <td className="fw-bold text-success">${parseFloat(po.totalAmount).toFixed(2)}</td>
                  <td>
                    <span className={`badge ${
                      po.status === 'DELIVERED'
                        ? 'bg-success'
                        : po.status === 'DISPATCHED'
                        ? 'bg-primary'
                        : 'bg-warning text-dark'
                    }`}>
                      {po.status}
                    </span>
                  </td>
                  <td className="text-end pe-4">
                    <div className="d-flex justify-content-end gap-1">
                      {po.status === 'SUBMITTED' && (
                        <button
                          className="btn btn-info text-white btn-sm"
                          onClick={() => handleUpdateOrderStatus(po.id, 'CONFIRMED')}
                        >
                          Confirm Order
                        </button>
                      )}
                      {po.status === 'CONFIRMED' && (
                        <button
                          className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1"
                          onClick={() => handleUpdateOrderStatus(po.id, 'DISPATCHED')}
                        >
                          <Truck size={14} /> Dispatch Freight
                        </button>
                      )}
                      {po.status === 'DISPATCHED' && (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleUpdateOrderStatus(po.id, 'DELIVERED')}
                        >
                          Confirm Delivery
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Catalog Item Modal */}
      {showCatalogModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Update Vendor Catalog Quotation</h5>
                <button type="button" className="btn-close" onClick={() => setShowCatalogModal(false)}></button>
              </div>
              <form onSubmit={handleAddCatalogItem}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Inventory Material</label>
                    <select
                      className="form-select"
                      value={catalogItem.itemId}
                      onChange={(e) => setCatalogItem({ ...catalogItem, itemId: e.target.value })}
                      required
                    >
                      {items.map((it) => (
                        <option key={it.id} value={it.id}>{it.sku} - {it.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Vendor Part Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={catalogItem.supplierPartNumber}
                      onChange={(e) => setCatalogItem({ ...catalogItem, supplierPartNumber: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label fw-semibold">Unit Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={catalogItem.unitCost}
                        onChange={(e) => setCatalogItem({ ...catalogItem, unitCost: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-semibold">Lead Time (Days)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={catalogItem.leadTimeDays}
                        onChange={(e) => setCatalogItem({ ...catalogItem, leadTimeDays: parseInt(e.target.value, 10) })}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowCatalogModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4">Save Quotation</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
