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
    parseSearch,
    parseHomeSections
} from './ComicKParser'

import {
    chapterSettings,
    languageSettings,
    resetSettings,
    uploadersSettings
} from './ComicKSettings'

import {
    ChapterList,
    CMLanguages,
    Uploader
} from './ComicKHelper'

const COMICK_DOMAIN = 'https://comick.cc'
const COMICK_API = 'https://api.comick.fun'
const LIMIT = 300

export const ComicKInfo: SourceInfo = {
    version: '2.1.3',
    name: 'ComicK',
    icon: 'icon.png',
    author: 'xOnlyFadi',
    authorWebsite: 'https://github.com/xOnlyFadi',
    description: 'Extension that pulls manga from comick.cc.',
    contentRating: ContentRating.MATURE,
    websiteBaseURL: COMICK_DOMAIN,
    intents: SourceIntents.HOMEPAGE_SECTIONS | SourceIntents.SETTINGS_UI | SourceIntents.MANGA_CHAPTERS | SourceIntents.CLOUDFLARE_BYPASS_REQUIRED,
    sourceTags: [
        {
            text: 'Multi Language',
            type: BadgeColor.YELLOW
        }
    ]
}
export class ComicK implements MangaProviding, ChapterProviding, SearchResultsProviding, HomePageSectionsProviding {
    requestManager = App.createRequestManager({
        requestsPerSecond: 10,
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
    })

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
        this.CloudFlareError(response.status)

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
        const showTitle: boolean = await this.stateManager.retrieve('show_title') ?? false
        const showVol: boolean = await this.stateManager.retrieve('show_volume_number') ?? false
        const uploadersToggled: boolean = await this.stateManager.retrieve('uploaders_toggled') ?? false
        const uploadersWhitelisted: boolean = await this.stateManager.retrieve('uploaders_whitelisted') ?? false
        const aggressiveUploadersFilter: boolean = await this.stateManager.retrieve('aggressive_uploaders_filtering') ?? false
        const strictNameMatching: boolean = await this.stateManager.retrieve('strict_name_matching') ?? false
        const uploaders: Uploader[] = await this.stateManager.retrieve('uploaders') ?? []

        let data = await this.createChapterRequest(mangaId, 1)
        const total = data.total
        data = await this.createChapterRequest(mangaId, total)

        return parseChapters(
            data,
            showTitle,
            showVol,
            uploadersToggled,
            uploadersWhitelisted,
            aggressiveUploadersFilter,
            strictNameMatching,
            uploaders
        )
    }

    async createChapterRequest(mangaId: string, limit: number): Promise<ChapterList> {
        const LIMIT = limit
        const Languages = await this.stateManager.retrieve('languages') ?? CMLanguages.getDefault()
        const request = App.createRequest({
            url: `${COMICK_API}/comic/${mangaId}/chapters?page=1&limit=${LIMIT}${!Languages.includes('all') ? `&lang=${Languages}` : ''}&tachiyomi=true`,
            method: 'GET'
        })
        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)

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
        this.CloudFlareError(response.status)

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
        this.CloudFlareError(response.status)

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
        // Show only 20 titles on HomeSection, override global LIMIT to 20
        const LIMIT = 20

        const createSectionRequest = (sort: string) => ({
            id: sort,
            request: App.createRequest({
                url: `${COMICK_API}/v1.0/search/?tachiyomi=true&page=1&limit=${LIMIT}&sort=${sort}&t=false`,
                method: 'GET'
            })
        })

        const sections = [
            createSectionRequest('view'),
            createSectionRequest('follow'),
            createSectionRequest('uploaded')
        ]

        for (const s of sections) {
            const response = await this.requestManager.schedule(s.request, 1)
            this.CloudFlareError(response.status)

            let data
            try {
                data = JSON.parse(response.data ?? '')
            }
            catch (e) {
                throw new Error(`${e}`)
            }

            parseHomeSections(data, s.id, sectionCallback)
        }
    }

    async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1
        let param
        switch (homepageSectionId) {
            case 'view':
                param = `/v1.0/search/?tachiyomi=true&page=${page}&limit=${LIMIT}&sort=view&t=false`
                break
            case 'follow':
                param = `/v1.0/search/?tachiyomi=true&page=${page}&limit=${LIMIT}&sort=follow&t=false`
                break
            case 'uploaded':
                param = `/v1.0/search/?tachiyomi=true&page=${page}&limit=${LIMIT}&sort=uploaded&t=false`
                break
            default:
                throw new Error('Requested to getViewMoreItems for a section ID which doesn\'t exist')
        }

        const request = App.createRequest({
            url: COMICK_API,
            param: param,
            method: 'GET'
        })
        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)

        let data
        try {
            data = JSON.parse(response.data ?? '')
        }
        catch (e) {
            throw new Error(`${e}`)
        }

        const manga = parseSearch(data)
        metadata = data.length === LIMIT ? { page: page + 1 } : undefined
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

        query.includedTags?.map((x) => {
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

        query.excludedTags?.map((x) => {
            const id = x.id
            const SplittedID = id?.split('.')?.pop() ?? ''
            if (id.includes('genre.')) {
                excludedGenres.push(`&excludes=${SplittedID}`)
            }
        })

        let request
        if (query.title) {
            request = App.createRequest({
                url: `${COMICK_API}/v1.0/search?q=${query.title.replace(/ /g, '%20')}&limit=${LIMIT}&page=${page}&tachiyomi=true`,
                method: 'GET'
            })
        } else {
            request = App.createRequest({
                url: `${COMICK_API}/v1.0/search?page=${page}&limit=${LIMIT}${includedGenres.length > 0 ? includedGenres.join('') : ''}${excludedGenres.length > 0 ? excludedGenres.join('') : ''}${Sort.length > 0 ? Sort.join('') : ''}${CreatedAt.length > 0 ? CreatedAt.join('') : ''}${Type.length > 0 ? Type.join('') : ''}${Demographic.length > 0 ? Demographic.join('') : ''}&tachiyomi=true`,
                method: 'GET'
            })
        }
        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)

        let data
        try {
            data = JSON.parse(response.data ?? '')
        }
        catch (e) {
            throw new Error(`${e}`)
        }

        const manga = parseSearch(data)
        metadata = data.length === LIMIT ? { page: page + 1 } : undefined
        return App.createPagedResults({
            results: manga,
            metadata
        })
    }

    CloudFlareError(status: number): void {
        if (status == 503 || status == 403) {
            throw new Error(`CLOUDFLARE BYPASS ERROR:\nPlease go to the homepage of <${ComicKInfo.name}> and press the cloud icon.`)
        }
    }

    async getCloudflareBypassRequestAsync(): Promise<Request> {
        return App.createRequest({
            url: COMICK_DOMAIN,
            method: 'GET',
            headers: {
                'referer': `${COMICK_DOMAIN}/`,
                'user-agent': await this.requestManager.getDefaultUserAgent()
            }
        })
    }
}
