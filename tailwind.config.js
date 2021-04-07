module.exports = {
  purge: {
    content: ['**/*.html'],
    options: {
      safelist: ['text-red-600', 'border-red-600'],
    }
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      screens: {
        'xs': '500px',
      },
    },
  },
  variants: {
    extend: {
      opacity: ['disabled'],
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
