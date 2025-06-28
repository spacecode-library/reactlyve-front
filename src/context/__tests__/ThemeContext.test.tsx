import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../ThemeContext';

afterEach(() => {
  localStorage.clear();
  document.body.className = '';
  jest.restoreAllMocks();
});

function TestComponent() {
  const { theme, toggleTheme } = useTheme();
  return <button onClick={toggleTheme}>Theme: {theme}</button>;
}

describe('ThemeProvider', () => {
  it('applies stored dark theme to the body', () => {
    localStorage.setItem('theme', 'dark');
    render(
      <ThemeProvider>
        <div>content</div>
      </ThemeProvider>
    );
    expect(document.body.classList.contains('dark')).toBe(true);
  });

  it('toggles theme classes when toggleTheme is called', () => {
    localStorage.setItem('theme', 'light');
    const { getByRole } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    const button = getByRole('button');
    expect(document.body.classList.contains('light')).toBe(true);
    fireEvent.click(button);
    expect(document.body.classList.contains('dark')).toBe(true);
  });

  it('defaults to system dark theme when no preference is stored', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockReturnValue({
        matches: true,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }),
    });

    render(
      <ThemeProvider>
        <div>content</div>
      </ThemeProvider>
    );

    expect(document.body.classList.contains('dark')).toBe(true);
  });

  it('updates when system theme changes without stored preference', () => {
    let matches = false;
    const listeners: Array<(e: MediaQueryListEvent) => void> = [];

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockReturnValue({
        get matches() {
          return matches;
        },
        addEventListener: jest.fn((_event, cb) => listeners.push(cb)),
        removeEventListener: jest.fn(),
      }),
    });

    render(
      <ThemeProvider>
        <div>content</div>
      </ThemeProvider>
    );

    expect(document.body.classList.contains('light')).toBe(true);

    matches = true;
    act(() => {
      listeners.forEach(cb => cb({ matches } as MediaQueryListEvent));
    });

    expect(document.body.classList.contains('dark')).toBe(true);
  });

});
