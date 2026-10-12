import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  LogIn, Key, Mail, AlertCircle, CheckCircle2, UserCheck, 
  Shield, Wrench, Package, Truck, ArrowRight, Sparkles, Eye, EyeOff 
} from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isExpired = searchParams.get('expired') === 'true';

  const demoAccounts = [
    {
      role: 'Customer',
      email: 'customer@handyconnect.local',
      pass: 'Password123!',
      icon: UserCheck,
      badge: 'ROLE_CUSTOMER',
      desc: 'Book repairs, view quotes & pay'
    },
    {
      role: 'Handyman (Pro)',
      email: 'handyman1@handyconnect.local',
      pass: 'Password123!',
      icon: Wrench,
      badge: 'ROLE_HANDYMAN',
      desc: 'Accept jobs, record parts used'
    },
    {
      role: 'Administrator',
      email: 'admin@handyconnect.local',
      pass: 'Password123!',
      icon: Shield,
      badge: 'ROLE_ADMIN',
      desc: 'Dispatch, approvals & analytics'
    },
    {
      role: 'Inventory Manager',
      email: 'inventory@handyconnect.local',
      pass: 'Password123!',
      icon: Package,
      badge: 'ROLE_INVENTORY_MANAGER',
      desc: 'Stock balances, ROP & transfers'
    },
    {
      role: 'Supplier',
      email: 'supplier@handyconnect.local',
      pass: 'Password123!',
      icon: Truck,
      badge: 'ROLE_SUPPLIER',
      desc: 'Catalog, PO orders & dispatch'
    }
  ];

  const redirectUser = (user) => {
    const role = user.role || '';
    if (role.includes('ROLE_ADMIN') || role === 'ADMIN') {
      navigate('/admin');
    } else if (role.includes('ROLE_HANDYMAN') || role === 'HANDYMAN') {
      navigate('/handyman');
    } else if (role.includes('ROLE_INVENTORY_MANAGER') || role === 'INVENTORY_MANAGER') {
      navigate('/inventory');
    } else if (role.includes('ROLE_SUPPLIER') || role === 'SUPPLIER') {
      navigate('/supplier');
    } else {
      navigate('/customer/bookings');
    }
  };

  const handleLoginError = (err) => {
    console.error('Login error:', err);
    let msg = 'Invalid email or password. Please verify the demo password is: Password123!';
    if (!err.response) {
      msg = 'Unable to reach backend server. If using Render free tier, the server may take ~30-50 seconds to wake up from idle. Please wait and retry.';
    } else if (err.response.status === 401) {
      msg = 'Invalid email or password. Demo account password is: Password123!';
    } else if (err.response.status === 404) {
      msg = 'Authentication endpoint not reachable (404). Check backend deployment status.';
    } else if (err.response.data?.message) {
      msg = err.response.data.message;
    }
    setError(msg);
    showToast(msg, 'error');
  };

  const handleQuickFill = (acc) => {
    setEmail(acc.email);
    setPassword(acc.pass);
    setError('');
    showToast(`Filled credentials for ${acc.role}. Password is Password123!`, 'info');
  };

  const handleDirectLogin = async (acc) => {
    setEmail(acc.email);
    setPassword(acc.pass);
    setError('');
    setLoading(true);
    try {
      const user = await login(acc.email, acc.pass);
      showToast(`Welcome back, ${user.fullName || user.email}!`, 'success');
      redirectUser(user);
    } catch (err) {
      handleLoginError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      showToast(`Welcome back, ${user.fullName || user.email}!`, 'success');
      redirectUser(user);
    } catch (err) {
      handleLoginError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-9 col-lg-6">
          <div className="hc-card p-4 p-md-5 border-0 shadow-lg rounded-4">
            {/* Header */}
            <div className="text-center mb-4">
              <div 
                className="d-inline-flex align-items-center justify-content-center p-3 rounded-circle shadow-sm mb-3"
                style={{ backgroundColor: 'rgba(37,99,235,0.08)' }}
              >
                <div 
                  className="rounded-3 d-flex align-items-center justify-content-center"
                  style={{ width: 44, height: 44, backgroundColor: 'var(--hc-primary)', color: '#fff' }}
                >
                  <Wrench size={24} />
                </div>
              </div>
              <h3 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.02em' }}>
                Welcome to HandyConnect
              </h3>
              <p className="text-secondary small mb-0">
                Log in to access your bookings, dispatch board, or warehouse portal
              </p>
            </div>

            {isExpired && (
              <div className="alert alert-warning small rounded-3 border-0 mb-4 d-flex align-items-center gap-2">
                <AlertCircle size={16} />
                <span>Your session has expired. Please sign in again.</span>
              </div>
            )}

            {error && (
              <div className="alert alert-danger small rounded-3 border-0 mb-4 d-flex align-items-center gap-2">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark">Email Address</label>
                <div className="position-relative">
                  <Mail size={16} className="text-secondary position-absolute" style={{ left: 14, top: 12 }} />
                  <input
                    type="email"
                    className="form-control form-control-lg ps-5 rounded-3 border"
                    style={{ fontSize: '0.95rem' }}
                    placeholder="name@handyconnect.local"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label small fw-semibold text-dark mb-0">Password</label>
                </div>
                <div className="position-relative">
                  <Key size={16} className="text-secondary position-absolute" style={{ left: 14, top: 14 }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control form-control-lg ps-5 pe-5 rounded-3 border"
                    style={{ fontSize: '0.95rem' }}
                    placeholder="Password123!"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-link position-absolute text-secondary p-0 text-decoration-none"
                    style={{ right: 14, top: 12 }}
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-2.5 rounded-3 fw-medium d-inline-flex align-items-center justify-content-center gap-2 shadow-sm"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <LogIn size={17} />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick-Fill Demo Profiles */}
            <div className="mt-4 pt-3 border-top">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="small fw-semibold text-secondary" style={{ fontSize: '0.78rem' }}>
                  ONE-CLICK DEMO LOGIN (TEST ACCOUNTS)
                </span>
                <span className="badge bg-primary-subtle text-primary border border-primary-subtle" style={{ fontSize: '0.68rem' }}>
                  Pass: Password123!
                </span>
              </div>
              
              <div className="d-flex flex-column gap-2">
                {demoAccounts.map((acc) => {
                  const Icon = acc.icon;
                  return (
                    <div
                      key={acc.email}
                      className="btn btn-light text-start p-2.5 rounded-3 border d-flex align-items-center justify-content-between transition-all"
                      style={{ fontSize: '0.82rem', cursor: 'pointer' }}
                      onClick={() => handleDirectLogin(acc)}
                    >
                      <div className="d-flex align-items-center gap-2.5">
                        <div className="p-1.5 rounded-circle bg-white border text-primary">
                          <Icon size={14} />
                        </div>
                        <div>
                          <div className="fw-semibold text-dark">{acc.role}</div>
                          <div className="text-secondary" style={{ fontSize: '0.72rem' }}>{acc.email}</div>
                        </div>
                      </div>
                      <span className="badge bg-primary text-white px-2 py-1" style={{ fontSize: '0.7rem' }}>
                        1-Click Login ➔
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="text-center mt-4 small text-secondary">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary fw-semibold text-decoration-none">
                Register as Customer or Pro
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
