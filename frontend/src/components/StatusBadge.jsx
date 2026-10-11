import React from 'react';

const statusConfig = {
  // Booking Statuses
  PENDING: {
    label: 'Pending',
    style: { backgroundColor: '#fffbeb', color: '#b45309', borderColor: '#fde68a' },
    dotColor: '#f59e0b',
  },
  ASSIGNED: {
    label: 'Assigned',
    style: { backgroundColor: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' },
    dotColor: '#2563eb',
  },
  CONFIRMED: {
    label: 'Confirmed',
    style: { backgroundColor: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' },
    dotColor: '#2563eb',
  },
  ACCEPTED: {
    label: 'Accepted',
    style: { backgroundColor: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' },
    dotColor: '#2563eb',
  },
  ON_THE_WAY: {
    label: 'On The Way',
    style: { backgroundColor: '#ecfeff', color: '#0e7490', borderColor: '#a5f3fc' },
    dotColor: '#06b6d4',
  },
  ARRIVED: {
    label: 'Arrived on Site',
    style: { backgroundColor: '#ecfeff', color: '#0e7490', borderColor: '#a5f3fc' },
    dotColor: '#06b6d4',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    style: { backgroundColor: '#eff6ff', color: '#2563eb', borderColor: '#93c5fd' },
    dotColor: '#2563eb',
  },
  WAITING_FOR_MATERIALS: {
    label: 'Waiting for Materials',
    style: { backgroundColor: '#fffbeb', color: '#b45309', borderColor: '#fde68a' },
    dotColor: '#f59e0b',
  },
  COMPLETED: {
    label: 'Completed',
    style: { backgroundColor: '#f0fdf4', color: '#15803d', borderColor: '#bbf7d0' },
    dotColor: '#16a34a',
  },
  CANCELLED: {
    label: 'Cancelled',
    style: { backgroundColor: '#f8fafc', color: '#64748b', borderColor: '#e2e8f0' },
    dotColor: '#94a3b8',
  },
  REJECTED: {
    label: 'Declined',
    style: { backgroundColor: '#fef2f2', color: '#b91c1c', borderColor: '#fecaca' },
    dotColor: '#dc2626',
  },

  // Job Readiness Levels
  READY: {
    label: 'Readiness: Ready',
    style: { backgroundColor: '#f0fdf4', color: '#15803d', borderColor: '#bbf7d0' },
    dotColor: '#16a34a',
  },
  PARTIALLY_READY: {
    label: 'Partially Ready',
    style: { backgroundColor: '#ecfeff', color: '#0e7490', borderColor: '#a5f3fc' },
    dotColor: '#06b6d4',
  },
  AT_RISK: {
    label: 'At Risk',
    style: { backgroundColor: '#fffbeb', color: '#b45309', borderColor: '#fde68a' },
    dotColor: '#f59e0b',
  },
  BLOCKED: {
    label: 'Blocked',
    style: { backgroundColor: '#fef2f2', color: '#b91c1c', borderColor: '#fecaca' },
    dotColor: '#dc2626',
  },

  // Verification & Payments
  VERIFIED: {
    label: 'Verified',
    style: { backgroundColor: '#f0fdf4', color: '#15803d', borderColor: '#bbf7d0' },
    dotColor: '#16a34a',
  },
  PAID: {
    label: 'Paid',
    style: { backgroundColor: '#f0fdf4', color: '#15803d', borderColor: '#bbf7d0' },
    dotColor: '#16a34a',
  },
  SUCCESSFUL: {
    label: 'Paid',
    style: { backgroundColor: '#f0fdf4', color: '#15803d', borderColor: '#bbf7d0' },
    dotColor: '#16a34a',
  },
  PENDING_PAYMENT: {
    label: 'Payment Due',
    style: { backgroundColor: '#fffbeb', color: '#b45309', borderColor: '#fde68a' },
    dotColor: '#f59e0b',
  },
  SUBMITTED: {
    label: 'Submitted',
    style: { backgroundColor: '#f8fafc', color: '#475569', borderColor: '#cbd5e1' },
    dotColor: '#64748b',
  },
  DISPATCHED: {
    label: 'Dispatched',
    style: { backgroundColor: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' },
    dotColor: '#2563eb',
  },
  DELIVERED: {
    label: 'Delivered',
    style: { backgroundColor: '#f0fdf4', color: '#15803d', borderColor: '#bbf7d0' },
    dotColor: '#16a34a',
  },
};

export const StatusBadge = ({ status, showDot = true, size = 'sm' }) => {
  if (!status) return null;
  const key = String(status).toUpperCase();
  const config = statusConfig[key] || {
    label: status,
    style: { backgroundColor: '#f8fafc', color: '#475569', borderColor: '#e2e8f0' },
    dotColor: '#64748b',
  };

  return (
    <span
      className={`d-inline-flex align-items-center gap-1 border rounded-pill fw-semibold ${
        size === 'lg' ? 'px-3 py-1 text-sm' : 'px-2 py-1'
      }`}
      style={{
        ...config.style,
        fontSize: size === 'lg' ? '0.85rem' : '0.75rem',
        letterSpacing: '0.01em',
        lineHeight: 1.2,
      }}
    >
      {showDot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: config.dotColor,
            flexShrink: 0,
          }}
        />
      )}
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;
