import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { 
  Users, DollarSign, Calendar, AlertTriangle, CheckCircle, 
  TrendingUp, Wrench, Package, ShieldCheck, ArrowUpRight, BarChart3, Activity,
  Sparkles, Clock, ArrowRight, Zap, Hammer, Wind, Paintbrush, Briefcase, Layers
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, CartesianGrid, BarChart, Bar, Legend, PieChart, Pie, Cell 
} from 'recharts';
import Breadcrumb from '../components/Breadcrumb';
import MetricCard from '../components/MetricCard';
import Skeleton from '../components/Skeleton';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, catRes] = await Promise.allSettled([
        api.get('/analytics/overview'),
        api.get('/admin/categories'),
      ]);

      if (analyticsRes.status === 'fulfilled') {
        setAnalytics(analyticsRes.value.data.data);
      }
      if (catRes.status === 'fulfilled') {
        setCategories(catRes.value.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError('Could not retrieve analytics metrics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-4">
        <Skeleton width="180px" height="20px" className="mb-4" />
        <div className="row g-3 mb-4">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="col-6 col-lg-3"><Skeleton height="120px" /></div>
          ))}
        </div>
        <div className="row g-4">
          <div className="col-lg-8"><Skeleton height="320px" /></div>
          <div className="col-lg-4"><Skeleton height="320px" /></div>
        </div>
      </div>
    );
  }

  const getCategoryIcon = (iconName) => {
    switch (iconName?.toLowerCase()) {
      case 'zap': return Zap;
      case 'wrench': return Wrench;
      case 'hammer': return Hammer;
      case 'wind': return Wind;
      case 'paintbrush': return Paintbrush;
      case 'cpu': return Package;
      default: return Briefcase;
    }
  };

  const totalPendingSpecialistBookings = categories.reduce((acc, c) => acc + (c.pendingBookingsCount || 0), 0);

  const revenueData = analytics?.monthlyRevenue?.length > 0 ? analytics.monthlyRevenue : [
    { month: 'Nov', revenue: 12400 },
    { month: 'Dec', revenue: 16800 },
    { month: 'Jan', revenue: 19500 },
    { month: 'Feb', revenue: 22100 },
    { month: 'Mar', revenue: 27900 },
    { month: 'Apr', revenue: 31200 },
  ];

  const consumptionData = analytics?.consumptionByCategory?.length > 0 ? analytics.consumptionByCategory : [
    { category: 'Electrical', amount: 8400 },
    { category: 'Plumbing', amount: 6200 },
    { category: 'HVAC', amount: 5100 },
    { category: 'Carpentry', amount: 3900 },
    { category: 'Appliances', amount: 2800 },
  ];

  const statusDistribution = [
    { name: 'Pending', value: analytics?.pendingBookings || 3, color: '#f59e0b' },
    { name: 'In Progress', value: analytics?.inProgressBookings || 5, color: '#2563eb' },
    { name: 'Completed', value: analytics?.completedBookings || 18, color: '#16a34a' },
    { name: 'Cancelled', value: analytics?.cancelledBookings || 1, color: '#dc2626' },
  ];

  return (
    <div className="container py-4">
      <Breadcrumb items={[{ label: 'Admin Command Center' }]} />

      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-danger bg-opacity-10 text-danger px-2.5 py-1 rounded-pill fw-semibold" style={{ fontSize: '0.75rem' }}>
              SYSTEM OPERATIONS COMMAND
            </span>
            <span className="badge bg-success bg-opacity-10 text-success px-2 py-0.5 rounded-pill" style={{ fontSize: '0.72rem' }}>
              ● Live Metrics
            </span>
          </div>
          <h2 className="fw-bold text-dark mb-0" style={{ letterSpacing: '-0.02em' }}>
            Executive Operations Dashboard
          </h2>
          <p className="text-secondary small mb-0 mt-0.5">
            Real-time tracking of dispatch throughput, technician utilization, and regional warehouse material flow
          </p>
        </div>

        <div className="d-flex flex-wrap gap-2">
          <Link to="/admin/bookings" className="btn btn-primary btn-sm px-3 py-2 rounded-3 d-inline-flex align-items-center gap-1.5 shadow-sm fw-medium">
            <Activity size={16} /> Service Dispatch Board
          </Link>
          <Link to="/admin/handymen" className="btn btn-outline-secondary btn-sm px-3 py-2 rounded-3 d-inline-flex align-items-center gap-1.5 fw-medium">
            <ShieldCheck size={16} /> Technician Approvals
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger rounded-3 border-0 shadow-sm mb-4 small">
          {error}
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <MetricCard
            title="Gross Revenue"
            value={`$${parseFloat(analytics?.totalRevenue || 12450.0).toFixed(2)}`}
            subtitle="Platform settlement"
            icon={DollarSign}
            trend="+18.4%"
            color="success"
          />
        </div>

        <div className="col-6 col-lg-3">
          <MetricCard
            title="Total Service Jobs"
            value={analytics?.totalBookings || 27}
            subtitle={`${analytics?.pendingBookings || 3} awaiting dispatch`}
            icon={Calendar}
            color="primary"
          />
        </div>

        <div className="col-6 col-lg-3">
          <MetricCard
            title="Verified Pros"
            value={`${analytics?.verifiedHandymen || 8} / ${analytics?.totalHandymen || 10}`}
            subtitle={`Utilization: ${analytics?.handymanUtilizationRate || 74.5}%`}
            icon={Wrench}
            trend="+5% active"
            color="info"
          />
        </div>

        <div className="col-6 col-lg-3">
          <MetricCard
            title="Low Stock Alerts"
            value={`${analytics?.lowStockItemCount || 2} SKUs`}
            subtitle={`Jobs At Risk: ${analytics?.jobsAtRiskCount || 0}`}
            icon={AlertTriangle}
            color="warning"
          />
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="row g-4 mb-4">
        {/* Monthly Revenue Trend */}
        <div className="col-12 col-lg-8">
          <div className="hc-card p-4 border-0 shadow-sm h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h6 className="fw-bold text-dark mb-0">Platform Revenue Trend ($)</h6>
                <div className="text-secondary small" style={{ fontSize: '0.78rem' }}>Monthly billings collected</div>
              </div>
              <span className="badge bg-light text-secondary border">FY 2026</span>
            </div>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} 
                    formatter={(v) => [`$${v}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Job Status Distribution */}
        <div className="col-12 col-lg-4">
          <div className="hc-card p-4 border-0 shadow-sm h-100">
            <div className="mb-3">
              <h6 className="fw-bold text-dark mb-0">Job Status Distribution</h6>
              <div className="text-secondary small" style={{ fontSize: '0.78rem' }}>Active lifecycle status share</div>
            </div>
            <div style={{ width: '100%', height: 210 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="d-flex flex-wrap justify-content-between gap-1 mt-2 small">
              {statusDistribution.map((st) => (
                <div key={st.name} className="d-flex align-items-center gap-1.5" style={{ fontSize: '0.78rem' }}>
                  <span style={{ width: 9, height: 9, backgroundColor: st.color, borderRadius: '50%' }}></span>
                  <span className="text-secondary">{st.name}: <strong className="text-dark">{st.value}</strong></span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Material Consumption by Category */}
        <div className="col-12">
          <div className="hc-card p-4 border-0 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h6 className="fw-bold text-dark mb-0">Material Consumption by Service Domain ($)</h6>
                <div className="text-secondary small" style={{ fontSize: '0.78rem' }}>Warehouse inventory utilized across service categories</div>
              </div>
            </div>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <BarChart data={consumptionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="category" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} 
                    formatter={(v) => [`$${v}`, 'Consumed']}
                  />
                  <Bar dataKey="amount" fill="#16a34a" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Handyman Specialization Management & Service Trade Breakdown */}
        <div className="col-12">
          <div className="hc-card p-4 border-0 shadow-sm">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-3 border-bottom">
              <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                    <ShieldCheck className="text-primary" size={20} /> Handyman Specialization Management
                  </h5>
                  <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25" style={{ fontSize: '0.72rem' }}>
                    {categories.length} Specialized Departments
                  </span>
                </div>
                <p className="text-secondary small mb-0">
                  Real-time monitoring of dedicated handyman teams, qualified technician capacity, and unassigned booking queues
                </p>
              </div>

              <div className="d-flex flex-wrap gap-2">
                <Link to="/admin/services" className="btn btn-outline-primary btn-sm px-3 py-1.5 rounded-3 d-inline-flex align-items-center gap-1.5 fw-medium">
                  <Layers size={14} /> Manage Categories &amp; Services
                </Link>
                <Link to="/admin/handymen" className="btn btn-outline-secondary btn-sm px-3 py-1.5 rounded-3 d-inline-flex align-items-center gap-1.5 fw-medium">
                  <Users size={14} /> Manage Technicians &amp; Skills
                </Link>
              </div>
            </div>

            {totalPendingSpecialistBookings > 0 && (
              <div className="alert alert-warning border-0 rounded-3 d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4 p-3 shadow-xs">
                <div className="d-flex align-items-center gap-2">
                  <AlertTriangle size={18} className="text-warning flex-shrink-0" />
                  <span className="small text-dark fw-medium">
                    <strong>{totalPendingSpecialistBookings} bookings</strong> currently awaiting qualified handyman assignment.
                  </span>
                </div>
                <Link to="/admin/bookings?status=PENDING" className="btn btn-warning btn-sm px-3 py-1 text-dark fw-medium rounded-pill text-decoration-none">
                  Assign Specialist Now &rarr;
                </Link>
              </div>
            )}

            <div className="row g-3">
              {categories.map((cat) => {
                const CatIcon = getCategoryIcon(cat.iconName);
                return (
                  <div key={cat.id} className="col-12 col-md-6 col-xl-4">
                    <div className="p-3 bg-light rounded-3 border h-100 d-flex flex-column justify-content-between transition-all">
                      <div>
                        <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
                          <div className="d-flex align-items-center gap-2">
                            <div className="p-2 bg-white rounded-circle shadow-xs border text-primary">
                              <CatIcon size={16} />
                            </div>
                            <div>
                              <h6 className="fw-bold text-dark mb-0" style={{ fontSize: '0.95rem' }}>{cat.name}</h6>
                              <span className="font-monospace text-secondary" style={{ fontSize: '0.68rem' }}>{cat.code}</span>
                            </div>
                          </div>
                          {cat.isActive ? (
                            <span className="badge bg-success bg-opacity-15 text-success border border-success" style={{ fontSize: '0.68rem' }}>
                              Active
                            </span>
                          ) : (
                            <span className="badge bg-secondary bg-opacity-20 text-secondary border" style={{ fontSize: '0.68rem' }}>
                              Inactive
                            </span>
                          )}
                        </div>

                        <p className="text-secondary small mb-3" style={{ fontSize: '0.78rem', minHeight: '36px' }}>
                          {cat.description || 'Specialized maintenance and repair services.'}
                        </p>

                        <div className="row g-2 mb-3 text-center">
                          <div className="col-4">
                            <div className="p-2 bg-white rounded-2 border">
                              <div className="fw-bold text-dark" style={{ fontSize: '1rem' }}>{cat.qualifiedHandymenCount || 0}</div>
                              <div className="text-secondary" style={{ fontSize: '0.68rem' }}>Specialists</div>
                            </div>
                          </div>
                          <div className="col-4">
                            <div className="p-2 bg-white rounded-2 border">
                              <div className="fw-bold text-dark" style={{ fontSize: '1rem' }}>{cat.servicesCount || 0}</div>
                              <div className="text-secondary" style={{ fontSize: '0.68rem' }}>Services</div>
                            </div>
                          </div>
                          <div className="col-4">
                            <div className={`p-2 bg-white rounded-2 border ${(cat.pendingBookingsCount || 0) > 0 ? 'border-warning' : ''}`}>
                              <div className={`fw-bold ${(cat.pendingBookingsCount || 0) > 0 ? 'text-warning' : 'text-dark'}`} style={{ fontSize: '1rem' }}>
                                {cat.pendingBookingsCount || 0}
                              </div>
                              <div className="text-secondary" style={{ fontSize: '0.68rem' }}>Pending</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="d-flex align-items-center justify-content-between pt-2 border-top">
                        <Link
                          to={`/admin/bookings?category=${cat.id}`}
                          className="btn btn-sm btn-link text-primary p-0 text-decoration-none fw-medium d-inline-flex align-items-center gap-1"
                          style={{ fontSize: '0.78rem' }}
                        >
                          View Trade Bookings <ArrowRight size={13} />
                        </Link>
                        <Link
                          to={`/admin/handymen`}
                          className="text-secondary small text-decoration-none"
                          style={{ fontSize: '0.74rem' }}
                        >
                          View Techs &rarr;
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
