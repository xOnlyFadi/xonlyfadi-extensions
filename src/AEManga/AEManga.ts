
import {
    Source,
    Manga,
    Chapter,
    ChapterDetails,
    HomeSection,
    SearchRequest,
    PagedResults,
    SourceInfo,
    TagType,
    TagSection,
    ContentRating,
    Request,
    Response,
    MangaUpdates
} from 'paperback-extensions-common'

import {
    parseChapterDetails,
    NextPage,
    parseTags,
    parseChapters,
    parseMangaDetails,
    parseSearch,
    getUpdatedManga
} from './AEMangaParser'

const AEManga_DOMAIN = 'https://manga.ae'

export const AEMangaInfo: SourceInfo = {
    version: '1.0.1',
    name: 'MangaAE',
    icon: 'icon.png',
    author: 'xOnlyFadi',
    authorWebsite: 'https://github.com/xOnlyFadi',
    description: 'Extension that pulls comics from manga.ae.',
    contentRating: ContentRating.EVERYONE,
    websiteBaseURL: AEManga_DOMAIN,
    language: 'Arabic',
    sourceTags: [
        {
            text: 'Cloudflare',
            type: TagType.RED
        },
        {
            text: 'العربية',
            type: TagType.GREY
        }
    ]
}

const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 12_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Safari/605.1.15'

export class AEManga extends Source {
    baseUrl = AEManga_DOMAIN

    requestManager = createRequestManager({
        requestsPerSecond: 2,
        requestTimeout: 15000,
        interceptor: {
            interceptRequest: async (request: Request): Promise<Request> => {

                request.headers = {
                    ...(request.headers ?? {}),
                    ...{
                        'user-agent': userAgent,
                        'referer': AEManga_DOMAIN
                    }
                }

                return request
            },

            interceptResponse: async (response: Response): Promise<Response> => {
                return response
            }
        }
    })

    override getMangaShareUrl(mangaId: string): string { return `${AEManga_DOMAIN}/${mangaId}` }

    override async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const sections = [
            {
                request: createRequestObject({
                    url: encodeURI(`${AEManga_DOMAIN}/manga/page:1|order:views`),
                    method: 'GET',
                }),
                section: createHomeSection({
                    id: 'views',
                    title: 'المانجا المشهورة',
                    view_more: true,
                }),
            },
            {
                request: createRequestObject({
                    url: encodeURI(`${AEManga_DOMAIN}/manga/page:1|order:updated_at`),
                    method: 'GET',
                }),
                section: createHomeSection({
                    id: 'updated_at',
                    title: 'المانجا المحدثه',
                    view_more: true,
                }),
            },
            {
                request: createRequestObject({
                    url: encodeURI(`${AEManga_DOMAIN}/manga/page:1|order:release_date`),
                    method: 'GET',
                }),
                section: createHomeSection({
                    id: 'release_date',
                    title: 'تاريخ النشر',
                    view_more: true,
                }),
            },
            {
                request: createRequestObject({
                    url: encodeURI(`${AEManga_DOMAIN}/manga/page:1|order:chapter_count`),
                    method: 'GET',
                }),
                section: createHomeSection({
                    id: 'chapter_count',
                    title: 'عدد الفصول',
                    view_more: true,
                }),
            },
            {
                request: createRequestObject({
                    url: encodeURI(`${AEManga_DOMAIN}/manga/page:1|order:status`),
                    method: 'GET',
                }),
                section: createHomeSection({
                    id: 'status',
                    title: 'الحالة',
                    view_more: true,
                }),
            },
        ]

        const promises: Promise<void>[] = []
        
        for (const section of sections) {
            sectionCallback(section.section)
            promises.push(
                this.requestManager.schedule(section.request, 1).then(response => {
                    this.CloudFlareError(response.status)
                    const $ = this.cheerio.load(response.data)
                    section.section.items = parseSearch($, this)
                    sectionCallback(section.section)
                }),
            )

        }
        await Promise.all(promises)
    }

    override async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1

        const request = createRequestObject({
            url: encodeURI(`${AEManga_DOMAIN}/manga/page:${page}|order:${homepageSectionId}`),
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)
        const manga = parseSearch($, this)

        metadata = NextPage($) ? { page: page + 1 } : undefined

        return createPagedResults({
            results: manga,
            metadata
        })
    }

    override async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1
        const Genres: string[] = []
        const Order: string[] = []
        const Sort: string[] = []
        query.includedTags?.map((x: any) => {
            if (x.id.includes('genres.')) {
                Genres.push(`|tag:${x.id?.split('.')?.pop()}`)
            }

            if (x.id.includes('order.')) {
                Order.push(`|order:${x.id?.split('.')?.pop()}`)
            }

            if (x.id.includes('sort.')) {
                Sort.push(`|arrange:${x.id?.split('.')?.pop()}`)
            }
        })

        let request

        if (query.title) {
            request = createRequestObject({
                url: encodeURI(`${AEManga_DOMAIN}/manga/page:${page}|search:${query.title.replace(/ /g,'%20')}${Order.length !== 0 ? Order[0] : ''}${Sort.length !== 0 ? Sort[0] : ''}`),
                method: 'GET',
            })
        } else {
            request = createRequestObject({
                url: encodeURI(`${AEManga_DOMAIN}/manga/page:${page}${Genres.length !== 0 ? Genres[0] : ''}${Order.length !== 0 ? Order[0] : ''}${Sort.length !== 0 ? Sort[0] : ''}`),
                method: 'GET',
            })
        }
        
        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)
        const manga = parseSearch($, this)

        metadata = NextPage($) ? { page: page + 1 } : undefined

        return createPagedResults({
            results: manga,
            metadata
        })
    }

    override async getTags(): Promise<TagSection[]> {
        const request = createRequestObject({
            url: `${AEManga_DOMAIN}/manga/`,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)

        return parseTags($)
    }

    override async getMangaDetails(mangaId: string): Promise<Manga> {
        const request = createRequestObject({
            url: `${AEManga_DOMAIN}/${mangaId}`,
            method: 'GET',
        })
        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)

        return parseMangaDetails($, mangaId)
    }

    override async getChapters(mangaId: string): Promise<Chapter[]> {
        const request = createRequestObject({
            url: `${AEManga_DOMAIN}/${mangaId}`,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)

        return parseChapters($, mangaId)
    }

    override async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const request = createRequestObject({
            url: `${AEManga_DOMAIN}/${mangaId}/${chapterId}`,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)

        return parseChapterDetails($, mangaId, chapterId)
    }

    override async filterUpdatedManga(mangaUpdatesFoundCallback: (updates: MangaUpdates) => void, time: Date, ids: string[]): Promise<void> {
        let page = 1
    
        while (page < 5) {
            const request = createRequestObject({
                url: `${AEManga_DOMAIN}/manga/page:${page}%7Corder:updated_at`,
                method: 'GET',
            })
    
            const mangaToUpdate: string[] = []

            const response = await this.requestManager.schedule(request, 1)
            const $ = this.cheerio.load(response.data)
    
            mangaToUpdate.push(...getUpdatedManga($, time, ids, this))

            page++

            if (mangaToUpdate.length > 0) {
                mangaUpdatesFoundCallback(createMangaUpdates({
                    ids: mangaToUpdate
                }))
            }
        }
    }

    override getCloudflareBypassRequest(): Request {
        return createRequestObject({
            url: AEManga_DOMAIN,
            method: 'GET',
            headers: {
                'user-agent': userAgent,
            }
        })
    }
    
    CloudFlareError(status: number): void {
        if(status == 503) {
            throw new Error('CLOUDFLARE BYPASS ERROR:\nPlease go to Settings > Sources > MangaAE and press Cloudflare Bypass or press the Cloud image on the right')
        }
    }
}
