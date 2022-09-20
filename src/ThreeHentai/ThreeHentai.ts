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
    LanguageCode,
    Request,
    Response,
    SourceStateManager,
    Section
} from 'paperback-extensions-common'

import { 
    THLanguages, 
    THSortOrders
} from './ThreeHentaiHelper'


import {
    getExtraArgs,
    resetSettings,
    settings,
} from './ThreeHentaiSettings'

import {Parser} from './ThreeHentaiParser'

const ThreeHentai_Base = 'https://3hentai.net'

export const ThreeHentaiInfo: SourceInfo = {
    author: 'xOnlyFadi',
    description: 'Extension that pulls manga from 3hentai.net',
    icon: 'icon.png',
    name: '3hentai',
    version: '1.0.0',
    authorWebsite: 'https://github.com/xOnlyFadi',
    websiteBaseURL: ThreeHentai_Base,
    contentRating: ContentRating.ADULT,
    language: LanguageCode.ENGLISH,
    sourceTags: [
        {
            text: 'Multi Language',
            type: TagType.GREEN
        },
        {
            text: '18+',
            type: TagType.RED
        },
    ]
}

const language = async (stateManager: SourceStateManager): Promise<string> => {
    const lang = (await stateManager.retrieve('languages') as string) ?? THLanguages.getDefault()
    
    return `language:${lang}`
}

const sortOrder = async (query: string, stateManager: SourceStateManager): Promise<string[]> => {
    const inQuery: string[] = THSortOrders.containsShortcut(query)
    if (inQuery[0]?.length !== 0) {
        return [inQuery[0] ?? '', query.replace(inQuery[1] ?? '', '')]
    } else {
        const sortOrder = (await stateManager.retrieve('sort_order') as string) ?? THSortOrders.getDefault()
        return [sortOrder, query]
    }
}

const extraArgs = async (stateManager: SourceStateManager): Promise<string> => {
    const args = await getExtraArgs(stateManager)
    return ` ${args}`
}

export class ThreeHentai extends Source {
    private readonly parser: Parser = new Parser()

    readonly requestManager = createRequestManager({
        requestsPerSecond: 3,
        requestTimeout: 30000,
        interceptor: {
            interceptRequest: async (request: Request): Promise<Request> => {

                request.headers = {
                    ...(request.headers ?? {}),
                    ...{
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36 Edg/103.0.1264.62',
                        'referer': `${ThreeHentai_Base}/`,
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
                settings(this.stateManager),
                resetSettings(this.stateManager),
            ])
        }))
    }

    override getMangaShareUrl(mangaId: string): string {
        return `${ThreeHentai_Base}/d/${mangaId}`
    }

    override async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const section1 = createHomeSection({ id: 'date', title: 'Recent', view_more: true })
        const section2 = createHomeSection({ id: 'popular-24h', title: 'Popular Today', view_more: true })
        const section3 = createHomeSection({ id: 'popular-7d', title: 'Popular Week', view_more: true })
        const section4 = createHomeSection({ id: 'popular', title: 'Popular All-time', view_more: true })
        const sections = [section1, section2, section3, section4]


        for (const section of sections) {
            sectionCallback(section)
            const request = createRequestObject({
                url: `${ThreeHentai_Base}/search?q=${encodeURIComponent(await language(this.stateManager) + await extraArgs(this.stateManager))}&sort=${section.id}`,
                method: 'GET'
            })

            const data = await this.requestManager.schedule(request, 1)
            const $ = this.cheerio.load(data.data)

            section.items = this.parser.parseSearchResults($, this)
            sectionCallback(section)
        }
    }

    override async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1

        const request = createRequestObject({
            url: `${ThreeHentai_Base}/search?q=${encodeURIComponent(await language(this.stateManager) + await extraArgs(this.stateManager))}&sort=${homepageSectionId}&page=${page}`,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)
        const manga = this.parser.parseSearchResults($ ,this)

        metadata = this.parser.NextPage($) ? {page: page + 1} : undefined
        return createPagedResults({
            results: manga,
            metadata
        })
    }

    async getMangaDetails(mangaId: string): Promise<Manga> {
        const options  = createRequestObject({
            url: `${ThreeHentai_Base}/d/${mangaId}`,
            method: 'GET',
        })
        const response = await this.requestManager.schedule(options, 1)
        const $ = this.cheerio.load(response.data)
        return this.parser.parseMangaDetails($, mangaId,this)
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        const lang = (await this.stateManager.retrieve('languages') as string) ?? THLanguages.getDefault()
        const options = createRequestObject({
            url: `${ThreeHentai_Base}/d/${mangaId}`,
            method: 'GET'
        })
        const response = await this.requestManager.schedule(options, 1)
        const $ = this.cheerio.load(response.data)
        return this.parser.parseChapters($, mangaId, lang,this)
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const options = createRequestObject({
            url: `${ThreeHentai_Base}/d/${chapterId}/1`,
            method: 'GET'
        })
        const response = await this.requestManager.schedule(options, 1)
        return this.parser.parseChapterDetails(response.data, mangaId, chapterId)
    }

    async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        if (metadata?.completed) return metadata
        const page: number = metadata?.page ?? 1
        const title: string = query.title ?? ''

        if(query.title){
            if (/^\d+$/.test(title)) {
                const request = createRequestObject({
                    url: `${ThreeHentai_Base}/d/${title}`,
                    method: 'GET'
                })
    
                const data = await this.requestManager.schedule(request, 1)
    
                if(data.status == 404) return createPagedResults({results: [], metadata: undefined})
    
                const $ = this.cheerio.load(data.data)
                const manga = this.parser.parseSearchResultsArchive($,this,title)
                return createPagedResults({
                    results: manga,
                    metadata: undefined
                })
            } else {
                const q: string = title + ' ' + await language(this.stateManager) + await extraArgs(this.stateManager)
                const [sort, query]: string[] = await sortOrder(q, this.stateManager) ?? ['', q]
                console.log(`sort is ${sort}`)
                const request = createRequestObject({
                    url: `${ThreeHentai_Base}/search?q=${encodeURIComponent(query ?? '')}&sort=${sort}&page=${page}`,
                    method: 'GET',
                })
                const data = await this.requestManager.schedule(request, 2)
                const $ = this.cheerio.load(data.data)
                const manga = this.parser.parseSearchResults($, this)
    
                metadata = this.parser.NextPage($) ? {page: page + 1} : undefined
    
                return createPagedResults({
                    results: manga,
                    metadata
                })
            }
        } else {
            const request = createRequestObject({
                url: `${ThreeHentai_Base}/tags/${query?.includedTags?.map((x: any) => x.id)[0]}`,
                method: 'GET',
            })
            const data = await this.requestManager.schedule(request, 2)
            const $ = this.cheerio.load(data.data)
            const manga = this.parser.parseSearchResults($, this)

            metadata = this.parser.NextPage($) ? {page: page + 1} : undefined

            return createPagedResults({
                results: manga,
                metadata
            }) 
        }

    }
}