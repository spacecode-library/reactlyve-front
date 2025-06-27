import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../ThemeContext';

afterEach(() => {
  localStorage.clear();
  document.body.className = '';
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
});
