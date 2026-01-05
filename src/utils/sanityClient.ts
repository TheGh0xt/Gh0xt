import { createClient } from '@sanity/client';

export const sanity = createClient({
  projectId: 'kciy3tvs', // Your Sanity project ID
  dataset: 'production', // Your dataset name
  apiVersion: '2023-10-01', // Use a recent date for the API version
  useCdn: true, // `false` if you want to ensure fresh data
});
