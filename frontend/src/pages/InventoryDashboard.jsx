import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { 
  Package, AlertTriangle, ArrowRightLeft, ShoppingCart, 
  DollarSign, MapPin, TrendingDown, Clock, ShieldCheck, Plus, CheckCircle2 
} from 'lucide-react';

export default function InventoryDashboard() {
  const [balances, setBalances] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const [balRes, alertRes, movRes, locRes] = await Promise.allSettled([
        api.get('/inventory/balances'),
        api.get('/inventory/alerts/low-stock'),
        api.get('/inventory/movements'),
        api.get('/inventory/locations'),
      ]);

      if (balRes.status === 'fulfilled') setBalances(balRes.value.data.data || []);
      if (alertRes.status === 'fulfilled') setLowStockAlerts(alertRes.value.data.data || []);
      if (movRes.status === 'fulfilled') setMovements(movRes.value.data.data || []);
      if (locRes.status === 'fulfilled') setLocations(locRes.value.data.data || []);
    } catch (err) {
      console.error('Failed to load inventory data:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalSKUs = new Set(balances.map((b) => b.sku)).size;
  const totalValuation = balances.reduce(
    (acc, b) => acc + (parseFloat(b.costPrice || 0) * parseFloat(b.quantityOnHand || 0)),
    0
  );

  return (
    <div className="container py-5">
      {/* Top Banner */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <span className="badge bg-warning bg-opacity-10 text-dark px-3 py-1 rounded-pill fw-semibold mb-1">
            Warehouse Logistics &amp; Material Management
          </span>
          <h2 className="fw-bold mb-1">Inventory Operations Command</h2>
          <p className="text-muted mb-0">Multi-warehouse stock levels, reorder analytics, and immutable ledger movements</p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <Link to="/inventory/balances" className="btn btn-primary d-inline-flex align-items-center gap-2">
            <Package size={18} /> Manage Stock Balances
          </Link>
          <Link to="/inventory/replenishment" className="btn btn-outline-secondary d-inline-flex align-items-center gap-2">
            <ShoppingCart size={18} /> Replenishment Planning
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small fw-semibold">Distinct SKUs</span>
              <span className="p-2 rounded bg-primary bg-opacity-10 text-primary"><Package size={20} /></span>
            </div>
            <div className="fs-3 fw-bold text-dark">{totalSKUs} Items</div>
            <div className="small text-muted mt-1">Across 3 regional hubs</div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small fw-semibold">Inventory Valuation</span>
              <span className="p-2 rounded bg-success bg-opacity-10 text-success"><DollarSign size={20} /></span>
            </div>
            <div className="fs-3 fw-bold text-success">${totalValuation.toFixed(2)}</div>
            <div className="small text-muted mt-1">Total on-hand stock assets</div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small fw-semibold">Low-Stock Warnings</span>
              <span className="p-2 rounded bg-danger bg-opacity-10 text-danger"><AlertTriangle size={20} /></span>
            </div>
            <div className="fs-3 fw-bold text-danger">{lowStockAlerts.length} SKUs</div>
            <div className="small text-danger mt-1">Below safety reorder point</div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small fw-semibold">Active Locations</span>
              <span className="p-2 rounded bg-info bg-opacity-10 text-info"><MapPin size={20} /></span>
            </div>
            <div className="fs-3 fw-bold text-dark">{locations.length || 3} Hubs</div>
            <div className="small text-muted mt-1">Central, North &amp; South</div>
          </div>
        </div>
      </div>

      {/* Warehouses Summary Grid */}
      <h5 className="fw-bold mb-3">Regional Fulfillment Warehouses</h5>
      <div className="row g-3 mb-4">
        {locations.map((loc) => {
          const locBalances = balances.filter((b) => b.locationCode === loc.locationCode);
          const totalUnits = locBalances.reduce((acc, b) => acc + parseFloat(b.quantityOnHand || 0), 0);
          return (
            <div key={loc.id} className="col-12 col-md-4">
              <div className="card border-0 shadow-sm rounded-4 p-3 bg-light h-100">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="badge bg-secondary">{loc.locationCode}</span>
                  <span className="badge bg-success bg-opacity-10 text-success">Active Hub</span>
                </div>
                <h5 className="fw-bold mb-1">{loc.locationName}</h5>
                <p className="text-muted small mb-2">{loc.address}</p>
                <div className="mt-auto pt-2 border-top d-flex justify-content-between small text-muted">
                  <span>Stock Stored:</span>
                  <strong className="text-dark">{totalUnits} units</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Stock Movement Ledger */}
      <div className="card border-0 shadow-sm rounded-4 p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0">Immutable Stock-Movement Ledger (Recent)</h5>
          <Link to="/inventory/balances" className="small text-primary text-decoration-none">View All Balances</Link>
        </div>
        <p className="text-muted small mb-3">Every reservation, goods receipt, consumption, and adjustment is recorded with audit trail.</p>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-3">Timestamp</th>
                <th>Type</th>
                <th>Item / SKU</th>
                <th>Warehouse</th>
                <th>Qty Delta</th>
                <th>Reference #</th>
                <th className="pe-3">Reason</th>
              </tr>
            </thead>
            <tbody>
              {movements.slice(0, 8).map((m) => (
                <tr key={m.id}>
                  <td className="ps-3 small text-muted">{new Date(m.timestamp).toLocaleString()}</td>
                  <td>
                    <span className={`badge ${
                      m.movementType === 'GOODS_RECEIPT'
                        ? 'bg-success'
                        : m.movementType === 'RESERVATION'
                        ? 'bg-warning text-dark'
                        : m.movementType === 'CONSUMPTION'
                        ? 'bg-primary'
                        : 'bg-secondary'
                    }`}>
                      {m.movementType}
                    </span>
                  </td>
                  <td className="fw-semibold text-dark">{m.itemName}</td>
                  <td><span className="badge bg-light text-dark border">{m.locationCode}</span></td>
                  <td className={`fw-bold ${parseFloat(m.quantity) > 0 ? 'text-success' : 'text-danger'}`}>
                    {parseFloat(m.quantity) > 0 ? `+${m.quantity}` : m.quantity}
                  </td>
                  <td className="small text-muted">{m.referenceNumber}</td>
                  <td className="pe-3 small text-muted">{m.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
