import React from 'react';
import { render, screen } from '@testing-library/react';
import TermsPage from '../Terms';

jest.mock('../../layouts/MainLayout', () => ({ children }: { children: React.ReactNode }) => <div>{children}</div>);

describe('TermsPage', () => {
  it('renders terms heading', () => {
    render(<TermsPage />);
    expect(screen.getByRole('heading', { name: /terms of service/i, level: 1 })).toBeInTheDocument();
  });
});
