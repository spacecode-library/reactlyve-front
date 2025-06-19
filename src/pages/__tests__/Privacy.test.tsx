import React from 'react';
import { render, screen } from '@testing-library/react';
import PrivacyPolicyPage from '../Privacy';

describe('PrivacyPolicyPage', () => {
  it('renders heading', () => {
    render(<PrivacyPolicyPage />);
    expect(
      screen.getByRole('heading', { name: /privacy policy/i })
    ).toBeInTheDocument();
  });
});
