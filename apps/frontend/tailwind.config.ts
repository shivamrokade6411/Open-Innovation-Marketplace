/*
 * Purpose: Tailwind CSS theme configuration for the frontend design system.
 * Author: Copilot
 * Date: 2026-06-28
 */

import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';
import forms from '@tailwindcss/forms';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Requested colors
        primary: '#6366f1',
        secondary: '#8b5cf6',
        accent: '#06b6d4',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        'surface-dark': '#0f172a',
        'surface-card-dark': '#1e293b',
        'surface-light': '#f8fafc',
        'surface-card-light': '#ffffff',
        // Backward compatibility
        'brand-primary': '#6366f1',
        'brand-secondary': '#8b5cf6',
        'brand-accent': '#06b6d4',
        'surface-glass': '#ffffff0d'
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      borderRadius: {
        glass: '1rem'
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.37)',
        glow: '0 0 20px rgba(99, 102, 241, 0.5)'
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' }
        }
      },
      animation: {
        shimmer: 'shimmer 2s infinite'
      }
    }
  },
  plugins: [typography, forms]
};

export default config;
