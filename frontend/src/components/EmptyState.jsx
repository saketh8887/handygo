import React from 'react';
import { Link } from 'react-router-dom';
import { Inbox } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No items found',
  description = 'There is currently no data to display for this view.',
  actionLabel,
  actionTo,
  onAction,
}) {
  return (
    <div className="card border shadow-sm text-center p-5 my-4">
      <div className="d-flex justify-content-center mb-3">
        <div
          className="d-flex align-items-center justify-content-center rounded-circle"
          style={{ width: 64, height: 64, backgroundColor: '#f1f5f9', color: '#64748b' }}
        >
          <Icon size={32} />
        </div>
      </div>
      <h5 className="fw-bold text-dark mb-2">{title}</h5>
      <p className="text-secondary small mx-auto mb-4" style={{ maxWidth: 420 }}>
        {description}
      </p>
      {(actionLabel && (actionTo || onAction)) && (
        <div>
          {actionTo ? (
            <Link to={actionTo} className="btn btn-primary px-4 py-2">
              {actionLabel}
            </Link>
          ) : (
            <button type="button" className="btn btn-primary px-4 py-2" onClick={onAction}>
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
