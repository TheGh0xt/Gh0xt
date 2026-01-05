// @ts-check
import { defineConfig } from "astro/config";

import tailwind from "@astrojs/tailwind";

import react from "@astrojs/react";

import mdx from "@astrojs/mdx";


import sanity from "@sanity/astro";

export default defineConfig({
  site: 'https://TheGh0xt.github.io',
  base: '/',
  output: 'static',
  integrations: [tailwind(), react(), mdx(), sanity({
    projectId: 'kciy3tvs',
    dataset: 'production',

    useCdn: false,
  })],
});