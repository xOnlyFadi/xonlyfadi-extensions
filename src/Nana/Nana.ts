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
    TagSection,
    Tag,
    HomeSectionType,
} from 'paperback-extensions-common'

import {Parser} from './NanaParser'

const Nana_Base = 'https://nana.my.id'

export const NanaInfo: SourceInfo = {
    author: 'xOnlyFadi',
    description: 'Extension that pulls manga from nana.my.id',
    icon: 'icon.png',
    name: 'Nana',
    version: '1.0.3',
    authorWebsite: 'https://github.com/xOnlyFadi',
    websiteBaseURL: Nana_Base,
    contentRating: ContentRating.ADULT,
    language: LanguageCode.ENGLISH,
    sourceTags: [
        {
            text: '18+',
            type: TagType.RED
        }
    ]
}

export class Nana extends Source {
    private readonly parser: Parser = new Parser()

    baseUrl = Nana_Base
    readonly requestManager = createRequestManager({
        requestsPerSecond: 3,
        requestTimeout: 30000,
        interceptor: {
            
            interceptRequest: async (request: Request): Promise<Request> => {
                request.headers = {
                    ...(request.headers ?? {}),
                    ...{
                        'referer': `${Nana_Base}/`,
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
        return `${Nana_Base}/reader/${mangaId}`
    }

    override async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const sections = [
            {
                request: createRequestObject({
                    url: `${Nana_Base}`,
                    method: 'GET'
                }),
                section: createHomeSection({
                    id: '0',
                    title: 'Latest Upload',
                    view_more: true,
                    type: HomeSectionType.singleRowLarge
                }),
            },
        ]

        const promises: Promise<void>[] = []
        for (const section of sections) {

            sectionCallback(section.section)

            promises.push(
                this.requestManager.schedule(section.request, 1).then(async response => {
                    const $ = this.cheerio.load(response.data)
                    section.section.items = this.parser.parseSearchResults($,Nana_Base)
                    sectionCallback(section.section)
                }),
            )

        }

        await Promise.all(promises)
    }

    override async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1
        let param = ''

        switch (homepageSectionId) {
            case '0':
                param = `/?p=${page}`
                break
            default:
                throw new Error(`Invalid homeSectionId | ${homepageSectionId}`)
        }

        const request = createRequestObject({
            url: Nana_Base,
            method: 'GET',
            param
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)
        const manga = this.parser.parseSearchResults($, Nana_Base)

        metadata = this.parser.NextPage($) ? {page: page + 1} : undefined 

        return createPagedResults({
            results: manga,
            metadata
        })
    }

    async getMangaDetails(mangaId: string): Promise<Manga> {
        const options  = createRequestObject({
            url: `${Nana_Base}/reader/${mangaId}`,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(options, 1)
        const $ = this.cheerio.load(response.data)

        return this.parser.parseMangaDetails($, mangaId,this.baseUrl)
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        return [
            createChapter({
                id: mangaId, 
                mangaId: mangaId,
                name: 'Chapter 1', 
                chapNum: 1,
                time: undefined,
                langCode: LanguageCode.ENGLISH
            })
        ]
    }

    override async getSearchTags(): Promise<TagSection[]> {
        const arrayTags: Tag[] = [
            {
                id: 'search.asc',
                label: 'Ascending'
            },
            {
                id: 'search.desc',
                label: 'Descending'
            }
        ]
        
        return [
            createTagSection({ id: '1', label: 'Sort Date Added by', tags: arrayTags.map(x => createTag(x)) }),
        ]
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const options = createRequestObject({
            url: `${Nana_Base}/api/archives/${mangaId}/extractthumbnails`,
            method: 'GET'
        })

        const response = await this.requestManager.schedule(options, 1)
        let data
        try {
            data = JSON.parse(response.data)
        } catch (e) {
            throw new Error(`${e}`)
        }

        if(data.pages.length == 0) throw new Error(`Could not fetch chapter details for ${mangaId}`)

        return this.parser.parseChapterDetails(data, mangaId, chapterId, Nana_Base)
    }

    async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1

        const request = createRequestObject({
            url: `${Nana_Base}/?q=${query.title?.replace(/ /g, '+')?.replace(/%20/g, '+') ?? ''}${query?.includedTags?.length !== 0 ? query?.includedTags?.map((x: any) => {if(x.id.includes('details.')) {return `%2B%22${encodeURIComponent(x.id.split('.').pop())}%22`} return ''}) ?? '' : ''}&sort=${query?.includedTags?.length !== 0 ? query?.includedTags?.map((x: any) => {if(x.id.includes('search.')) return x.id.split('.').pop()})[0] ?? 'desc': 'desc'}&p=${page}`,
            method: 'GET'
        })

        const data = await this.requestManager.schedule(request, 2)
        const $ = this.cheerio.load(data.data)
        const manga = this.parser.parseSearchResults($, Nana_Base)

        metadata = this.parser.NextPage($) ? {page: page + 1} : undefined 

        return createPagedResults({
            results: manga,
            metadata
        })
    }
}
