/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import {
    Source,
    Manga,
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
    LanguageCode
} from 'paperback-extensions-common'

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
    version: '1.0.1',
    name: 'MangaSect',
    icon: 'icon.png',
    author: 'xOnlyFadi',
    authorWebsite: 'https://github.com/xOnlyFadi',
    description: 'Extension that pulls comics from mangasect.com',
    contentRating: ContentRating.EVERYONE,
    websiteBaseURL: DOMAIN,
    language: LanguageCode.ENGLISH,
}

const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 12_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Safari/605.1.15'

export class MangaSect extends Source {
    baseUrl = DOMAIN

    requestManager = createRequestManager({
        requestsPerSecond: 2,
        requestTimeout: 15000,
        interceptor: {
            interceptRequest: async (request: Request): Promise<Request> => {

                request.headers = {
                    ...(request.headers ?? {}),
                    ...{
                        'user-agent': userAgent,
                        'referer': DOMAIN
                    }
                }

                return request
            },

            interceptResponse: async (response: Response): Promise<Response> => {
                return response
            }
        }
    })

    override getMangaShareUrl(mangaId: string): string { return `${DOMAIN}/manga/${mangaId}` }

    override async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const home_request = createRequestObject({
            url: DOMAIN,
            method: 'GET',
        })
        const home_response = await this.requestManager.schedule(home_request, 2)
        const $ = this.cheerio.load(home_response.data)

        await parseHomeSections($, sectionCallback)
    }


    override async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1

        const request = createRequestObject({
            url: encodeURI(`${DOMAIN}/filter/${page}/?sort=${homepageSectionId}`),
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)
        const manga = parseSearch($)

        metadata = manga.length >= 19 ? { page: page + 1 } : undefined

        return createPagedResults({
            results: manga,
            metadata
        })
    }

    override async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
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
            request = createRequestObject({
                url: encodeURI(`${DOMAIN}/search/${page}/?keyword=${query.title}`),
                method: 'GET',
            })
        } else {
            request = createRequestObject({
                url: encodeURI(`${DOMAIN}/filter/${page}/?sort=${Sort.length > 0 ? Sort[0] : 'default'}${Status.length > 0 ? Status[0] : ''}${Genres.length > 0 ? `&genres=${Genres.join('%2C')}` : ''}`),
                method: 'GET',
            })
        }
        
        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)
        const manga = parseSearch($)

        metadata = manga.length >= 19 ? { page: page + 1 } : undefined

        return createPagedResults({
            results: manga,
            metadata
        })
    }

    override async getTags(): Promise<TagSection[]> {
        const request = createRequestObject({
            url: `${DOMAIN}/filter/`,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)

        return parseTags($)
    }

    override async getMangaDetails(mangaId: string): Promise<Manga> {
        const request = createRequestObject({
            url: `${DOMAIN}/manga/${mangaId}`,
            method: 'GET',
        })
        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)

        return parseMangaDetails($, mangaId)
    }

    override async getChapters(mangaId: string): Promise<Chapter[]> {
        const request = createRequestObject({
            url: `${DOMAIN}/manga/${mangaId}`,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)

        return parseChapters($, mangaId)
    }

    override async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const request = createRequestObject({
            url: `${DOMAIN}/ajax/image/list/chap/${chapterId}`,
            method: 'GET',
        })


        const response = await this.requestManager.schedule(request, 1)        
        this.CloudFlareError(response.status)

        let data

        try {
            data = JSON.parse(response.data)
        } catch (e) {
            throw new Error(`${e}`)
        }

        const $ = this.cheerio.load(data.html)

        return parseChapterDetails($, mangaId, chapterId)
    }

    override getCloudflareBypassRequest(): Request {
        return createRequestObject({
            url: DOMAIN,
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
