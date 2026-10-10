import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  ShieldCheck, ShieldAlert, Wrench, Phone, Mail, CheckCircle2, 
  XCircle, AlertCircle, Eye, DollarSign, Star
} from 'lucide-react';

export default function AdminHandymen() {
  const [handymen, setHandymen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedHandyman, setSelectedHandyman] = useState(null);

  useEffect(() => {
    fetchHandymen();
  }, []);

  const fetchHandymen = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/handymen');
      setHandymen(res.data.data || []);
    } catch (err) {
      console.error('Failed to load handymen:', err);
      setError('Could not retrieve technician list.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id, approved) => {
    try {
      setError('');
      await api.post(`/admin/handymen/${id}/verify`, { approved });
      setSuccess(`Technician status updated to ${approved ? 'VERIFIED' : 'UNVERIFIED'}.`);
      fetchHandymen();
    } catch (err) {
      console.error('Verification failed:', err);
      setError('Failed to update verification status.');
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="badge bg-danger bg-opacity-10 text-danger px-3 py-1 rounded-pill fw-semibold mb-1">
            Workforce Compliance
          </span>
          <h2 className="fw-bold mb-1">Handyman Onboarding &amp; Verification</h2>
          <p className="text-muted mb-0">Review technician credentials, certificates, and license authorizations</p>
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

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading handymen...</span>
          </div>
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">Technician Name</th>
                  <th>Contact Details</th>
                  <th>Rate &amp; Experience</th>
                  <th>Service Coverage</th>
                  <th>Verification Status</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {handymen.map((hm) => (
                  <tr key={hm.id}>
                    <td className="ps-4">
                      <div className="fw-bold text-dark">{hm.fullName}</div>
                      <div className="small text-muted">★ {parseFloat(hm.ratingAverage || 5.0).toFixed(1)} rating ({hm.totalJobsCompleted || 0} jobs)</div>
                    </td>
                    <td>
                      <div className="small">{hm.email}</div>
                      <div className="small text-muted">{hm.phone}</div>
                    </td>
                    <td>
                      <div className="fw-semibold text-success">${parseFloat(hm.hourlyRate || 40).toFixed(2)}/hr</div>
                      <div className="small text-muted">{hm.experienceYears || 0} years in trade</div>
                    </td>
                    <td>
                      <div className="small text-truncate" style={{ maxWidth: 200 }}>
                        {hm.serviceAreas || 'Central Metro'}
                      </div>
                    </td>
                    <td>
                      {hm.isVerified ? (
                        <span className="badge bg-success bg-opacity-10 text-success border border-success d-inline-flex align-items-center gap-1">
                          <CheckCircle2 size={12} /> Verified &amp; Active
                        </span>
                      ) : (
                        <span className="badge bg-warning bg-opacity-10 text-warning border border-warning d-inline-flex align-items-center gap-1">
                          <AlertCircle size={12} /> Pending Review
                        </span>
                      )}
                    </td>
                    <td className="text-end pe-4">
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1"
                          onClick={() => setSelectedHandyman(hm)}
                        >
                          <Eye size={14} /> Details
                        </button>
                        {hm.isVerified ? (
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleVerify(hm.id, false)}
                            title="Revoke Verification"
                          >
                            Revoke
                          </button>
                        ) : (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleVerify(hm.id, true)}
                          >
                            Approve
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

      {/* Technician Profile Viewer Modal */}
      {selectedHandyman && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Technician Profile: {selectedHandyman.fullName}</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedHandyman(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <span className="text-muted small">Hourly Rate</span>
                    <h5 className="fw-bold text-success">${parseFloat(selectedHandyman.hourlyRate || 40).toFixed(2)} / hour</h5>
                  </div>
                  <div className="col-md-6">
                    <span className="text-muted small">Experience</span>
                    <h5 className="fw-bold">{selectedHandyman.experienceYears} Years in Trade</h5>
                  </div>
                  <div className="col-12">
                    <span className="text-muted small">Coverage Zones</span>
                    <div className="fw-semibold">{selectedHandyman.serviceAreas}</div>
                  </div>
                  <div className="col-12">
                    <span className="text-muted small">Professional Bio &amp; Background</span>
                    <div className="p-3 bg-light rounded-3 small">{selectedHandyman.bio || 'No bio provided'}</div>
                  </div>
                </div>

                <h6 className="fw-bold mb-2">Registered Skills &amp; Certifications</h6>
                {selectedHandyman.skills?.length > 0 ? (
                  <div className="d-flex flex-column gap-2">
                    {selectedHandyman.skills.map((s) => (
                      <div key={s.id} className="p-2 border rounded-2 d-flex justify-content-between align-items-center small">
                        <div>
                          <strong>{s.skillName}</strong>
                          <span className="badge bg-secondary ms-2">{s.proficiencyLevel}</span>
                          {s.certificationName && <span className="text-success ms-2">({s.certificationName})</span>}
                        </div>
                        <span className="text-muted">{s.yearsExperience} yrs</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted small">No specific skills enumerated.</p>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setSelectedHandyman(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
