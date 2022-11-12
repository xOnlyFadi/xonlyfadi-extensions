/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    PagedResults,
    Source,
    Manga,
    Chapter,
    ChapterDetails,
    HomeSection,
    SearchRequest,
    SourceInfo,
    ContentRating,
    LanguageCode,
    Request,
    Response,
    TagSection,
    SearchField
} from 'paperback-extensions-common'

import {
    SearchQuery,
    MangaDetailQuery,
    ChaptersQuery,
    FiltersQuery,
    ChapterDetailsQuery,
    HomePageQuery
} from './VoyceMEGraphQL'

import { 
    SearchType,
    VoyceChapterData, 
    VoyceChapterDetailsData, 
    VoyceMangaData 
} from './VoyceMEHelper'

import {
    Parser
} from './VoyceMEParser'

const VoyceME_Base = 'http://voyce.me'

export const VoyceMEInfo: SourceInfo = {
    author: 'xOnlyFadi',
    description: 'Extension that pulls manga from voyce.me',
    icon: 'icon.png',
    name: 'Voyce.Me',
    version: '2.0.0',
    authorWebsite: 'https://github.com/xOnlyFadi',
    websiteBaseURL: VoyceME_Base,
    contentRating: ContentRating.EVERYONE,
    language: LanguageCode.ENGLISH,
}

export class VoyceME extends Source {

    private readonly parser: Parser = new Parser()
    
    private readonly graphqlURL: string = 'https://graphql.voyce.me/v1/graphql'
    private readonly popularPerPage: number = 30

    readonly requestManager = createRequestManager({
        requestsPerSecond: 3,
        requestTimeout: 15000,
        interceptor: {
            interceptRequest: async (request: Request): Promise<Request> => {

                request.headers = {
                    ...(request.headers ?? {}),
                    ...{
                        'Accept': '*/*',
                        'Referer': `${VoyceME_Base}/`,
                        'Origin': VoyceME_Base,
                        'content-type': 'application/json',
                        'accept': 'application/json',
                    }
                }

                return request
            },

            interceptResponse: async (response: Response): Promise<Response> => {
                return response
            }
        }
    })

    override getMangaShareUrl(mangaId: string): string {
        return `${VoyceME_Base}/series/${mangaId}`
    }

    override async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const request = createRequestObject({
            url: this.graphqlURL,
            method: 'POST',
            data: HomePageQuery(0, this)
        })
        const response = await this.requestManager.schedule(request, 1)
        let data
        try {
            data = JSON.parse(response.data)
        } catch (e) {
            throw new Error(`${e}`)
        }

        this.parser.parseHomeSections(data, sectionCallback)

    }

    override async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 0

        const request = createRequestObject({
            url: this.graphqlURL,
            method: 'POST',
            data: HomePageQuery(page, this)
        })

        const response = await this.requestManager.schedule(request, 1)

        let data
        try {
            data = JSON.parse(response.data)
        } catch (e) {
            throw new Error(`${e}`)
        }

        const manga = this.parser.parseViewMore(homepageSectionId, data)
        metadata = manga.length == this.popularPerPage ? {page: page + 1} : undefined

        return createPagedResults({
            results: manga,
            metadata
        })
    }

    async getMangaDetails(mangaId: string): Promise<Manga> {
        const options = createRequestObject({
            url: this.graphqlURL,
            method: 'POST',
            data: MangaDetailQuery(Number(mangaId))
        })

        const response = await this.requestManager.schedule(options, 1)

        let data: VoyceMangaData
        try {
            data = JSON.parse(response.data)
        } catch (e) {
            throw new Error(`${e}`)
        }

        if(data.data.series?.isEmpty()) throw new Error(`Failed to parse manga property from data object mangaId: ${mangaId}`)

        return this.parser.parseMangaDetails(data, mangaId)
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        const options = createRequestObject({
            url: this.graphqlURL,
            method: 'POST',
            data: ChaptersQuery(Number(mangaId))
        })

        const response = await this.requestManager.schedule(options, 1)
        
        let data: VoyceChapterData
        try {
            data = JSON.parse(response.data)
        } catch (e) {
            throw new Error(`${e}`)
        }

        if (data.data?.series?.isEmpty()) throw new Error(`Failed to parse manga property from data object mangaId: ${mangaId}`)

        if (data.data?.series?.first()?.chapters?.isEmpty()) throw new Error(`Failed to parse chapters property from manga object mangaId: ${mangaId}`)

        return this.parser.parseChapters(data, mangaId)
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const options = createRequestObject({
            url: this.graphqlURL,
            method: 'POST',
            data: ChapterDetailsQuery(Number(chapterId))
        })

        const response = await this.requestManager.schedule(options, 1)

        let data: VoyceChapterDetailsData
        try {
            data = JSON.parse(response.data)
        } catch (e) {
            throw new Error(`${e}`)
        }

        return this.parser.parseChapterDetails(data, mangaId, chapterId)
    }

    async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 0

        const request = createRequestObject({
            url: this.graphqlURL,
            method: 'POST',
            data: SearchQuery(query, metadata, this)
        })

        const response = await this.requestManager.schedule(request, 2)

        let data
        try {
            data = JSON.parse(response.data)
        } catch (e) {
            throw new Error(`${e}`)
        }

        const manga = this.parser.parseSearch(data)

        metadata = manga.length == this.popularPerPage ? {page: page + 1} : undefined

        return createPagedResults({
            results: manga,
            metadata
        })
    }
    
    override async getSearchTags(): Promise<TagSection[]> {
        const request = createRequestObject({
            url: this.graphqlURL,
            method: 'POST',
            data: FiltersQuery()
        })

        const response = await this.requestManager.schedule(request, 2)

        let data: SearchType
        try {
            data = JSON.parse(response.data)
        } catch (e) {
            throw new Error(`${e}`)
        }

        return this.parser.parseTags(data)
    }

    override async supportsSearchOperators(): Promise<boolean> {
        return true
    }

    override async getSearchFields(): Promise<SearchField[]> {
        return [
            createSearchField({id: 'author', placeholder: '', name: 'Author'}),
            createSearchField({id: 'description', placeholder: '', name: 'Description'})
        ]
    }
}
