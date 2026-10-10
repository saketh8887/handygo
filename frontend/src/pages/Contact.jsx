import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Clock } from 'lucide-react';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="fw-bold">Contact Support &amp; Regional Hubs</h1>
        <p className="text-muted">Have a question regarding service dispatch, supplier onboarding, or logistics? We are here to help.</p>
      </div>

      <div className="row g-4">
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-primary text-white">
            <h4 className="fw-bold mb-4">Operations Headquarters</h4>
            <div className="d-flex flex-column gap-4">
              <div className="d-flex align-items-start gap-3">
                <MapPin size={24} className="text-warning flex-shrink-0" />
                <div>
                  <h6 className="fw-bold mb-1">Central Warehouse &amp; Dispatch Hub</h6>
                  <p className="mb-0 opacity-75 small">100 Logistics Parkway, Central Metro Industrial District, 10001</p>
                </div>
              </div>

              <div className="d-flex align-items-start gap-3">
                <Phone size={24} className="text-warning flex-shrink-0" />
                <div>
                  <h6 className="fw-bold mb-1">Toll-Free Dispatch Helpline</h6>
                  <p className="mb-0 opacity-75 small">+1 (800) 555-HANDY (24/7 Priority Emergency Line)</p>
                </div>
              </div>

              <div className="d-flex align-items-start gap-3">
                <Mail size={24} className="text-warning flex-shrink-0" />
                <div>
                  <h6 className="fw-bold mb-1">Email Inquiries</h6>
                  <p className="mb-0 opacity-75 small">support@handyconnect.local | vendors@handyconnect.local</p>
                </div>
              </div>

              <div className="d-flex align-items-start gap-3">
                <Clock size={24} className="text-warning flex-shrink-0" />
                <div>
                  <h6 className="fw-bold mb-1">Operating Hours</h6>
                  <p className="mb-0 opacity-75 small">Technician Dispatch: 07:00 – 21:00 Daily<br/>Warehouse Receiving: 08:00 – 18:00 Mon–Sat</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <h4 className="fw-bold mb-3">Send us a Message</h4>
            {submitted ? (
              <div className="alert alert-success d-flex align-items-center gap-2 p-4 rounded-3" role="alert">
                <CheckCircle2 size={24} />
                <div>
                  <h6 className="fw-bold mb-1">Message Received!</h6>
                  <p className="mb-0 small">Our support and dispatch coordination team will follow up within 2 business hours.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Your Name</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="jane@example.com"
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold">Subject</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      placeholder="Booking inquiry, technician question, or supplier onboarding"
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold">Message</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      required
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="How can our operations team assist you?"
                    ></textarea>
                  </div>
                  <div className="col-12">
                    <button type="submit" className="btn btn-primary d-inline-flex align-items-center gap-2 px-4 py-2">
                      <Send size={18} /> Send Message
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
