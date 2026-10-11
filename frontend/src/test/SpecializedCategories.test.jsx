import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BookService from '../pages/BookService';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';

// Mock axios API
vi.mock('../api/axios', () => ({
  default: {
    get: vi.fn((url) => {
      if (url === '/categories') {
        return Promise.resolve({
          data: {
            data: [
              {
                id: 1,
                name: 'Plumbing Works',
                code: 'PLUMB',
                description: 'Licensed plumbers for pipe leakage and fixture repairs.',
                iconName: 'Wrench',
                qualifiedHandymenCount: 3,
                servicesCount: 2,
                exampleServices: ['Pipe Leak Repair', 'Faucet Replacement'],
              },
              {
                id: 2,
                name: 'Electrical Works',
                code: 'ELECT',
                description: 'Licensed wiremen for domestic wiring and breakers.',
                iconName: 'Zap',
                qualifiedHandymenCount: 2,
                servicesCount: 2,
                exampleServices: ['Circuit Breaker Diagnostics'],
              },
            ],
          },
        });
      }
      if (url === '/services') {
        return Promise.resolve({
          data: {
            data: [
              {
                id: 1,
                name: 'Pipe Leak Detection and Repair',
                categoryId: 1,
                categoryName: 'Plumbing Works',
                indicativeBasePrice: 65.0,
                estimatedDurationMinutes: 60,
                standardMaterials: [{ itemName: 'PVC Pipe', standardQuantity: 1, sellingPrice: 15.0 }],
              },
            ],
          },
        });
      }
      if (url === '/customer/addresses') {
        return Promise.resolve({
          data: {
            data: [
              { id: 1, streetLine: '123 Main St', city: 'Metropolis', postalCode: '10001', isDefault: true },
            ],
          },
        });
      }
      if (url.includes('/categories/1/handymen')) {
        return Promise.resolve({
          data: {
            data: [
              {
                id: 1,
                fullName: 'Robert Smith',
                primaryTeamName: 'Plumbing Services Team',
                hourlyRate: 45.0,
                ratingAvg: 5.0,
                verificationStatus: 'VERIFIED',
              },
            ],
          },
        });
      }
      return Promise.resolve({ data: { data: [] } });
    }),
    post: vi.fn(() => Promise.resolve({ data: { data: { id: 101, bookingReference: 'BK-TEST-123' } } })),
  },
}));

describe('Specialized Categories and Smart Job Assignment UI', () => {
  it('renders Step 1 specialized category cards with specialist counts', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <BookService />
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    // Verify category cards render
    const plumbing = await screen.findByText('Plumbing Works');
    expect(plumbing).toBeInTheDocument();

    const electrical = await screen.findByText('Electrical Works');
    expect(electrical).toBeInTheDocument();

    // Verify specialist counts badge
    expect(screen.getByText('3 Specialists')).toBeInTheDocument();
    expect(screen.getByText('2 Specialists')).toBeInTheDocument();

    // Verify popular example service tags
    expect(screen.getByText('Pipe Leak Repair')).toBeInTheDocument();
    expect(screen.getByText('Circuit Breaker Diagnostics')).toBeInTheDocument();
  });
});
