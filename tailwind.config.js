const {
  Setup,
  RatioBox,
  Layout,
  GridLine,
  PseudoElements,
  DevTools,
  GridGap,
  Container,
  Keyline,
  Spacing,
  Typography,
  ColorTokens,
  ApplyColorVariables
} = require('@area17/a17-tailwind-plugins');
const plugin = require('tailwindcss/plugin')

module.exports = {
    prefix: 'a17-',
    purge: [
      './resources/frontend/js/**/*.js',
      './resources/views/**/*.php',
      './resources/views/**/*.css',
    ],
    corePlugins: {
      preflight: false,
        // container: false
    },
    darkMode: false, // or 'media' or 'class'
    theme: {
      extend: {
        zIndex: {
          900: 900
        }
      }
    },
    variants: {
    },
    plugins: [
      DevTools,
      plugin(function({ addUtilities }) {
        const transitions = {
          '.trans-show-hide': {
            opacity: 0,
            visibility: 'hidden',
            'pointer-events': 'none',
            transition: 'opacity 200ms ease-in-out, visibility 0s 200ms ease-in-out',
          },
          '.trans-show-hide--active': {
            opacity: 1,
            visibility: 'visible',
            'pointer-events': 'normal',
            transition: 'opacity 200ms ease-in-out'
          },
        }

        addUtilities(transitions, ['responsive'])
      })
    ]
}
