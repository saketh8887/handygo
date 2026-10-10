import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  Package, Plus, Edit, RefreshCw, AlertTriangle, CheckCircle2, 
  AlertCircle, Filter, Download, ArrowDownToLine, SlidersHorizontal 
} from 'lucide-react';

export default function StockBalances() {
  const [balances, setBalances] = useState([]);
  const [items, setItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState('ALL');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Goods Receipt Modal
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptForm, setReceiptForm] = useState({
    itemId: '',
    locationId: '',
    quantity: '25',
    referenceId: `GR-${Date.now()}`,
    reason: 'Standard Supplier Delivery Received',
  });

  // Stock Adjustment Modal
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustForm, setAdjustForm] = useState({
    itemId: '',
    locationId: '',
    adjustmentType: 'CYCLE_COUNT_CORRECTION',
    quantityChange: '5',
    reason: 'Quarterly inventory count physical audit discrepancy',
  });

  useEffect(() => {
    fetchStockData();
  }, []);

  const fetchStockData = async () => {
    try {
      setLoading(true);
      const [balRes, itemRes, locRes] = await Promise.allSettled([
        api.get('/inventory/balances'),
        api.get('/inventory/items'),
        api.get('/inventory/locations'),
      ]);

      if (balRes.status === 'fulfilled') setBalances(balRes.value.data.data || []);
      if (itemRes.status === 'fulfilled') {
        const itms = itemRes.value.data.data || [];
        setItems(itms);
        if (itms.length > 0) {
          setReceiptForm((prev) => ({ ...prev, itemId: itms[0].id.toString() }));
          setAdjustForm((prev) => ({ ...prev, itemId: itms[0].id.toString() }));
        }
      }
      if (locRes.status === 'fulfilled') {
        const locs = locRes.value.data.data || [];
        setLocations(locs);
        if (locs.length > 0) {
          setReceiptForm((prev) => ({ ...prev, locationId: locs[0].id.toString() }));
          setAdjustForm((prev) => ({ ...prev, locationId: locs[0].id.toString() }));
        }
      }
    } catch (err) {
      console.error('Failed to load stock data:', err);
      setError('Could not retrieve stock records.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoodsReceipt = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await api.post('/inventory/goods-receipt', {
        itemId: parseInt(receiptForm.itemId, 10),
        locationId: parseInt(receiptForm.locationId, 10),
        quantity: parseFloat(receiptForm.quantity),
        referenceId: receiptForm.referenceId,
        reason: receiptForm.reason,
      });
      setShowReceiptModal(false);
      setSuccess('Goods receipt recorded! Stock balances updated and ledger logged.');
      fetchStockData();
    } catch (err) {
      console.error('Receipt error:', err);
      setError(err.response?.data?.message || 'Failed to record goods receipt.');
    }
  };

  const handleStockAdjustment = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await api.post('/inventory/adjust', {
        itemId: parseInt(adjustForm.itemId, 10),
        locationId: parseInt(adjustForm.locationId, 10),
        adjustmentType: adjustForm.adjustmentType,
        quantityChange: parseFloat(adjustForm.quantityChange),
        reason: adjustForm.reason,
      });
      setShowAdjustModal(false);
      setSuccess('Stock adjusted successfully and ledger updated.');
      fetchStockData();
    } catch (err) {
      console.error('Adjustment error:', err);
      setError(err.response?.data?.message || 'Failed to adjust stock.');
    }
  };

  const filteredBalances = balances.filter((b) => {
    if (selectedLocation === 'ALL') return true;
    return b.locationCode === selectedLocation;
  });

  return (
    <div className="container py-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <span className="badge bg-warning bg-opacity-10 text-dark px-3 py-1 rounded-pill fw-semibold mb-1">
            Real-Time Material Accounting
          </span>
          <h2 className="fw-bold mb-1">Stock Balances &amp; Ledger Control</h2>
          <p className="text-muted mb-0">Monitor On Hand, Reserved, and Available Stock across all distribution nodes</p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <button className="btn btn-success d-inline-flex align-items-center gap-2" onClick={() => setShowReceiptModal(true)}>
            <ArrowDownToLine size={18} /> Record Goods Receipt
          </button>
          <button className="btn btn-outline-secondary d-inline-flex align-items-center gap-2" onClick={() => setShowAdjustModal(true)}>
            <SlidersHorizontal size={18} /> Stock Adjustment
          </button>
        </div>
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

      {/* Filter Bar */}
      <div className="card shadow-sm border-0 rounded-4 mb-4">
        <div className="card-body p-3 d-flex flex-wrap align-items-center gap-2">
          <span className="text-muted small fw-semibold me-2 d-flex align-items-center gap-1">
            <Filter size={16} /> Warehouse:
          </span>
          <button
            className={`btn btn-sm rounded-pill px-3 ${selectedLocation === 'ALL' ? 'btn-primary' : 'btn-light'}`}
            onClick={() => setSelectedLocation('ALL')}
          >
            All Warehouses ({balances.length})
          </button>
          {locations.map((loc) => (
            <button
              key={loc.id}
              className={`btn btn-sm rounded-pill px-3 ${selectedLocation === loc.locationCode ? 'btn-primary' : 'btn-light'}`}
              onClick={() => setSelectedLocation(loc.locationCode)}
            >
              {loc.locationName} ({loc.locationCode})
            </button>
          ))}
        </div>
      </div>

      {/* Balances Table */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading balances...</span>
          </div>
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">SKU / Code</th>
                  <th>Material Name</th>
                  <th>Location</th>
                  <th>On Hand</th>
                  <th>Reserved</th>
                  <th>Available Stock</th>
                  <th>Reorder Level</th>
                  <th>Cost / Unit</th>
                  <th className="pe-4">Stock Health</th>
                </tr>
              </thead>
              <tbody>
                {filteredBalances.map((b) => {
                  const onHand = parseFloat(b.quantityOnHand || 0);
                  const reserved = parseFloat(b.reservedQuantity || 0);
                  const available = parseFloat(b.availableQuantity ?? (onHand - reserved));
                  const reorder = parseFloat(b.reorderPoint || 10);
                  const isLow = available <= reorder;

                  return (
                    <tr key={b.id || `${b.itemId}-${b.locationId}`}>
                      <td className="ps-4 fw-bold text-primary">{b.sku}</td>
                      <td>
                        <div className="fw-semibold text-dark">{b.itemName}</div>
                        <div className="small text-muted">{b.category}</div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">{b.locationCode}</span>
                      </td>
                      <td className="fw-bold">{onHand}</td>
                      <td className="text-warning fw-semibold">{reserved}</td>
                      <td className="fw-bold text-success fs-6">{available}</td>
                      <td className="small text-muted">{reorder}</td>
                      <td className="small">${parseFloat(b.costPrice || 0).toFixed(2)}</td>
                      <td className="pe-4">
                        {isLow ? (
                          <span className="badge bg-danger bg-opacity-10 text-danger border border-danger d-inline-flex align-items-center gap-1">
                            <AlertTriangle size={12} /> Low Stock (Below ROP)
                          </span>
                        ) : (
                          <span className="badge bg-success bg-opacity-10 text-success border border-success d-inline-flex align-items-center gap-1">
                            <CheckCircle2 size={12} /> Healthy Stock
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Goods Receipt Modal */}
      {showReceiptModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Record Goods Receipt</h5>
                <button type="button" className="btn-close" onClick={() => setShowReceiptModal(false)}></button>
              </div>
              <form onSubmit={handleGoodsReceipt}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Inventory Item (SKU)</label>
                    <select
                      className="form-select"
                      value={receiptForm.itemId}
                      onChange={(e) => setReceiptForm({ ...receiptForm, itemId: e.target.value })}
                      required
                    >
                      {items.map((it) => (
                        <option key={it.id} value={it.id}>
                          {it.sku} - {it.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Receiving Warehouse Location</label>
                    <select
                      className="form-select"
                      value={receiptForm.locationId}
                      onChange={(e) => setReceiptForm({ ...receiptForm, locationId: e.target.value })}
                      required
                    >
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.locationName} ({loc.locationCode})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Quantity Received</label>
                    <input
                      type="number"
                      step="1"
                      className="form-control"
                      value={receiptForm.quantity}
                      onChange={(e) => setReceiptForm({ ...receiptForm, quantity: e.target.value })}
                      required
                      min="1"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">PO / Delivery Reference #</label>
                    <input
                      type="text"
                      className="form-control"
                      value={receiptForm.referenceId}
                      onChange={(e) => setReceiptForm({ ...receiptForm, referenceId: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Receiving Note / Reason</label>
                    <input
                      type="text"
                      className="form-control"
                      value={receiptForm.reason}
                      onChange={(e) => setReceiptForm({ ...receiptForm, reason: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowReceiptModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-success px-4">Post Goods Receipt</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {showAdjustModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Audit Stock Adjustment</h5>
                <button type="button" className="btn-close" onClick={() => setShowAdjustModal(false)}></button>
              </div>
              <form onSubmit={handleStockAdjustment}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Inventory Item</label>
                    <select
                      className="form-select"
                      value={adjustForm.itemId}
                      onChange={(e) => setAdjustForm({ ...adjustForm, itemId: e.target.value })}
                      required
                    >
                      {items.map((it) => (
                        <option key={it.id} value={it.id}>
                          {it.sku} - {it.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Warehouse Location</label>
                    <select
                      className="form-select"
                      value={adjustForm.locationId}
                      onChange={(e) => setAdjustForm({ ...adjustForm, locationId: e.target.value })}
                      required
                    >
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.locationName} ({loc.locationCode})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Adjustment Type</label>
                    <select
                      className="form-select"
                      value={adjustForm.adjustmentType}
                      onChange={(e) => setAdjustForm({ ...adjustForm, adjustmentType: e.target.value })}
                    >
                      <option value="CYCLE_COUNT_CORRECTION">Cycle Count Correction</option>
                      <option value="DAMAGE">Damaged Goods Write-off</option>
                      <option value="SCRAP">Scrap / Expired</option>
                      <option value="CORRECTION">Manual Administrative Correction</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Quantity Delta (Positive or Negative)</label>
                    <input
                      type="number"
                      step="1"
                      className="form-control"
                      placeholder="e.g. -2 or +5"
                      value={adjustForm.quantityChange}
                      onChange={(e) => setAdjustForm({ ...adjustForm, quantityChange: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Mandatory Reason for Adjustment <span className="text-danger">*</span>
                    </label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="Audit reason explaining discrepancy..."
                      value={adjustForm.reason}
                      onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowAdjustModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4">Execute Adjustment</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
