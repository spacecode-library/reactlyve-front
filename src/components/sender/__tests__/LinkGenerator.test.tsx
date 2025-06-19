import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LinkGenerator from '../LinkGenerator';
import { showToast } from '../../common/ErrorToast';

jest.mock('../../../services/api', () => ({
  messageLinksApi: { list: jest.fn() },
}));

jest.mock('../../common/ErrorToast', () => ({
  showToast: jest.fn(),
}));

describe('LinkGenerator', () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

  beforeEach(() => {
    jest.useFakeTimers();
    Object.defineProperty(navigator, 'clipboard', {
      writable: true,
      value: { writeText: jest.fn().mockResolvedValue(undefined) },
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('copies link to clipboard and shows toast', async () => {
    render(<LinkGenerator shareableLink="https://example.com" hasPasscode={false} />);

    await user.click(screen.getByRole('button', { name: /copy link/i }));
    await Promise.resolve();

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://example.com');
    expect(showToast).toHaveBeenCalledWith({ message: 'Link copied to clipboard', type: 'success' });

    act(() => {
      jest.runAllTimers();
    });
  });
});
