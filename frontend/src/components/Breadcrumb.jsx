import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumb({ items = [] }) {
  return (
    <nav aria-label="breadcrumb" className="mb-3">
      <ol className="breadcrumb align-items-center mb-0 p-0" style={{ fontSize: '0.825rem' }}>
        <li className="breadcrumb-item d-flex align-items-center">
          <Link to="/" className="text-secondary text-decoration-none d-flex align-items-center gap-1 hover-primary">
            <Home size={14} />
            <span>Home</span>
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li
              key={index}
              className={`breadcrumb-item d-flex align-items-center ${isLast ? 'active text-dark fw-semibold' : ''}`}
              aria-current={isLast ? 'page' : undefined}
            >
              <ChevronRight size={12} className="mx-1 text-muted" />
              {isLast || !item.to ? (
                <span className={isLast ? 'text-dark' : 'text-secondary'}>{item.label}</span>
              ) : (
                <Link to={item.to} className="text-secondary text-decoration-none hover-primary">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
