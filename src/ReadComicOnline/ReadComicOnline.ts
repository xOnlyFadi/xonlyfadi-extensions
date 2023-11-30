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
    isLastPage,
    parseTags,
    parseChapters,
    parseHomeSections,
    parseMangaDetails,
    parseViewMore,
    parseSearch 
} from './ReadComicOnlineParser'

const RCO_DOMAIN = 'https://readcomiconline.li'
export const ReadComicOnlineInfo: SourceInfo = {
    version: '2.0.0',
    name: 'ReadComicOnline',
    icon: 'icon.png',
    author: 'xOnlyFadi',
    authorWebsite: 'https://github.com/xOnlyFadi',
    description: 'Extension that pulls comics from ReadComicOnline.li.',
    intents: SourceIntents.HOMEPAGE_SECTIONS | SourceIntents.MANGA_CHAPTERS | SourceIntents.CLOUDFLARE_BYPASS_REQUIRED,
    contentRating: ContentRating.MATURE,
    websiteBaseURL: RCO_DOMAIN,
    sourceTags: [
        {
            text: 'Cloudflare',
            type: BadgeColor.RED
        }
    ]
}

export class ReadComicOnline implements MangaProviding, ChapterProviding, SearchResultsProviding, HomePageSectionsProviding {
    constructor(public cheerio: CheerioAPI) { }
    
    requestManager = App.createRequestManager({
        requestsPerSecond: 2,
        requestTimeout: 15000,
        interceptor: {
            interceptRequest: async (request: Request): Promise<Request> => {
                request.headers = {
                    ...(request.headers ?? {}),
                    ...{
                        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 12_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Safari/605.1.15',
                        'referer': `${RCO_DOMAIN}/`
                    }
                }
                return request
            },
            interceptResponse: async (response: Response): Promise<Response> => {
                return response
            }
        }
    });
    
    async getCloudflareBypassRequestAsync(): Promise<Request> {
        return App.createRequest({
            url: RCO_DOMAIN,
            method: 'GET',
            headers: {
                'referer': `${RCO_DOMAIN}/`,
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 12_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Safari/605.1.15'
            }
        })
    }

    getMangaShareUrl(mangaId: string): string { return `${RCO_DOMAIN}/Comic/${mangaId}` }
    
    async getMangaDetails(mangaId: string): Promise<SourceManga> {
        const request = App.createRequest({
            url: `${RCO_DOMAIN}/Comic/`,
            method: 'GET',
            param: mangaId
        })
        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data as string)
        
        return parseMangaDetails($, mangaId)
    }
    async getChapters(mangaId: string): Promise<Chapter[]> {
        const request = App.createRequest({
            url: `${RCO_DOMAIN}/Comic/`,
            method: 'GET',
            param: mangaId
        })
        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data as string)
        
        return parseChapters($)
    }
    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const request = App.createRequest({
            url: `${RCO_DOMAIN}/Comic/${mangaId}/${chapterId}`,
            method: 'GET',
            param: '?readType=1&quality=hq'
        })
        const response = await this.requestManager.schedule(request, 1)
        
        return parseChapterDetails(response.data as string, mangaId, chapterId)
    }
    async getSearchTags(): Promise<TagSection[]> {
        const request = App.createRequest({
            url: `${RCO_DOMAIN}/ComicList`,
            method: 'GET'
        })
        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data as string)
        
        return parseTags($)
    }
    async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const request = App.createRequest({
            url: RCO_DOMAIN,
            method: 'GET'
        })
        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data as string)
        
        parseHomeSections($, sectionCallback)
    }
    async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1
        
        let param = ''
        switch (homepageSectionId) {
            case 'latest_comic':
                param = `/LatestUpdate?page=${page}`
                break
            case 'new_comic':
                param = `/Newest?page=${page}`
                break
            case 'popular_comic':
                param = `/MostPopular?page=${page}`
                break
            default:
                throw new Error('Requested to getViewMoreItems for a section ID which doesn\'t exist')
        }
        
        const request = App.createRequest({
            url: `${RCO_DOMAIN}/ComicList`,
            method: 'GET',
            param
        })
        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data as string)
        const manga = parseViewMore($)
        
        metadata = !isLastPage($) ? { page: page + 1 } : undefined
        
        return App.createPagedResults({
            results: manga,
            metadata
        })
    }
    async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1

        let request
        if (query.title) {
            request = App.createRequest({
                url: `${RCO_DOMAIN}/Search/Comic`,
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Content-type': 'application/x-www-form-urlencoded'
                },
                data: `keyword=${encodeURI(query.title ?? '')}`
            })
        } else {
            request = App.createRequest({
                url: `${RCO_DOMAIN}/Genre/`,
                method: 'GET',
                param: `${query?.includedTags?.map((x: any) => x.id)[0]}?page=${page}`
            })
        }
        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data as string)
        const manga = parseSearch($)
        
        metadata = !isLastPage($) ? { page: page + 1 } : undefined
        
        return App.createPagedResults({
            results: manga,
            metadata
        })
    }

    CloudFlareError(status: number): void {
        if (status == 503 || status == 403) {
            throw new Error(`CLOUDFLARE BYPASS ERROR:\nPlease go to Settings > Sources > ${ReadComicOnlineInfo.name} and press Cloudflare Bypass`)
        }
    }
}
