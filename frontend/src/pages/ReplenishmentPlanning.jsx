import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { 
  ShoppingCart, RefreshCw, ArrowRightLeft, TrendingUp, AlertTriangle, 
  CheckCircle2, AlertCircle, Calculator, Package, Check, ArrowRight,
  Sparkles, Layers
} from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

export default function ReplenishmentPlanning() {
  const { showToast } = useToast();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/procurement/reorder-recommendations');
      setRecommendations(res.data.data || []);
    } catch (err) {
      console.error('Failed to load replenishment recommendations:', err);
      setError('Could not compute replenishment recommendations.');
      showToast('Could not load replenishment recommendations.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequisition = async (rec) => {
    try {
      setProcessingId(rec.itemId);
      setError('');
      await api.post('/procurement/requisitions', {
        itemId: rec.itemId,
        locationId: rec.locationId,
        suggestedQuantity: rec.suggestedOrderQuantity,
        reason: `Auto replenishment (Available: ${rec.availableQuantity}, ROP: ${rec.reorderPoint})`,
      });
      showToast(`Purchase requisition created for ${rec.itemName}!`, 'success');
      fetchRecommendations();
    } catch (err) {
      console.error('Requisition error:', err);
      const msg = err.response?.data?.message || 'Failed to create requisition.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRequestTransfer = async (rec) => {
    try {
      setProcessingId(rec.itemId);
      setError('');
      await api.post('/procurement/transfers', {
        itemId: rec.itemId,
        fromLocationId: rec.suggestedSourceLocationId || 1,
        toLocationId: rec.locationId,
        quantity: rec.suggestedOrderQuantity,
        reason: `Regional inventory balancing transfer for ${rec.itemName}`,
      });
      showToast(`Stock transfer requested from Central Hub to ${rec.locationCode}!`, 'success');
      fetchRecommendations();
    } catch (err) {
      console.error('Transfer error:', err);
      const msg = err.response?.data?.message || 'Failed to request transfer.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="container py-4">
      <Breadcrumb
        items={[
          { label: 'Inventory Command', path: '/inventory' },
          { label: 'Automated Replenishment Planning' }
        ]}
      />

      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-primary bg-opacity-10 text-primary px-2.5 py-1 rounded-pill fw-semibold" style={{ fontSize: '0.75rem' }}>
              ALGORITHMIC MATERIAL OPTIMIZATION
            </span>
          </div>
          <h2 className="fw-bold text-dark mb-0" style={{ letterSpacing: '-0.02em' }}>
            Automated Replenishment Planning
          </h2>
          <p className="text-secondary small mb-0 mt-0.5">
            Deterministic reorder point (ROP) analytics &amp; inter-warehouse stock sharing
          </p>
        </div>

        <div className="d-flex gap-2">
          <Link to="/inventory/transfers" className="btn btn-outline-primary btn-sm px-3 py-2 rounded-3 d-inline-flex align-items-center gap-1.5 fw-medium">
            <ArrowRightLeft size={16} /> Inter-Warehouse Transfers
          </Link>
          <Link to="/inventory/orders" className="btn btn-primary btn-sm px-3 py-2 rounded-3 d-inline-flex align-items-center gap-1.5 shadow-sm fw-medium">
            <ShoppingCart size={16} /> Purchase Orders
          </Link>
        </div>
      </div>

      {/* Formula Explanation Card */}
      <div className="hc-card p-4 mb-4 border-0 shadow-sm bg-light">
        <div className="d-flex align-items-center gap-2 mb-2 text-primary fw-bold" style={{ fontSize: '0.92rem' }}>
          <Calculator size={18} /> Deterministic Reorder Point (ROP) &amp; Multi-Hub Optimization Logic
        </div>
        <div className="p-3 bg-white rounded-3 border font-monospace text-dark small" style={{ fontSize: '0.8rem', lineHeight: '1.7' }}>
          <strong>Reorder Point (ROP)</strong> = (Average Daily Demand &times; Supplier Lead Time in Days) + Safety Stock
          <br />
          <strong>Optimization Rule:</strong> If Available Stock &le; ROP, our engine evaluates regional hubs with surplus stock. If surplus is detected, it prioritizes an <em>Inter-Warehouse Transfer</em> to eliminate vendor lead time and reduce procurement costs.
        </div>
      </div>

      {error && (
        <div className="alert alert-danger rounded-3 border-0 shadow-sm mb-4 small">
          {error}
        </div>
      )}

      {/* Recommendations Grid / Table */}
      {loading ? (
        <div className="d-flex flex-column gap-3">
          {[1, 2, 3].map(n => (
            <div key={n} className="hc-card p-4">
              <Skeleton height="80px" />
            </div>
          ))}
        </div>
      ) : recommendations.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="All stock levels optimal"
          description="No materials currently sit below their calculated reorder points across any warehouse hub."
        />
      ) : (
        <div className="d-flex flex-column gap-3">
          {recommendations.map((rec) => {
            const isTransferFeasible = rec.canTransferFromOtherLocation;
            return (
              <div
                key={`${rec.itemId}-${rec.locationId}`}
                className={`hc-card p-4 border-0 shadow-sm border-start border-4 transition-all ${
                  isTransferFeasible ? 'border-primary' : 'border-warning'
                }`}
              >
                <div className="row align-items-center g-3">
                  <div className="col-12 col-md-5">
                    <div className="d-flex flex-wrap align-items-center gap-2 mb-1.5">
                      <span className="badge bg-light text-primary font-monospace border" style={{ fontSize: '0.74rem' }}>
                        {rec.sku}
                      </span>
                      <span className="badge bg-light text-secondary border font-monospace" style={{ fontSize: '0.74rem' }}>
                        {rec.locationCode}
                      </span>
                      <span className={`badge px-2 py-0.5 ${isTransferFeasible ? 'bg-primary bg-opacity-15 text-primary' : 'bg-warning bg-opacity-20 text-dark'}`} style={{ fontSize: '0.72rem' }}>
                        {isTransferFeasible ? 'TRANSFER RECOMMENDED' : 'SUPPLIER PO REQUIRED'}
                      </span>
                    </div>

                    <h5 className="fw-bold text-dark mb-1" style={{ fontSize: '1.1rem' }}>
                      {rec.itemName}
                    </h5>

                    <div className="small text-secondary">
                      Available: <strong className="text-dark">{rec.availableQuantity}</strong> units (On Hand: {rec.quantityOnHand}, Reserved: {rec.reservedQuantity})
                    </div>
                    <div className="small text-danger mt-0.5">
                      Safety Threshold: <strong>{rec.reorderPoint}</strong> units (Deficit: {rec.reorderPoint - rec.availableQuantity})
                    </div>
                  </div>

                  <div className="col-12 col-md-4">
                    <div className="p-3 bg-light rounded-3 small border">
                      <div className="fw-semibold text-dark mb-1" style={{ fontSize: '0.78rem' }}>Algorithmic Assessment:</div>
                      <p className="text-secondary mb-0" style={{ fontSize: '0.78rem', lineHeight: '1.5' }}>
                        {rec.explanation}
                      </p>
                    </div>
                  </div>

                  <div className="col-12 col-md-3 text-md-end">
                    <div className="mb-2">
                      <div className="small text-secondary" style={{ fontSize: '0.75rem' }}>Suggested Order Quantity</div>
                      <div className="fw-bold fs-5 text-dark">{rec.suggestedOrderQuantity} units</div>
                    </div>

                    {isTransferFeasible ? (
                      <button
                        className="btn btn-primary btn-sm px-3 py-1.5 rounded-3 d-inline-flex align-items-center gap-1.5 fw-medium shadow-sm"
                        disabled={processingId === rec.itemId}
                        onClick={() => handleRequestTransfer(rec)}
                      >
                        <ArrowRightLeft size={15} /> Request Transfer
                      </button>
                    ) : (
                      <button
                        className="btn btn-warning btn-sm px-3 py-1.5 rounded-3 d-inline-flex align-items-center gap-1.5 text-dark fw-medium"
                        disabled={processingId === rec.itemId}
                        onClick={() => handleCreateRequisition(rec)}
                      >
                        <ShoppingCart size={15} /> Create Requisition
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
