/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // NOTE: `darkMode` is a legacy JS-config option and is ignored by
    // @tailwindcss/postcss. In Tailwind v4 the `dark:` variant is configured
    // in CSS with `@custom-variant dark (&:where(.dark, .dark *));`
    // (see src/app/globals.css).
    "@tailwindcss/postcss": {},
  },
};

export default config;
