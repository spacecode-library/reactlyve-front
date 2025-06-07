import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import MessageForm from './MessageForm';
import { useAuth } from '../../context/AuthContext';
import { MESSAGE_ERRORS } from '../constants/errorMessages';
import { messagesApi } from '../../services/api';

// Mock useAuth
jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock messagesApi
jest.mock('../../services/api', () => ({
  messagesApi: {
    createWithFormData: jest.fn(),
  },
}));

// Mock child components to simplify testing, if necessary
jest.mock('./MediaUploader', () => (props: any) => <div data-testid="media-uploader" onClick={() => props.onMediaSelect(null)} data-disabled={props.disabled ? 'true' : 'false'}>MediaUploader</div>);
jest.mock('./PasscodeCreator', () => (props: any) => <div data-testid="passcode-creator" data-disabled={props.disabled ? 'true' : 'false'}>PasscodeCreator</div>);
jest.mock('./LinkGenerator', () => () => <div data-testid="link-generator">LinkGenerator</div>);
jest.mock('../common/Button', () => (props: any) => <button disabled={props.disabled} onClick={props.onClick} title={props.title}>{props.children}</button>);
jest.mock('../common/ErrorToast', () => ({
  showToast: jest.fn(),
}));


const mockUseAuth = useAuth as jest.Mock;
const mockCreateMessage = messagesApi.createWithFormData as jest.Mock;

describe('MessageForm', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockUseAuth.mockReset();
    mockCreateMessage.mockReset();
    jest.clearAllMocks();
  });

  const getFormElements = () => {
    const messageTextarea = screen.getByPlaceholderText('Write your surprise message here...');
    const mediaUploader = screen.getByTestId('media-uploader');
    const passcodeCreator = screen.getByTestId('passcode-creator');
    const reactionLengthSlider = screen.getByLabelText(/Reaction Recording Length:/);
    const submitButton = screen.getByRole('button', { name: /Create Message/i });
    return { messageTextarea, mediaUploader, passcodeCreator, reactionLengthSlider, submitButton };
  };

  test('Test Case 1: Guest User, Limit Reached', () => {
    mockUseAuth.mockReturnValue({
      user: {
        role: 'guest',
        maxMessagesPerMonth: 10,
        currentMessagesThisMonth: 10,
      },
    });

    render(<MessageForm />);

    expect(screen.getByText(MESSAGE_ERRORS.GUEST_MESSAGE_LIMIT_REACHED)).toBeInTheDocument();

    const { messageTextarea, mediaUploader, passcodeCreator, reactionLengthSlider, submitButton } = getFormElements();
    expect(messageTextarea).toBeDisabled();
    expect(mediaUploader).toHaveAttribute('data-disabled', 'true');
    expect(passcodeCreator).toHaveAttribute('data-disabled', 'true');
    expect(reactionLengthSlider).toBeDisabled();
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveAttribute('title', 'You have reached your monthly message limit.');
  });

  test('Test Case 2: Registered User, Limit Reached', () => {
    mockUseAuth.mockReturnValue({
      user: {
        role: 'user',
        maxMessagesPerMonth: 100,
        currentMessagesThisMonth: 100,
        lastUsageResetDate: '2023-01-01T00:00:00.000Z',
      },
    });

    render(<MessageForm />);

    expect(screen.getByText(MESSAGE_ERRORS.USER_MESSAGE_LIMIT_REACHED)).toBeInTheDocument();

    const { messageTextarea, mediaUploader, passcodeCreator, reactionLengthSlider, submitButton } = getFormElements();
    expect(messageTextarea).toBeDisabled();
    expect(mediaUploader).toHaveAttribute('data-disabled', 'true');
    expect(passcodeCreator).toHaveAttribute('data-disabled', 'true');
    expect(reactionLengthSlider).toBeDisabled();
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveAttribute('title', 'You have reached your monthly message limit.');
  });

  // This is the original Test Case 3 that needed `async` - REMOVING THE DUPLICATE ABOVE THIS
  test('Test Case 3: User, Limit Not Reached', async () => {
    mockUseAuth.mockReturnValue({
      user: {
        role: 'user',
        maxMessagesPerMonth: 100,
        currentMessagesThisMonth: 50,
        lastUsageResetDate: '2023-01-01T00:00:00.000Z',
      },
    });

    render(<MessageForm />);

    expect(screen.queryByText(MESSAGE_ERRORS.GUEST_MESSAGE_LIMIT_REACHED)).not.toBeInTheDocument();
    expect(screen.queryByText(MESSAGE_ERRORS.USER_MESSAGE_LIMIT_REACHED)).not.toBeInTheDocument();

    const { messageTextarea, mediaUploader, passcodeCreator, reactionLengthSlider, submitButton } = getFormElements();
    expect(messageTextarea).toBeEnabled();
    expect(mediaUploader).toHaveAttribute('data-disabled', 'false');
    expect(passcodeCreator).toHaveAttribute('data-disabled', 'false');
    expect(reactionLengthSlider).toBeEnabled();
    // Submit button is disabled until form is valid. Let's type a message.
    await act(async () => {
      fireEvent.change(messageTextarea, { target: { value: 'Test message' } });
    });
    // Use findByRole which waits for the element to be enabled (or timeout)
    const enabledSubmitButtonUser = await screen.findByRole('button', { name: /Create Message/i });
    expect(enabledSubmitButtonUser).toBeEnabled();
    // expect(submitButton).not.toHaveAttribute('title'); // Original submitButton reference might be stale
    expect(enabledSubmitButtonUser).not.toHaveAttribute('title');
  });

  // This is the original Test Case 3b, which was already async
  test('Test Case 3b: Guest User, Limit Not Reached', async () => {
    mockUseAuth.mockReturnValue({
      user: {
        role: 'guest',
        maxMessagesPerMonth: 10,
        currentMessagesThisMonth: 5,
      },
    });

    render(<MessageForm />);

    expect(screen.queryByText(MESSAGE_ERRORS.GUEST_MESSAGE_LIMIT_REACHED)).not.toBeInTheDocument();
    expect(screen.queryByText(MESSAGE_ERRORS.USER_MESSAGE_LIMIT_REACHED)).not.toBeInTheDocument();

    const { messageTextarea, mediaUploader, passcodeCreator, reactionLengthSlider, submitButton } = getFormElements(); // submitButton here is the initial one
    expect(messageTextarea).toBeEnabled();
    expect(mediaUploader).toHaveAttribute('data-disabled', 'false');
    expect(passcodeCreator).toHaveAttribute('data-disabled', 'false');
    expect(reactionLengthSlider).toBeEnabled();
    await act(async () => {
      fireEvent.change(messageTextarea, { target: { value: 'Test message' } });
    });
    const enabledSubmitButtonGuest = await screen.findByRole('button', { name: /Create Message/i }); // find the button again
    expect(enabledSubmitButtonGuest).toBeEnabled();
    expect(enabledSubmitButtonGuest).not.toHaveAttribute('title'); // check the correct button
  });

  test('Displays LinkGenerator when shareableLink is present', async () => {
    mockUseAuth.mockReturnValue({
      user: {
        role: 'user',
        maxMessagesPerMonth: 100,
        currentMessagesThisMonth: 50,
      },
    });

    // Mock API to return a shareable link
    mockCreateMessage.mockResolvedValueOnce({
      data: { shareableLink: 'http://example.com/share' },
    });

    render(<MessageForm />);

    const { messageTextarea, submitButton } = getFormElements();

    // Make form valid
    await act(async () => {
      fireEvent.change(messageTextarea, { target: { value: 'A valid message' } });
    });

    // Ensure button is enabled before clicking
    const enabledSubmitButton = await screen.findByRole('button', { name: /Create Message/i });
    expect(enabledSubmitButton).toBeEnabled();

    await act(async () => {
      fireEvent.click(enabledSubmitButton);
    });

    // Wait for LinkGenerator to appear
    expect(await screen.findByTestId('link-generator')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Write your surprise message here...')).not.toBeInTheDocument(); // Form should be gone
  });
});
