import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { FileText, Download, CheckCircle2, Clock, Printer, Eye } from 'lucide-react';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/invoices/my-invoices');
      setInvoices(res.data.data || []);
    } catch (err) {
      console.error('Failed to load invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Billing &amp; Invoices</h2>
        <p className="text-muted mb-0">View all itemized service invoices, material receipts, and payment transactions</p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading invoices...</span>
          </div>
        </div>
      ) : invoices.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 text-center py-5">
          <div className="card-body">
            <FileText size={48} className="text-muted mb-3" />
            <h5 className="fw-bold">No Invoices Found</h5>
            <p className="text-muted">Invoices are generated automatically upon completion of service appointments.</p>
          </div>
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">Invoice #</th>
                  <th>Booking Reference</th>
                  <th>Date Issued</th>
                  <th>Labor Base</th>
                  <th>Parts / Materials</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th className="text-end pe-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="ps-4 fw-bold text-primary">{inv.invoiceNumber}</td>
                    <td>#{inv.bookingNumber}</td>
                    <td>{new Date(inv.issuedAt || inv.createdAt).toLocaleDateString()}</td>
                    <td>${parseFloat(inv.baseLaborAmount).toFixed(2)}</td>
                    <td>${parseFloat(inv.materialsAmount || 0).toFixed(2)}</td>
                    <td className="fw-bold">${parseFloat(inv.totalAmount).toFixed(2)}</td>
                    <td>
                      <span className={`badge ${inv.status === 'PAID' ? 'bg-success' : 'bg-warning text-dark'}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="text-end pe-4">
                      <button
                        className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-1"
                        onClick={() => setSelectedInvoice(inv)}
                      >
                        <Eye size={15} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoice Viewer Modal */}
      {selectedInvoice && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <button type="button" className="btn-close" onClick={() => setSelectedInvoice(null)}></button>
              </div>
              <div className="modal-body p-4 p-md-5">
                <div className="d-flex justify-content-between align-items-start border-bottom pb-4 mb-4">
                  <div>
                    <h3 className="fw-bold text-primary mb-1">HandyConnect</h3>
                    <p className="text-muted small mb-0">Home Services, Logistics &amp; Inventory Management Platform</p>
                  </div>
                  <div className="text-end">
                    <h5 className="fw-bold mb-1">INVOICE</h5>
                    <div className="text-muted small">{selectedInvoice.invoiceNumber}</div>
                    <div className="text-muted small">Date: {new Date(selectedInvoice.issuedAt || selectedInvoice.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="row g-4 mb-4">
                  <div className="col-6">
                    <h6 className="fw-bold text-dark mb-1">Bill To:</h6>
                    <div className="text-muted small">{selectedInvoice.customerName}</div>
                    <div className="text-muted small">{selectedInvoice.customerAddress}</div>
                  </div>
                  <div className="col-6 text-end">
                    <h6 className="fw-bold text-dark mb-1">Payment Status:</h6>
                    <span className={`badge fs-6 ${selectedInvoice.status === 'PAID' ? 'bg-success' : 'bg-warning text-dark'}`}>
                      {selectedInvoice.status}
                    </span>
                  </div>
                </div>

                <table className="table table-bordered mb-4">
                  <thead className="table-light">
                    <tr>
                      <th>Description</th>
                      <th className="text-end">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Handyman Professional Labor (Booking #{selectedInvoice.bookingNumber})</td>
                      <td className="text-end">${parseFloat(selectedInvoice.baseLaborAmount).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td>Parts &amp; Consumed Materials</td>
                      <td className="text-end">${parseFloat(selectedInvoice.materialsAmount || 0).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td>Tax &amp; Service Platform Surcharge (10%)</td>
                      <td className="text-end">${parseFloat(selectedInvoice.taxAmount || (parseFloat(selectedInvoice.totalAmount) - parseFloat(selectedInvoice.baseLaborAmount) - parseFloat(selectedInvoice.materialsAmount || 0))).toFixed(2)}</td>
                    </tr>
                    <tr className="table-light fw-bold">
                      <td>Total Invoice Amount</td>
                      <td className="text-end text-success">${parseFloat(selectedInvoice.totalAmount).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="modal-footer border-0">
                <button className="btn btn-secondary" onClick={() => setSelectedInvoice(null)}>Close</button>
                <button className="btn btn-primary d-inline-flex align-items-center gap-2" onClick={() => window.print()}>
                  <Printer size={16} /> Print Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
