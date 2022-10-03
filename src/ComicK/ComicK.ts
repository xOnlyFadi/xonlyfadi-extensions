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
    TagSection,
    ContentRating,
    Request,
    Response,
    Section,
    MangaUpdates,
    HomeSectionType,
    TagType
} from 'paperback-extensions-common'
import { SearchData } from './ComicKHelper'

import {
    parseChapterDetails,
    parseTags,
    parseChapters,
    parseMangaDetails,
    parseSearch
} from './ComicKParser'
import { 
    chapterSettings, 
    getHomeFilter, 
    getLanguages, 
    getShowChapterTitle, 
    getShowChapterVolume, 
    languageSettings,
    resetSettings
} from './ComicKSettings'

const COMICK_DOMAIN = 'https://comick.fun'
const COMICK_API = 'https://api.comick.fun'
const SEARCH_PAGE_LIMIT = 100

export const ComicKInfo: SourceInfo = {
    version: '1.0.2',
    name: 'Comick',
    icon: 'icon.png',
    author: 'xOnlyFadi',
    authorWebsite: 'https://github.com/xOnlyFadi',
    description: 'Extension that pulls manga from comick.fun.',
    contentRating: ContentRating.MATURE,
    websiteBaseURL: COMICK_DOMAIN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        },
        {
            text: 'Multi Language',
            type: TagType.YELLOW
        }
    ]
}

export class ComicK extends Source {
    requestManager = createRequestManager({
        requestsPerSecond: 2,
        requestTimeout: 15000,
        interceptor: {
            interceptRequest: async (request: Request): Promise<Request> => {

                request.headers = {
                    ...(request.headers ?? {}),
                    ...{
                        'referer': COMICK_DOMAIN
                    }
                }

                return request
            },

            interceptResponse: async (response: Response): Promise<Response> => {
                return response
            }
        }
    })

    stateManager = createSourceStateManager({})

    override async getSourceMenu(): Promise<Section> {
        return Promise.resolve(createSection({
            id: 'main',
            header: 'Source Settings',
            rows: () => Promise.resolve([
                languageSettings(this.stateManager),
                chapterSettings(this.stateManager),
                resetSettings(this.stateManager)
            ])
        }))
    }

    override getMangaShareUrl(mangaId: string): string { return `${COMICK_DOMAIN}/comic/${mangaId}` }

    override async getMangaDetails(mangaId: string): Promise<Manga> {
        const request = createRequestObject({
            url: `${COMICK_API}/comic/${mangaId}?tachiyomi=true`,
            method: 'GET',
        })
        const response = await this.requestManager.schedule(request, 1)

        let data
        try {
            data = JSON.parse(response.data)
        } catch (e) {
            throw new Error(`${e}`)
        }

        return parseMangaDetails(data, mangaId)
    }

    override async getChapters(mangaId: string): Promise<Chapter[]> {
        const showVol = await getShowChapterVolume(this.stateManager)
        const showTitle = await getShowChapterTitle(this.stateManager)

        const chapters: Chapter[] = []

        const request = createRequestObject({
            url: `${COMICK_API}/comic/${mangaId}?tachiyomi=true`,
            method: 'GET',
        })
        const response = await this.requestManager.schedule(request, 1)

        let data
        try {
            data = JSON.parse(response.data)
        } catch (e) {
            throw new Error(`${e}`)
        }

        let page = 1
        let json = null

        do {
            json = await this.createChapterRequest(data.comic.id,page)
            chapters.push(...parseChapters(json, mangaId,{show_title: showTitle, show_volume: showVol}))
            page += 1

        } while (json.chapters.length === SEARCH_PAGE_LIMIT)

        return chapters
    }

    async createChapterRequest(mangaId: string, page: number) : Promise<any> {
        const Languages = await getLanguages(this.stateManager)

        const request = createRequestObject({
            url: `${COMICK_API}/comic/${mangaId}/chapter?page=${page}&limit=${SEARCH_PAGE_LIMIT}${!Languages.includes('all') ? `&lang=${Languages}` : ''}&tachiyomi=true`,
            method: 'GET',
        })
        const response = await this.requestManager.schedule(request, 1)

        let data
        try {
            data = JSON.parse(response.data)
        } catch (e) {
            throw new Error(`${e}`)
        }

        return data
    }

    override async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const request = createRequestObject({
            url: `${COMICK_API}/chapter/${chapterId}/?tachiyomi=true`,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 1)
        let data
        try {
            data = JSON.parse(response.data)
        } catch (e) {
            throw new Error(`${e}`)
        }
        return parseChapterDetails(data, mangaId, chapterId)
    }

    override async getSearchTags(): Promise<TagSection[]> {
        const request = createRequestObject({
            url: `${COMICK_API}/genre/`,
            method: 'GET',
        })
        const response = await this.requestManager.schedule(request, 1)

        let data
        try {
            data = JSON.parse(response.data)
        } catch (e) {
            throw new Error(`${e}`)
        }

        return parseTags(data)
    }

    override async supportsTagExclusion(): Promise<boolean> {
        return true
    }

    override async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const HomeFilter = await getHomeFilter(this.stateManager)
        const Languages = await getLanguages(this.stateManager)
        let filterLang = []
        for (const lang of Languages) {
            if (lang === 'all') {
                filterLang = []
                break
            }
            filterLang.push(`&lang=${lang}`)
        }

        const sections = [
            {
                request: createRequestObject({
                    url: `${COMICK_API}/search?page=1&limit=10&tachiyomi=true`,
                    method: 'GET'
                }),
                section: createHomeSection({
                    id: 'top10',
                    title: 'Top 10',
                    type: HomeSectionType.featured
                }),
                usesSearch: true
            },
            {
                request: createRequestObject({
                    url: `${COMICK_API}/search?page=1&limit=100&tachiyomi=true`,
                    method: 'GET'
                }),
                section: createHomeSection({
                    id: 'popular',
                    title: 'Popular',
                    view_more: true,
                }),
                usesSearch: true
            },
            {
                request: createRequestObject({
                    url: `${COMICK_API}/chapter?page=1&order=hot${HomeFilter ? filterLang.length !== 0 ? filterLang.join('') : '' : ''}&device-memory=8&tachiyomi=true`,
                    method: 'GET'
                }),
                section: createHomeSection({
                    id: 'hot',
                    title: 'Hot',
                    view_more: true,
                }),
            },
            {
                request: createRequestObject({
                    url: `${COMICK_API}/chapter?page=1&order=new${HomeFilter ? filterLang.length !== 0 ? filterLang.join('') : '' : ''}&device-memory=8&tachiyomi=true`,
                    method: 'GET'
                }),
                section: createHomeSection({
                    id: 'new',
                    title: 'New',
                    view_more: true,
                }),
            }
        ]

        const promises: Promise<void>[] = []
        for (const section of sections) {

            sectionCallback(section.section)

            promises.push(
                this.requestManager.schedule(section.request, 1).then(async response => {
                    let data

                    try {
                        data = JSON.parse(response.data)
                    } catch (e) {
                        throw new Error(`${e}`)
                    }

                    section.section.items = parseSearch(data, section.usesSearch)
                    sectionCallback(section.section)
                }),
            )
        }

        await Promise.all(promises)
    }


    override async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1
        let param = ''
        let usesSearch = false

        const HomeFilter = await getHomeFilter(this.stateManager)
        const Languages = await getLanguages(this.stateManager)
        let filterLang = []
        for (const lang of Languages) {
            if (lang === 'all') {
                filterLang = []
                break
            }
            filterLang.push(`&lang=${lang}`)
        }
        
        switch (homepageSectionId) {
            case 'popular':
                param = `/search/?page=${page}&limit=${SEARCH_PAGE_LIMIT}&tachiyomi=true`
                usesSearch = true
                break
            case 'hot':
                param = `/chapter/?page=${page}&order=hot${HomeFilter ? filterLang.length !== 0 ? filterLang.join('') : '' : ''}&device-memory=8&tachiyomi=true`
                break
            case 'new':
                param = `/chapter/?page=${page}&order=new${HomeFilter ? filterLang.length !== 0 ? filterLang.join('') : '' : ''}&device-memory=8&tachiyomi=true`
                break
            default:
                throw new Error('Requested to getViewMoreItems for a section ID which doesn\'t exist')
        }

        const request = createRequestObject({
            url: COMICK_API + param,
            method: 'GET'
        })
        const response = await this.requestManager.schedule(request, 1)
        
        let data
        try {
            data = JSON.parse(response.data)
        } catch (e) {
            throw new Error(`${e}`)
        }

        const manga = parseSearch(data, usesSearch)
        metadata = usesSearch ? data.length === SEARCH_PAGE_LIMIT ? { page: page + 1 } : undefined : { page: page + 1 }
        return createPagedResults({
            results: manga,
            metadata
        })
    }

    override async filterUpdatedManga(mangaUpdatesFoundCallback: (updates: MangaUpdates) => void, time: Date, ids: string[]): Promise<void> {
        let page = 1

        const updatedManga: string[] = []
        
        const HomeFilter = await getHomeFilter(this.stateManager)
        const Languages = await getLanguages(this.stateManager)
        let filterLang = []
        for (const lang of Languages) {
            if (lang === 'all') {
                filterLang = []
                break
            }
            filterLang.push(`&lang=${lang}`)
        }

        while (page < 6) {
            const request = createRequestObject({
                url: `${COMICK_API}/chapter?page=${page}&order=hot${HomeFilter ? filterLang.length !== 0 ? filterLang.join('') : '' : ''}&device-memory=8&tachiyomi=true`,
                method: 'GET',
            })
            const response = await this.requestManager.schedule(request, 1)

            let data: SearchData[]
            try {
                data = JSON.parse(response.data)
            } catch (e) {
                throw new Error(`${e}`)
            }


            const mangaToUpdate: string[] = []
            for (const chapter of data) {
                const mangaId = chapter.md_comics.slug
                const mangaTime = new Date(chapter.updated_at ?? '')
                if (mangaTime <= time) {
                    if (ids.includes(mangaId) && !updatedManga.includes(mangaId)) {
                        mangaToUpdate.push(mangaId)
                        updatedManga.push(mangaId)
                    }
                }
            }

            page++

            if (mangaToUpdate.length > 0) {
                mangaUpdatesFoundCallback(createMangaUpdates({
                    ids: mangaToUpdate
                }))
            }
        }
    }

    override async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1
        const includedGenres = query.includedTags?.map((x: any) => {
            if (x.id.includes('genre.')) {
                return `&genres=${x.id?.split('.')?.pop()}`
            }
            return undefined
        }).join('') ?? ''
        const excludedGenres = query.excludedTags?.map((x: any) => {
            if (x.id.includes('genre.')) {
                return `&excludes=${x.id?.split('.')?.pop()}`
            }
            return undefined
        }).join('') ?? ''
        const Sort = query.includedTags?.map((x: any) => {
            if (x.id.includes('sort.')) {
                return `&sort=${x.id?.split('.')?.pop()}`
            }
            return undefined
        })[0] ?? ''
        const CreatedAt = query.includedTags?.map((x: any) => {
            if (x.id.includes('createdat.')) {
                return `&time=${x.id?.split('.')?.pop()}`
            }
            return undefined
        })[0] ?? ''
        const Type = query.includedTags?.map((x: any) => {
            if (x.id.includes('type.')) {
                return `&country=${x.id?.split('.')?.pop()}`
            }
            return undefined
        }).join('') ?? ''
        const Demographic = query.includedTags?.map((x: any) => {
            if (x.id.includes('demographic.')) {
                return `&demographic=${x.id?.split('.')?.pop()}`
            }
            return undefined
        }).join('') ?? ''

        let request

        if (query.title) {
            request = createRequestObject({
                url: `${COMICK_API}/search?q=${query.title.replace(/ /g, '%20')}&limit=${SEARCH_PAGE_LIMIT}&page=${page}&tachiyomi=true`,
                method: 'GET',
            })
        } else {
            request = createRequestObject({
                url: `${COMICK_API}/search?page=${page}&limit=${SEARCH_PAGE_LIMIT}${includedGenres}${excludedGenres}${Sort}${CreatedAt}${Type}${Demographic}&tachiyomi=true`,
                method: 'GET',
            })
        }
        
        const response = await this.requestManager.schedule(request, 1)

        let data
        try {
            data = JSON.parse(response.data)
        } catch (e) {
            throw new Error(`${e}`)
        }

        const manga = parseSearch(data, true)
        metadata = data.length === SEARCH_PAGE_LIMIT ? { page: page + 1 } : undefined

        return createPagedResults({
            results: manga,
            metadata
        })
    }
}
