import { SearchRequest } from '@paperback/types'

export interface GraphQLQuery {
    query: string;
    variables?: unknown;
}

export const HomePageQuery = (page: number, popularPerPage: number): GraphQLQuery => ({
    query: `query ($offset: Int, $limit: Int) {
      featured: voyce_series(
        where: {
          publish: { _eq: 1 }
          type: { id: { _in: [2, 4] } }
          feature: { _eq: "1" }
          id: { _is_null: false }
        }
        order_by: { views_counts: { count: desc_nulls_last } }
        limit: 10
      ) {
        ...info
      }
      popular: voyce_series(
        where: {
          publish: { _eq: 1 }
          type: { id: { _in: [2, 4] } }
          id: { _is_null: false }
        }
        order_by: { views_counts: { count: desc_nulls_last } }
        limit: $limit
        offset: $offset
      ) {
        ...info
      }
      trending: voyce_series(
        where: {
          publish: { _eq: 1 }
          type: { id: { _in: [2, 4] } }
          id: { _is_null: false }
        }
        order_by: { trending: desc_nulls_last }
        limit: $limit
        offset: $offset
      ) {
        ...info
      }
      recommended: voyce_series(
        where: {
          publish: { _eq: 1 }
          type: { id: { _in: [2, 4] } }
          id: { _is_null: false }
        }
        order_by: { is_recommended: desc_nulls_last }
        limit: $limit
        offset: $offset
      ) {
        ...info
      }
      recent: voyce_series(
        where: {
          publish: { _eq: 1 }
          id: { _is_null: false }
          type: { id: { _in: [2, 4] } }
        }
        order_by: { updated_at: desc_nulls_last }
        limit: $limit
        offset: $offset
      ) {
        ...info
      }
      fresh: voyce_series(
        limit: $limit
        offset: $offset
        where: {
          publish: { _eq: 1 }
          id: { _is_null: false }
          type: { id: { _in: [2, 4] } }
        }
        order_by: { created_at: desc_nulls_last }
      ) {
        ...info
      }
    }
    
    fragment info on voyce_series {
      id
      thumbnail
      title
      chapter_count
    }`,
    variables: { 'offset': page * popularPerPage, 'limit': popularPerPage }
})

export const SearchQuery = (query: SearchRequest, page: number, popularPerPage: number): GraphQLQuery => {
    const Genres: number[] = []
    const Types: number[] = []
    const Status: string[] = []
    let Category = false

    query.includedTags?.map(x => {
        const id = x?.id ?? ''
        const SplittedID = id?.split('.')?.pop() ?? ''

        if(id.includes('genre.')) {
            Genres.push(Number(SplittedID))
        }

        if(id.includes('types.')) {
            Types.push(Number(SplittedID))
        }

        if(id.includes('category.')) {
            Category = true
        }

        if(id.includes('status.')) {
            Status.push(SplittedID)
        }
    })

    const title = query?.title ?? ''
    const description = query?.parameters.description as string
    const author = query?.parameters?.author as string

    return {
        query: `query($limit: Int, $offset: Int) {
            voyce_series(
                where: {
                    ${title || description || author ? `_or: [
                        ${title ? `{ title: { _ilike: "%${title}%" } }` : ''}
                        ${description ? `{ description: { _ilike: "%${description}%" } }` : ''}
                        ${author ? `{ author: { username: { _ilike: "%${author}%" } } }` : ''}
                        ]` : ''}
                    publish: { _eq: 1 },
                    ${Category ? 'is_original: {_eq: 1}' : ''}
                    type: { id: { _in: ${Types?.length > 0 ? `${JSON.stringify(Types)}` : '[2, 4]'} } }
                    ${Status?.length > 0 ? `status: { _in: ${JSON.stringify(Status)} }` : ''}
                    ${Genres?.length > 0 ? `genres: { genre_id: { _in: ${JSON.stringify(Genres)} } }` : ''}
                },
                order_by: [{ views_counts: { count: desc_nulls_last } }],
                limit: $limit,
                offset: $offset
            ) {
                id
                slug
                thumbnail
                title
            }
        }`,
        variables: {'offset': page * popularPerPage, 'limit': popularPerPage}
    }
}

export const MangaDetailQuery = (id: number): GraphQLQuery => ({
    query: `query($id: Int!) {
        series: voyce_series(
            where: { 
              id: { _eq: $id }
              publish: { _eq: 1 },
              type: { id: { _in: [2, 4] } },
          }, 
            limit: 1
            ) {
                  id
                  slug
                  thumbnail
                  title
                  description
                  status
                  author { username }
                  genres(order_by: [{ genre: { title: asc } }]) {
                      genre { 
                        title
                        id 
                    }
                  }
              }
      }`,
    variables: { 'id': id }
})

export const ChaptersQuery = (id: number): GraphQLQuery => ({
    query: `query ($id: Int!) {
        series: voyce_series(
          where: {
            id: { _eq: $id }
            publish: { _eq: 1 }
            type: { id: { _in: [2, 4] } }
          }
          limit: 1
        ) {
          chapters(order_by: [{ created_at: desc }]) {
            id
            title
            created_at
          }
        }
      }`,
    variables: { 'id': id }
})

export const ChapterDetailsQuery = (chapterId: number): GraphQLQuery => ({
    query: `query($chapterId: Int!) {
        images: voyce_chapter_images(
          where: { chapter_id: { _eq: $chapterId } }
          order_by: [{ sort_order: asc }, { id: asc }]
        ) {
          image
          id
          sort_order
        }
      }`,
    variables: { 'chapterId': chapterId }
})

export const FiltersQuery = (): GraphQLQuery => ({
    query: `query filterTypes {
        types: voyce_comic_types {
          title
          id
        }
        genres: voyce_genres {
          title
          id
        }
      }`,
    variables: {}
})
