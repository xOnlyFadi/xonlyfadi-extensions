import { 
    MangaProviding,
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
    DUISection,
    BadgeColor, 
    ChapterProviding,
    SourceIntents,
    SearchResultsProviding,
    HomePageSectionsProviding
} from '@paperback/types'

import { 
    parseChapterDetails,
    parseTags,
    parseChapters,
    parseMangaDetails,
    parseSearch 
} from './ComicKParser'

import { 
    chapterSettings,
    languageSettings,
    resetSettings, 
    uploadersSettings
} from './ComicKSettings'

import { CMLanguages } from './ComicKHelper'

const COMICK_DOMAIN = 'https://comick.app'
const COMICK_API = 'https://api.comick.fun'
const SEARCH_PAGE_LIMIT = 100

export const ComicKInfo: SourceInfo = {
    version: '2.1.1',
    name: 'ComicK',
    icon: 'icon.png',
    author: 'xOnlyFadi',
    authorWebsite: 'https://github.com/xOnlyFadi',
    description: 'Extension that pulls manga from comick.app.',
    contentRating: ContentRating.MATURE,
    websiteBaseURL: COMICK_DOMAIN,
    intents: SourceIntents.HOMEPAGE_SECTIONS | SourceIntents.SETTINGS_UI | SourceIntents.MANGA_CHAPTERS,
    sourceTags: [
        {
            text: 'Multi Language',
            type: BadgeColor.YELLOW
        }
    ]
}
export class ComicK implements MangaProviding, ChapterProviding, SearchResultsProviding, HomePageSectionsProviding {
    requestManager = App.createRequestManager({
        requestsPerSecond: 4,
        requestTimeout: 15000,
        interceptor: {
            interceptRequest: async (request: Request): Promise<Request> => {
                request.headers = {
                    ...(request.headers ?? {}),
                    ...{
                        'user-agent': await this.requestManager.getDefaultUserAgent(),
                        'referer': COMICK_DOMAIN
                    }
                }
                return request
            },
            interceptResponse: async (response: Response): Promise<Response> => {
                return response
            }
        }
    });
    
    stateManager = App.createSourceStateManager()

    async getSourceMenu(): Promise<DUISection> {
        return Promise.resolve(App.createDUISection({
            id: 'main',
            header: 'Source Settings',
            isHidden: false,
            rows: async () => [
                languageSettings(this.stateManager),
                chapterSettings(this.stateManager),
                uploadersSettings(this.stateManager),
                resetSettings(this.stateManager)
            ]
        }))
    }
    
    getMangaShareUrl(mangaId: string): string { return `${COMICK_DOMAIN}/comic/${mangaId}` }
    
    async getMangaDetails(mangaId: string): Promise<SourceManga> {
        const request = App.createRequest({
            url: `${COMICK_API}/comic/${mangaId}?tachiyomi=true`,
            method: 'GET'
        })
        const response = await this.requestManager.schedule(request, 1)
        
        let data
        try {
            data = JSON.parse(response.data ?? '')
        }
        catch (e) {
            throw new Error(`${e}`)
        }
        
        return parseMangaDetails(data, mangaId)
    }
    
    async getChapters(mangaId: string): Promise<Chapter[]> {
        const showVol = await this.stateManager.retrieve('show_volume_number') ?? false
        const showTitle = await this.stateManager.retrieve('show_title') ?? false
        const chapters: Chapter[] = []
        
        let page = 1
        let json = await this.createChapterRequest(mangaId, page++)
        let resultSize = json.chapters.length

        chapters.push(...(await parseChapters(json, { show_title: showTitle, show_volume: showVol }, this.stateManager)))

        while (json.total > resultSize) {
            json = await this.createChapterRequest(mangaId, page++)
            resultSize += json.chapters.length
            chapters.push(...(await parseChapters(json, { show_title: showTitle, show_volume: showVol }, this.stateManager)))
        }

        return chapters
    }
    
    async createChapterRequest(mangaId: string, page: number): Promise<any> {
        const Languages = await this.stateManager.retrieve('languages') ?? CMLanguages.getDefault()
        const request = App.createRequest({
            url: `${COMICK_API}/comic/${mangaId}/chapters?page=${page}${!Languages.includes('all') ? `&lang=${Languages}` : ''}&tachiyomi=true`,
            method: 'GET'
        })
        const response = await this.requestManager.schedule(request, 1)
        
        let data
        try {
            data = JSON.parse(response.data ?? '')
        }
        catch (e) {
            throw new Error(`${e}`)
        }

        return data
    }
    
    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const request = App.createRequest({
            url: `${COMICK_API}/chapter/${chapterId}/?tachiyomi=true`,
            method: 'GET'
        })
        const response = await this.requestManager.schedule(request, 1)
        
        let data
        try {
            data = JSON.parse(response.data ?? '')
        }
        catch (e) {
            throw new Error(`${e}`)
        }
        
        return parseChapterDetails(data, mangaId, chapterId)
    }
    
    async getSearchTags(): Promise<TagSection[]> {
        const request = App.createRequest({
            url: `${COMICK_API}/genre/`,
            method: 'GET'
        })
        const response = await this.requestManager.schedule(request, 1)
        
        let data
        try {
            data = JSON.parse(response.data ?? '')
        }
        catch (e) {
            throw new Error(`${e}`)
        }

        return parseTags(data)
    }
    
    async supportsTagExclusion(): Promise<boolean> {
        return true
    }
    
    async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const sections = [
            {
                request: App.createRequest({
                    url: `${COMICK_API}/v1.0/search/?tachiyomi=true&page=1&limit=${SEARCH_PAGE_LIMIT}&sort=view&t=false`,
                    method: 'GET'
                }),
                section: App.createHomeSection({
                    id: 'views',
                    title: 'Most Viewed',
                    containsMoreItems: true,
                    type: 'singleRowNormal'
                })
            },
            {
                request: App.createRequest({
                    url: `${COMICK_API}/v1.0/search/?tachiyomi=true&page=1&limit=${SEARCH_PAGE_LIMIT}&sort=follow&t=false`,
                    method: 'GET'
                }),
                section: App.createHomeSection({
                    id: 'follow',
                    title: 'Most Follows',
                    containsMoreItems: true,
                    type: 'singleRowNormal'
                })
            },
            {
                request: App.createRequest({
                    url: `${COMICK_API}/v1.0/search/?tachiyomi=true&page=1&limit=${SEARCH_PAGE_LIMIT}&sort=uploaded&t=false`,
                    method: 'GET'
                }),
                section: App.createHomeSection({
                    id: 'latest',
                    title: 'Latest Uploads',
                    containsMoreItems: true,
                    type: 'singleRowNormal'
                })
            }
        ]

        const promises: Promise<void>[] = []
        for (const section of sections) {
            sectionCallback(section.section)
            promises.push(this.requestManager.schedule(section.request, 1).then(async (response) => {
                let data
                try {
                    data = JSON.parse(response.data ?? '')
                }
                catch (e) {
                    throw new Error(`${e}`)
                }
                
                section.section.items = parseSearch(data)
                sectionCallback(section.section)
            }))
        }
        
        await Promise.all(promises)
    }
    
    async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1
        let param
        switch (homepageSectionId) {
            case 'views':
                param = `/v1.0/search/?tachiyomi=true&page=${page}&limit=${SEARCH_PAGE_LIMIT}&sort=view&t=false`
                break
            case 'follow':
                param = `/v1.0/search/?tachiyomi=true&page=${page}&limit=${SEARCH_PAGE_LIMIT}&sort=follow&t=false`
                break
            case 'latest':
                param = `/v1.0/search/?tachiyomi=true&page=${page}&limit=${SEARCH_PAGE_LIMIT}&sort=uploaded&t=false`
                break
            default:
                throw new Error('Requested to getViewMoreItems for a section ID which doesn\'t exist')
        }
        
        const request = App.createRequest({
            url: COMICK_API + param,
            method: 'GET'
        })
        const response = await this.requestManager.schedule(request, 1)
        
        let data
        try {
            data = JSON.parse(response.data ?? '')
        }
        catch (e) {
            throw new Error(`${e}`)
        }
        
        const manga = parseSearch(data)
        metadata = data.length === SEARCH_PAGE_LIMIT ? { page: page + 1 } : undefined
        return App.createPagedResults({
            results: manga,
            metadata
        })
    }

    async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1
        const includedGenres: string[] = []
        const excludedGenres: string[] = []
        const Sort: string[] = []
        const CreatedAt: string[] = []
        const Type: string[] = []
        const Demographic: string[] = []

        query.includedTags?.map((x: any) => {
            const id = x.id
            const SplittedID = id?.split('.')?.pop() ?? ''
            if (id.includes('genre.')) {
                includedGenres.push(`&genres=${SplittedID}`)
            }
            if (id.includes('sort.')) {
                Sort.push(`&sort=${SplittedID}`)
            }
            if (id.includes('createdat.')) {
                CreatedAt.push(`&time=${SplittedID}`)
            }
            if (id.includes('type.')) {
                Type.push(`&country=${SplittedID}`)
            }
            if (id.includes('demographic.')) {
                Demographic.push(`&demographic=${SplittedID}`)
            }
        })
        
        query.excludedTags?.map((x: any) => {
            const id = x.id
            const SplittedID = id?.split('.')?.pop() ?? ''
            if (id.includes('genre.')) {
                excludedGenres.push(`&excludes=${SplittedID}`)
            }
        })
        
        let request
        if (query.title) {
            request = App.createRequest({
                url: `${COMICK_API}/v1.0/search?q=${query.title.replace(/ /g, '%20')}&limit=${SEARCH_PAGE_LIMIT}&page=${page}&tachiyomi=true`,
                method: 'GET'
            })
        } else {
            request = App.createRequest({
                url: `${COMICK_API}/v1.0/search?page=${page}&limit=${SEARCH_PAGE_LIMIT}${includedGenres.length > 0 ? includedGenres.join('') : ''}${excludedGenres.length > 0 ? excludedGenres.join('') : ''}${Sort.length > 0 ? Sort.join('') : ''}${CreatedAt.length > 0 ? CreatedAt.join('') : ''}${Type.length > 0 ? Type.join('') : ''}${Demographic.length > 0 ? Demographic.join('') : ''}&tachiyomi=true`,
                method: 'GET'
            })
        }
        const response = await this.requestManager.schedule(request, 1)
        
        let data
        try {
            data = JSON.parse(response.data ?? '')
        }
        catch (e) {
            throw new Error(`${e}`)
        }
        
        const manga = parseSearch(data)
        metadata = data.length === SEARCH_PAGE_LIMIT ? { page: page + 1 } : undefined
        return App.createPagedResults({
            results: manga,
            metadata
        })
    }
}
