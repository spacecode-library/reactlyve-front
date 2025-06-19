import React from 'react';
import { render, screen } from '@testing-library/react';
import TermsPage from '../Terms';

describe('TermsPage', () => {
  it('renders heading', () => {
    render(<TermsPage />);
    expect(
      screen.getByRole('heading', { name: /terms of service/i })
    ).toBeInTheDocument();
  });
});
