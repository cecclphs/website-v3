const colors = require('tailwindcss/colors')

module.exports = {
  mode: 'jit',
  content: ['./src/{pages,public,components,config,hooks,styles}/**/*.{js,jsx,ts,tsx,css}'],
  theme: {},
  variants: {
    extend: {},
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
}
