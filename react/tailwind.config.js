/** @type {import('tailwindcss').Config} */
const { addDynamicIconSelectors } = require("@iconify/tailwind");
const { iconsPlugin, getIconCollections } = require("@egoist/tailwindcss-icons");
const { nextui } = require("@nextui-org/react");
const { color } = require("framer-motion");
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        "orochi-img": "url('./components/home/home-components/image/orochi.png')",
      },
    },
  },
  darkMode: "class",
  plugins: [
    addDynamicIconSelectors(),
    iconsPlugin({
      collections: getIconCollections(["mdi", "lucide"]),
    }),
    nextui({
      addCommonColors: true,
      themes: {
        dark: {
          colors: {
            background: "#0D1117",
            primary: "#7828C8",
            default: "#7828C8",
          },
        },
      },
    }),
    require("@tailwindcss/typography"),
  ],
};
