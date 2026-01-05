// @ts-check
import { defineConfig } from "astro/config";

import tailwind from "@astrojs/tailwind";

import react from "@astrojs/react";

import mdx from "@astrojs/mdx";
import vercel from "@astrojs/vercel/serverless";


import sanity from "@sanity/astro";

export default defineConfig({
  output: 'server',
  integrations: [tailwind(), react(), mdx(), sanity({
    projectId: 'kciy3tvs',
    dataset: 'production',

    useCdn: false,
  })],

  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
  }),
});