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

module.exports = {
    prefix: 'a17-',
    corePlugins: {
      preflight: false,
        // container: false
    },
    darkMode: false, // or 'media' or 'class'
    theme: {
    },
    variants: {
    },
    plugins: [
      DevTools,
    ]
  };
