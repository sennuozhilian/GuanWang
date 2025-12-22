/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0EA5E9',
        secondary: '#1E293B',
        dark: '#0F172A',
        accent: '#22D3EE',
        light: '#F8FAFC',
        success: '#10B981',
        error: '#EF4444'
      },
      fontFamily: {
        inter: ['Inter', 'system-ui', 'sans-serif'],
      },
      transforms: {
        '115': 'scale(1.15)',
        'rotate-5': 'rotate(5deg)',
      },
      rotate: {
        '5': '5deg',
        '10': '10deg',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'fade-up': 'fadeUp 0.8s ease forwards',
        'fade-in': 'fadeIn 1s ease forwards',
        'scan': 'scan 2s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'tech-pop': 'techPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'slide-up-right': 'slideUpRight 0.3s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(14, 165, 233, 0.5), 0 0 20px rgba(14, 165, 233, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(14, 165, 233, 0.8), 0 0 40px rgba(14, 165, 233, 0.5), 0 0 60px rgba(14, 165, 233, 0.3)' },
        },
        techPop: {
          '0%': { 
            opacity: 0, 
            transform: 'translateX(-50%) scale(0.3) rotate(-5deg)',
            boxShadow: '0 0 0 rgba(14, 165, 233, 0)'
          },
          '70%': { 
            opacity: 1, 
            transform: 'translateX(-50%) scale(1.05) rotate(2deg)',
            boxShadow: '0 0 30px rgba(14, 165, 233, 0.8), 0 0 60px rgba(14, 165, 233, 0.5)'
          },
          '100%': { 
            opacity: 1, 
            transform: 'translateX(-50%) scale(1) rotate(0deg)',
            boxShadow: '0 0 20px rgba(14, 165, 233, 0.8), 0 0 40px rgba(14, 165, 233, 0.5)'
          }
        },
        slideUpRight: {
          'from': { opacity: 0, transform: 'translate(-10px, 10px)' },
          'to': { opacity: 1, transform: 'translate(0, 0)' },
        }
      }
    },
  },
  plugins: [],
}