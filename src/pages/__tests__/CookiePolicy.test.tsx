import React from 'react';
import { render, screen } from '@testing-library/react';
import CookiePolicyPage from '../CookiePolicy';

describe('CookiePolicyPage', () => {
  it('renders heading', () => {
    render(<CookiePolicyPage />);
    expect(
      screen.getByRole('heading', { name: /cookie policy/i })
    ).toBeInTheDocument();
  });
});
