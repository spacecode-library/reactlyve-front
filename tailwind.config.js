/** @type {import('tailwindcss').Config} */
import forms from '@tailwindcss/forms';
import aspectRatio from '@tailwindcss/aspect-ratio';
import defaultColors from 'tailwindcss/colors';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', './src/styles/**/*.css'],
  darkMode: 'class',
  theme: {
    colors: {
      ...defaultColors,
      // Primary colors
      primary: {
        50: '#EFF6FF',
        100: '#DBEAFE',
        200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          850: '#1C2526',
          900: '#1E3A8A',
          950: '#172554',
        },
        secondary: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
          950: '#022C22',
        },
        accent: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        950: '#2E1065',
      },
      neutral: {
        ...defaultColors.neutral,
        850: '#1C2526',
      },
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B',
      info: '#3B82F6',
    },
    extend: {
      fontFamily: {
        sans: ['Inter var', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      // Add animations
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out',
        slideUp: 'slideUp 0.5s ease-out',
        'record-glow': 'record-glow 2s ease-in-out infinite',
        'record-glow-md': 'record-glow-md 2s ease-in-out infinite',
        'record-glow-lg': 'record-glow-lg 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'record-glow': {
          '0%, 100%': {
            opacity: '0.6',
            'box-shadow': 'inset 0 0 0 4px rgba(239,68,68,0.5)',
          },
          '50%': {
            opacity: '1',
            'box-shadow': 'inset 0 0 0 4px rgba(239,68,68,1)',
          },
        },
        'record-glow-md': {
          '0%, 100%': {
            opacity: '0.6',
            'box-shadow': 'inset 0 0 0 8px rgba(239,68,68,0.5)',
          },
          '50%': {
            opacity: '1',
            'box-shadow': 'inset 0 0 0 8px rgba(239,68,68,1)',
          },
        },
        'record-glow-lg': {
          '0%, 100%': {
            opacity: '0.6',
            'box-shadow': 'inset 0 0 0 15px rgba(239,68,68,0.5)',
          },
          '50%': {
            opacity: '1',
            'box-shadow': 'inset 0 0 0 15px rgba(239,68,68,1)',
          },
        },
      },
    },
  },
  plugins: [forms, aspectRatio],
};
