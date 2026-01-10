import { sanity } from './sanityClient';

export async function getSanityPosts() {
  // GROQ query to fetch posts
  const query = `*[_type == "post"]|order(publishedAt desc){
    _id,
    title,
    description,
    publishedAt,
    slug,
    tags,
    mainImage {
      asset -> {
        url
      },
      alt,
      caption
    },
    body[] {
      ...,
      _type == "image" => {
        asset -> {
          url
        },
        alt,
        caption
      }
    }
  }`;
  return await sanity.fetch(query);
}
