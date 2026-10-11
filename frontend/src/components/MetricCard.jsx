import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function MetricCard({
  title,
  value,
  subtext,
  icon: Icon,
  iconBg = '#eff6ff',
  iconColor = '#2563eb',
  trend,
  trendType = 'up',
}) {
  return (
    <div className="card border shadow-sm p-4 h-100 card-hoverable">
      <div className="d-flex justify-content-between align-items-start mb-3">
        <span className="text-secondary small fw-semibold text-uppercase" style={{ letterSpacing: '0.04em' }}>
          {title}
        </span>
        {Icon && (
          <div
            className="d-flex align-items-center justify-content-center rounded-3"
            style={{ width: 40, height: 40, backgroundColor: iconBg, color: iconColor }}
          >
            <Icon size={20} />
          </div>
        )}
      </div>

      <div className="fs-3 fw-bold text-dark mb-1" style={{ letterSpacing: '-0.02em' }}>
        {value}
      </div>

      <div className="d-flex align-items-center justify-content-between mt-auto pt-1">
        {subtext && <span className="small text-secondary">{subtext}</span>}
        {trend && (
          <span
            className={`d-inline-flex align-items-center gap-1 small fw-semibold px-2 py-0.5 rounded-pill ${
              trendType === 'up' ? 'text-success bg-success-subtle' : 'text-danger bg-danger-subtle'
            }`}
            style={{ fontSize: '0.75rem' }}
          >
            {trendType === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
