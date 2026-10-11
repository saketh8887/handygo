import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import JobExecution from '../pages/JobExecution';
import { ToastProvider } from '../context/ToastContext';
import api from '../api/axios';

vi.mock('../api/axios', () => {
  return {
    default: {
      get: vi.fn(),
      patch: vi.fn(),
      post: vi.fn(),
    },
  };
});

function renderExecutionComponent(jobId = '23') {
  return render(
    <MemoryRouter initialEntries={[`/handyman/jobs/${jobId}/execution`]}>
      <ToastProvider>
        <Routes>
          <Route path="/handyman/jobs/:id/execution" element={<JobExecution />} />
          <Route path="/handyman/jobs/:jobId/execution" element={<JobExecution />} />
        </Routes>
      </ToastProvider>
    </MemoryRouter>
  );
}

describe('JobExecution Page Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders booking details and execution workflow controls successfully for an accepted job', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        data: {
          id: 23,
          bookingReference: 'BK-20261011-EE808',
          bookingNumber: 'BK-20261011-EE808',
          serviceName: 'Pipe Leak Detection and Repair',
          serviceCategory: 'Plumbing Works',
          serviceTeamName: 'Plumbing Services Team',
          status: 'ACCEPTED',
          customerName: 'John Doe',
          customerPhone: '+1-555-0201',
          customerAddress: '742 Evergreen Terrace, Springfield',
          scheduledDate: '2026-11-20',
          scheduledTimeSlot: '16:00 - 18:00',
          problemDescription: 'Water pressure audit',
          materials: [
            {
              id: 16,
              itemName: 'PEX Pipe 1/2-inch (10ft)',
              itemSku: 'PLUMB-PEX-01',
              locationName: 'Central City Warehouse',
              reservedQty: 1.0,
              unitPrice: 14.0,
            },
          ],
        },
      },
    });

    renderExecutionComponent('23');

    // Wait for booking title to load
    await waitFor(() => {
      expect(screen.getByText('Pipe Leak Detection and Repair')).toBeInTheDocument();
    });

    // Check header reference and badges
    expect(screen.getByText('#BK-20261011-EE808')).toBeInTheDocument();
    expect(screen.getByText('Plumbing Works')).toBeInTheDocument();
    expect(screen.getByText('Plumbing Services Team')).toBeInTheDocument();

    // Check customer and address
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('+1-555-0201')).toBeInTheDocument();
    expect(screen.getAllByText('742 Evergreen Terrace, Springfield').length).toBeGreaterThanOrEqual(1);

    // Check workflow transition button for ACCEPTED status
    expect(screen.getByRole('button', { name: /Mark "On The Way"/i })).toBeInTheDocument();

    // Check reserved replacement parts section
    expect(screen.getByText(/Reserved Replacement Parts/i)).toBeInTheDocument();
    expect(screen.getByText('PEX Pipe 1/2-inch (10ft)')).toBeInTheDocument();
    expect(screen.getByText(/PLUMB-PEX-01/i)).toBeInTheDocument();
  });

  it('renders informative Job Not Found state when job does not exist (404)', async () => {
    const error404 = new Error('Not found');
    error404.response = { status: 404, data: { message: 'Booking not found' } };
    api.get.mockRejectedValueOnce(error404);

    renderExecutionComponent('9999');

    await waitFor(() => {
      expect(screen.getByText('Job Not Found')).toBeInTheDocument();
    });

    expect(screen.getByText(/Job #9999 was not found/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Back to Technician Workbench/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
  });

  it('renders informative Access Denied state when handyman is not authorized (403)', async () => {
    const error403 = new Error('Forbidden');
    error403.response = { status: 403, data: { message: 'Technician access denied' } };
    api.get.mockRejectedValueOnce(error403);

    renderExecutionComponent('9');

    await waitFor(() => {
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
    });

    expect(screen.getByText(/You are not authorized to view or execute Job #9/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Back to Technician Workbench/i })).toBeInTheDocument();
  });
});
