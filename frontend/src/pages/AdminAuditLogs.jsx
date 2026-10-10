import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { ShieldCheck, Clock, User, Globe, AlertCircle } from 'lucide-react';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/audit');
      setLogs(res.data.data || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      setError('Could not load system audit records.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="mb-4">
        <span className="badge bg-danger bg-opacity-10 text-danger px-3 py-1 rounded-pill fw-semibold mb-1">
          Security &amp; Regulatory Compliance
        </span>
        <h2 className="fw-bold mb-1">System Audit &amp; Event Trail</h2>
        <p className="text-muted mb-0">Immutable records of user authentications, status state transitions, and inventory ledger events</p>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
          <AlertCircle size={18} />
          <div>{error}</div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading audit logs...</span>
          </div>
        </div>
      ) : logs.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 text-center py-5">
          <div className="card-body">
            <ShieldCheck size={48} className="text-muted mb-3" />
            <h5 className="fw-bold">No Audit Logs Yet</h5>
            <p className="text-muted">Security and state changes will be automatically logged here.</p>
          </div>
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">Timestamp</th>
                  <th>Action</th>
                  <th>Entity Type</th>
                  <th>Entity ID</th>
                  <th>Initiator (User)</th>
                  <th>IP Address</th>
                  <th className="pe-4">Details / Metadata</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="ps-4 small text-muted">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td>
                      <span className="badge bg-primary bg-opacity-10 text-primary fw-semibold">
                        {log.action}
                      </span>
                    </td>
                    <td className="fw-semibold text-dark">{log.entityType}</td>
                    <td>#{log.entityId}</td>
                    <td>
                      <div className="small text-muted d-flex align-items-center gap-1">
                        <User size={13} /> {log.performedBy || 'SYSTEM'}
                      </div>
                    </td>
                    <td>
                      <div className="small text-muted d-flex align-items-center gap-1">
                        <Globe size={13} /> {log.ipAddress || '127.0.0.1'}
                      </div>
                    </td>
                    <td className="pe-4 small text-muted text-truncate" style={{ maxWidth: 300 }}>
                      {log.details || 'OK'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
