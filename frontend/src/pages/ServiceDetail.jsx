import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { Wrench, Clock, DollarSign, Package, CheckCircle, ShieldCheck, ArrowLeft, ArrowRight } from 'lucide-react';

export const ServiceDetail = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await api.get(`/services/${id}`);
        if (res.data?.data) {
          setService(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load service', err);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-warning">Service not found.</div>
        <Link to="/services" className="btn btn-primary rounded-pill">
          Back to Catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <Link to="/services" className="btn btn-outline-secondary btn-sm rounded-pill mb-4 d-inline-flex align-items-center gap-1">
        <ArrowLeft size={16} /> Back to Services
      </Link>

      <div className="row gy-4">
        <div className="col-lg-8">
          <div className="card p-4 shadow-sm border-0 mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1 rounded-pill">
                {service.categoryName}
              </span>
              <span className="text-muted small">Code: {service.code}</span>
            </div>

            <h2 className="fw-bold mb-3">{service.name}</h2>
            <p className="text-secondary lead fs-6 mb-4">{service.description}</p>

            <div className="row g-3 mb-4">
              <div className="col-sm-6">
                <div className="bg-light p-3 rounded-3 border d-flex align-items-center gap-3">
                  <div className="bg-success text-white p-2 rounded-2">
                    <DollarSign size={24} />
                  </div>
                  <div>
                    <div className="text-muted small">Indicative Base Labour</div>
                    <h4 className="fw-bold mb-0 text-success">${service.indicativeBasePrice.toFixed(2)}</h4>
                  </div>
                </div>
              </div>

              <div className="col-sm-6">
                <div className="bg-light p-3 rounded-3 border d-flex align-items-center gap-3">
                  <div className="bg-primary text-white p-2 rounded-2">
                    <Clock size={24} />
                  </div>
                  <div>
                    <div className="text-muted small">Estimated Duration</div>
                    <h4 className="fw-bold mb-0 text-primary">{service.estimatedDurationMinutes} mins</h4>
                  </div>
                </div>
              </div>
            </div>

            <h5 className="fw-bold mb-3">Technician Qualifications Required</h5>
            <div className="bg-light p-3 rounded-3 border mb-4">
              <div className="d-flex align-items-center gap-2 text-dark small">
                <ShieldCheck className="text-primary" size={20} />
                <span>{service.requiredSkills || 'Standard Certified Technician'}</span>
              </div>
            </div>

            <h5 className="fw-bold mb-3">Pre-Allocated Bill of Materials</h5>
            <p className="text-muted small mb-3">
              HandyConnect guarantees that these required spare parts are verified in stock and reserved prior to the appointment window.
            </p>

            <div className="table-responsive">
              <table className="table table-bordered table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Item SKU</th>
                    <th>Material Name</th>
                    <th>Standard Qty</th>
                    <th>Unit Est.</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {service.standardMaterials && service.standardMaterials.length > 0 ? (
                    service.standardMaterials.map((m) => (
                      <tr key={m.id}>
                        <td><code>{m.itemSku}</code></td>
                        <td className="fw-semibold">{m.itemName}</td>
                        <td>{m.standardQuantity} {m.unitOfMeasure}</td>
                        <td>${m.unitPrice ? m.unitPrice.toFixed(2) : '0.00'}</td>
                        <td>
                          <span className="badge bg-success-subtle text-success border border-success-subtle">
                            Stock Reserved on Booking
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center text-muted py-3">
                        No standard materials required for this diagnostic service.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card p-4 shadow-sm border-0 sticky-top" style={{ top: '90px' }}>
            <h5 className="fw-bold mb-3">Ready to Schedule?</h5>
            <p className="text-muted small mb-4">
              Select an available time slot, choose your service address, and preview real-time technician and inventory readiness.
            </p>

            <div className="d-flex flex-column gap-2 mb-4">
              <div className="d-flex align-items-center gap-2 small text-secondary">
                <CheckCircle size={16} className="text-success" />
                <span>No cancellation fees up to 2 hours before</span>
              </div>
              <div className="d-flex align-items-center gap-2 small text-secondary">
                <CheckCircle size={16} className="text-success" />
                <span>Parts invoiced strictly upon consumption</span>
              </div>
              <div className="d-flex align-items-center gap-2 small text-secondary">
                <CheckCircle size={16} className="text-success" />
                <span>Simulated secure payment workflow</span>
              </div>
            </div>

            <Link
              to={`/book?serviceId=${service.id}`}
              className="btn btn-primary btn-lg rounded-pill w-100 d-flex align-items-center justify-content-center gap-2 shadow-sm"
            >
              <span>Book Appointment</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
