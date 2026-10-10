import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import About from '../pages/About';
import Contact from '../pages/Contact';

describe('Frontend Component Tests', () => {
  it('renders StatusBadge with correct labels and colors', () => {
    const { rerender } = render(<StatusBadge status="PENDING" />);
    expect(screen.getByText('Pending')).toBeInTheDocument();

    rerender(<StatusBadge status="ASSIGNED" />);
    expect(screen.getByText('Assigned')).toBeInTheDocument();

    rerender(<StatusBadge status="IN_PROGRESS" />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();

    rerender(<StatusBadge status="COMPLETED" />);
    expect(screen.getByText('Completed')).toBeInTheDocument();

    rerender(<StatusBadge status="WAITING_FOR_MATERIALS" />);
    expect(screen.getByText('Waiting for Materials')).toBeInTheDocument();
  });

  it('renders About page with architecture pillars and information', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );
    expect(screen.getByText('About HandyConnect')).toBeInTheDocument();
    expect(screen.getByText(/Solving the Triple Friction of Home Maintenance/i)).toBeInTheDocument();
    expect(screen.getByText(/Job Readiness and Material Coordination Engine/i)).toBeInTheDocument();
  });

  it('renders Contact page with operations headquarters details', () => {
    render(
      <BrowserRouter>
        <Contact />
      </BrowserRouter>
    );
    expect(screen.getByText(/Contact Support & Regional Hubs/i)).toBeInTheDocument();
    expect(screen.getByText(/Central Warehouse & Dispatch Hub/i)).toBeInTheDocument();
  });
});
