import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { ShoppingCart, Plus, CheckCircle2, AlertCircle, Clock, Truck, DollarSign, Package } from 'lucide-react';

export default function PurchaseOrders() {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [poForm, setPoForm] = useState({
    supplierId: '',
    destinationLocationId: '',
    itemId: '',
    quantity: '50',
    unitPrice: '12.50',
  });

  useEffect(() => {
    fetchOrdersAndDependencies();
  }, []);

  const fetchOrdersAndDependencies = async () => {
    try {
      setLoading(true);
      const [ordRes, supRes, itmRes, locRes] = await Promise.allSettled([
        api.get('/procurement/orders'),
        api.get('/suppliers'),
        api.get('/inventory/items'),
        api.get('/inventory/locations'),
      ]);

      if (ordRes.status === 'fulfilled') setOrders(ordRes.value.data.data || []);
      if (supRes.status === 'fulfilled') {
        const sups = supRes.value.data.data || [];
        setSuppliers(sups);
        if (sups.length > 0) setPoForm((prev) => ({ ...prev, supplierId: sups[0].id.toString() }));
      }
      if (itmRes.status === 'fulfilled') {
        const itms = itmRes.value.data.data || [];
        setItems(itms);
        if (itms.length > 0) setPoForm((prev) => ({ ...prev, itemId: itms[0].id.toString() }));
      }
      if (locRes.status === 'fulfilled') {
        const locs = locRes.value.data.data || [];
        setLocations(locs);
        if (locs.length > 0) setPoForm((prev) => ({ ...prev, destinationLocationId: locs[0].id.toString() }));
      }
    } catch (err) {
      console.error('Failed to load purchase orders:', err);
      setError('Could not load purchase orders.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await api.post('/procurement/orders', {
        supplierId: parseInt(poForm.supplierId, 10),
        destinationLocationId: parseInt(poForm.destinationLocationId, 10),
        items: [
          {
            itemId: parseInt(poForm.itemId, 10),
            quantity: parseFloat(poForm.quantity),
            unitPrice: parseFloat(poForm.unitPrice),
          },
        ],
      });
      setShowModal(false);
      setSuccess('Purchase order submitted to supplier successfully.');
      fetchOrdersAndDependencies();
    } catch (err) {
      console.error('PO creation failed:', err);
      setError(err.response?.data?.message || 'Failed to create purchase order.');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      setError('');
      await api.patch(`/procurement/orders/${id}/status`, { status });
      setSuccess(`Order #${id} status updated to ${status}.`);
      fetchOrdersAndDependencies();
    } catch (err) {
      console.error('PO update failed:', err);
      setError('Failed to update PO status.');
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="badge bg-warning bg-opacity-10 text-dark px-3 py-1 rounded-pill fw-semibold mb-1">
            Supplier Procurement
          </span>
          <h2 className="fw-bold mb-1">Supplier Purchase Orders</h2>
          <p className="text-muted mb-0">Contractual procurement orders issued to certified manufacturing vendors</p>
        </div>
        <button className="btn btn-primary d-inline-flex align-items-center gap-2" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Create Purchase Order
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
            <span className="visually-hidden">Loading purchase orders...</span>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 text-center py-5">
          <div className="card-body">
            <ShoppingCart size={48} className="text-muted mb-3" />
            <h5 className="fw-bold">No Purchase Orders</h5>
            <p className="text-muted">Issue purchase orders to suppliers for stock replenishment.</p>
          </div>
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">PO Number</th>
                  <th>Supplier</th>
                  <th>Destination Hub</th>
                  <th>Order Date</th>
                  <th>Total Cost</th>
                  <th>Status</th>
                  <th className="text-end pe-4">Status Transition</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((po) => (
                  <tr key={po.id}>
                    <td className="ps-4 fw-bold text-primary">{po.orderNumber}</td>
                    <td>
                      <div className="fw-semibold text-dark">{po.supplierName}</div>
                      <div className="small text-muted">{po.supplierCode}</div>
                    </td>
                    <td><span className="badge bg-light text-dark border">{po.destinationLocationCode}</span></td>
                    <td className="small text-muted">{new Date(po.createdAt).toLocaleDateString()}</td>
                    <td className="fw-bold text-success">${parseFloat(po.totalAmount).toFixed(2)}</td>
                    <td>
                      <span className={`badge ${
                        po.status === 'DELIVERED'
                          ? 'bg-success'
                          : po.status === 'DISPATCHED'
                          ? 'bg-primary'
                          : po.status === 'CONFIRMED'
                          ? 'bg-info text-white'
                          : 'bg-warning text-dark'
                      }`}>
                        {po.status}
                      </span>
                    </td>
                    <td className="text-end pe-4">
                      <div className="d-flex justify-content-end gap-1">
                        {po.status === 'SUBMITTED' && (
                          <button
                            className="btn btn-outline-info btn-sm"
                            onClick={() => handleUpdateStatus(po.id, 'CONFIRMED')}
                          >
                            Confirm
                          </button>
                        )}
                        {po.status === 'CONFIRMED' && (
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => handleUpdateStatus(po.id, 'DISPATCHED')}
                          >
                            Dispatch
                          </button>
                        )}
                        {po.status === 'DISPATCHED' && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleUpdateStatus(po.id, 'DELIVERED')}
                          >
                            Mark Delivered
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
      )}

      {/* Create PO Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Issue Supplier Purchase Order</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleCreateOrder}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Supplier Vendor</label>
                    <select
                      className="form-select"
                      value={poForm.supplierId}
                      onChange={(e) => setPoForm({ ...poForm, supplierId: e.target.value })}
                      required
                    >
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Destination Receiving Warehouse</label>
                    <select
                      className="form-select"
                      value={poForm.destinationLocationId}
                      onChange={(e) => setPoForm({ ...poForm, destinationLocationId: e.target.value })}
                      required
                    >
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>{loc.locationName} ({loc.locationCode})</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Material Item</label>
                    <select
                      className="form-select"
                      value={poForm.itemId}
                      onChange={(e) => setPoForm({ ...poForm, itemId: e.target.value })}
                      required
                    >
                      {items.map((it) => (
                        <option key={it.id} value={it.id}>{it.sku} - {it.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="row g-2">
                    <div className="col-6 mb-3">
                      <label className="form-label fw-semibold">Order Quantity</label>
                      <input
                        type="number"
                        className="form-control"
                        value={poForm.quantity}
                        onChange={(e) => setPoForm({ ...poForm, quantity: e.target.value })}
                        required
                        min="1"
                      />
                    </div>
                    <div className="col-6 mb-3">
                      <label className="form-label fw-semibold">Unit Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={poForm.unitPrice}
                        onChange={(e) => setPoForm({ ...poForm, unitPrice: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4">Submit Purchase Order</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
