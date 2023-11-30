/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { 
    SourceManga,
    Chapter,
    ChapterDetails,
    HomeSection,
    SearchRequest,
    PagedResults,
    SourceInfo,
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
    parseTags,
    parseChapters,
    parseMangaDetails,
    parseSearch,
    parseHomeSections 
} from './MangaSectParser'


const DOMAIN = 'https://mangasect.com'
export const MangaSectInfo: SourceInfo = {
    version: '2.0.0',
    name: 'MangaSect',
    icon: 'icon.png',
    author: 'xOnlyFadi',
    authorWebsite: 'https://github.com/xOnlyFadi',
    description: 'Extension that pulls comics from mangasect.com',
    contentRating: ContentRating.EVERYONE,
    websiteBaseURL: DOMAIN,
    language: 'ENGLISH',
    intents: SourceIntents.HOMEPAGE_SECTIONS | SourceIntents.MANGA_CHAPTERS
}

export class MangaSect implements MangaProviding, ChapterProviding, SearchResultsProviding, HomePageSectionsProviding {
    constructor(public cheerio: CheerioAPI) { }

    baseUrl = DOMAIN;
    requestManager = App.createRequestManager({
        requestsPerSecond: 2,
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
    });
    
    async getCloudflareBypassRequestAsync(): Promise<Request> {
        return App.createRequest({
            url: DOMAIN,
            method: 'GET',
            headers: {
                'referer': `${DOMAIN}/`,
                'user-agent': await this.requestManager.getDefaultUserAgent()
            }
        })
    }

    getMangaShareUrl(mangaId: string): string { return `${DOMAIN}/manga/${mangaId}` }
    
    async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const request = App.createRequest({
            url: DOMAIN,
            method: 'GET'
        })
        const response = await this.requestManager.schedule(request, 2)
        const $ = this.cheerio.load(response.data as string)
        
        await parseHomeSections($, sectionCallback)
    }
    
    async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1
        
        const request = App.createRequest({
            url: encodeURI(`${DOMAIN}/filter/${page}/?sort=${homepageSectionId}`),
            method: 'GET'
        })
        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data as string)
        const manga = parseSearch($)
        
        metadata = manga.length >= 19 ? { page: page + 1 } : undefined
        
        return App.createPagedResults({
            results: manga,
            metadata
        })
    }
    
    async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1
        
        const Status: string[] = []
        const Sort: string[] = []
        const Genres: string[] = []
        query.includedTags?.map((x: any) => {
            if (x.id.startsWith('genres.')) {
                Genres.push(x.id?.split('.')?.pop())
            }
            
            if (x.id.startsWith('status.')) {
                Status.push(`&status=${x.id?.split('.')?.pop()}`)
            }
            
            if (x.id.startsWith('sort.')) {
                Sort.push(x.id?.split('.')?.pop())
            }
        })
        
        let request
        if (query.title) {
            request = App.createRequest({
                url: encodeURI(`${DOMAIN}/search/${page}/?keyword=${query.title}`),
                method: 'GET'
            })
        } else {
            request = App.createRequest({
                url: encodeURI(`${DOMAIN}/filter/${page}/?sort=${Sort.length > 0 ? Sort[0] : 'default'}${Status.length > 0 ? Status[0] : ''}${Genres.length > 0 ? `&genres=${Genres.join('%2C')}` : ''}`),
                method: 'GET'
            })
        }
        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data as string)
        const manga = parseSearch($)
        
        metadata = manga.length >= 19 ? { page: page + 1 } : undefined
        
        return App.createPagedResults({
            results: manga,
            metadata
        })
    }
    
    async getSearchTags(): Promise<TagSection[]> {
        const request = App.createRequest({
            url: `${DOMAIN}/filter/`,
            method: 'GET'
        })
        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data as string)
        
        return parseTags($)
    }
    
    async getMangaDetails(mangaId: string): Promise<SourceManga> {
        const request = App.createRequest({
            url: `${DOMAIN}/manga/${mangaId}`,
            method: 'GET'
        })
        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data as string)
        
        return parseMangaDetails($, mangaId)
    }
    
    async getChapters(mangaId: string): Promise<Chapter[]> {
        const request = App.createRequest({
            url: `${DOMAIN}/manga/${mangaId}`,
            method: 'GET'
        })
        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data as string)
        
        return parseChapters($)
    }
    
    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const request = App.createRequest({
            url: `${DOMAIN}/ajax/image/list/chap/${chapterId}`,
            method: 'GET'
        })
        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        
        let data
        try {
            data = JSON.parse(response.data as string)
        }
        catch (e) {
            throw new Error(`${e}`)
        }
        const $ = this.cheerio.load(data.html)
        
        return parseChapterDetails($, mangaId, chapterId)
    }
    
    CloudFlareError(status: number): void {
        if (status == 503 || status == 403) {
            throw new Error(`CLOUDFLARE BYPASS ERROR:\nPlease go to Settings > Sources > ${MangaSectInfo.name} and press Cloudflare Bypass`)
        }
    }
}
