import { sanity } from './sanityClient';

export async function getSanityPostBySlug(slug: string) {
  const query = `*[_type == "post" && slug.current == $slug][0]{
    _id,
    title,
    description,
    publishedAt,
    slug,
    tags,
    markdown,
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
  return await sanity.fetch(query, { slug });
}
