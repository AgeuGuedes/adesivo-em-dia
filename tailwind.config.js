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
    },
  },
  plugins: [],
}
