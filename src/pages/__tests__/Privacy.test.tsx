import { render, screen } from '@testing-library/react';
import PrivacyPolicyPage from '../Privacy';

jest.mock('../../layouts/MainLayout', () => ({ children }: { children: React.ReactNode }) => <div>{children}</div>);

describe('PrivacyPolicyPage', () => {
  it('renders privacy policy heading', () => {
    render(<PrivacyPolicyPage />);
    expect(screen.getByRole('heading', { name: /privacy policy/i, level: 1 })).toBeInTheDocument();
  });
});
