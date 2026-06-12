/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Linear Surfaces
        'pitch-black':   '#08090a',
        'graphite':      '#0f1011',
        'deep-slate':    '#161718',
        'charcoal-grey': '#23252a',
        'muted-ash':     '#323334',
        'gunmetal':      '#383b3f',

        // ── Text
        'porcelain':     '#f7f8f8',
        'light-steel':   '#d0d6e0',
        'storm-cloud':   '#8a8f98',
        'fog-grey':      '#62666d',

        // ── GitHub Accents
        'polar-blue':    '#8dd6ff',
        'neon-green':    '#5fed83',
        'cosmic-violet': '#8c93fb',

        // ── Status
        'forest-green':  '#008d2c',
        'warning-red':   '#eb5757',
        'emerald':       '#27a644',

        // ── Extra
        'aether-blue':   '#5e6ad2',
        'cyan-spark':    '#02b8cc',
      },

      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },

      fontSize: {
        'caption': ['10px', { lineHeight: '1.4', letterSpacing: '-0.1px' }],
        'body-sm': ['13px', { lineHeight: '1.5', letterSpacing: '-0.1px' }],
        'body':    ['14px', { lineHeight: '1.4', letterSpacing: '-0.13px' }],
        'ui':      ['15px', { lineHeight: '1.6', letterSpacing: '-0.1px' }],
        'heading': ['24px', { lineHeight: '1.33', letterSpacing: '-0.22px' }],
        'heading-lg': ['48px', { lineHeight: '1.2', letterSpacing: '-0.22px' }],
        'display': ['72px', { lineHeight: '1', letterSpacing: '-0.22px' }],
      },

      borderRadius: {
        'sm':   '2px',
        'DEFAULT': '6px',
        'md':   '6px',
        'lg':   '8px',
        'xl':   '12px',
        '2xl':  '16px',
        '3xl':  '24px',
        'full': '9999px',
      },

      boxShadow: {
        'sm':       'rgba(0, 0, 0, 0.4) 0px 2px 4px 0px',
        'md':       'rgba(0, 0, 0, 0.2) 0px 0px 12px 0px inset',
        'subtle':   'rgb(35, 37, 42) 0px 0px 0px 1px inset',
        'subtle-2': 'rgba(0, 0, 0, 0.2) 0px 0px 0px 1px',
        'subtle-3': 'rgba(0, 0, 0, 0.01) 0px 5px 2px 0px, rgba(0, 0, 0, 0.04) 0px 3px 2px 0px, rgba(0, 0, 0, 0.07) 0px 1px 1px 0px, rgba(0, 0, 0, 0.08) 0px 0px 1px 0px',
        'xl':       'rgba(8, 9, 10, 0.6) 0px 4px 32px 0px',
        'subtle-6': 'rgba(255, 255, 255, 0.03) 0px 0px 0px 1px inset, rgba(255, 255, 255, 0.04) 0px 1px 0px 0px inset, rgba(0, 0, 0, 0.6) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 4px 4px 0px',
        'blue-glow': '0 0 20px rgba(141, 214, 255, 0.15)',
        'blue-glow-lg': '0 0 40px rgba(141, 214, 255, 0.2)',
      },

      animation: {
        'fade-in':  'fadeIn 0.4s ease-out',
        'fade-up':  'fadeUp 0.4s ease-out',
        'fade-down':'fadeDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'shimmer':  'shimmer 2s infinite',
      },

      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeDown: {
          '0%':   { opacity: '0', transform: 'translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}