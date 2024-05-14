/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "./projects/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3056D3",
        background: "#E7E7E7",
        disabled: "#f1f1f1",
      },
    },
  },
  plugins: [require("daisyui")],
};
