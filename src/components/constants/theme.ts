// Theme options
export const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
  } as const;
  
  export type ThemeType = (typeof THEMES)[keyof typeof THEMES];
  
  // Animation durations
  export const ANIMATION = {
    FADE_IN: 'fade-in 0.3s ease-in-out',
    SLIDE_UP: 'slide-up 0.4s ease-out',
    PULSE: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  } as const;
  
  // Z-index values for layering
  export const Z_INDEX = {
    MODAL: 50,
    DROPDOWN: 40,
    STICKY: 30,
    FIXED: 20,
    DEFAULT: 10,
    BELOW: -10,
  } as const;
  
  // Breakpoints for responsive design (matching Tailwind defaults)
  export const BREAKPOINTS = {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    XXL: 1536,
  } as const;
  
  // Default theme colors
  export const COLORS = {
    primary: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      200: '#BFDBFE',
      300: '#93C5FD',
      400: '#60A5FA',
      500: '#3B82F6', // Main primary color
      600: '#2563EB',
      700: '#1D4ED8',
      800: '#1E40AF',
      900: '#1E3A8A',
      950: '#172554',
    },
    secondary: {
      50: '#ECFDF5',
      100: '#D1FAE5',
      200: '#A7F3D0',
      300: '#6EE7B7',
      400: '#34D399',
      500: '#10B981', // Main secondary color
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
      500: '#8B5CF6', // Main accent color
      600: '#7C3AED',
      700: '#6D28D9',
      800: '#5B21B6',
      900: '#4C1D95',
      950: '#2E1065',
    },
    neutral: {
      50: '#F9FAFB', // Background light
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280', // Text secondary
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937', // Text primary
      900: '#111827',
      950: '#030712',
    },
    success: '#10B981', // Green
    error: '#EF4444',   // Red
    warning: '#F59E0B', // Amber
    info: '#3B82F6',    // Blue
  } as const;
  
  // Font families
  export const FONTS = {
    SANS: 'Inter var, Inter, ui-sans-serif, system-ui, sans-serif',
    MONO: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  } as const;
  
  // Font sizes (matching Tailwind defaults)
  export const FONT_SIZES = {
    XS: '0.75rem',     // 12px
    SM: '0.875rem',    // 14px
    BASE: '1rem',      // 16px
    LG: '1.125rem',    // 18px
    XL: '1.25rem',     // 20px
    '2XL': '1.5rem',   // 24px
    '3XL': '1.875rem', // 30px
    '4XL': '2.25rem',  // 36px
    '5XL': '3rem',     // 48px
    '6XL': '3.75rem',  // 60px
  } as const;
  
  // Spacing values (matching Tailwind defaults)
  export const SPACING = {
    0: '0',
    0.5: '0.125rem',  // 2px
    1: '0.25rem',     // 4px
    1.5: '0.375rem',  // 6px
    2: '0.5rem',      // 8px
    2.5: '0.625rem',  // 10px
    3: '0.75rem',     // 12px
    3.5: '0.875rem',  // 14px
    4: '1rem',        // 16px
    5: '1.25rem',     // 20px
    6: '1.5rem',      // 24px
    7: '1.75rem',     // 28px
    8: '2rem',        // 32px
    9: '2.25rem',     // 36px
    10: '2.5rem',     // 40px
    11: '2.75rem',    // 44px
    12: '3rem',       // 48px
    14: '3.5rem',     // 56px
    16: '4rem',       // 64px
    20: '5rem',       // 80px
    24: '6rem',       // 96px
    28: '7rem',       // 112px
    32: '8rem',       // 128px
    36: '9rem',       // 144px
    40: '10rem',      // 160px
    44: '11rem',      // 176px
    48: '12rem',      // 192px
    52: '13rem',      // 208px
    56: '14rem',      // 224px
    60: '15rem',      // 240px
    64: '16rem',      // 256px
    72: '18rem',      // 288px
    80: '20rem',      // 320px
    96: '24rem',      // 384px
  } as const;
  
  // Border radius values (matching Tailwind defaults)
  export const BORDER_RADIUS = {
    NONE: '0',
    SM: '0.125rem',     // 2px
    DEFAULT: '0.25rem', // 4px
    MD: '0.375rem',     // 6px
    LG: '0.5rem',       // 8px
    XL: '0.75rem',      // 12px
    '2XL': '1rem',      // 16px
    '3XL': '1.5rem',    // 24px
    FULL: '9999px',     // Circle/pill
  } as const;
  
  // Box shadow values (matching Tailwind defaults)
  export const BOX_SHADOW = {
    SM: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    MD: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    LG: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    XL: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2XL': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    INNER: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    NONE: 'none',
  } as const;