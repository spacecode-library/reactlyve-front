import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfilePage from './Profile';
import { useAuth } from '../context/AuthContext';
import { profileApi } from '../services/api';
import { formatDate } from '../utils/formatters'; // Import for date formatting assertions
import { User }
from '../types/user'; // Import User type

// Mock useAuth
jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock profileApi
jest.mock('../services/api', () => ({
  profileApi: {
    getProfileMe: jest.fn(),
    deleteProfileMe: jest.fn(), // Also mock delete if Account Management tests were added
  },
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // import and retain default behavior
  useNavigate: jest.fn(), // Allows us to spy on navigation
}));

// Mock child components
jest.mock('../layouts/DashboardLayout', () => ({ children }: { children: React.ReactNode }) => <div data-testid="dashboard-layout">{children}</div>);
jest.mock('../components/common/LoadingSpinner', () => () => <div data-testid="loading-spinner">Loading...</div>);
jest.mock('../components/common/Modal', () => (props: any) => props.isOpen ? <div data-testid="modal">{props.children}</div> : null);
jest.mock('../components/common/Button', () => (props: any) => <button onClick={props.onClick} disabled={props.disabled || props.isLoading}>{props.children}</button>);
jest.mock('react-hot-toast', () => ({
    success: jest.fn(),
    error: jest.fn(),
  }));


const mockUseAuth = useAuth as jest.Mock;
const mockGetProfileMe = profileApi.getProfileMe as jest.Mock;
const mockUseNavigate = require('react-router-dom').useNavigate as jest.Mock;


describe('ProfilePage', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockUseAuth.mockReset();
    mockGetProfileMe.mockReset();
    mockUseNavigate.mockReset();
    jest.clearAllMocks();

    // Default mock for useAuth, can be overridden in specific tests
    mockUseAuth.mockReturnValue({
      user: {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
        picture: 'test-pic.jpg',
        role: 'user', // Default to 'user'
      },
      logout: jest.fn(),
    });

    // Default mock for useNavigate
    mockUseNavigate.mockReturnValue(jest.fn());
  });

  test('Test Case 1: Guest User Profile', async () => {
    const guestProfileData: User = {
      id: 'guest-123',
      name: 'Guest User',
      email: 'guest@example.com',
      role: 'guest',
      currentMessagesThisMonth: 5,
      maxMessagesPerMonth: 10,
      reactionsReceivedThisMonth: 0,
      maxReactionsPerMonth: null, // Unlimited
      maxReactionsPerMessage: 5,
      blocked: false, // Added
      lastLogin: new Date().toISOString(),
      lastUsageResetDate: null, // Guest doesn't have this
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockGetProfileMe.mockResolvedValue({ data: guestProfileData });
    // Also update the user object in useAuth mock if it's used for rendering or checks that need 'blocked'
    mockUseAuth.mockReturnValue({
        user: { ...guestProfileData, blocked: false },
        logout: jest.fn()
    });


    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Guest User')).toBeInTheDocument();
    expect(screen.getByText('guest@example.com')).toBeInTheDocument();
    expect(screen.getByText(guestProfileData.role, { selector: '.capitalize' })).toBeInTheDocument();

    // Check for the custom message for guests
    const customMessage = "Your limits are fixed. To increase them, please contact support@reactlyve.com or sign up for an account.";
    expect(screen.getByText(customMessage)).toBeInTheDocument();

    // Ensure "Usage Resets On:" label is present, but with the custom message
    const usageResetsOnLabel = screen.getByText('Usage Resets On:');
    expect(usageResetsOnLabel).toBeInTheDocument();
    expect(usageResetsOnLabel.nextElementSibling?.textContent).toBe(customMessage);

    // Ensure the date is not displayed
    // (Checking that the custom message is the sibling effectively does this)
  });

  test('Test Case 2: Registered User Profile', async () => {
    const userProfileData: User = {
      id: 'user-456',
      name: 'Registered User',
      email: 'user@example.com',
      role: 'user',
      currentMessagesThisMonth: 20,
      maxMessagesPerMonth: 100,
      reactionsReceivedThisMonth: 5,
      maxReactionsPerMonth: 200,
      maxReactionsPerMessage: 10,
      blocked: false, // Added
      lastLogin: new Date().toISOString(),
      lastUsageResetDate: '2023-12-01T00:00:00.000Z', // Specific date for testing
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockGetProfileMe.mockResolvedValue({ data: userProfileData });
    // Also update the user object in useAuth mock
    mockUseAuth.mockReturnValue({
        user: { ...userProfileData, blocked: false },
        logout: jest.fn()
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Registered User')).toBeInTheDocument();
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
    expect(screen.getByText(userProfileData.role, { selector: '.capitalize' })).toBeInTheDocument();

    // Check for "Usage Resets On:" and the formatted date
    const usageResetsOnLabel = screen.getByText('Usage Resets On:');
    expect(usageResetsOnLabel).toBeInTheDocument();
    expect(usageResetsOnLabel.nextElementSibling?.textContent).toBe(formatDate(userProfileData.lastUsageResetDate!));

    // Verify the custom guest message is NOT displayed
    const customMessage = "Your limits are fixed. To increase them, please contact support@reactlyve.com or sign up for an account.";
    expect(screen.queryByText(customMessage)).not.toBeInTheDocument();
  });

  test('Shows loading state initially', () => {
    // Prevent resolving the promise immediately to check loading state
    mockGetProfileMe.mockReturnValue(new Promise(() => {}));
    render(<ProfilePage />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  test('Shows error message if fetching profile fails', async () => {
    mockGetProfileMe.mockRejectedValue(new Error('Failed to fetch'));
    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Failed to fetch profile data. Please try again later.')).toBeInTheDocument();
  });
});
