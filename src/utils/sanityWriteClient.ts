import { createClient } from "@sanity/client";

export const sanityWriteClient = createClient({
  projectId: "kciy3tvs",
  dataset: "production",
  useCdn: false,
  apiVersion: "2023-10-01",
  token: import.meta.env.SANITY_API_WRITE_TOKEN,
});
