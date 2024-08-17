import {
    SourceManga,
    Chapter,
    ChapterDetails,
    HomeSection,
    SearchRequest,
    PagedResults,
    SourceInfo,
    ContentRating,
    Request,
    Response,
    TagSection,
    BadgeColor,
    ChapterProviding,
    HomePageSectionsProviding,
    MangaProviding,
    SearchResultsProviding,
    SourceIntents
} from '@paperback/types'

import {
    parseChapterDetails,
    parseChapters,
    parseSearch,
    parseMangaDetails,
    parseTags
} from './DesuMEParser'

import {
    ChapterDetailsImages,
    MangaDetails,
    Metadata,
    SearchData
} from './DesuMEHelper'

const DOMAIN = 'https://desu.me'
const API = `${DOMAIN}/manga/api`
export const DesuMEInfo: SourceInfo = {
    version: '2.0.3',
    name: 'Desu',
    icon: 'icon.png',
    author: 'xOnlyFadi',
    authorWebsite: 'https://github.com/xOnlyFadi',
    description: 'Extension that pulls from desu.me.',
    contentRating: ContentRating.EVERYONE,
    websiteBaseURL: DOMAIN,
    intents: SourceIntents.HOMEPAGE_SECTIONS | SourceIntents.MANGA_CHAPTERS,
    language: 'Russian',
    sourceTags: [
        {
            text: 'Russian',
            type: BadgeColor.GREY
        }
    ]
}

export class DesuME implements MangaProviding, ChapterProviding, SearchResultsProviding, HomePageSectionsProviding {
    requestManager = App.createRequestManager({
        requestsPerSecond: 4,
        requestTimeout: 15000,
        interceptor: {
            interceptRequest: async (request: Request): Promise<Request> => {
                request.headers = {
                    ...(request.headers ?? {}),
                    ...{
                        'user-agent': await this.requestManager.getDefaultUserAgent(),
                        'referer': `${DOMAIN}/`
                    }
                }
                return request
            },
            interceptResponse: async (response: Response): Promise<Response> => {
                return response
            }
        }
    })

    limit = 50

    getMangaShareUrl(mangaId: string): string { return `${DOMAIN}/manga/${mangaId}` }

    async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const sections = [
            {
                request: App.createRequest({
                    url: `${API}/?limit=${this.limit}&order=popular&page=1`,
                    method: 'GET'
                }),
                section: App.createHomeSection({
                    id: 'popular',
                    title: 'популярный',
                    containsMoreItems: true,
                    type: 'singleRowNormal'
                })
            },
            {
                request: App.createRequest({
                    url: `${API}/?limit=${this.limit}&order=updated&page=1`,
                    method: 'GET'
                }),
                section: App.createHomeSection({
                    id: 'updated',
                    title: 'обновленный',
                    containsMoreItems: true,
                    type: 'singleRowNormal'
                })
            },
            {
                request: App.createRequest({
                    url: `${API}/?limit=${this.limit}&order=name&page=1`,
                    method: 'GET'
                }),
                section: App.createHomeSection({
                    id: 'name',
                    title: 'по алфавиту',
                    containsMoreItems: true,
                    type: 'singleRowNormal'
                })
            }
        ]

        const promises: Promise<void>[] = []

        for (const section of sections) {
            sectionCallback(section.section)
            promises.push(this.requestManager.schedule(section.request, 1).then(response => {
                this.CloudFlareError(response.status)
                let data: SearchData
                try {
                    data = JSON.parse(response.data!) as SearchData
                }
                catch (e) {
                    throw new Error(JSON.stringify(e))
                }
                section.section.items = parseSearch(data)
                sectionCallback(section.section)
            }))
        }

        await Promise.all(promises)
    }

    async getViewMoreItems(homepageSectionId: string, metadata?: Metadata): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1
        const request = App.createRequest({
            url: `${API}/?limit=${this.limit}&order=${homepageSectionId}&page=${page}`,
            method: 'GET'
        })
        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)

        let data: SearchData
        try {
            data = JSON.parse(response.data!) as SearchData
        }
        catch (e) {
            throw new Error(JSON.stringify(e))
        }
        const manga = parseSearch(data)

        metadata = data.pageNavParams.count > data.pageNavParams.page * data.pageNavParams.limit ? { page: page + 1 } : undefined

        return App.createPagedResults({
            results: manga,
            metadata
        })
    }

    async getSearchResults(query: SearchRequest, metadata?: Metadata): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1
        let url = `${API}/?limit=${this.limit}&page=${page}`

        const Genres: string[] = []
        const Types: string[] = []
        const Order: string[] = []
        query.includedTags?.map(x => {
            const id = x?.id
            const SplittedID = id?.split('.')?.pop() ?? ''

            if (id.includes('genres.')) {
                Genres.push(SplittedID)
            }

            if (id.includes('types.')) {
                Types.push(SplittedID)
            }

            if (id.includes('order.')) {
                Order.push(SplittedID)
            }
        })

        if (query?.title) {
            url += `&search=${query?.title.replace(/ /g, '+').replace(/%20/g, '+')}`
        }

        if (Genres?.length > 0) {
            url += `&genres=${Genres.join(',')}`
        }

        if (Types?.length > 0) {
            url += `&kinds=${Types.join(',')}`
        }

        if (Order?.length > 0) {
            url += `&order=${Order[0]}`
        }

        const request = App.createRequest({
            url: url,
            method: 'GET'
        })
        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)

        let data: SearchData
        try {
            data = JSON.parse(response.data!) as SearchData
        }
        catch (e) {
            throw new Error(JSON.stringify(e))
        }
        const manga = parseSearch(data)

        metadata = data.pageNavParams.count > data.pageNavParams.page * data.pageNavParams.limit ? { page: page + 1 } : undefined

        return App.createPagedResults({
            results: manga,
            metadata
        })
    }

    async getMangaDetails(mangaId: string): Promise<SourceManga> {
        const request = App.createRequest({
            url: `${API}/${mangaId}`,
            method: 'GET'
        })
        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)

        let data: MangaDetails
        try {
            data = JSON.parse(response.data!) as MangaDetails
        }
        catch (e) {
            throw new Error(JSON.stringify(e))
        }

        return parseMangaDetails(data, mangaId)
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        const request = App.createRequest({
            url: `${API}/${mangaId}`,
            method: 'GET'
        })
        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)

        let data: MangaDetails
        try {
            data = JSON.parse(response.data!) as MangaDetails
        }
        catch (e) {
            throw new Error(JSON.stringify(e))
        }

        return parseChapters(data)
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const request = App.createRequest({
            url: `${API}/${mangaId}/chapter/${chapterId}`,
            method: 'GET'
        })
        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)

        let data: ChapterDetailsImages
        try {
            data = JSON.parse(response.data!) as ChapterDetailsImages
        }
        catch (e) {
            throw new Error(JSON.stringify(e))
        }

        return parseChapterDetails(data, mangaId, chapterId)
    }

    async getSearchTags(): Promise<TagSection[]> {
        return parseTags()
    }

    CloudFlareError(status: number): void {
        if (status == 503 || status == 403) {
            throw new Error(`CLOUDFLARE BYPASS ERROR:\nPlease go to Settings > Sources > ${DesuMEInfo.name} and press Cloudflare Bypass`)
        }
    }
}
