// @ts-check
import { defineConfig } from "astro/config";

import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import vercel from "@astrojs/vercel";
import sanity from "@sanity/astro";

export default defineConfig({
  site: "https://thegh0xt.vercel.app",
  output: "server",

  // The project was renamed from Sirius to Brnq; keep old links working.
  redirects: {
    "/work/sirius": "/work/brnq",
  },

  integrations: [
    tailwind(),
    react(),
    mdx(),
    sanity({
      projectId: "kciy3tvs",
      dataset: "production",
      // Reads go through the Sanity CDN. The write client
      // (src/utils/sanityWriteClient.ts) deliberately does not.
      useCdn: true,
    }),
  ],

  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
  }),
});
