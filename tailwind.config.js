/** @type {import("tailwindcss").Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: { nunito: ["Nunito", "sans-serif"] },
      colors: {
        primary:   { DEFAULT: "#293088", variant: "#1c2566", light: "#3b43b0" },
        secondary: { DEFAULT: "#992e51", variant: "#7a2541", light: "#bf4070" },
      },
      boxShadow: {
        card:    "0 4px 20px 0 rgba(41,48,136,0.10)",
        "card-h":"0 8px 32px 0 rgba(41,48,136,0.18)",
        kpi:     "0 8px 32px 0 rgba(41,48,136,0.25)",
      },
    },
  },
  plugins: [],
};
