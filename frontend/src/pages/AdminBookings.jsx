import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { 
  Activity, Calendar, Clock, MapPin, Wrench, UserCheck, 
  Search, Filter, CheckCircle2, AlertCircle, ChevronRight, Eye
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [handymen, setHandymen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Assignment Modal
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedHandymanId, setSelectedHandymanId] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchBookingsAndHandymen();
  }, []);

  const fetchBookingsAndHandymen = async () => {
    try {
      setLoading(true);
      const [bookRes, hmRes] = await Promise.allSettled([
        api.get('/bookings'),
        api.get('/admin/handymen'),
      ]);

      if (bookRes.status === 'fulfilled') {
        setBookings(bookRes.value.data.data || []);
      }
      if (hmRes.status === 'fulfilled') {
        setHandymen(hmRes.value.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load dispatch data:', err);
      setError('Could not load bookings.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAssignModal = (b) => {
    setSelectedBooking(b);
    if (handymen.length > 0) {
      setSelectedHandymanId(handymen[0].id.toString());
    }
  };

  const handleAssignHandyman = async (e) => {
    e.preventDefault();
    if (!selectedHandymanId) return;

    try {
      setAssigning(true);
      setError('');
      await api.post(`/bookings/${selectedBooking.id}/assign`, {
        handymanId: parseInt(selectedHandymanId, 10),
      });
      setSuccess(`Technician assigned to booking #${selectedBooking.bookingNumber}!`);
      setSelectedBooking(null);
      fetchBookingsAndHandymen();
    } catch (err) {
      console.error('Assignment error:', err);
      setError(err.response?.data?.message || 'Failed to assign handyman.');
    } finally {
      setAssigning(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesFilter =
      filter === 'ALL'
        ? true
        : filter === 'PENDING'
        ? b.status === 'PENDING'
        : filter === 'ASSIGNED'
        ? b.status === 'ASSIGNED'
        : filter === 'IN_PROGRESS'
        ? ['ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'WAITING_FOR_MATERIALS'].includes(b.status)
        : filter === 'COMPLETED'
        ? b.status === 'COMPLETED'
        : true;

    const matchesSearch =
      searchQuery === '' ||
      b.bookingNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.serviceName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customerAddress?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-1 rounded-pill fw-semibold mb-1">
            Dispatch Coordination Center
          </span>
          <h2 className="fw-bold mb-1">Service Dispatch Board</h2>
          <p className="text-muted mb-0">Monitor open customer appointments and coordinate qualified technician assignments</p>
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

      {/* Filter and Search Bar */}
      <div className="card shadow-sm border-0 rounded-4 mb-4">
        <div className="card-body p-3">
          <div className="row g-3 align-items-center">
            <div className="col-12 col-md-6 col-lg-4">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <Search size={18} className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by #, service, customer or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-8">
              <div className="d-flex flex-wrap gap-2 justify-content-md-end">
                <button
                  className={`btn btn-sm rounded-pill px-3 ${filter === 'ALL' ? 'btn-primary' : 'btn-light'}`}
                  onClick={() => setFilter('ALL')}
                >
                  All ({bookings.length})
                </button>
                <button
                  className={`btn btn-sm rounded-pill px-3 ${filter === 'PENDING' ? 'btn-warning text-dark' : 'btn-light'}`}
                  onClick={() => setFilter('PENDING')}
                >
                  Pending Dispatch ({bookings.filter((b) => b.status === 'PENDING').length})
                </button>
                <button
                  className={`btn btn-sm rounded-pill px-3 ${filter === 'ASSIGNED' ? 'btn-info text-white' : 'btn-light'}`}
                  onClick={() => setFilter('ASSIGNED')}
                >
                  Assigned ({bookings.filter((b) => b.status === 'ASSIGNED').length})
                </button>
                <button
                  className={`btn btn-sm rounded-pill px-3 ${filter === 'IN_PROGRESS' ? 'btn-primary' : 'btn-light'}`}
                  onClick={() => setFilter('IN_PROGRESS')}
                >
                  In Progress ({bookings.filter((b) => ['ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'WAITING_FOR_MATERIALS'].includes(b.status)).length})
                </button>
                <button
                  className={`btn btn-sm rounded-pill px-3 ${filter === 'COMPLETED' ? 'btn-success' : 'btn-light'}`}
                  onClick={() => setFilter('COMPLETED')}
                >
                  Completed ({bookings.filter((b) => b.status === 'COMPLETED').length})
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading dispatch board...</span>
          </div>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 text-center py-5">
          <div className="card-body">
            <Activity size={48} className="text-muted mb-3" />
            <h5 className="fw-bold">No bookings found</h5>
            <p className="text-muted">No appointments matching current criteria.</p>
          </div>
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">Booking #</th>
                  <th>Service &amp; Category</th>
                  <th>Customer &amp; Location</th>
                  <th>Scheduled Slot</th>
                  <th>Assigned Technician</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((b) => (
                  <tr key={b.id}>
                    <td className="ps-4 fw-bold">#{b.bookingNumber}</td>
                    <td>
                      <div className="fw-semibold text-primary">{b.serviceName}</div>
                      <div className="small text-muted">{b.categoryName}</div>
                    </td>
                    <td>
                      <div className="fw-semibold">{b.customerName || 'Customer'}</div>
                      <div className="small text-muted text-truncate" style={{ maxWidth: 220 }}>
                        {b.customerAddress}
                      </div>
                    </td>
                    <td>
                      <div className="small">{b.scheduledDate}</div>
                      <div className="small text-muted">{b.scheduledTimeSlot}</div>
                    </td>
                    <td>
                      {b.assignedHandymanName ? (
                        <span className="badge bg-light text-dark border">
                          <Wrench size={12} className="me-1 text-primary" /> {b.assignedHandymanName}
                        </span>
                      ) : (
                        <span className="badge bg-warning text-dark">Unassigned</span>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="fw-bold text-dark">
                      ${parseFloat(b.totalAmount || b.estimatedBasePrice || 0).toFixed(2)}
                    </td>
                    <td className="text-end pe-4">
                      <div className="d-flex justify-content-end gap-1">
                        {b.status === 'PENDING' && (
                          <button
                            className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1"
                            onClick={() => handleOpenAssignModal(b)}
                          >
                            <UserCheck size={14} /> Assign
                          </button>
                        )}
                        <Link
                          to={`/customer/bookings/${b.id}`}
                          className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1"
                          title="View Details & Job Readiness"
                        >
                          <Eye size={14} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Technician Assignment Modal */}
      {selectedBooking && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  Assign Technician to Booking #{selectedBooking.bookingNumber}
                </h5>
                <button type="button" className="btn-close" onClick={() => setSelectedBooking(null)}></button>
              </div>
              <form onSubmit={handleAssignHandyman}>
                <div className="modal-body p-4">
                  <div className="p-3 bg-light rounded-3 mb-4">
                    <div className="row g-2">
                      <div className="col-md-6">
                        <span className="text-muted small">Service:</span>
                        <div className="fw-bold">{selectedBooking.serviceName}</div>
                      </div>
                      <div className="col-md-6">
                        <span className="text-muted small">Location:</span>
                        <div className="fw-semibold">{selectedBooking.customerAddress}</div>
                      </div>
                      <div className="col-12 mt-2">
                        <span className="text-muted small">Issue Description:</span>
                        <div className="small text-dark">{selectedBooking.problemDescription}</div>
                      </div>
                    </div>
                  </div>

                  <h6 className="fw-bold mb-3">Qualified Technicians Available for Dispatch</h6>
                  <div className="d-flex flex-column gap-2 mb-3">
                    {handymen.map((hm) => (
                      <label
                        key={hm.id}
                        className={`p-3 border rounded-3 d-flex align-items-center justify-content-between cursor-pointer ${
                          selectedHandymanId.toString() === hm.id.toString()
                            ? 'border-primary bg-primary bg-opacity-10'
                            : 'bg-white'
                        }`}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="d-flex align-items-center gap-3">
                          <input
                            type="radio"
                            name="handymanRadio"
                            checked={selectedHandymanId.toString() === hm.id.toString()}
                            onChange={() => setSelectedHandymanId(hm.id.toString())}
                          />
                          <div>
                            <div className="fw-bold text-dark d-flex align-items-center gap-2">
                              {hm.fullName}
                              {hm.isVerified && <span className="badge bg-success small">Verified</span>}
                            </div>
                            <div className="small text-muted">
                              {hm.phone} | ${parseFloat(hm.hourlyRate || 40).toFixed(2)}/hr | {hm.experienceYears || 3} yrs exp
                            </div>
                            <div className="small text-primary mt-1">
                              Zones: {hm.serviceAreas || 'Metro Wide'}
                            </div>
                          </div>
                        </div>
                        <div className="text-end">
                          <span className="badge bg-success bg-opacity-10 text-success border border-success">
                            95% Match Score
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setSelectedBooking(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4" disabled={assigning}>
                    {assigning ? 'Dispatching...' : 'Confirm Technician Assignment'}
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
