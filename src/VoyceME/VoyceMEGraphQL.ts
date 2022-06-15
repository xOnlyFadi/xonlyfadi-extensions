export interface GraphQLQuery {
    query: string
    variables?: unknown
}
export const LatestQuery = (page: number, source : any): GraphQLQuery => ({
    query: `query($limit: Int, $offset: Int) {
        voyce_series(
            where: {
                publish: { _eq: 1 },
                type: { id: { _in: [2, 4] } }
            },
            order_by: [{ updated_at: desc }],
            limit: $limit,
            offset: $offset
        ) {
            id
            slug
            thumbnail
            title
        }
    }`,
    variables: {'offset': (page - 1) * source.popularPerPage,'limit':source.popularPerPage}
})
export const popularQuery = (page: number, source : any): GraphQLQuery => ({
    query: `query($limit: Int!, $offset: Int!) {
        voyce_series(
            where: {
                publish: { _eq: 1 },
                type: { id: { _in: [2, 4] } }
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
    variables: {'offset': (page - 1) * source.popularPerPage,'limit':source.popularPerPage}
})
export const Top5Query = (): GraphQLQuery => ({
    query: `query{
        voyce_series(
          where: {
            series_tags_junctions: {
              series_tag: { name: { _eq: "originals_top_voyceme" } }
            }
          }
          limit: 5
        ) {
                  id
                  slug
                  thumbnail
                  title
        }
      }`,
    variables: {}
})
export const SearchQuery = (query:string, page: number, source : any): GraphQLQuery => ({
    query: `query($searchTerm: String!, $limit: Int, $offset: Int) {
    voyce_series(
        where: {
            publish: { _eq: 1 },
            type: { id: { _in: [2, 4] } },
            title: { _ilike: $searchTerm }
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
    variables: {'searchTerm':`%${query}%`,'offset': (page - 1) * source.popularPerPage,'limit':source.popularPerPage}
})
export const MangaDetailQuery = (slug:string): GraphQLQuery => ({
    query: `query($slug: String!) {
        voyce_series(
            where: {
                publish: { _eq: 1 },
                type: { id: { _in: [2, 4] } },
                slug: { _eq: $slug }
            },
            limit: 1,
        ) {
            id
            slug
            thumbnail
            title
            description
            status
            author { username }
            genres(order_by: [{ genre: { title: asc } }]) {
                genre { title }
            }
        }
    }`,
    variables: {'slug':slug}
})

export const ChapterDetailQuery = (slug:string): GraphQLQuery => ({
    query: `query($slug: String!) {
        voyce_series(
            where: {
                publish: { _eq: 1 },
                type: { id: { _in: [2, 4] } },
                slug: { _eq: $slug }
            },
            limit: 1,
        ) {
            slug
            chapters(order_by: [{ created_at: desc }]) {
                id
                title
                created_at
            }
        }
    }`,
    variables: {'slug':slug}
})