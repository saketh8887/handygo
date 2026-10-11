import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';

function renderWithRouter(initialRoute = '/') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Route Navigation Tests', () => {
  const routesToTest = [
    '/',
    '/services',
    '/about',
    '/contact',
    '/book',
    '/customer/bookings',
    '/bookings',
    '/customer/addresses',
    '/addresses',
    '/customer/invoices',
    '/invoices',
    '/catalogue',
    '/track-job',
    '/login',
    '/register',
    '/handyman',
    '/handyman/jobs/23/execution',
    '/handyman/jobs/23/execute',
    '/something-random-404',
  ];

  routesToTest.forEach((route) => {
    it(`renders route ${route} without crashing`, () => {
      const { container } = renderWithRouter(route);
      expect(container.innerHTML).not.toBe('');
      console.log(`Route [${route}] rendered HTML length:`, container.innerHTML.length);
    });
  });
});
