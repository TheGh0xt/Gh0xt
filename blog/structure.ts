import type {StructureResolver} from 'sanity/structure'

/**
 * Moderation lives here: unapproved comments surface in their own Pending
 * list rather than being mixed in with published ones.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.documentTypeListItem('post').title('Posts'),
      S.divider(),
      S.listItem()
        .title('Comments — Pending')
        .child(
          S.documentList()
            .title('Pending Comments')
            .filter('_type == "comment" && approved != true')
            .defaultOrdering([{field: 'createdAt', direction: 'desc'}]),
        ),
      S.listItem()
        .title('Comments — Approved')
        .child(
          S.documentList()
            .title('Approved Comments')
            .filter('_type == "comment" && approved == true')
            .defaultOrdering([{field: 'createdAt', direction: 'desc'}]),
        ),
      S.divider(),
      S.documentTypeListItem('reaction').title('Reactions'),
      S.documentTypeListItem('author').title('Authors'),
      S.documentTypeListItem('category').title('Categories'),
    ])
