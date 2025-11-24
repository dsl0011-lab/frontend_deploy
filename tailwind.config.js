/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        xxs: "20rem",
        xs: "30rem",
        // break points por altura
        mdh: { raw: "(max-height: 650px)" },
      },
    },
  },
  plugins: [],
}