import React from 'react';
import { render, screen } from '@testing-library/react';
import CookiePolicyPage from '../CookiePolicy';
        
jest.mock('../../layouts/MainLayout', () => ({ children }: { children: React.ReactNode }) => <div>{children}</div>);

describe('CookiePolicyPage', () => {
  it('renders cookie policy heading', () => {
    render(<CookiePolicyPage />);
    expect(screen.getByRole('heading', { name: /cookie policy/i, level: 1 })).toBeInTheDocument();
  });
});
