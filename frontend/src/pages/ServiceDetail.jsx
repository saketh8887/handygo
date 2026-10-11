import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { 
  Wrench, Clock, DollarSign, Package, CheckCircle, ShieldCheck, 
  ArrowLeft, ArrowRight, Sparkles, Building2, Check, AlertCircle 
} from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import Skeleton from '../components/Skeleton';

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
      <div className="container py-4">
        <Skeleton width="180px" height="20px" className="mb-4" />
        <div className="row g-4">
          <div className="col-lg-8"><Skeleton height="400px" /></div>
          <div className="col-lg-4"><Skeleton height="300px" /></div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="container py-5 text-center">
        <div className="hc-card p-5 max-w-md mx-auto" style={{ maxWidth: 460 }}>
          <AlertCircle size={44} className="text-danger mx-auto mb-3" />
          <h4 className="fw-bold mb-2">Service Not Found</h4>
          <p className="text-secondary small mb-4">The requested service catalog item does not exist or has been archived.</p>
          <Link to="/services" className="btn btn-primary px-4">
            Back to Catalogue
          </Link>
        </div>
      </div>
    );
  }

  const basePrice = service.indicativeBasePrice || service.basePrice || 0;

  return (
    <div className="container py-4">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Service Catalogue', path: '/services' },
          { label: service.name }
        ]}
      />

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="hc-card p-4 p-md-5 mb-4 border-0 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-1.5 rounded-pill fw-medium" style={{ fontSize: '0.75rem' }}>
                {service.categoryName}
              </span>
              <span className="badge bg-light text-secondary font-monospace border">
                CODE: {service.code}
              </span>
            </div>

            <h1 className="fw-bold text-dark mb-2" style={{ fontSize: '1.8rem', letterSpacing: '-0.02em' }}>
              {service.name}
            </h1>
            <p className="text-secondary lead fs-6 mb-4" style={{ lineHeight: '1.6' }}>
              {service.description}
            </p>

            {/* Quick Metrics */}
            <div className="row g-3 mb-4">
              <div className="col-sm-6">
                <div className="p-3 bg-light rounded-3 border d-flex align-items-center gap-3">
                  <div className="rounded-circle bg-success bg-opacity-10 text-success p-2.5">
                    <DollarSign size={22} />
                  </div>
                  <div>
                    <div className="text-secondary small">Indicative Base Labor</div>
                    <h4 className="fw-bold mb-0 text-success">${parseFloat(basePrice).toFixed(2)}</h4>
                  </div>
                </div>
              </div>

              <div className="col-sm-6">
                <div className="p-3 bg-light rounded-3 border d-flex align-items-center gap-3">
                  <div className="rounded-circle bg-primary bg-opacity-10 text-primary p-2.5">
                    <Clock size={22} />
                  </div>
                  <div>
                    <div className="text-secondary small">Standard Duration</div>
                    <h4 className="fw-bold mb-0 text-primary">{service.estimatedDurationMinutes} mins</h4>
                  </div>
                </div>
              </div>
            </div>

            {/* Technician Qualifications */}
            <h5 className="fw-bold text-dark mb-2" style={{ fontSize: '1.1rem' }}>
              Technician Certification Required
            </h5>
            <div className="p-3 bg-light rounded-3 border mb-4 d-flex align-items-center gap-2.5">
              <ShieldCheck className="text-primary flex-shrink-0" size={20} />
              <span className="small text-dark fw-medium">
                {service.requiredSkills || 'Standard Certified General Tradesperson (Class A Verified)'}
              </span>
            </div>

            {/* Bill of Materials */}
            <h5 className="fw-bold text-dark mb-1" style={{ fontSize: '1.1rem' }}>
              Pre-Allocated Bill of Materials (BOM)
            </h5>
            <p className="text-secondary small mb-3">
              HandyConnect coordinates spare-parts availability across distribution hubs before confirming technician dispatch.
            </p>

            <div className="table-responsive border rounded-3 overflow-hidden">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-secondary small">
                  <tr>
                    <th>Item SKU</th>
                    <th>Material Name</th>
                    <th>Standard Qty</th>
                    <th>Unit Est.</th>
                    <th>Logistics Status</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {service.standardMaterials && service.standardMaterials.length > 0 ? (
                    service.standardMaterials.map((m) => (
                      <tr key={m.id}>
                        <td className="font-monospace text-primary">{m.itemSku}</td>
                        <td className="fw-semibold text-dark">{m.itemName}</td>
                        <td>{m.standardQuantity} {m.unitOfMeasure}</td>
                        <td>${m.unitPrice ? parseFloat(m.unitPrice).toFixed(2) : '0.00'}</td>
                        <td>
                          <span className="hc-badge hc-badge-success" style={{ fontSize: '0.72rem' }}>
                            <Check size={11} className="me-0.5" /> Warehouse Reserved
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center text-secondary py-4">
                        No standard materials required for this diagnostic repair service.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sticky Booking CTA */}
        <div className="col-lg-4">
          <div className="hc-card p-4 border-0 shadow-sm sticky-top" style={{ top: '85px' }}>
            <span className="badge bg-success bg-opacity-15 text-success px-2.5 py-1 rounded-pill fw-semibold mb-2" style={{ fontSize: '0.75rem' }}>
              GUARANTEED APPOINTMENT
            </span>
            <h5 className="fw-bold text-dark mb-2">Book This Service</h5>
            <p className="text-secondary small mb-4">
              Select your preferred time slot and receive immediate technician matching.
            </p>

            <div className="p-3 bg-light rounded-3 mb-4 border">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-secondary small">Labor Base Rate:</span>
                <span className="fw-bold text-dark">${parseFloat(basePrice).toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-secondary small">Estimated Parts:</span>
                <span className="text-secondary small">Itemized on site</span>
              </div>
              <hr className="my-2" />
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-bold text-dark small">Starting From:</span>
                <span className="fw-bold fs-5 text-primary">${parseFloat(basePrice).toFixed(2)}</span>
              </div>
            </div>

            <Link
              to={`/book?serviceId=${service.id}`}
              className="btn btn-primary w-100 py-2.5 rounded-3 fw-medium d-flex align-items-center justify-content-center gap-2 shadow-sm mb-3"
            >
              <span>Schedule Service Now</span>
              <ArrowRight size={16} />
            </Link>

            <div className="d-flex flex-column gap-2 text-secondary" style={{ fontSize: '0.78rem' }}>
              <div className="d-flex align-items-center gap-2">
                <ShieldCheck size={15} className="text-success flex-shrink-0" />
                <span>100% Background-checked tradespeople</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <Building2 size={15} className="text-primary flex-shrink-0" />
                <span>Regional warehouse spare parts pre-locked</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
