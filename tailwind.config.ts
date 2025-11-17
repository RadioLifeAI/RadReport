import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--bg)',
        panel: 'var(--panel)',
        foreground: 'var(--text)',
        muted: 'var(--muted)',
        primary: 'var(--accent)',
        primary2: 'var(--accent2)',
        border: 'var(--border)'
      },
      container: {
        center: true,
        padding: '1rem',
        screens: { lg: '1140px' }
      },
      boxShadow: {
        glow: '0 10px 30px rgba(6,182,212,.25)'
      },
      borderRadius: {
        lg: '22px',
        md: '14px',
        DEFAULT: '12px'
      }
    }
  },
  plugins: [animate],
} satisfies Config