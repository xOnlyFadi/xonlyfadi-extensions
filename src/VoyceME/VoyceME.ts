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
    MangaStatus,
    ContentRating,
    LanguageCode,
    Request,
    Response,
    HomeSectionType
} from 'paperback-extensions-common'
import {LatestQuery,
    popularQuery,
    Top5Query,
    SearchQuery,
    MangaDetailQuery,
    ChapterDetailQuery} from './VoyceMEGraphQL'
import {
    Parser
} from './VoyceMEParser'
const VoyceME_Base = 'http://voyce.me'

export const VoyceMEInfo: SourceInfo = {
    author: 'xOnlyFadi',
    description: 'Extension that pulls manga from voyce.me',
    icon: 'icon.png',
    name: 'Voyce.Me',
    version: '1.0.8',
    authorWebsite: 'https://github.com/xOnlyFadi',
    websiteBaseURL: VoyceME_Base,
    contentRating: ContentRating.EVERYONE,
    language: LanguageCode.ENGLISH,
}

export class VoyceME extends Source {

    private readonly parser: Parser = new Parser()
    
    private readonly graphqlURL: string = 'https://graphql.voyce.me/v1/graphql'
    private readonly popularPerPage: number = 10

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
        const sections = [
            {
                request: createRequestObject({
                    url: this.graphqlURL,
                    method: 'POST',
                    data: Top5Query()
                }),
                section: createHomeSection({
                    id: '0',
                    title: 'Top 5 Series',
                    type: HomeSectionType.featured,
                }),
            },
            {
                request: createRequestObject({
                    url: this.graphqlURL,
                    method: 'POST',
                    data: LatestQuery(1,this)
                }),
                section: createHomeSection({
                    id: '1',
                    title: 'Latest Updates',
                    view_more: true,
                }),
            },
            {
                request: createRequestObject({
                    url: this.graphqlURL,
                    method: 'POST',
                    data: popularQuery(1,this)
                }),
                section: createHomeSection({
                    id: '2',
                    title: 'Popular Series',
                    view_more: true,
                }),
            },
        ]

        const promises: Promise<void>[] = []
        for (const section of sections) {
            sectionCallback(section.section)
            promises.push(
                this.requestManager.schedule(section.request, 1).then(response => {
                    let data
                    try {
                        data = JSON.parse(response.data)
                        section.section.items = this.parser.parseHomeSections(data)
                        sectionCallback(section.section)
                    } catch (e) {
                        throw new Error(`${e}`)
                    }
                }),
            )

        }
        await Promise.all(promises)
    }

    override async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        if (metadata?.completed) return metadata
        const page: number = metadata?.page ?? 1
        let graph

        switch (homepageSectionId) {
            case '1':
                graph = LatestQuery(page,this)
                break
            case '2':
                graph = popularQuery(page,this)
                break
            default:
                throw new Error(`Invalid homeSectionId | ${homepageSectionId}`)
        }

        const request = createRequestObject({
            url: this.graphqlURL,
            method: 'POST',
            data: graph
        })

        const response = await this.requestManager.schedule(request, 1)

        let data
        try {
            data = JSON.parse(response.data)
        } catch (e) {
            throw new Error(`${e}`)
        }

        const manga = this.parser.parseHomeSections(data)
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
            data: MangaDetailQuery(mangaId)
        })

        const response = await this.requestManager.schedule(options, 1)

        let data
        try {
            data = JSON.parse(response.data)
        } catch (e) {
            throw new Error(`${e}`)
        }

        if(!data.data.voyce_series[0]) throw new Error(`Failed to parse manga property from data object mangaId:${mangaId}`)

        return this.parser.parseMangaDetails(data, mangaId,this)
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        const options = createRequestObject({
            url: this.graphqlURL,
            method: 'POST',
            data: ChapterDetailQuery(mangaId)
        })

        const response = await this.requestManager.schedule(options, 1)
        
        let data
        try {
            data = JSON.parse(response.data)
        } catch (e) {
            throw new Error(`${e}`)
        }

        if(!data.data?.voyce_series[0]) throw new Error(`Failed to parse manga property from data object mangaId:${mangaId}`)
        if (data.data?.manga?.voyce_series[0]?.length == 0) throw new Error(`Failed to parse chapters property from manga object mangaId:${mangaId}`)

        return this.parser.parseChapters(data, mangaId)
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const options = createRequestObject({
            url: `${VoyceME_Base}/series/${chapterId}`,
            method: 'GET'
        })

        const response = await this.requestManager.schedule(options, 1)
        const $ = this.cheerio.load(response.data)

        return this.parser.parseChapterDetails($, mangaId, chapterId,this)
    }

    async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        if(!query.title) return createPagedResults({ results: [], metadata: undefined })

        const page: number = metadata?.page ?? 1
        
        const request = createRequestObject({
            url: this.graphqlURL,
            method: 'POST',
            data: SearchQuery(query.title.replace(/%20/g, ' ').replace(/_/g,' ') ?? '',page,this)
        })

        const response = await this.requestManager.schedule(request, 2)

        let data
        try {
            data = JSON.parse(response.data)
        } catch (e) {
            throw new Error(`${e}`)
        }

        const manga = this.parser.parseHomeSections(data)

        metadata = manga.length == this.popularPerPage ? {page: page + 1} : undefined

        return createPagedResults({
            results: manga,
            metadata
        })
    }
    
    parseStatus(str: string): MangaStatus {
        let status = MangaStatus.UNKNOWN
        switch (str.toLowerCase()) {
            case 'ongoing':
            case 'on-going':
                status = MangaStatus.ONGOING
                break
            case 'completed':
                status = MangaStatus.COMPLETED
                break
        }
        return status
    }
}
