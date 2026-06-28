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
        'brand-primary': '#6366f1',
        'brand-secondary': '#8b5cf6',
        'brand-accent': '#06b6d4',
        'surface-dark': '#0f172a',
        'surface-glass': '#ffffff0d'
      },
      borderRadius: {
        glass: '1rem'
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.37)',
        glow: '0 0 20px #6366f1'
      }
    }
  },
  plugins: [typography, forms]
};

export default config;
