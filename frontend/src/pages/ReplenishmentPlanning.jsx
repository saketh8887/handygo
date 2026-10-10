import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { 
  ShoppingCart, RefreshCw, ArrowRightLeft, TrendingUp, AlertTriangle, 
  CheckCircle2, AlertCircle, Calculator, Package, Check, ArrowRight
} from 'lucide-react';

export default function ReplenishmentPlanning() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
      setSuccess(`Purchase requisition created for ${rec.itemName}!`);
      fetchRecommendations();
    } catch (err) {
      console.error('Requisition error:', err);
      setError(err.response?.data?.message || 'Failed to create requisition.');
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
        fromLocationId: rec.suggestedSourceLocationId || 1, // Central Hub
        toLocationId: rec.locationId,
        quantity: rec.suggestedOrderQuantity,
        reason: `Regional inventory balancing transfer for ${rec.itemName}`,
      });
      setSuccess(`Stock transfer requested from Central Hub to ${rec.locationCode}!`);
      fetchRecommendations();
    } catch (err) {
      console.error('Transfer error:', err);
      setError(err.response?.data?.message || 'Failed to request transfer.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-1 rounded-pill fw-semibold mb-1">
            Algorithmic Material Optimization
          </span>
          <h2 className="fw-bold mb-1">Automated Replenishment Planning</h2>
          <p className="text-muted mb-0">Deterministic reorder point calculation &amp; inter-warehouse inventory sharing</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/inventory/transfers" className="btn btn-outline-primary d-inline-flex align-items-center gap-2">
            <ArrowRightLeft size={18} /> View Transfers
          </Link>
          <Link to="/inventory/orders" className="btn btn-primary d-inline-flex align-items-center gap-2">
            <ShoppingCart size={18} /> Purchase Orders
          </Link>
        </div>
      </div>

      {/* Formula Explanation Card */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-light">
        <div className="d-flex align-items-center gap-2 mb-2 text-primary fw-bold">
          <Calculator size={20} /> Reorder Point (ROP) &amp; Transfer Optimization Engine
        </div>
        <div className="p-3 bg-white rounded-3 border mb-2 font-monospace text-dark small">
          <strong>Reorder Point</strong> = (Average Daily Demand &times; Supplier Lead Time in Days) + Safety Stock
          <br />
          <strong>Multi-Location Decision Rule:</strong> If Available Stock &le; ROP, first evaluate regional hubs with surplus stock. If surplus exists, prioritize an <em>Inter-Warehouse Transfer</em> to eliminate supplier lead time and procurement cost.
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

      {/* Recommendations Grid / Table */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Calculating replenishment models...</span>
          </div>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 text-center py-5">
          <div className="card-body">
            <CheckCircle2 size={48} className="text-success mb-3" />
            <h5 className="fw-bold">All Stock Levels Optimal</h5>
            <p className="text-muted">No materials currently sit below their calculated reorder points across any warehouse.</p>
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {recommendations.map((rec) => {
            const isTransferFeasible = rec.canTransferFromOtherLocation;
            return (
              <div
                key={`${rec.itemId}-${rec.locationId}`}
                className={`card border-0 shadow-sm rounded-4 overflow-hidden border-start border-4 ${
                  isTransferFeasible ? 'border-primary' : 'border-warning'
                }`}
              >
                <div className="card-body p-4">
                  <div className="row align-items-center g-3">
                    <div className="col-12 col-md-5">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <span className="badge bg-light text-dark border">{rec.sku}</span>
                        <span className="badge bg-secondary">{rec.locationCode}</span>
                        <span className={`badge ${isTransferFeasible ? 'bg-primary' : 'bg-warning text-dark'}`}>
                          {isTransferFeasible ? 'TRANSFER RECOMMENDED' : 'SUPPLIER PO RECOMMENDED'}
                        </span>
                      </div>
                      <h5 className="fw-bold text-dark mb-1">{rec.itemName}</h5>
                      <div className="small text-muted">
                        Available: <strong>{rec.availableQuantity}</strong> units (On Hand: {rec.quantityOnHand}, Reserved: {rec.reservedQuantity})
                      </div>
                      <div className="small text-danger mt-1">
                        Reorder Point: <strong>{rec.reorderPoint}</strong> units (Deficit: {rec.reorderPoint - rec.availableQuantity})
                      </div>
                    </div>

                    <div className="col-12 col-md-4">
                      <div className="p-3 bg-light rounded-3 small">
                        <div className="fw-bold text-dark mb-1">Explainable AI Recommendation:</div>
                        <p className="text-muted mb-0">{rec.explanation}</p>
                      </div>
                    </div>

                    <div className="col-12 col-md-3 text-md-end">
                      <div className="mb-2">
                        <div className="small text-muted">Suggested Quantity</div>
                        <div className="fw-bold fs-5 text-dark">{rec.suggestedOrderQuantity} units</div>
                      </div>

                      {isTransferFeasible ? (
                        <button
                          className="btn btn-primary btn-sm d-inline-flex align-items-center gap-2"
                          disabled={processingId === rec.itemId}
                          onClick={() => handleRequestTransfer(rec)}
                        >
                          <ArrowRightLeft size={16} /> Request Transfer
                        </button>
                      ) : (
                        <button
                          className="btn btn-warning btn-sm d-inline-flex align-items-center gap-2 text-dark"
                          disabled={processingId === rec.itemId}
                          onClick={() => handleCreateRequisition(rec)}
                        >
                          <ShoppingCart size={16} /> Create Requisition
                        </button>
                      )}
                    </div>
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
