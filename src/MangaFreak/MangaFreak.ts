import {
    PagedResults,
    SourceManga,
    Chapter,
    ChapterDetails,
    HomeSection,
    SearchRequest,
    SourceInfo,
    ContentRating,
    TagSection,
    Request,
    Response,
    BadgeColor,
    ChapterProviding,
    HomePageSectionsProviding,
    MangaProviding,
    SearchResultsProviding,
    SourceIntents
} from '@paperback/types'

import { Parser } from './MangaFreakParser'

const MangaFreak_BASE = 'https://ww1.mangafreak.me/'
const MangaFreak_CDN = 'https://images.mangafreak.net'
export const MangaFreakInfo: SourceInfo = {
    author: 'xOnlyFadi',
    description: 'Extension that pulls manga from mangafreak.net',
    icon: 'icon.png',
    name: 'MangaFreak',
    version: '2.0.3',
    authorWebsite: 'https://github.com/xOnlyFadi',
    websiteBaseURL: MangaFreak_BASE,
    contentRating: ContentRating.EVERYONE,
    intents: SourceIntents.CLOUDFLARE_BYPASS_REQUIRED | SourceIntents.HOMEPAGE_SECTIONS | SourceIntents.MANGA_CHAPTERS,
    language: 'English',
    sourceTags: [
        {
            text: 'Cloudflare',
            type: BadgeColor.RED
        }
    ]
}

export class MangaFreak implements MangaProviding, ChapterProviding, SearchResultsProviding, HomePageSectionsProviding {
    constructor(public cheerio: cheerio.CheerioAPI) { }

    private readonly parser: Parser = new Parser()
    baseUrl = MangaFreak_BASE
    baseCdn = MangaFreak_CDN

    readonly requestManager = App.createRequestManager({
        requestsPerSecond: 4,
        requestTimeout: 45000,
        interceptor: {
            interceptRequest: async (request: Request): Promise<Request> => {
                request.headers = {
                    ...(request.headers ?? {}),
                    ...{
                        'user-agent': await this.requestManager.getDefaultUserAgent(),
                        'referer': `${MangaFreak_BASE}/`
                    }
                }
                return request
            },
            interceptResponse: async (response: Response): Promise<Response> => {
                return response
            }
        }
    })

    getMangaShareUrl(mangaId: string): string {
        return `${MangaFreak_BASE}/Manga/${mangaId}`
    }

    async getCloudflareBypassRequestAsync(): Promise<Request> {
        return App.createRequest({
            url: `${MangaFreak_BASE}/Genre`,
            method: 'GET',
            headers: {
                'referer': `${this.baseUrl}/`,
                'user-agent': await this.requestManager.getDefaultUserAgent()
            }
        })
    }

    async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const request = App.createRequest({
            url: `${MangaFreak_BASE}/`,
            method: 'GET'
        })
        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data as string)
        this.CloudFlareError(response.status)

        return this.parser.parseHomeSections($, sectionCallback, MangaFreak_CDN)
    }

    async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        const page = metadata?.page ?? 1

        let param = ''
        let isPopular = false
        switch (homepageSectionId) {
            case 'popular':
                param = `Genre/All/${page}`
                isPopular = true
                break
            case 'today_manga':
                param = `Latest_Releases/${page}`
                break
            default:
                throw new Error(`Invalid homeSectionId | ${homepageSectionId}`)
        }

        const request = App.createRequest({
            url: `${MangaFreak_BASE}/${param}`,
            method: 'GET'
        })
        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data as string)
        this.CloudFlareError(response.status)
        const manga = this.parser.ViewMoreParse($, MangaFreak_CDN, isPopular)

        metadata = this.parser.NextPage($) ? { page: page + 1 } : undefined

        return App.createPagedResults({
            results: manga,
            metadata
        })
    }

    async getSearchTags(): Promise<TagSection[]> {
        const request = App.createRequest({
            url: `${MangaFreak_BASE}/Find`,
            method: 'GET'
        })
        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data as string)

        return this.parser.parseTags($)
    }

    async getMangaDetails(mangaId: string): Promise<SourceManga> {
        const request = App.createRequest({
            url: `${MangaFreak_BASE}/Manga/${mangaId}`,
            method: 'GET'
        })
        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data as string)

        return this.parser.parseMangaDetails($, mangaId, MangaFreak_CDN)
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        const request = App.createRequest({
            url: `${MangaFreak_BASE}/Manga/${mangaId}`,
            method: 'GET'
        })
        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data as string)

        return this.parser.parseChapters($)
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const request = App.createRequest({
            url: `${MangaFreak_BASE}/${chapterId}`,
            method: 'GET'
        })
        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data as string)

        return this.parser.parseChapterDetails($, mangaId, chapterId)
    }

    async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        const page = metadata?.page ?? 1

        let UsesDeatils = false
        let request
        if (query.includedTags?.length === 0) {
            request = App.createRequest({
                url: `${MangaFreak_BASE}/Find/${query?.title?.replace(/%20/g, '+').replace(/ /g, '+') ?? ''}`,
                method: 'GET'
            })
        } else {
            const GenreDeatils: string[] = []
            const SelectedTags: string[] = []
            const UnSelectedTags: string[] = []
            const Status: string[] = []
            const Types: string[] = []
            query.includedTags?.map(x => {
                const id = x.id
                const SplittedID = id?.split('.')?.pop() ?? ''

                if (id.includes('details.')) {
                    GenreDeatils.push(SplittedID)
                }

                if (query.includedTags?.length === 1 && id.includes('genre.')) {
                    GenreDeatils.push(SplittedID)
                }

                if (id.includes('genre.')) {
                    SelectedTags.push(SplittedID)
                }

                if (id.includes('status.')) {
                    Status.push(SplittedID)
                }

                if (id.includes('types.')) {
                    Types.push(SplittedID)
                }
            })

            query.excludedTags?.map(x => {
                const id = x.id
                const SplittedID = id?.split('.')?.pop() ?? ''

                if (id.includes('genre.')) {
                    UnSelectedTags.push(SplittedID)
                }
            })

            if (GenreDeatils.length === 1) {
                request = App.createRequest({
                    url: `${MangaFreak_BASE}/Genre/${GenreDeatils[0]}/${page}`,
                    method: 'GET'
                })
                UsesDeatils = true
            } else {
                if (!query.title) {
                    throw new Error('Do not use genre with multipule tags search without putting a title or the search will infinitely loop')
                }

                const genres: string[] = ['/Genre/']
                for (const tag of (await this.getSearchTags())[0]?.tags ?? []) {
                    const SplittedID = tag.id?.split('.')?.pop() ?? ''
                    if (SelectedTags?.includes(SplittedID)) {
                        genres.push('1')
                    } else if (UnSelectedTags?.includes(SplittedID)) {
                        genres.push('2')
                    } else {
                        genres.push('0')
                    }
                }

                request = App.createRequest({
                    url: `${MangaFreak_BASE}/Find/${query?.title?.replace(/%20/g, '+').replace(/ /g, '+') ?? ''}${genres.join('')}/Status/${Status.length !== 0 ? Status[0] : '0'}/Type/${Types.length !== 0 ? Types[0] : '0'}`,
                    method: 'GET'
                })
            }
        }

        const data = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(data.status)
        const $ = this.cheerio.load(data.data as string)
        const manga = this.parser.parseSearchResults($, MangaFreak_CDN, UsesDeatils)

        metadata = this.parser.NextPage($) ? { page: page + 1 } : undefined

        return App.createPagedResults({
            results: manga,
            metadata
        })
    }

    async supportsTagExclusion(): Promise<boolean> {
        return true
    }

    CloudFlareError(status: number): void {
        if (status == 503 || status == 403) {
            throw new Error(`CLOUDFLARE BYPASS ERROR:\nPlease go to Settings > Sources > ${MangaFreakInfo.name} and press Cloudflare Bypass`)
        }
    }
}
