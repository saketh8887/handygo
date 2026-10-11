import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { 
  FileText, Download, CheckCircle2, Clock, Printer, Eye, 
  DollarSign, Calendar, Building2, Wrench, ShieldCheck, X 
} from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

export default function Invoices() {
  const { showToast } = useToast();
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
      showToast('Could not load billing statements.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <Breadcrumb items={[{ label: 'Invoices & Billing' }]} />

      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-0" style={{ letterSpacing: '-0.02em' }}>
          Billing &amp; Invoices
        </h2>
        <p className="text-secondary small mb-0 mt-0.5">
          View all itemized service statements, material receipts, and verified payment transactions
        </p>
      </div>

      {loading ? (
        <div className="hc-card p-4">
          <Skeleton height="40px" className="mb-3" />
          <Skeleton height="50px" className="mb-2" />
          <Skeleton height="50px" className="mb-2" />
          <Skeleton height="50px" />
        </div>
      ) : invoices.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No invoices found"
          description="Invoices are generated automatically upon completion of service appointments with itemized parts breakdown."
        />
      ) : (
        <div className="hc-card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-secondary small">
                <tr>
                  <th className="ps-4">Invoice #</th>
                  <th>Booking Reference</th>
                  <th>Date Issued</th>
                  <th>Labor Base</th>
                  <th>Parts / Materials</th>
                  <th>Total Amount</th>
                  <th>Payment Status</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody className="small">
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="ps-4 fw-bold font-monospace text-primary">
                      {inv.invoiceNumber}
                    </td>
                    <td className="font-monospace">#{inv.bookingNumber}</td>
                    <td className="text-secondary">{new Date(inv.issuedAt || inv.createdAt).toLocaleDateString()}</td>
                    <td>${parseFloat(inv.baseLaborAmount).toFixed(2)}</td>
                    <td>${parseFloat(inv.materialsAmount || 0).toFixed(2)}</td>
                    <td className="fw-bold text-dark">${parseFloat(inv.totalAmount).toFixed(2)}</td>
                    <td>
                      <span className={`badge px-2.5 py-1 ${inv.status === 'PAID' ? 'bg-success' : 'bg-warning text-dark'}`} style={{ fontWeight: 600 }}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="text-end pe-4">
                      <button
                        className="btn btn-outline-primary btn-sm px-2.5 py-1 rounded-3 d-inline-flex align-items-center gap-1"
                        style={{ fontSize: '0.75rem' }}
                        onClick={() => setSelectedInvoice(inv)}
                      >
                        <Eye size={13} /> View Invoice
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
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
              <div className="modal-header border-bottom px-4 pt-4 pb-3 bg-light">
                <div className="d-flex align-items-center gap-2">
                  <div className="p-2 rounded-circle bg-primary text-white">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h5 className="modal-title fw-bold text-dark mb-0">Invoice #{selectedInvoice.invoiceNumber}</h5>
                    <div className="text-secondary small">HandyConnect Official Settlement Receipt</div>
                  </div>
                </div>
                <button type="button" className="btn-close" onClick={() => setSelectedInvoice(null)}></button>
              </div>

              <div className="modal-body p-4">
                <div className="row g-3 mb-4">
                  <div className="col-sm-6">
                    <div className="text-secondary small">Issued To:</div>
                    <div className="fw-bold text-dark">{selectedInvoice.customerName || 'Customer'}</div>
                    <div className="text-secondary small">{selectedInvoice.customerAddress}</div>
                  </div>
                  <div className="col-sm-6 text-sm-end">
                    <div className="text-secondary small">Date Issued:</div>
                    <div className="fw-semibold text-dark">{new Date(selectedInvoice.issuedAt || selectedInvoice.createdAt).toLocaleDateString()}</div>
                    <div className="text-secondary small">Booking Ref: #{selectedInvoice.bookingNumber}</div>
                  </div>
                </div>

                <div className="table-responsive border rounded-3 mb-4">
                  <table className="table mb-0 small">
                    <thead className="table-light text-secondary">
                      <tr>
                        <th>Description</th>
                        <th className="text-end">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <div className="fw-semibold text-dark">Service Labor Base Charge</div>
                          <div className="text-secondary" style={{ fontSize: '0.75rem' }}>Fixed platform rate for scheduled trade appointment</div>
                        </td>
                        <td className="text-end fw-semibold">${parseFloat(selectedInvoice.baseLaborAmount).toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td>
                          <div className="fw-semibold text-dark">Verified Materials &amp; Spare Parts</div>
                          <div className="text-secondary" style={{ fontSize: '0.75rem' }}>Warehouse components pre-allocated &amp; consumed</div>
                        </td>
                        <td className="text-end fw-semibold">${parseFloat(selectedInvoice.materialsAmount || 0).toFixed(2)}</td>
                      </tr>
                      <tr className="table-light">
                        <td className="fw-bold">Total Invoiced:</td>
                        <td className="text-end fw-bold text-primary fs-6">${parseFloat(selectedInvoice.totalAmount).toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-3 small">
                  <div>
                    <span className="text-secondary">Payment Method: </span>
                    <strong className="text-dark">{selectedInvoice.paymentMethod || 'Simulated Electronic Gateway'}</strong>
                  </div>
                  <span className={`badge px-2.5 py-1 ${selectedInvoice.status === 'PAID' ? 'bg-success' : 'bg-warning text-dark'}`}>
                    {selectedInvoice.status}
                  </span>
                </div>
              </div>

              <div className="modal-footer border-top px-4 py-3 bg-light d-flex justify-content-between">
                <button 
                  className="btn btn-outline-secondary btn-sm px-3 py-2 rounded-3 d-inline-flex align-items-center gap-1.5"
                  onClick={() => window.print()}
                >
                  <Printer size={15} /> Print Receipt
                </button>
                <button type="button" className="btn btn-primary btn-sm px-4 py-2 rounded-3" onClick={() => setSelectedInvoice(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
