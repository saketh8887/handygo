import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Key, Mail, AlertCircle, CheckCircle2, UserCheck, Shield, Wrench, Package, Truck } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isExpired = searchParams.get('expired') === 'true';

  const demoAccounts = [
    {
      role: 'Administrator',
      email: 'admin@handyconnect.local',
      pass: 'Password123!',
      icon: Shield,
      color: 'btn-outline-danger',
      desc: 'Dispatch, approvals, catalog & analytics'
    },
    {
      role: 'Customer',
      email: 'customer@handyconnect.local',
      pass: 'Password123!',
      icon: UserCheck,
      color: 'btn-outline-primary',
      desc: 'Book repairs, view quotes & pay'
    },
    {
      role: 'Handyman (Electrician)',
      email: 'handyman1@handyconnect.local',
      pass: 'Password123!',
      icon: Wrench,
      color: 'btn-outline-success',
      desc: 'Accept jobs, record parts used'
    },
    {
      role: 'Inventory Manager',
      email: 'inventory@handyconnect.local',
      pass: 'Password123!',
      icon: Package,
      color: 'btn-outline-warning',
      desc: 'Stock balances, ROP & transfers'
    },
    {
      role: 'Supplier',
      email: 'supplier@handyconnect.local',
      pass: 'Password123!',
      icon: Truck,
      color: 'btn-outline-info',
      desc: 'Catalog, PO orders & dispatch'
    }
  ];

  const handleQuickFill = (acc) => {
    setEmail(acc.email);
    setPassword(acc.pass);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      // Route by role
      if (user.roles?.includes('ROLE_ADMIN')) {
        navigate('/admin');
      } else if (user.roles?.includes('ROLE_HANDYMAN')) {
        navigate('/handyman');
      } else if (user.roles?.includes('ROLE_INVENTORY_MANAGER')) {
        navigate('/inventory');
      } else if (user.roles?.includes('ROLE_SUPPLIER')) {
        navigate('/supplier');
      } else {
        navigate('/customer/bookings');
      }
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.response?.data?.message || 'Invalid email or password. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body p-4 p-md-5">
              <div className="text-center mb-4">
                <div className="d-inline-flex p-3 rounded-circle bg-primary bg-opacity-10 text-primary mb-3">
                  <LogIn size={32} />
                </div>
                <h3 className="fw-bold">Welcome Back</h3>
                <p className="text-muted">Sign in to your HandyConnect account</p>
              </div>

              {isExpired && (
                <div className="alert alert-warning d-flex align-items-center gap-2 mb-4" role="alert">
                  <AlertCircle size={18} />
                  <div>Your session has expired. Please sign in again.</div>
                </div>
              )}

              {error && (
                <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
                  <AlertCircle size={18} />
                  <div>{error}</div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <Mail size={18} className="text-muted" />
                    </span>
                    <input
                      type="email"
                      className="form-control border-start-0"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="d-flex justify-content-between">
                    <label className="form-label fw-semibold">Password</label>
                  </div>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <Key size={18} className="text-muted" />
                    </span>
                    <input
                      type="password"
                      className="form-control border-start-0"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      Signing In...
                    </>
                  ) : (
                    <>
                      <LogIn size={18} /> Sign In
                    </>
                  )}
                </button>
              </form>

              {/* Demo Credentials Quick-Fill Section */}
              <div className="mt-4 pt-3 border-top">
                <p className="small text-muted fw-semibold mb-2 text-center text-uppercase letter-spacing-1">
                  ⚡ One-Click Demo Personas
                </p>
                <div className="d-flex flex-column gap-2">
                  {demoAccounts.map((acc) => {
                    const IconComponent = acc.icon;
                    return (
                      <button
                        key={acc.role}
                        type="button"
                        onClick={() => handleQuickFill(acc)}
                        className={`btn btn-sm ${acc.color} text-start d-flex align-items-center justify-content-between p-2`}
                      >
                        <div className="d-flex align-items-center gap-2">
                          <IconComponent size={16} />
                          <div>
                            <span className="fw-semibold">{acc.role}</span>
                            <span className="text-muted small ms-2 d-none d-sm-inline">({acc.email})</span>
                          </div>
                        </div>
                        <span className="badge bg-light text-dark border">Fill</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="text-center mt-4">
                <p className="text-muted mb-0 small">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-primary fw-semibold text-decoration-none">
                    Create an account
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
