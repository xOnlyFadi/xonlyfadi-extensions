import { 
    PagedResults,
    SourceManga,
    Chapter,
    ChapterDetails,
    HomeSection,
    SearchRequest,
    SourceInfo,
    ContentRating,
    Request,
    Response,
    TagSection,
    SearchField,
    ChapterProviding,
    HomePageSectionsProviding,
    MangaProviding,
    SearchResultsProviding,
    SourceIntents
} from '@paperback/types'

import { 
    SearchQuery,
    MangaDetailQuery,
    ChaptersQuery,
    FiltersQuery,
    ChapterDetailsQuery,
    HomePageQuery 
} from './VoyceMEGraphQL'

import { 
    SearchType,
    VoyceChapterData,
    VoyceChapterDetailsData,
    VoyceMangaData 
} from './VoyceMEHelper'
import { Parser } from './VoyceMEParser'

const VoyceME_Base = 'http://voyce.me'
export const VoyceMEInfo: SourceInfo = {
    author: 'xOnlyFadi',
    description: 'Extension that pulls manga from voyce.me',
    icon: 'icon.png',
    name: 'Voyce.Me',
    version: '2.0.1',
    authorWebsite: 'https://github.com/xOnlyFadi',
    websiteBaseURL: VoyceME_Base,
    contentRating: ContentRating.EVERYONE,
    language: 'ENGLISH',
    intents: SourceIntents.MANGA_CHAPTERS | SourceIntents.HOMEPAGE_SECTIONS
}
export class VoyceME implements MangaProviding, ChapterProviding, SearchResultsProviding, HomePageSectionsProviding {
    private readonly parser: Parser = new Parser()
    private readonly graphqlURL: string = 'https://graphql.voyce.me/v1/graphql'
    private readonly popularPerPage: number = 30
    
    readonly requestManager = App.createRequestManager({
        requestsPerSecond: 4,
        requestTimeout: 15000,
        interceptor: {
            interceptRequest: async (request: Request): Promise<Request> => {
                request.headers = {
                    ...(request.headers ?? {}),
                    ...{
                        'Accept': '*/*',
                        'Referer': `${VoyceME_Base}/`,
                        'Origin': VoyceME_Base,
                        'content-type': 'application/json',
                        'accept': 'application/json'
                    }
                }
                return request
            },
            interceptResponse: async (response: Response): Promise<Response> => {
                return response
            }
        }
    })
    
    getMangaShareUrl(mangaId: string): string {
        return `${VoyceME_Base}/series/${mangaId}`
    }
    
    async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const request = App.createRequest({
            url: this.graphqlURL,
            method: 'POST',
            data: HomePageQuery(0, this.popularPerPage)
        })
        const response = await this.requestManager.schedule(request, 1)
        
        let data
        try {
            data = JSON.parse(response.data as string)
        }
        catch (e) {
            throw new Error(`${e}`)
        }
        
        this.parser.parseHomeSections(data, sectionCallback)
    }
    
    async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 0
        const request = App.createRequest({
            url: this.graphqlURL,
            method: 'POST',
            data: HomePageQuery(page, this.popularPerPage)
        })
        const response = await this.requestManager.schedule(request, 1)
        
        let data
        try {
            data = JSON.parse(response.data as string)
        }
        catch (e) {
            throw new Error(`${e}`)
        }
        const manga = this.parser.parseViewMore(homepageSectionId, data)
        
        metadata = manga.length == this.popularPerPage ? { page: page + 1 } : undefined
        
        return App.createPagedResults({
            results: manga,
            metadata
        })
    }
    
    async getMangaDetails(mangaId: string): Promise<SourceManga> {
        const options = App.createRequest({
            url: this.graphqlURL,
            method: 'POST',
            data: MangaDetailQuery(Number(mangaId))
        })
        const response = await this.requestManager.schedule(options, 1)
        
        let data: VoyceMangaData
        try {
            data = JSON.parse(response.data as string)
        }
        catch (e) {
            throw new Error(`${e}`)
        }
        
        if (data.data.series?.isEmpty()) throw new Error(`Failed to parse manga property from data object mangaId: ${mangaId}`)
        
        return this.parser.parseMangaDetails(data, mangaId)
    }
    
    async getChapters(mangaId: string): Promise<Chapter[]> {
        const options = App.createRequest({
            url: this.graphqlURL,
            method: 'POST',
            data: ChaptersQuery(Number(mangaId))
        })
        const response = await this.requestManager.schedule(options, 1)
        
        let data: VoyceChapterData
        try {
            data = JSON.parse(response.data as string)
        }
        catch (e) {
            throw new Error(`${e}`)
        }
        
        if (data.data?.series?.isEmpty()) throw new Error(`Failed to parse manga property from data object mangaId: ${mangaId}`)
        if (data.data?.series?.first()?.chapters?.isEmpty()) throw new Error(`Failed to parse chapters property from manga object mangaId: ${mangaId}`)
        
        return this.parser.parseChapters(data)
    }
    
    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const options = App.createRequest({
            url: this.graphqlURL,
            method: 'POST',
            data: ChapterDetailsQuery(Number(chapterId))
        })
        const response = await this.requestManager.schedule(options, 1)
        
        let data: VoyceChapterDetailsData
        try {
            data = JSON.parse(response.data as string)
        }
        catch (e) {
            throw new Error(`${e}`)
        }
        
        return this.parser.parseChapterDetails(data, mangaId, chapterId)
    }
    
    async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 0
        const request = App.createRequest({
            url: this.graphqlURL,
            method: 'POST',
            data: SearchQuery(query, page, this.popularPerPage)
        })
        const response = await this.requestManager.schedule(request, 2)
        
        let data
        try {
            data = JSON.parse(response.data as string)
        }
        catch (e) {
            throw new Error(`${e}`)
        }
        const manga = this.parser.parseSearch(data)
        
        metadata = manga.length == this.popularPerPage ? { page: page + 1 } : undefined
        
        return App.createPagedResults({
            results: manga,
            metadata
        })
    }
    
    async getSearchTags(): Promise<TagSection[]> {
        const request = App.createRequest({
            url: this.graphqlURL,
            method: 'POST',
            data: FiltersQuery()
        })
        const response = await this.requestManager.schedule(request, 2)
        
        let data: SearchType
        try {
            data = JSON.parse(response.data as string)
        }
        catch (e) {
            throw new Error(`${e}`)
        }
        
        return this.parser.parseTags(data)
    }
    
    async supportsSearchOperators(): Promise<boolean> {
        return true
    }
    
    async getSearchFields(): Promise<SearchField[]> {
        return [
            App.createSearchField({ id: 'author', placeholder: '', name: 'Author' }),
            App.createSearchField({ id: 'description', placeholder: '', name: 'Description' })
        ]
    }
}
