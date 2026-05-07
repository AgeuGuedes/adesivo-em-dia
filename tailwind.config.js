/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        med: {
          bg:        '#f0f4f9',
          surface:   '#ffffff',
          elevated:  '#f8fafc',
          border:    '#e2e8f0',
          border2:   '#cbd5e1',
          primary:   '#1d6ed8',
          'primary-light': '#dbeafe',
          'primary-hover': '#1558b0',
          success:   '#059669',
          'success-light': '#d1fae5',
          danger:    '#dc2626',
          'danger-light': '#fee2e2',
          text:      '#1e293b',
          muted:     '#64748b',
          faint:     '#94a3b8',
          admin:     '#b45309',
          'admin-light': '#fef3c7',
        },
      },
      boxShadow: {
        card:  '0 1px 6px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.05)',
        card2: '0 2px 12px rgba(0,0,0,0.10), 0 8px 24px rgba(0,0,0,0.06)',
        'blue-glow': '0 0 0 3px rgba(29,110,216,0.18)',
      },
      keyframes: {
        slideUp: {
          '0%':   { transform: 'translateY(40px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%':   { transform: 'scale(0.5)', opacity: '0' },
          '60%':  { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)',   opacity: '1' },
        },
        fadeUp: {
          '0%':   { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
      },
      animation: {
        slideUp:  'slideUp 0.25s ease-out',
        fadeIn:   'fadeIn 0.3s ease-out',
        scaleIn:  'scaleIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275)',
        fadeUp:   'fadeUp 0.4s ease-out',
        fadeUpD1: 'fadeUp 0.4s 0.1s ease-out both',
        fadeUpD2: 'fadeUp 0.4s 0.2s ease-out both',
      },
    },
  },
  plugins: [],
}
