import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Calendar, Clock, MapPin, Wrench, ChevronRight, PlusCircle, AlertCircle } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings');
      setBookings(res.data.data || []);
    } catch (err) {
      console.error('Failed to load bookings:', err);
      setError('Could not retrieve your bookings.');
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'ALL') return true;
    if (filter === 'ACTIVE') {
      return ['PENDING', 'ASSIGNED', 'ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'WAITING_FOR_MATERIALS'].includes(b.status);
    }
    if (filter === 'COMPLETED') return b.status === 'COMPLETED';
    if (filter === 'CANCELLED') return b.status === 'CANCELLED';
    return true;
  });

  return (
    <div className="container py-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">My Service Bookings</h2>
          <p className="text-muted mb-0">Track real-time handyman dispatch, material allocations, and invoices</p>
        </div>
        <Link to="/book" className="btn btn-primary d-inline-flex align-items-center gap-2 px-4 py-2">
          <PlusCircle size={18} /> Book New Service
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
          <AlertCircle size={18} />
          <div>{error}</div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="card shadow-sm border-0 rounded-4 mb-4">
        <div className="card-body p-2 d-flex flex-wrap gap-2">
          <button
            className={`btn btn-sm rounded-pill px-3 ${filter === 'ALL' ? 'btn-primary' : 'btn-light'}`}
            onClick={() => setFilter('ALL')}
          >
            All Bookings ({bookings.length})
          </button>
          <button
            className={`btn btn-sm rounded-pill px-3 ${filter === 'ACTIVE' ? 'btn-primary' : 'btn-light'}`}
            onClick={() => setFilter('ACTIVE')}
          >
            Active In-Progress (
            {bookings.filter((b) => ['PENDING', 'ASSIGNED', 'ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'WAITING_FOR_MATERIALS'].includes(b.status)).length}
            )
          </button>
          <button
            className={`btn btn-sm rounded-pill px-3 ${filter === 'COMPLETED' ? 'btn-primary' : 'btn-light'}`}
            onClick={() => setFilter('COMPLETED')}
          >
            Completed ({bookings.filter((b) => b.status === 'COMPLETED').length})
          </button>
          <button
            className={`btn btn-sm rounded-pill px-3 ${filter === 'CANCELLED' ? 'btn-primary' : 'btn-light'}`}
            onClick={() => setFilter('CANCELLED')}
          >
            Cancelled ({bookings.filter((b) => b.status === 'CANCELLED').length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading bookings...</span>
          </div>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 text-center py-5">
          <div className="card-body">
            <Wrench size={48} className="text-muted mb-3" />
            <h5 className="fw-bold">No bookings found</h5>
            <p className="text-muted">You have no service appointments matching the selected filter.</p>
            <Link to="/book" className="btn btn-primary px-4 py-2 mt-2">
              Book a Service Now
            </Link>
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filteredBookings.map((b) => (
            <div key={b.id} className="card border-0 shadow-sm rounded-4 overflow-hidden">
              <div className="card-body p-4">
                <div className="row align-items-center g-3">
                  <div className="col-12 col-md-4">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span className="badge bg-light text-dark border">#{b.bookingNumber}</span>
                      <StatusBadge status={b.status} />
                    </div>
                    <h5 className="fw-bold mb-1 text-primary">{b.serviceName}</h5>
                    <p className="text-muted small mb-0">{b.categoryName}</p>
                  </div>

                  <div className="col-12 col-md-4">
                    <div className="d-flex flex-column gap-1 small text-muted">
                      <div className="d-flex align-items-center gap-2">
                        <Calendar size={15} className="text-primary" />
                        <span><strong>Scheduled:</strong> {b.scheduledDate} ({b.scheduledTimeSlot})</span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <MapPin size={15} className="text-danger" />
                        <span className="text-truncate">{b.customerAddress}</span>
                      </div>
                      {b.assignedHandymanName && (
                        <div className="d-flex align-items-center gap-2 text-dark">
                          <Wrench size={15} className="text-success" />
                          <span><strong>Technician:</strong> {b.assignedHandymanName}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-12 col-md-4 d-flex flex-column align-items-md-end justify-content-between">
                    <div className="text-md-end mb-2">
                      <div className="small text-muted">Estimated Amount</div>
                      <div className="fw-bold fs-5 text-dark">
                        ${parseFloat(b.totalAmount || b.estimatedBasePrice || 0).toFixed(2)}
                      </div>
                    </div>
                    <Link
                      to={`/customer/bookings/${b.id}`}
                      className="btn btn-outline-primary d-inline-flex align-items-center gap-2 px-3 py-1 btn-sm"
                    >
                      Track Job &amp; Details <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
