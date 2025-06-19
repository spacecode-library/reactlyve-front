import { render, screen, fireEvent } from '@testing-library/react';
import PasscodeEntry from '../PasscodeEntry';

describe('PasscodeEntry', () => {
  it('calls onSubmitPasscode and shows error on failure', async () => {
    const submit = jest.fn().mockResolvedValue(false);
    render(<PasscodeEntry onSubmitPasscode={submit} maxAttempts={2} />);

    const input = screen.getByLabelText(/passcode/i);
    fireEvent.change(input, { target: { value: '1234' } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    expect(submit).toHaveBeenCalledWith('1234');
    expect(await screen.findByText(/incorrect passcode/i)).toBeInTheDocument();
  });

  it('disables form after reaching max attempts', async () => {
    const submit = jest.fn().mockResolvedValue(false);
    render(<PasscodeEntry onSubmitPasscode={submit} maxAttempts={1} />);

    const input = screen.getByLabelText(/passcode/i);
    const button = screen.getByRole('button', { name: /submit/i });
    fireEvent.change(input, { target: { value: '1111' } });
    fireEvent.click(button);

    expect(await screen.findByText(/too many failed attempts/i)).toBeInTheDocument();
    expect(button).toBeDisabled();
  });
});
