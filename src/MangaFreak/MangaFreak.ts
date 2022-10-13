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
    TagSection,
    LanguageCode,
    Request,
    Response,
    TagType
} from 'paperback-extensions-common'

import {
    Parser
} from './MangaFreakParser'

const MangaFreak_BASE = 'https://w13.mangafreak.net'
const MangaFreak_CDN = 'https://images.mangafreak.net'
const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 12_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Safari/605.1.15'

export const MangaFreakInfo: SourceInfo = {
    author: 'xOnlyFadi',
    description: 'Extension that pulls manga from mangafreak.net',
    icon: 'icon.png',
    name: 'MangaFreak',
    version: '1.0.3',
    authorWebsite: 'https://github.com/xOnlyFadi',
    websiteBaseURL: MangaFreak_BASE,
    contentRating: ContentRating.EVERYONE,
    language: LanguageCode.ENGLISH,
    sourceTags: [
        {
            text: 'Cloudflare',
            type: TagType.RED
        }
    ]
}

export class MangaFreak extends Source {
    private readonly parser: Parser = new Parser()

    baseUrl = MangaFreak_BASE
    baseCdn = MangaFreak_CDN
    readonly requestManager = createRequestManager({
        requestsPerSecond: 3,
        requestTimeout: 45000,
        interceptor: {
            interceptRequest: async (request: Request): Promise<Request> => {

                request.headers = {
                    ...(request.headers ?? {}),
                    ...{
                        'user-agent': userAgent,
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


    override getMangaShareUrl(mangaId: string): string {
        return `${MangaFreak_BASE}/Manga/${mangaId}`
    }
    override getCloudflareBypassRequest(): any {
        return createRequestObject({
            url: `${MangaFreak_BASE}/Genre`,
            method: 'GET',
            headers:{
                'user-agent': userAgent
            }
        })
    }

    override async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const request = createRequestObject({
            url: `${MangaFreak_BASE}/`,
            method: 'GET'
        })
        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)

        this.CloudFlareError(response.status)
        return this.parser.parseHomeSections($, sectionCallback, this)
    }

    override async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
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

        const request = createRequestObject({
            url: `${MangaFreak_BASE}/${param}`,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)
        this.CloudFlareError(response.status)
        const manga = this.parser.ViewMoreParse($, this, isPopular)

        metadata = this.parser.NextPage($) ? {page: page + 1} : undefined 

        return createPagedResults({
            results: manga,
            metadata
        })
    }

    override async getSearchTags(): Promise<TagSection[]> {
        const request = createRequestObject({
            url: `${MangaFreak_BASE}/Search`,
            method: 'GET'
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)

        return this.parser.parseTags($)
    }

    async getMangaDetails(mangaId: string): Promise<Manga> {
        const request = createRequestObject({
            url: `${MangaFreak_BASE}/Manga/${mangaId}`,
            method: 'GET',
        })
        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)

        return this.parser.parseMangaDetails($, mangaId, this)
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        const request = createRequestObject({
            url: `${MangaFreak_BASE}/Manga/${mangaId}`,
            method: 'GET'
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)

        return this.parser.parseChapters($, mangaId)
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const request = createRequestObject({
            url: `${MangaFreak_BASE}/${chapterId}`,
            method: 'GET'
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)

        return this.parser.parseChapterDetails($, mangaId, chapterId)
    }

    async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        const page = metadata?.page ?? 1
        let UsesDeatils = false
        let request

        if(query.includedTags?.length === 0){
            request = createRequestObject({
                url: `${MangaFreak_BASE}/Search/${query?.title?.replace(/%20/g, '+').replace(/ /g,'+') ?? ''}`,
                method: 'GET',
            })   
        } else {
            const GenreDeatils: string[] = []
            const SelectedTags: string[] = []
            const UnSelectedTags: string[] = []
            const Status: string[] = []
            const Types: string[] = []

            query.includedTags?.map(x =>{ 
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

            query.excludedTags?.map(x =>{ 
                const id = x.id
                const SplittedID = id?.split('.')?.pop() ?? ''

                if (id.includes('genre.')) {
                    UnSelectedTags.push(SplittedID)
                }
            })

            if (GenreDeatils.length === 1) {
                request = createRequestObject({
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

                request = createRequestObject({
                    url: `${MangaFreak_BASE}/Search/${query?.title?.replace(/%20/g, '+').replace(/ /g,'+') ?? ''}${genres.join('')}/Status/${Status.length !== 0 ? Status[0] : '0'}/Type/${Types.length !== 0 ? Types[0] : '0'}`,
                    method: 'GET',
                })
            }

        }

        const data = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(data.status)
        const $ = this.cheerio.load(data.data)
        const manga = this.parser.parseSearchResults($, this, UsesDeatils)

        metadata = this.parser.NextPage($) ? {page: page + 1} : undefined 

        return createPagedResults({
            results: manga,
            metadata
        })
    }

    override async supportsTagExclusion(): Promise<boolean> {
        return true
    }

    CloudFlareError(status: number) {
        if(status == 503) {
            throw new Error('CLOUDFLARE BYPASS ERROR:\nPlease go to Settings > Sources > MangaFreak and press Cloudflare Bypass or press the Cloud image on the right')
        }
    }
}