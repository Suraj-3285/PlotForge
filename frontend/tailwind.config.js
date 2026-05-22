/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary brand colors
        primary: {
          50:  '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d7fe',
          300: '#a5b8fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        // Dark theme backgrounds
        dark: {
          50:  '#f8f9fa',
          100: '#1a1a2e',
          200: '#16213e',
          300: '#0f3460',
          400: '#533483',
        },
        // Accent for AI features
        ai: {
          from: '#6366f1',
          to:   '#a855f7',
        }
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        serif:   ['Merriweather', 'Georgia', 'serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in':      'fadeIn 0.5s ease-in-out',
        'fade-up':      'fadeUp 0.5s ease-out',
        'fade-down':    'fadeDown 0.3s ease-out',
        'slide-in':     'slideIn 0.3s ease-out',
        'slide-out':    'slideOut 0.3s ease-in',
        'scale-in':     'scaleIn 0.2s ease-out',
        'pulse-slow':   'pulse 3s infinite',
        'shimmer':      'shimmer 2s infinite',
        'float':        'float 3s ease-in-out infinite',
        'glow':         'glow 2s ease-in-out infinite',
        'typing':       'typing 1s steps(20) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeDown: {
          '0%':   { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideOut: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)' },
          '50%':      { boxShadow: '0 0 40px rgba(99, 102, 241, 0.6)' },
        },
        typing: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0' },
        },
      },
      backgroundImage: {
        'gradient-radial':   'radial-gradient(var(--tw-gradient-stops))',
        'gradient-ai':       'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
        'gradient-dark':     'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        'gradient-card':     'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
        'shimmer-gradient':  'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
      },
      boxShadow: {
        'glow':        '0 0 20px rgba(99, 102, 241, 0.3)',
        'glow-lg':     '0 0 40px rgba(99, 102, 241, 0.4)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.3)',
        'card':        '0 4px 24px rgba(0, 0, 0, 0.3)',
        'card-hover':  '0 8px 40px rgba(0, 0, 0, 0.4)',
      },
      borderRadius: {
        'xl':  '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}