/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
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
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          850: '#1C2526',
          900: '#111827',
          950: '#030712',
        },
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6',
        },
        fontFamily: {
          sans: ['Inter var', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        },
        // Add animations
        animation: {
          fadeIn: 'fadeIn 0.5s ease-out',
          slideUp: 'slideUp 0.5s ease-out',
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
          'grow-width': { // Top and Bottom
            '0%': { width: '0%' },
            '100%': { width: '100%' },
          },
          'grow-height': { // Right and Left
            '0%': { height: '0%' },
            '100%': { height: '100%' },
          },
        },
        animation: { // Ensure this is correctly placed within extend: {}
          fadeIn: 'fadeIn 0.5s ease-out',
          slideUp: 'slideUp 0.5s ease-out',
          'snake-border-top': 'grow-width 1.25s ease-in-out',
          'snake-border-right': 'grow-height 1.25s ease-in-out',
          'snake-border-bottom': 'grow-width 1.25s ease-in-out',
          'snake-border-left': 'grow-height 1.25s ease-in-out',
        },
      },
    },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
  ],
};