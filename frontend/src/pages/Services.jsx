import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { Search, Clock, DollarSign, Package, ArrowRight, CheckCircle2 } from 'lucide-react';

export const Services = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(Number(categoryParam));
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, srvRes] = await Promise.all([
          api.get('/categories'),
          api.get('/services')
        ]);
        if (catRes.data?.data) setCategories(catRes.data.data);
        if (srvRes.data?.data) setServices(srvRes.data.data);
      } catch (err) {
        console.error('Failed to load services', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredServices = services.filter((s) => {
    const matchesCategory = selectedCategory ? s.categoryId === selectedCategory : true;
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill mb-2">
          Service Catalogue & Quotations
        </span>
        <h1 className="fw-bold">Standardized Home Repair Services</h1>
        <p className="text-muted mx-auto" style={{ maxWidth: '650px' }}>
          Explore our certified repair offerings with transparent indicative base pricing, estimated durations, and pre-allocated standard spare parts.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="row g-3 mb-4 justify-content-between align-items-center">
        <div className="col-md-5">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0">
              <Search size={18} className="text-muted" />
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search by service name or problem..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="col-md-7 d-flex flex-wrap gap-2 justify-content-md-end">
          <button
            className={`btn btn-sm rounded-pill px-3 ${
              selectedCategory === null ? 'btn-primary' : 'btn-outline-secondary'
            }`}
            onClick={() => setSelectedCategory(null)}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              className={`btn btn-sm rounded-pill px-3 ${
                selectedCategory === c.id ? 'btn-primary' : 'btn-outline-secondary'
              }`}
              onClick={() => setSelectedCategory(c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="alert alert-info text-center py-5 rounded-4">
          <h5>No services found matching your criteria</h5>
          <p className="text-muted mb-0">Try adjusting your search terms or category filter.</p>
        </div>
      ) : (
        <div className="row g-4">
          {filteredServices.map((srv) => (
            <div key={srv.id} className="col-lg-4 col-md-6">
              <div className="card h-100 card-hover p-4 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="badge bg-light text-primary border border-primary-subtle px-3 py-1 rounded-pill">
                      {srv.categoryName}
                    </span>
                    <span className="badge bg-secondary-subtle text-secondary small">
                      {srv.code}
                    </span>
                  </div>

                  <h5 className="fw-bold mb-2">{srv.name}</h5>
                  <p className="text-secondary small mb-3">{srv.description}</p>

                  <div className="d-flex gap-4 text-muted small mb-3 pb-3 border-bottom">
                    <span className="d-flex align-items-center gap-1">
                      <DollarSign size={16} className="text-success" />
                      <strong>${srv.indicativeBasePrice.toFixed(2)}</strong> (Base)
                    </span>
                    <span className="d-flex align-items-center gap-1">
                      <Clock size={16} className="text-primary" />
                      {srv.estimatedDurationMinutes} mins
                    </span>
                  </div>

                  {srv.standardMaterials && srv.standardMaterials.length > 0 && (
                    <div className="mb-3">
                      <div className="text-secondary small fw-medium mb-1 d-flex align-items-center gap-1">
                        <Package size={14} /> Standard Materials:
                      </div>
                      <div className="d-flex flex-wrap gap-1">
                        {srv.standardMaterials.map((m) => (
                          <span
                            key={m.id}
                            className="badge bg-light text-dark border small fw-normal"
                            title={`Qty: ${m.standardQuantity} ${m.unitOfMeasure} @ $${m.unitPrice}`}
                          >
                            {m.itemName} ({m.standardQuantity} {m.unitOfMeasure})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 d-flex gap-2">
                  <Link
                    to={`/book?serviceId=${srv.id}`}
                    className="btn btn-primary rounded-pill flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                  >
                    <span>Book Service</span>
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    to={`/services/${srv.id}`}
                    className="btn btn-outline-secondary rounded-pill px-3"
                  >
                    Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Services;
