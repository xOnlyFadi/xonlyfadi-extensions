/* eslint-disable @typescript-eslint/no-unused-vars */
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
    TagType,
    ContentRating,
    TagSection,
    LanguageCode,
    Request,
    Response
} from 'paperback-extensions-common'

import {Parser} from './VyvyMangaParser'

const VyvyManga_Base = 'https://vyvymanga.net'

export const VyvyMangaInfo: SourceInfo = {
    author: 'xOnlyFadi',
    description: 'Extension that pulls manga from vyvymanga.net',
    icon: 'icon.png',
    name: 'VyvyManga',
    version: '1.0.7',
    authorWebsite: 'https://github.com/xOnlyFadi',
    websiteBaseURL: VyvyManga_Base,
    contentRating: ContentRating.ADULT,
    language: LanguageCode.ENGLISH,
    sourceTags: [
        {
            text: '18+',
            type: TagType.RED
        }
    ]
}

export class VyvyManga extends Source {
    private readonly parser: Parser = new Parser()

    baseUrl = VyvyManga_Base
    readonly requestManager = createRequestManager({
        requestsPerSecond: 3,
        requestTimeout: 30000,
        interceptor: {
            interceptRequest: async (request: Request): Promise<Request> => {

                request.headers = {
                    ...(request.headers ?? {}),
                    ...{
                        'referer': `${VyvyManga_Base}/`,
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.134 Safari/537.36'
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
        return `${VyvyManga_Base}/manga/${mangaId}`
    }

    override async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const options = createRequestObject({
            url: `${VyvyManga_Base}`,
            method: 'GET'
        })
        const response = await this.requestManager.schedule(options, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)

        return this.parser.parseHomeSections($, sectionCallback, this)
    }

    override async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1

        let param = ''
        switch (homepageSectionId) {
            case '1':
                param = `/search?page=${page}`
                break
            case '2':
                param = `/search?sort=updated_at&page=${page}`
                break
            case '3':
                param = `/search?sort=created_at&page=${page}`
                break
            default:
                throw new Error(`Invalid homeSectionId | ${homepageSectionId}`)
        }
        const request = createRequestObject({
            url: VyvyManga_Base,
            method: 'GET',
            param
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)
        const manga = this.parser.parseSearchResults($)

        metadata = manga.length < 36 ? undefined : {page: page + 1} 

        return createPagedResults({
            results: manga,
            metadata
        })
    }

    override async getTags(): Promise<TagSection[]> {
        const options = createRequestObject({
            url: `${VyvyManga_Base}/search`,
            method: 'GET'
        })
        const response = await this.requestManager.schedule(options, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)
        return [createTagSection({
            id: '1',
            label: 'Genres',
            tags: this.parser.parseTags($)
        })]
    }

    async getMangaDetails(mangaId: string): Promise<Manga> {
        const options  = createRequestObject({
            url: `${VyvyManga_Base}/manga/${mangaId}`,
            method: 'GET',
        })
        const response = await this.requestManager.schedule(options, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)
        return this.parser.parseMangaDetails($, mangaId,this)
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        const options = createRequestObject({
            url: `${VyvyManga_Base}/manga/${mangaId}`,
            method: 'GET'
        })
        const response = await this.requestManager.schedule(options, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)
        return this.parser.parseChapters($, mangaId, this)
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const options = createRequestObject({
            url: `${chapterId}`,
            method: 'GET'
        })
        const response = await this.requestManager.schedule(options, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)
        return this.parser.parseChapterDetails($, mangaId, chapterId)
    }

    async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1
        let request
        const firstTag = query?.includedTags?.map((x: any) => x.id)[0] ?? []
        if(firstTag.includes('details.')) {
            request = createRequestObject({
                url: encodeURI(`${VyvyManga_Base}/genre/${firstTag.split('.')[1]}`),
                method: 'GET'
            })
        } else {
            request = createRequestObject({
                url: encodeURI(`${VyvyManga_Base}/search?q=${query?.title?.replace(/%20/g, '+').replace(/ /g,'+') ?? ''}&completed=&sort=viewed${query?.includedTags?.map((x: any) => '&genre[]=' + x.id)}`),
                method: 'GET'
            })
        }
        const data = await this.requestManager.schedule(request, 2)
        this.CloudFlareError(data.status)
        const $ = this.cheerio.load(data.data)
        const manga = this.parser.parseSearchResults($)

        metadata = manga.length < 36 ? undefined : {page: page + 1} 

        return createPagedResults({
            results: manga,
            metadata
        })
    }

    CloudFlareError(status: any) {
        if(status == 503) {
            throw new Error('CLOUDFLARE BYPASS ERROR:\nPlease go to Settings > Sources > VyvyManga and press Cloudflare Bypass or press the Cloud image on the right')
        }
    }
}
