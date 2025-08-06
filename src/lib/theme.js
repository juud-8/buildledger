const theme = {
  colors: {
    light: {
      background: '0 0% 100%',
      foreground: '222.2 84% 4.9%',
      card: '0 0% 100%',
      cardForeground: '222.2 84% 4.9%',
      popover: '0 0% 100%',
      popoverForeground: '222.2 84% 4.9%',
      primary: '24.6 95% 53.1%',
      primaryForeground: '60 9.1% 97.8%',
      secondary: '210 40% 96.1%',
      secondaryForeground: '222.2 47.4% 11.2%',
      muted: '210 40% 96.1%',
      mutedForeground: '215.4 16.3% 46.9%',
      accent: '210 40% 96.1%',
      accentForeground: '222.2 47.4% 11.2%',
      destructive: '0 84.2% 60.2%',
      destructiveForeground: '60 9.1% 97.8%',
      border: '214.3 31.8% 91.4%',
      input: '214.3 31.8% 91.4%',
      ring: '222.2 84% 4.9%',
      radius: '0.5rem',
    },
    dark: {
      background: '222.2 84% 4.9%',
      foreground: '210 40% 98%',
      card: '222.2 84% 4.9%',
      cardForeground: '210 40% 98%',
      popover: '222.2 84% 4.9%',
      popoverForeground: '210 40% 98%',
      primary: '24.6 95% 53.1%',
      primaryForeground: '60 9.1% 97.8%',
      secondary: '217.2 32.6% 17.5%',
      secondaryForeground: '210 40% 98%',
      muted: '217.2 32.6% 17.5%',
      mutedForeground: '215 20.2% 65.1%',
      accent: '217.2 32.6% 17.5%',
      accentForeground: '210 40% 98%',
      destructive: '0 62.8% 30.6%',
      destructiveForeground: '210 40% 98%',
      border: '217.2 32.6% 17.5%',
      input: '217.2 32.6% 17.5%',
      ring: '24.6 95% 53.1%',
    },
  },
  boxShadow: {
    'glow-primary': '0 0 15px hsl(var(--primary))',
    'glow-secondary': '0 0 15px hsl(var(--secondary))',
  },
  animation: {
    enter: 'enter 200ms ease-out',
    leave: 'leave 150ms ease-in',
    'slide-in': 'slide-in 1.5s cubic-bezier(.41,1.18,.8,1.04) forwards',
    'pulse-glow': 'pulse-glow 3s infinite',
  },
  keyframes: {
    enter: {
      '0%': { transform: 'scale(0.9)', opacity: '0' },
      '100%': { transform: 'scale(1)', opacity: '1' },
    },
    leave: {
      '0%': { transform: 'scale(1)', opacity: '1' },
      '100%': { transform: 'scale(0.9)', opacity: '0' },
    },
    'slide-in': {
      '0%': { transform: 'translateY(-100%)' },
      '100%': { transform: 'translateY(0)' },
    },
    'pulse-glow': {
      '0%, 100%': {
        boxShadow: '0 0 15px hsl(var(--primary) / 0.5)',
      },
      '50%': {
        boxShadow: '0 0 25px hsl(var(--primary) / 1)',
      },
    },
  },
};

module.exports = { theme }; 