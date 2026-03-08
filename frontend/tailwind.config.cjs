/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2563eb",
        accent: "#22c55e",
        danger: "#dc2626"
      }
    }
  },
  plugins: []
};

