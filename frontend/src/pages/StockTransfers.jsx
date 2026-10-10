import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowRightLeft, Plus, CheckCircle2, AlertCircle, Clock, 
  MapPin, Check, Truck 
} from 'lucide-react';

export default function StockTransfers() {
  const { user } = useAuth();
  const [transfers, setTransfers] = useState([]);
  const [items, setItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Request Transfer Modal
  const [showModal, setShowModal] = useState(false);
  const [transferForm, setTransferForm] = useState({
    itemId: '',
    fromLocationId: '',
    toLocationId: '',
    quantity: '20',
    reason: 'Balancing regional branch material demand',
  });

  useEffect(() => {
    fetchTransfersAndData();
  }, []);

  const fetchTransfersAndData = async () => {
    try {
      setLoading(true);
      const [trfRes, itmRes, locRes] = await Promise.allSettled([
        api.get('/procurement/transfers'),
        api.get('/inventory/items'),
        api.get('/inventory/locations'),
      ]);

      if (trfRes.status === 'fulfilled') setTransfers(trfRes.value.data.data || []);
      if (itmRes.status === 'fulfilled') {
        const itms = itmRes.value.data.data || [];
        setItems(itms);
        if (itms.length > 0) setTransferForm((prev) => ({ ...prev, itemId: itms[0].id.toString() }));
      }
      if (locRes.status === 'fulfilled') {
        const locs = locRes.value.data.data || [];
        setLocations(locs);
        if (locs.length >= 2) {
          setTransferForm((prev) => ({
            ...prev,
            fromLocationId: locs[0].id.toString(),
            toLocationId: locs[1].id.toString(),
          }));
        }
      }
    } catch (err) {
      console.error('Failed to load transfers:', err);
      setError('Could not load stock transfers.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestTransfer = async (e) => {
    e.preventDefault();
    try {
      setError('');
      if (transferForm.fromLocationId === transferForm.toLocationId) {
        setError('Origin and destination warehouses cannot be the same.');
        return;
      }
      await api.post('/procurement/transfers', {
        itemId: parseInt(transferForm.itemId, 10),
        fromLocationId: parseInt(transferForm.fromLocationId, 10),
        toLocationId: parseInt(transferForm.toLocationId, 10),
        quantity: parseFloat(transferForm.quantity),
        reason: transferForm.reason,
      });
      setShowModal(false);
      setSuccess('Inter-warehouse stock transfer requested successfully.');
      fetchTransfersAndData();
    } catch (err) {
      console.error('Request transfer failed:', err);
      setError(err.response?.data?.message || 'Failed to request transfer.');
    }
  };

  const handleExecuteTransfer = async (id) => {
    try {
      setError('');
      await api.post(`/procurement/transfers/${id}/execute`);
      setSuccess(`Transfer #${id} successfully executed! Inventory ledger updated.`);
      fetchTransfersAndData();
    } catch (err) {
      console.error('Execution failed:', err);
      setError(err.response?.data?.message || 'Failed to execute transfer.');
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="badge bg-warning bg-opacity-10 text-dark px-3 py-1 rounded-pill fw-semibold mb-1">
            Inter-Warehouse Logistics
          </span>
          <h2 className="fw-bold mb-1">Stock Transfers &amp; Freight Routing</h2>
          <p className="text-muted mb-0">Balance surplus and deficit inventory across regional distribution centers</p>
        </div>
        <button className="btn btn-primary d-inline-flex align-items-center gap-2" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Request Transfer
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
            <span className="visually-hidden">Loading transfers...</span>
          </div>
        </div>
      ) : transfers.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 text-center py-5">
          <div className="card-body">
            <ArrowRightLeft size={48} className="text-muted mb-3" />
            <h5 className="fw-bold">No Transfers Active</h5>
            <p className="text-muted">Initiate transfers to share surplus materials between regional warehouses.</p>
          </div>
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">Transfer #</th>
                  <th>Item / Material</th>
                  <th>From Origin</th>
                  <th>To Destination</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Reason</th>
                  <th className="text-end pe-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {transfers.map((trf) => (
                  <tr key={trf.id}>
                    <td className="ps-4 fw-bold text-primary">{trf.transferNumber}</td>
                    <td className="fw-semibold text-dark">{trf.itemName}</td>
                    <td><span className="badge bg-light text-dark border">{trf.fromLocationCode}</span></td>
                    <td><span className="badge bg-light text-primary border">{trf.toLocationCode}</span></td>
                    <td className="fw-bold fs-6">{trf.quantity} units</td>
                    <td>
                      <span className={`badge ${
                        trf.status === 'COMPLETED'
                          ? 'bg-success'
                          : trf.status === 'IN_TRANSIT'
                          ? 'bg-primary'
                          : 'bg-warning text-dark'
                      }`}>
                        {trf.status}
                      </span>
                    </td>
                    <td className="small text-muted text-truncate" style={{ maxWidth: 220 }}>{trf.reason}</td>
                    <td className="text-end pe-4">
                      {trf.status !== 'COMPLETED' && (
                        <button
                          className="btn btn-success btn-sm d-inline-flex align-items-center gap-1"
                          onClick={() => handleExecuteTransfer(trf.id)}
                        >
                          <Check size={14} /> Execute &amp; Receive
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Request Transfer Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Request Inter-Warehouse Transfer</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleRequestTransfer}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Inventory Material</label>
                    <select
                      className="form-select"
                      value={transferForm.itemId}
                      onChange={(e) => setTransferForm({ ...transferForm, itemId: e.target.value })}
                      required
                    >
                      {items.map((it) => (
                        <option key={it.id} value={it.id}>{it.sku} - {it.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label fw-semibold">Source (Origin)</label>
                      <select
                        className="form-select"
                        value={transferForm.fromLocationId}
                        onChange={(e) => setTransferForm({ ...transferForm, fromLocationId: e.target.value })}
                        required
                      >
                        {locations.map((loc) => (
                          <option key={loc.id} value={loc.id}>{loc.locationCode}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-6">
                      <label className="form-label fw-semibold">Destination</label>
                      <select
                        className="form-select"
                        value={transferForm.toLocationId}
                        onChange={(e) => setTransferForm({ ...transferForm, toLocationId: e.target.value })}
                        required
                      >
                        {locations.map((loc) => (
                          <option key={loc.id} value={loc.id}>{loc.locationCode}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Transfer Quantity</label>
                    <input
                      type="number"
                      step="1"
                      className="form-control"
                      value={transferForm.quantity}
                      onChange={(e) => setTransferForm({ ...transferForm, quantity: e.target.value })}
                      required
                      min="1"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Transfer Purpose / Reason</label>
                    <input
                      type="text"
                      className="form-control"
                      value={transferForm.reason}
                      onChange={(e) => setTransferForm({ ...transferForm, reason: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4">Submit Transfer Request</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
