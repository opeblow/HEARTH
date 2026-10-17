import next from "eslint-config-next/core-web-vitals";

const config = [
  ...next,
  {
    // Reading browser state (sessionStorage / localStorage / matchMedia) on
    // mount and syncing it into React state is the SSR-safe pattern. The React
    // Compiler's blanket ban on it is too strict for those cases here.
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    ignores: [".next/**", "node_modules/**", "next-env.d.ts"],
  },
];

export default config;
