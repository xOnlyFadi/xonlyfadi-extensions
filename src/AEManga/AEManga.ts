import {
    SourceManga,
    Chapter,
    ChapterDetails,
    HomeSection,
    SearchRequest,
    PagedResults,
    SourceInfo,
    BadgeColor,
    TagSection,
    ContentRating,
    Request,
    Response,
    ChapterProviding,
    HomePageSectionsProviding,
    MangaProviding,
    SearchResultsProviding,
    SourceIntents
} from '@paperback/types'

import { 
    parseChapterDetails,
    NextPage,
    parseTags,
    parseChapters,
    parseMangaDetails,
    parseSearch
} from './AEMangaParser'

const AEManga_DOMAIN = 'https://manga.ae'
export const AEMangaInfo: SourceInfo = {
    version: '2.0.0',
    name: 'AEManga',
    icon: 'icon.png',
    author: 'xOnlyFadi',
    authorWebsite: 'https://github.com/xOnlyFadi',
    description: 'Extension that pulls comics from manga.ae.',
    contentRating: ContentRating.EVERYONE,
    websiteBaseURL: AEManga_DOMAIN,
    intents: SourceIntents.HOMEPAGE_SECTIONS | SourceIntents.MANGA_CHAPTERS | SourceIntents.CLOUDFLARE_BYPASS_REQUIRED,
    language: 'Arabic',
    sourceTags: [
        {
            text: 'Cloudflare',
            type: BadgeColor.RED
        },
        {
            text: 'Arabic',
            type: BadgeColor.GREY
        }
    ]
}

export class AEManga implements MangaProviding, ChapterProviding, SearchResultsProviding, HomePageSectionsProviding {
    constructor(public cheerio: CheerioAPI) { }

    baseUrl = AEManga_DOMAIN;
    requestManager = App.createRequestManager({
        requestsPerSecond: 2,
        requestTimeout: 15000,
        interceptor: {
            interceptRequest: async (request: Request): Promise<Request> => {
                request.headers = {
                    ...(request.headers ?? {}),
                    ...{
                        'user-agent': await this.requestManager.getDefaultUserAgent(),
                        'referer': `${this.baseUrl}/`
                    }
                }
                return request
            },
            interceptResponse: async (response: Response): Promise<Response> => {
                return response
            }
        }
    });
    
    getMangaShareUrl(mangaId: string): string { return `${AEManga_DOMAIN}/${mangaId}` }
    
    async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const sections = [
            {
                request: App.createRequest({
                    url: encodeURI(`${AEManga_DOMAIN}/manga/page:1|order:views`),
                    method: 'GET'
                }),
                section: App.createHomeSection({
                    id: 'views',
                    title: 'المانجا المشهورة',
                    containsMoreItems: true,
                    type: 'singleRowNormal'
                })
            },
            {
                request: App.createRequest({
                    url: encodeURI(`${AEManga_DOMAIN}/manga/page:1|order:updated_at`),
                    method: 'GET'
                }),
                section: App.createHomeSection({
                    id: 'updated_at',
                    title: 'المانجا المحدثه',
                    containsMoreItems: true,
                    type: 'singleRowNormal'
                })
            },
            {
                request: App.createRequest({
                    url: encodeURI(`${AEManga_DOMAIN}/manga/page:1|order:release_date`),
                    method: 'GET'
                }),
                section: App.createHomeSection({
                    id: 'release_date',
                    title: 'تاريخ النشر',
                    containsMoreItems: true,
                    type: 'singleRowNormal'
                })
            },
            {
                request: App.createRequest({
                    url: encodeURI(`${AEManga_DOMAIN}/manga/page:1|order:chapter_count`),
                    method: 'GET'
                }),
                section: App.createHomeSection({
                    id: 'chapter_count',
                    title: 'عدد الفصول',
                    containsMoreItems: true,
                    type: 'singleRowNormal'
                })
            },
            {
                request: App.createRequest({
                    url: encodeURI(`${AEManga_DOMAIN}/manga/page:1|order:status`),
                    method: 'GET'
                }),
                section: App.createHomeSection({
                    id: 'status',
                    title: 'الحالة',
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
                const $ = this.cheerio.load(response.data as string)
                section.section.items = parseSearch($, this)
                sectionCallback(section.section)
            }))
        }

        await Promise.all(promises)
    }
    
    async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1
        
        const request = App.createRequest({
            url: encodeURI(`${AEManga_DOMAIN}/manga/page:${page}|order:${homepageSectionId}`),
            method: 'GET'
        })
        
        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data as string)
        const manga = parseSearch($, this)
        
        metadata = NextPage($) ? { page: page + 1 } : undefined
        
        return App.createPagedResults({
            results: manga,
            metadata
        })
    }
    
    async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
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
            request = App.createRequest({
                url: encodeURI(`${AEManga_DOMAIN}/manga/page:${page}|search:${query.title.replace(/ /g, '%20')}${Order.length !== 0 ? Order[0] : ''}${Sort.length !== 0 ? Sort[0] : ''}`),
                method: 'GET'
            })
        }
        else {
            request = App.createRequest({
                url: encodeURI(`${AEManga_DOMAIN}/manga/page:${page}${Genres.length !== 0 ? Genres[0] : ''}${Order.length !== 0 ? Order[0] : ''}${Sort.length !== 0 ? Sort[0] : ''}`),
                method: 'GET'
            })
        }
        
        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data as string)
        const manga = parseSearch($, this)
        
        metadata = NextPage($) ? { page: page + 1 } : undefined
        return App.createPagedResults({
            results: manga,
            metadata
        })
    }
    
    async getSearchTags(): Promise<TagSection[]> {
        const request = App.createRequest({
            url: `${AEManga_DOMAIN}/manga/`,
            method: 'GET'
        })
        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data as string)
        
        return parseTags($)
    }
    
    async getMangaDetails(mangaId: string): Promise<SourceManga> {
        const request = App.createRequest({
            url: `${AEManga_DOMAIN}/${mangaId}`,
            method: 'GET'
        })
        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data as string)
        
        return parseMangaDetails($, mangaId)
    }
    
    async getChapters(mangaId: string): Promise<Chapter[]> {
        const request = App.createRequest({
            url: `${AEManga_DOMAIN}/${mangaId}`,
            method: 'GET'
        })
        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data as string)
        
        return parseChapters($)
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const request = App.createRequest({
            url: `${AEManga_DOMAIN}/${mangaId}/${chapterId}`,
            method: 'GET'
        })
        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data as string)
        
        return parseChapterDetails($, mangaId, chapterId)
    }

    async getCloudflareBypassRequestAsync(): Promise<Request> {
        return App.createRequest({
            url: AEManga_DOMAIN,
            method: 'GET',
            headers: {
                'referer': `${this.baseUrl}/`,
                'user-agent': await this.requestManager.getDefaultUserAgent()
            }
        })
    }
    
    CloudFlareError(status: number): void {
        if (status == 503 || status == 403) {
            throw new Error(`CLOUDFLARE BYPASS ERROR:\nPlease go to Settings > Sources > ${AEMangaInfo.name} and press Cloudflare Bypass`)
        }
    }
}
