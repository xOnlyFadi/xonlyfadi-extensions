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
    HomeSectionType,
    TagSection,
    SearchField,
    BadgeColor,
    SourceIntents,
    ChapterProviding,
    HomePageSectionsProviding,
    MangaProviding,
    SearchResultsProviding
} from '@paperback/types'

import * as cheerio from 'cheerio'

import {
    parseChapterDetails,
    parseChapters,
    parseHompage,
    parseMangaDetails,
    parseMetadata,
    parseSearch,
    parseSearchFields,
    parseTags,
    popularQuery
} from './GMangaParser'

import { GMangaUtil } from './GMangaUtils'

const DOMAIN = 'gmanga.org'
const GMANGA_BASE = `https://${DOMAIN}`
const GMANGA_API = `https://api.${DOMAIN}/api`
export const GMangaInfo: SourceInfo = {
    version: '2.0.1',
    name: 'GManga',
    icon: 'icon.png',
    author: 'xOnlyFadi',
    authorWebsite: 'https://github.com/xOnlyFadi',
    description: 'Extension that pulls from gmanga.org.',
    contentRating: ContentRating.EVERYONE,
    websiteBaseURL: GMANGA_BASE,
    intents: SourceIntents.HOMEPAGE_SECTIONS | SourceIntents.MANGA_CHAPTERS,
    language: 'Arabic',
    sourceTags: [
        {
            text: 'Arabic',
            type: BadgeColor.GREY
        },
        {
            text: 'Cloudflare',
            type: BadgeColor.RED
        }
    ]
}

export class GManga implements MangaProviding, ChapterProviding, SearchResultsProviding, HomePageSectionsProviding {

    requestManager = App.createRequestManager({
        requestsPerSecond: 4,
        requestTimeout: 15000,
        interceptor: {
            interceptRequest: async (request: Request): Promise<Request> => {
                request.headers = {
                    ...(request.headers ?? {}),
                    ...{
                        'user-agent': await this.requestManager.getDefaultUserAgent(),
                        'referer': `${GMANGA_BASE}/`
                    }
                }
                return request
            },
            interceptResponse: async (response: Response): Promise<Response> => {
                return response
            }
        }
    })

    getMangaShareUrl(mangaId: string): string { return `${GMANGA_BASE}/mangas/${mangaId}` }

    async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const sections = [
            {
                request: App.createRequest({
                    url: `${GMANGA_BASE}/api/mangas/search`,
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json'
                    },
                    data: popularQuery(1)
                }),
                info: [
                    {
                        section: App.createHomeSection({
                            id: 'popular',
                            title: 'المانجا المشهورة',
                            containsMoreItems: true,
                            type: 'singleRowNormal'
                        }),
                        selector: 'mangas'
                    }
                ]
            },
            {
                request: App.createRequest({
                    url: `${GMANGA_API}/releases?page=1`,
                    method: 'GET'
                }),
                info: [
                    {
                        section: App.createHomeSection({
                            id: 'latest',
                            title: 'المانجا المحدثه',
                            containsMoreItems: true,
                            type: 'singleRowNormal'
                        }),
                        selector: 'releases'
                    }
                ]
            },
            {
                request: App.createRequest({
                    url: `${GMANGA_API}/mangas/featured?page=1`,
                    method: 'GET'
                }),
                info: [
                    {
                        section: App.createHomeSection({
                            id: 'top7completed',
                            title: 'مانجات اكتملت ترجمتها آخر ٧ أيام',
                            containsMoreItems: false,
                            type: HomeSectionType.featured
                        }),
                        selector: 'finished'
                    },
                    {
                        section: App.createHomeSection({
                            id: 'new',
                            title: 'مانجات جديدة',
                            containsMoreItems: true,
                            type: HomeSectionType.singleRowNormal
                        }),
                        selector: 'new'
                    }
                ]
            }
        ]

        const promises: Promise<void>[] = []
        for (const section of sections) {
            for (const dsection of section.info) {
                sectionCallback(dsection.section)
                promises.push(this.requestManager.schedule(section.request, 1).then(response => {
                    this.CloudFlareError(response.status)
                    let data
                    try {
                        data = JSON.parse(response.data as string)
                    }
                    catch (e) {
                        throw new Error(`${e}`)
                    }

                    data = data['iv'] ? GMangaUtil.haqiqa(data.data) : data
                    data = data['isCompact'] ? GMangaUtil.unpack(data) : data

                    dsection.section.items = parseHompage(data, dsection.selector)
                    sectionCallback(dsection.section)
                }))
            }
        }

        await Promise.all(promises)
    }

    async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1

        let request: Request
        let selector = 'undefined'
        if (homepageSectionId === 'latest') {
            request = App.createRequest({
                url: `${GMANGA_API}/releases?page=${page}`,
                method: 'GET'
            })
            selector = 'releases'
        } else if (homepageSectionId === 'popular') {
            request = App.createRequest({
                url: `${GMANGA_BASE}/api/mangas/search`,
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                },
                data: popularQuery(page)
            })
            selector = 'mangas'
        } else if (homepageSectionId === 'new') {
            request = App.createRequest({
                url: `${GMANGA_API}/mangas/featured`,
                method: 'GET'
            })
            selector = 'new'
        } else {
            request = App.createRequest({
                url: `${GMANGA_API}/empty`,
                method: 'GET'
            })
        }
        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)

        let data
        try {
            data = JSON.parse(response.data as string)
        }
        catch (e) {
            throw new Error(`${e}`)
        }

        data = data['iv'] ? GMangaUtil.haqiqa(data.data) : data
        data = data['isCompact'] ? GMangaUtil.unpack(data) : data
        const manga = parseHompage(data, selector)

        if (homepageSectionId === 'popular') {
            metadata = data.mangas.length === 50 ? { page: page + 1 } : undefined
        } else if (homepageSectionId === 'latest') {
            metadata = data.releases.length >= 30 ? { page: page + 1 } : undefined
        } else {
            metadata = undefined
        }

        return App.createPagedResults({
            results: manga,
            metadata
        })
    }
    async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1
        const request = App.createRequest({
            url: `${GMANGA_BASE}/api/mangas/search`,
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            data: parseMetadata(query, metadata)
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

        data = data['iv'] ? GMangaUtil.haqiqa(data.data) : data
        data = data['isCompact'] ? GMangaUtil.unpack(data) : data
        const manga = parseSearch(data)

        metadata = data.mangas.length === 50 ? { page: page + 1 } : undefined

        return App.createPagedResults({
            results: manga,
            metadata
        })
    }
    async getMangaDetails(mangaId: string): Promise<SourceManga> {
        const request = App.createRequest({
            url: `${GMANGA_API}/mangas/${mangaId}`,
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

        return parseMangaDetails(data, mangaId)
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        const request = App.createRequest({
            url: `${GMANGA_API}/mangas/${mangaId}/releases`,
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

        data = data['iv'] ? GMangaUtil.haqiqa(data.data) : data
        data = data['isCompact'] ? GMangaUtil.unpack(data) : data

        return parseChapters(data)
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const request = App.createRequest({
            url: `${GMANGA_BASE}/r/${chapterId}`,
            method: 'GET'
        })
        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = cheerio.load(response.data as string)

        return parseChapterDetails($, mangaId, chapterId)
    }

    async getSearchTags(): Promise<TagSection[]> {
        return parseTags()
    }

    async getSearchFields(): Promise<SearchField[]> {
        return parseSearchFields()
    }

    async supportsTagExclusion(): Promise<boolean> {
        return true
    }

    async supportsSearchOperators(): Promise<boolean> {
        return true
    }

    CloudFlareError(status: number): void {
        if (status == 503 || status == 403) {
            throw new Error(`CLOUDFLARE BYPASS ERROR:\nPlease go to Settings > Sources > ${GMangaInfo.name} and press Cloudflare Bypass`)
        }
    }
}
