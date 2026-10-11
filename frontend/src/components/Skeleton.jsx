import React from 'react';

export function Skeleton({ width = '100%', height = '20px', className = '', rounded = '6px' }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius: rounded,
      }}
    />
  );
}

export function BookingCardSkeleton() {
  return (
    <div className="card p-4 border shadow-sm mb-3">
      <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center justify-content-between gap-3">
        <div className="d-flex align-items-center gap-3 w-100" style={{ maxWidth: 360 }}>
          <Skeleton width="48px" height="48px" rounded="10px" />
          <div className="flex-grow-1">
            <Skeleton width="60%" height="18px" className="mb-2" />
            <Skeleton width="40%" height="14px" />
          </div>
        </div>

        <div className="w-100" style={{ maxWidth: 320 }}>
          <Skeleton width="35%" height="20px" rounded="999px" className="mb-2" />
          <Skeleton width="80%" height="14px" />
        </div>

        <div className="d-flex align-items-center justify-content-between justify-content-lg-end w-100 gap-3" style={{ maxWidth: 200 }}>
          <div>
            <Skeleton width="60px" height="12px" className="mb-1" />
            <Skeleton width="80px" height="22px" />
          </div>
          <Skeleton width="110px" height="36px" rounded="8px" />
        </div>
      </div>
    </div>
  );
}

export default Skeleton;
