const plugin = require('tailwindcss/plugin');
const { theme } = require('../src/lib/theme');

module.exports = plugin(
  function ({ addBase }) {
    addBase({
      ':root': Object.entries(theme.colors.light).reduce((acc, [key, value]) => {
        acc[`--${key}`] = value;
        return acc;
      }, {}),
      '.dark': Object.entries(theme.colors.dark).reduce((acc, [key, value]) => {
        acc[`--${key}`] = value;
        return acc;
      }, {}),
    });
  },
  {
    theme: {
      extend: {
        colors: Object.keys(theme.colors.light).reduce((acc, key) => {
          if (key.includes('Foreground')) {
            const baseKey = key.replace('Foreground', '');
            if (!acc[baseKey]) {
              acc[baseKey] = {};
            }
            if (typeof acc[baseKey] === 'string') {
              acc[baseKey] = { DEFAULT: acc[baseKey] };
            }
            acc[baseKey].foreground = `hsl(var(--${key}))`;
          } else {
            if (!acc[key]) {
              acc[key] = `hsl(var(--${key}))`;
            }
          }
          return acc;
        }, {}),
        boxShadow: theme.boxShadow,
        animation: theme.animation,
        keyframes: theme.keyframes,
      },
    },
  }
); 