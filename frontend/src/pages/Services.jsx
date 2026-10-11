import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { 
  Search, Clock, DollarSign, Package, ArrowRight, CheckCircle2, 
  Wrench, ShieldCheck, Sparkles, Filter, X 
} from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

export const Services = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(Number(categoryParam));
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
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

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    if (catId) {
      setSearchParams({ category: catId });
    } else {
      setSearchParams({});
    }
  };

  const filteredServices = services.filter((s) => {
    const matchesCategory = selectedCategory ? s.categoryId === selectedCategory : true;
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container py-4">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: 'Service Catalogue' }]} />

      {/* Hero Header */}
      <div className="hc-card p-4 p-md-5 mb-4 border-0 shadow-sm text-center position-relative overflow-hidden">
        <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-1.5 rounded-pill mb-2 fw-semibold" style={{ fontSize: '0.75rem' }}>
          VERIFIED TRADE CAPABILITIES &amp; FIXED RATES
        </span>
        <h1 className="fw-bold text-dark mb-2" style={{ fontSize: '2rem', letterSpacing: '-0.025em' }}>
          Standardized Home Repair Services
        </h1>
        <p className="text-secondary mx-auto mb-4" style={{ maxWidth: '640px', fontSize: '0.95rem' }}>
          Transparent indicative base rates, certified tradespeople, and pre-allocated spare parts ready across 3 regional distribution hubs.
        </p>

        {/* Global Search Bar */}
        <div className="position-relative mx-auto" style={{ maxWidth: '520px' }}>
          <Search size={18} className="text-secondary position-absolute" style={{ left: 14, top: 13 }} />
          <input
            type="text"
            className="form-control form-control-lg ps-5 pe-4 rounded-3 border shadow-sm"
            style={{ fontSize: '0.95rem' }}
            placeholder="Search by repair name, keyword, or problem code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="btn btn-link position-absolute text-secondary p-0"
              style={{ right: 14, top: 12 }}
              onClick={() => setSearchTerm('')}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="d-flex align-items-center gap-2 overflow-auto pb-3 mb-4" style={{ scrollbarWidth: 'none' }}>
        <button
          className={`btn btn-sm px-3 py-2 rounded-pill fw-medium transition-all flex-shrink-0 ${
            selectedCategory === null 
              ? 'btn-primary shadow-sm text-white' 
              : 'btn-light text-secondary border'
          }`}
          onClick={() => handleCategorySelect(null)}
        >
          All Categories ({services.length})
        </button>
        {categories.map((c) => {
          const count = services.filter(s => s.categoryId === c.id).length;
          return (
            <button
              key={c.id}
              className={`btn btn-sm px-3 py-2 rounded-pill fw-medium transition-all flex-shrink-0 ${
                selectedCategory === c.id 
                  ? 'btn-primary shadow-sm text-white' 
                  : 'btn-light text-secondary border'
              }`}
              onClick={() => handleCategorySelect(c.id)}
            >
              {c.name} {count > 0 && `(${count})`}
            </button>
          );
        })}
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="row g-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="col-lg-4 col-md-6">
              <div className="hc-card p-4">
                <Skeleton width="40%" height="20px" className="mb-2" />
                <Skeleton width="80%" height="28px" className="mb-2" />
                <Skeleton width="100%" height="45px" className="mb-3" />
                <div className="d-flex justify-content-between pt-3 border-top">
                  <Skeleton width="30%" height="24px" />
                  <Skeleton width="40%" height="36px" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredServices.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No services found"
          description={`We couldn't find any services matching "${searchTerm}". Try checking for typos or clear your category filter.`}
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchTerm('');
            handleCategorySelect(null);
          }}
        />
      ) : (
        <div className="row g-4">
          {filteredServices.map((srv) => {
            const price = srv.indicativeBasePrice || srv.basePrice || 0;
            return (
              <div key={srv.id} className="col-lg-4 col-md-6">
                <div className="hc-card h-100 p-4 border-0 shadow-sm d-flex flex-column justify-content-between transition-all">
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-2.5">
                      <span className="badge bg-primary bg-opacity-10 text-primary px-2.5 py-1 rounded-pill fw-medium" style={{ fontSize: '0.75rem' }}>
                        {srv.categoryName}
                      </span>
                      <span className="badge bg-light text-secondary font-monospace border" style={{ fontSize: '0.72rem' }}>
                        {srv.code}
                      </span>
                    </div>

                    <h5 className="fw-bold text-dark mb-2" style={{ fontSize: '1.15rem' }}>
                      {srv.name}
                    </h5>
                    <p className="text-secondary small mb-3 line-clamp-2" style={{ minHeight: '38px', fontSize: '0.84rem' }}>
                      {srv.description}
                    </p>

                    <div className="d-flex align-items-center justify-content-between p-2.5 bg-light rounded-3 mb-3 text-secondary small">
                      <div className="d-flex align-items-center gap-1.5">
                        <DollarSign size={15} className="text-success" />
                        <span>Base: <strong className="text-dark">${parseFloat(price).toFixed(2)}</strong></span>
                      </div>
                      <div className="d-flex align-items-center gap-1.5">
                        <Clock size={15} className="text-primary" />
                        <span>{srv.estimatedDurationMinutes} mins</span>
                      </div>
                    </div>

                    {srv.standardMaterials && srv.standardMaterials.length > 0 && (
                      <div className="mb-3">
                        <div className="text-secondary small fw-medium mb-1.5 d-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
                          <Package size={13} className="text-primary" /> Pre-Allocated Components:
                        </div>
                        <div className="d-flex flex-wrap gap-1">
                          {srv.standardMaterials.slice(0, 2).map((m) => (
                            <span
                              key={m.id}
                              className="badge bg-white text-dark border px-2 py-1 small fw-normal"
                              style={{ fontSize: '0.72rem' }}
                            >
                              {m.itemName} ({m.standardQuantity} {m.unitOfMeasure})
                            </span>
                          ))}
                          {srv.standardMaterials.length > 2 && (
                            <span className="badge bg-light text-secondary border px-1.5 py-1" style={{ fontSize: '0.7rem' }}>
                              +{srv.standardMaterials.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-top d-flex gap-2">
                    <Link
                      to={`/book?serviceId=${srv.id}`}
                      className="btn btn-primary btn-sm rounded-3 flex-grow-1 d-flex align-items-center justify-content-center gap-1.5 py-2 fw-medium shadow-sm"
                    >
                      <span>Book Service</span>
                      <ArrowRight size={15} />
                    </Link>
                    <Link
                      to={`/services/${srv.id}`}
                      className="btn btn-outline-secondary btn-sm rounded-3 px-3 py-2 fw-medium"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Services;
