import React from 'react';

const statusConfig = {
  // Booking Statuses
  PENDING: { label: 'Pending', bg: 'bg-warning text-dark' },
  ASSIGNED: { label: 'Assigned', bg: 'bg-info text-dark' },
  ACCEPTED: { label: 'Accepted', bg: 'bg-primary text-white' },
  ON_THE_WAY: { label: 'On The Way', bg: 'bg-primary text-white' },
  ARRIVED: { label: 'Arrived', bg: 'bg-info text-dark' },
  IN_PROGRESS: { label: 'In Progress', bg: 'bg-primary text-white' },
  WAITING_FOR_MATERIALS: { label: 'Waiting for Materials', bg: 'bg-warning text-dark' },
  COMPLETED: { label: 'Completed', bg: 'bg-success text-white' },
  CANCELLED: { label: 'Cancelled', bg: 'bg-secondary text-white' },
  REJECTED: { label: 'Declined', bg: 'bg-danger text-white' },

  // Job Readiness Statuses
  READY: { label: 'Ready', bg: 'bg-success text-white' },
  PARTIALLY_READY: { label: 'Partially Ready', bg: 'bg-info text-dark' },
  AT_RISK: { label: 'At Risk', bg: 'bg-warning text-dark' },
  BLOCKED: { label: 'Blocked', bg: 'bg-danger text-white' },

  // Verification
  VERIFIED: { label: 'Verified', bg: 'bg-success text-white' },

  // Payment & Invoice
  SUCCESSFUL: { label: 'Paid', bg: 'bg-success text-white' },
  PAID: { label: 'Paid', bg: 'bg-success text-white' },
  ISSUED: { label: 'Issued', bg: 'bg-warning text-dark' },

  // Delivery & PO
  SUBMITTED: { label: 'Submitted', bg: 'bg-secondary text-white' },
  CONFIRMED: { label: 'Confirmed', bg: 'bg-info text-dark' },
  DISPATCHED: { label: 'Dispatched', bg: 'bg-primary text-white' },
  DELIVERED: { label: 'Delivered', bg: 'bg-success text-white' },
  ACTIVE: { label: 'Active', bg: 'bg-success text-white' },
  OPEN: { label: 'Open', bg: 'bg-danger text-white' },
  RESOLVED: { label: 'Resolved', bg: 'bg-success text-white' },
};

export const StatusBadge = ({ status }) => {
  if (!status) return null;
  const key = String(status).toUpperCase();
  const config = statusConfig[key] || { label: status, bg: 'bg-secondary text-white' };

  return (
    <span className={`badge rounded-pill px-3 py-2 fw-medium ${config.bg}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
