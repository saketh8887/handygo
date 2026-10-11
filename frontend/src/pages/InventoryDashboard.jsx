import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { 
  Package, AlertTriangle, ArrowRightLeft, ShoppingCart, 
  DollarSign, MapPin, TrendingDown, Clock, ShieldCheck, Plus, CheckCircle2,
  Building2, Layers
} from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import MetricCard from '../components/MetricCard';
import Skeleton from '../components/Skeleton';

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
    <div className="container py-4">
      <Breadcrumb items={[{ label: 'Inventory & Logistics Command' }]} />

      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-warning bg-opacity-15 text-dark px-2.5 py-1 rounded-pill fw-semibold" style={{ fontSize: '0.75rem' }}>
              WAREHOUSE LOGISTICS &amp; MATERIAL MANAGEMENT
            </span>
          </div>
          <h2 className="fw-bold text-dark mb-0" style={{ letterSpacing: '-0.02em' }}>
            Inventory Operations Command
          </h2>
          <p className="text-secondary small mb-0 mt-0.5">
            Multi-warehouse stock levels, reorder analytics, and immutable ledger movements
          </p>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <Link to="/inventory/balances" className="btn btn-primary btn-sm px-3 py-2 rounded-3 d-inline-flex align-items-center gap-1.5 shadow-sm fw-medium">
            <Package size={16} /> Manage Stock Balances
          </Link>
          <Link to="/inventory/replenishment" className="btn btn-outline-secondary btn-sm px-3 py-2 rounded-3 d-inline-flex align-items-center gap-1.5 fw-medium">
            <ShoppingCart size={16} /> Replenishment Planning
          </Link>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <MetricCard
            title="Distinct SKUs"
            value={`${totalSKUs} Items`}
            subtitle="Across 3 regional hubs"
            icon={Package}
            color="primary"
          />
        </div>

        <div className="col-6 col-lg-3">
          <MetricCard
            title="Inventory Valuation"
            value={`$${totalValuation.toFixed(2)}`}
            subtitle="On-hand stock assets"
            icon={DollarSign}
            color="success"
          />
        </div>

        <div className="col-6 col-lg-3">
          <MetricCard
            title="Low-Stock Alerts"
            value={`${lowStockAlerts.length} SKUs`}
            subtitle="Below safety reorder point"
            icon={AlertTriangle}
            color="danger"
          />
        </div>

        <div className="col-6 col-lg-3">
          <MetricCard
            title="Active Locations"
            value={`${locations.length || 3} Hubs`}
            subtitle="Central, North & South"
            icon={MapPin}
            color="info"
          />
        </div>
      </div>

      {/* Regional Warehouses Grid */}
      <div className="mb-4">
        <h5 className="fw-bold text-dark mb-3" style={{ fontSize: '1.1rem' }}>
          Regional Fulfillment Warehouses
        </h5>
        <div className="row g-3">
          {locations.map((loc) => {
            const locBalances = balances.filter((b) => b.locationCode === loc.locationCode);
            const totalUnits = locBalances.reduce((acc, b) => acc + parseFloat(b.quantityOnHand || 0), 0);
            return (
              <div key={loc.id} className="col-12 col-md-4">
                <div className="hc-card p-4 border-0 shadow-sm h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="badge bg-light text-primary font-monospace border">
                        {loc.locationCode}
                      </span>
                      <span className="hc-badge hc-badge-success" style={{ fontSize: '0.72rem' }}>
                        Active Hub
                      </span>
                    </div>
                    <h6 className="fw-bold text-dark mb-1">{loc.locationName}</h6>
                    <p className="text-secondary small mb-3">{loc.address}</p>
                  </div>
                  <div className="pt-2.5 border-top d-flex justify-content-between align-items-center small text-secondary">
                    <span>Stock Stored:</span>
                    <strong className="text-dark fs-6">{totalUnits} units</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Immutable Stock Movement Ledger */}
      <div className="hc-card p-4 border-0 shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div>
            <h5 className="fw-bold text-dark mb-0" style={{ fontSize: '1.1rem' }}>
              Immutable Stock-Movement Ledger
            </h5>
            <p className="text-secondary small mb-0 mt-0.5">
              Audited transaction record of all reservations, goods receipts, and technician consumptions
            </p>
          </div>
          <Link to="/inventory/balances" className="small text-primary fw-medium text-decoration-none">
            View All Balances →
          </Link>
        </div>

        <div className="table-responsive mt-3">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light text-secondary small">
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
            <tbody className="small">
              {movements.slice(0, 8).map((m) => (
                <tr key={m.id}>
                  <td className="ps-3 text-secondary" style={{ fontSize: '0.76rem' }}>
                    {new Date(m.timestamp).toLocaleString()}
                  </td>
                  <td>
                    <span className={`badge px-2 py-0.5 ${
                      m.movementType === 'GOODS_RECEIPT'
                        ? 'bg-success bg-opacity-15 text-success'
                        : m.movementType === 'RESERVATION'
                        ? 'bg-warning bg-opacity-20 text-dark'
                        : m.movementType === 'CONSUMPTION'
                        ? 'bg-primary bg-opacity-15 text-primary'
                        : 'bg-light text-secondary border'
                    }`} style={{ fontSize: '0.72rem' }}>
                      {m.movementType}
                    </span>
                  </td>
                  <td className="fw-semibold text-dark">{m.itemName}</td>
                  <td><span className="badge bg-light text-dark border font-monospace">{m.locationCode}</span></td>
                  <td className={`fw-bold ${parseFloat(m.quantity) > 0 ? 'text-success' : 'text-danger'}`}>
                    {parseFloat(m.quantity) > 0 ? `+${m.quantity}` : m.quantity}
                  </td>
                  <td className="font-monospace text-secondary" style={{ fontSize: '0.75rem' }}>{m.referenceNumber}</td>
                  <td className="pe-3 text-secondary" style={{ fontSize: '0.76rem' }}>{m.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
