/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    Source,
    Manga,
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
    MangaUpdates,
} from 'paperback-extensions-common'

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

import moment from 'moment'

import './GMangaHelper'

import { LatestData } from './GMangaHelper'

const DOMAIN = 'gmanga.org'
const GMANGA_BASE = `https://${DOMAIN}`
const GMANGA_API = `https://api.${DOMAIN}/api`

const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36'

export const GMangaInfo: SourceInfo = {
    version: '1.0.0',
    name: 'GManga',
    icon: 'icon.png',
    author: 'xOnlyFadi',
    authorWebsite: 'https://github.com/xOnlyFadi',
    description: 'Extension that pulls from gmanga.org.',
    contentRating: ContentRating.ADULT,
    websiteBaseURL: GMANGA_BASE,
    language: 'العربية',
}


export class GManga extends Source {

    requestManager = createRequestManager({
        requestsPerSecond: 2,
        requestTimeout: 15000,
        interceptor: {
            interceptRequest: async (request: Request): Promise<Request> => {

                request.headers = {
                    ...(request.headers ?? {}),
                    ...{
                        'user-agent': userAgent,
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

    override getMangaShareUrl(mangaId: string): string { return `${GMANGA_BASE}/mangas/${mangaId}` }

    override async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const sections = [
            {
                request: createRequestObject({
                    url: `${GMANGA_BASE}/api/mangas/search`,
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                    },
                    data: popularQuery(1)
                }),
                info: [
                    {
                        section: createHomeSection({
                            id: 'popular',
                            title: 'المانجا المشهورة',
                            view_more: true,
                        }),
                        selector: 'mangas'
                    }       
                ],
            },
            {
                request: createRequestObject({
                    url: `${GMANGA_API}/releases?page=1`,
                    method: 'GET',
                }),
                info: [
                    {
                        section: createHomeSection({
                            id: 'latest',
                            title: 'المانجا المحدثه',
                            view_more: true,
                        }),
                        selector: 'releases'
                    }
                ]
            },
            {
                request: createRequestObject({
                    url: `${GMANGA_API}/mangas/featured?page=1`,
                    method: 'GET',
                }),
                info: [
                    {
                        section: createHomeSection({
                            id: 'top7completed',
                            title: 'مانجات اكتملت ترجمتها آخر ٧ أيام',
                            type: HomeSectionType.featured
                        }),
                        selector: 'finished'
                    },
                    {
                        section: createHomeSection({
                            id: 'new',
                            title: 'مانجات جديدة',
                            type: HomeSectionType.singleRowNormal,
                            view_more: true
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
                promises.push(
                    this.requestManager.schedule(section.request, 1).then(response => {
                        this.CloudFlareError(response.status)
                        let data

                        try {
                            data = JSON.parse(response.data)
                        } catch (e) {
                            throw new Error(`${e}`)
                        }

                        data = data['iv'] ? GMangaUtil.haqiqa(data.data) : data
                        data = data['isCompact'] ? GMangaUtil.unpack(data) : data

                        dsection.section.items = parseHompage(data, dsection.selector)
                        sectionCallback(dsection.section)
                    }),
                )
            }
        }

        await Promise.all(promises)
    }

    override async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1
        let request: Request
        let selector = 'undefined'

        if (homepageSectionId === 'latest') {
            request = createRequestObject({
                url: `${GMANGA_API}/releases?page=${page}`,
                method: 'GET',
            }) 
            selector = 'releases'
        } else if (homepageSectionId === 'popular') {
            request = createRequestObject({
                url: `${GMANGA_BASE}/api/mangas/search`,
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                },
                data: popularQuery(page)
            })
            selector = 'mangas'
        } else if (homepageSectionId === 'new') {
            request = createRequestObject({
                url: `${GMANGA_API}/mangas/featured`,
                method: 'GET',
            })
            selector = 'new'
        } else {
            request = createRequestObject({
                url: `${GMANGA_API}/empty`,
                method: 'GET',
            })
        }

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)

        let data

        try {
            data = JSON.parse(response.data)
        } catch (e) {
            throw new Error(`${e}`)
        }
        
        data = data['iv'] ? GMangaUtil.haqiqa(data.data) : data
        data = data['isCompact'] ? GMangaUtil.unpack(data) : data

        const manga = parseHompage(data, selector)

        if (homepageSectionId === 'popular') {
            metadata = data.mangas.length === 50 ? {page: page + 1} : undefined
        } else if (homepageSectionId === 'latest') {
            metadata = data.releases.length >= 30 ? {page: page + 1} : undefined
        } else {
            metadata = undefined
        }

        return createPagedResults({
            results: manga,
            metadata
        })
    }

    override async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1

        const request = createRequestObject({
            url: `${GMANGA_BASE}/api/mangas/search`,
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            data: parseMetadata(query, metadata)
        })
        
        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)

        let data

        try {
            data = JSON.parse(response.data)
        } catch (e) {
            throw new Error(`${e}`)
        }
        
        data = data['iv'] ? GMangaUtil.haqiqa(data.data) : data
        data = data['isCompact'] ? GMangaUtil.unpack(data) : data

        const manga = parseSearch(data)

        metadata = data.mangas.length === 50 ? {page: page + 1} : undefined

        return createPagedResults({
            results: manga,
            metadata
        })
    }

    override async getMangaDetails(mangaId: string): Promise<Manga> {
        const request = createRequestObject({
            url: `${GMANGA_API}/mangas/${mangaId}`,
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

        return parseMangaDetails(data, mangaId)
    }

    override async getChapters(mangaId: string): Promise<Chapter[]> {
        const request = createRequestObject({
            url: `${GMANGA_API}/mangas/${mangaId}/releases`,
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

        data = data['iv'] ? GMangaUtil.haqiqa(data.data) : data
        data = data['isCompact'] ? GMangaUtil.unpack(data) : data

        return parseChapters(data, mangaId)
    }

    override async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const request = createRequestObject({
            url: `${GMANGA_BASE}/r/${chapterId}`,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)

        return parseChapterDetails($, mangaId, chapterId)
    }
    
    override async filterUpdatedManga(mangaUpdatesFoundCallback: (updates: MangaUpdates) => void, time: Date, ids: string[]): Promise<void> {
        let day = 0

        while (day < 7) {
            const mangaToUpdate: string[] = []

            const request = createRequestObject({
                url: `${GMANGA_API}/releases/latest_wday?wday=${day}`,
                method: 'GET',
            })

            const response = await this.requestManager.schedule(request, 1)

            this.CloudFlareError(response.status)


            let data: LatestData
    
            try {
                data = JSON.parse(response.data)
            } catch (e) {
                throw new Error(`${e}`)
            }

            for (const release of data.releases) {
                const chapter = release.new_chapters[0]
                const id = chapter.manga_id ?? ''
                const FormatedCurrentDate = moment(time).format('YYYY-MM-DD')
                const FormatedChapterDate = moment(new Date(chapter.time_stamp * 1000)).format('YYYY-MM-DD')

                if (!id) continue

                if (FormatedChapterDate === FormatedCurrentDate) {
                    if (ids.includes(`${id}`)) {
                        mangaToUpdate.push(`${id}`)
                    }
                }
            }

            day++

            if (mangaToUpdate.length > 0) {
                mangaUpdatesFoundCallback(createMangaUpdates({
                    ids: mangaToUpdate
                }))
            }
        }
    }

    override async getTags(): Promise<TagSection[]> {
        return parseTags()
    }

    override async getSearchFields(): Promise<SearchField[]> {
        return parseSearchFields()
    }
    override async supportsTagExclusion(): Promise<boolean> {
        return true
    }

    override async supportsSearchOperators(): Promise<boolean> {
        return true
    }

    CloudFlareError(status: number): void {
        if (status == 503) {
            throw new Error('CLOUDFLARE BYPASS ERROR:\nPlease go to Settings > Sources > GManga and press Cloudflare Bypass or press the Cloud image on the right')
        }
    }
}