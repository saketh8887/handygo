import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  LogIn, Key, Mail, AlertCircle, CheckCircle2, UserCheck, 
  Shield, Wrench, Package, Truck, ArrowRight, Sparkles, Eye, EyeOff, Wifi, WifiOff 
} from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // 'checking' | 'waking' | 'online' | 'offline'
  const [serverStatus, setServerStatus] = useState('checking');
  const wakeRetryRef = useRef(null);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isExpired = searchParams.get('expired') === 'true';

  // ── Wake-up ping: silently hit /actuator/health on page load ──────────────
  useEffect(() => {
    const apiBase = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
    const healthUrl = apiBase ? `${apiBase}/actuator/health` : '/actuator/health';
    let attempts = 0;
    const MAX_ATTEMPTS = 18; // 18 × 5s = 90s

    const ping = async () => {
      attempts++;
      try {
        const res = await fetch(healthUrl, { method: 'GET', signal: AbortSignal.timeout(8000) });
        if (res.ok) {
          setServerStatus('online');
          return; // ✅ backend is awake – stop retrying
        }
      } catch (_) { /* network error or timeout = still sleeping */ }

      if (attempts >= MAX_ATTEMPTS) {
        setServerStatus('offline');
      } else {
        setServerStatus('waking');
        wakeRetryRef.current = setTimeout(ping, 5000);
      }
    };

    ping();

    return () => {
      if (wakeRetryRef.current) clearTimeout(wakeRetryRef.current);
    };
  }, []);

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

  // ── Auto-retry login while backend is waking up ───────────────────────────
  const loginWithRetry = async (emailVal, passVal) => {
    const MAX_RETRY_ATTEMPTS = 10;
    const RETRY_INTERVAL_MS = 6000;
    let attempt = 0;

    while (attempt < MAX_RETRY_ATTEMPTS) {
      try {
        const user = await login(emailVal, passVal);
        return user; // ✅ success
      } catch (err) {
        // Only retry on network errors (backend sleeping), not on 401/403/etc.
        if (err.response) throw err; // real HTTP error – don't retry
        if (err.message === 'BACKEND_URL_MISSING') throw err;
        attempt++;
        if (attempt >= MAX_RETRY_ATTEMPTS) throw err;
        setError(`⏳ Server is waking up… retrying in ${RETRY_INTERVAL_MS / 1000}s (attempt ${attempt}/${MAX_RETRY_ATTEMPTS})`);
        await new Promise(r => setTimeout(r, RETRY_INTERVAL_MS));
      }
    }
  };

  const handleLoginError = (err) => {
    console.error('Login error:', err);
    let msg = 'Invalid email or password. Demo account password is: Password123!';
    if (err.message === 'BACKEND_URL_MISSING') {
      msg = 'Backend URL is not configured. In Vercel, add environment variable VITE_API_URL = https://<your-render-service>.onrender.com (no trailing slash), then redeploy.';
    } else if (!err.response) {
      msg = 'Could not reach the backend server after multiple retries. Please refresh the page and try again in a minute.';
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
      const user = await loginWithRetry(acc.email, acc.pass);
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
      const user = await loginWithRetry(email, password);
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

            {/* Server Status Banner */}
            {serverStatus === 'checking' && (
              <div className="alert border-0 mb-3 py-2 px-3 rounded-3 d-flex align-items-center gap-2"
                style={{ backgroundColor: '#f0f4ff', color: '#4b5bab', fontSize: '0.8rem' }}>
                <span className="spinner-border spinner-border-sm" style={{ width: 12, height: 12, borderWidth: 2 }} />
                <span>Connecting to backend server…</span>
              </div>
            )}
            {serverStatus === 'waking' && (
              <div className="alert border-0 mb-3 py-2 px-3 rounded-3 d-flex align-items-center gap-2"
                style={{ backgroundColor: '#fff8e6', color: '#8a6200', fontSize: '0.8rem' }}>
                <span className="spinner-border spinner-border-sm" style={{ width: 12, height: 12, borderWidth: 2, color: '#f59e0b' }} />
                <span>⏳ Server is waking up (Render free tier). This takes ~30–60s. <strong>Login will work automatically once ready.</strong></span>
              </div>
            )}
            {serverStatus === 'online' && (
              <div className="alert border-0 mb-3 py-2 px-3 rounded-3 d-flex align-items-center gap-2"
                style={{ backgroundColor: '#f0fdf4', color: '#166534', fontSize: '0.8rem' }}>
                <Wifi size={13} />
                <span>Backend server is online. Ready to log in!</span>
              </div>
            )}
            {serverStatus === 'offline' && (
              <div className="alert border-0 mb-3 py-2 px-3 rounded-3 d-flex align-items-center gap-2"
                style={{ backgroundColor: '#fff0f0', color: '#991b1b', fontSize: '0.8rem' }}>
                <WifiOff size={13} />
                <span>Backend server is not responding. Try refreshing the page in ~1 minute.</span>
              </div>
            )}

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
                    autoComplete="off"
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
                    autoComplete="new-password"
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
                    <span>{serverStatus !== 'online' ? 'Waking up server…' : 'Signing In...'}</span>
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
