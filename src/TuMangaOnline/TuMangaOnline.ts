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
    BadgeColor,
    ChapterProviding,
    HomePageSectionsProviding,
    MangaProviding,
    SearchResultsProviding,
    DUISection,
    SourceIntents
} from '@paperback/types'

import * as cheerio from 'cheerio'

import { Parser } from './TuMangaOnlineParser'
import {
    contentSettings,
    getNSFW
} from './TuMangaOnlineSettings'

interface Metadata {
    page?: number
}

const TUMANGA_DOMAIN = 'https://visortmo.com'

export const TuMangaOnlineInfo: SourceInfo = {
    author: 'xOnlyFadi',
    description: 'Extensi\u00F3n que extrae el manga de visortmo.com',
    icon: 'icon.png',
    name: 'TuMangaOnline',
    version: '2.0.4',
    authorWebsite: 'https://github.com/xOnlyFadi',
    websiteBaseURL: TUMANGA_DOMAIN,
    contentRating: ContentRating.ADULT,
    intents: SourceIntents.MANGA_CHAPTERS | SourceIntents.HOMEPAGE_SECTIONS | SourceIntents.SETTINGS_UI,
    language: 'SPANISH',
    sourceTags: [
        {
            text: 'Spanish',
            type: BadgeColor.GREY
        }
    ]
}
export class TuMangaOnline implements MangaProviding, ChapterProviding, SearchResultsProviding, HomePageSectionsProviding {
    userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36'

    private readonly parser: Parser = new Parser()
    readonly requestManager = App.createRequestManager({
        requestsPerSecond: 4,
        requestTimeout: 15000,
        interceptor: {
            interceptRequest: async (request: Request): Promise<Request> => {
                console.log(request.url)
                request.headers = {
                    ...(request.headers ?? {}),
                    ...{
                        'user-agent': this.userAgent,
                        'referer': `${TUMANGA_DOMAIN}/`
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
        return `${TUMANGA_DOMAIN}/library/${mangaId}`
    }

    stateManager = App.createSourceStateManager()

    async getSourceMenu(): Promise<DUISection> {
        return App.createDUISection({
            id: 'main',
            header: 'Source Settings',
            rows: async () => [
                contentSettings(this.stateManager)
            ],
            isHidden: false
        })
    }

    async getCloudflareBypassRequestAsync(): Promise<Request> {
        return App.createRequest({
            url: TUMANGA_DOMAIN,
            method: 'GET',
            headers: {
                'referer': `${TUMANGA_DOMAIN}/`,
                'user-agent': this.userAgent
            }
        })
    }

    async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const getNSFWOption = await getNSFW(this.stateManager)
        const sections = [
            {
                request: App.createRequest({
                    url: `${TUMANGA_DOMAIN}/library?order_item=creation&order_dir=desc&title=&_pg=1&filter_by=title${getNSFWOption ? '' : '&exclude_genders%5B%5D=6&exclude_genders%5B%5D=17&exclude_genders%5B%5D=18&exclude_genders%5B%5D=19&erotic=false'}`,
                    method: 'GET'
                }),
                section: App.createHomeSection({
                    id: '1',
                    title: 'Últimas actualizaciones',
                    containsMoreItems: true,
                    type: 'singleRowNormal'
                })
            },
            {
                request: App.createRequest({
                    url: `${TUMANGA_DOMAIN}/library?order_item=likes_count&order_dir=desc&title=&_pg=1&filter_by=title${getNSFWOption ? '' : '&exclude_genders%5B%5D=6&exclude_genders%5B%5D=17&exclude_genders%5B%5D=18&exclude_genders%5B%5D=19&erotic=false'}`,
                    method: 'GET'
                }),
                section: App.createHomeSection({
                    id: '2',
                    title: 'Series populares',
                    containsMoreItems: true,
                    type: 'singleRowNormal'
                })
            }
        ]

        const promises: Promise<void>[] = []
        for (const section of sections) {
            sectionCallback(section.section)
            promises.push(this.requestManager.schedule(section.request, 1).then(response => {
                this.CloudFlareError(response.status)
                const $ = cheerio.load(response.data!)
                section.section.items = this.parser.parseHomeSection($, TUMANGA_DOMAIN)
                sectionCallback(section.section)
            }))
        }

        await Promise.all(promises)
    }

    async getViewMoreItems(homepageSectionId: string, metadata?: Metadata): Promise<PagedResults> {
        const getNSFWOption = await getNSFW(this.stateManager)
        const page = metadata?.page ?? 1

        let param = ''
        switch (homepageSectionId) {
            case '1':
                param = `/library?order_item=creation&order_dir=desc&filter_by=title${getNSFWOption ? '': '&exclude_genders%5B%5D=6&exclude_genders%5B%5D=17&exclude_genders%5B%5D=18&exclude_genders%5B%5D=19&erotic=false'}&_pg=1&page=${page}`
                break
            case '2':
                param = `/library?order_item=likes_count&order_dir=desc&filter_by=title${getNSFWOption ? '': '&exclude_genders%5B%5D=6&exclude_genders%5B%5D=17&exclude_genders%5B%5D=18&exclude_genders%5B%5D=19&erotic=false'}&_pg=1&page=${page}`
                break
            default:
                throw new Error(`Invalid homeSectionId | ${homepageSectionId}`)
        }

        const request = App.createRequest({
            url: `${TUMANGA_DOMAIN}${param}`,
            method: 'GET'
        })
        const response = await this.requestManager.schedule(request, 1)
        const $ = cheerio.load(response.data!)
        const manga = this.parser.parseHomeSection($, TUMANGA_DOMAIN)

        metadata = this.parser.NextPage($) ? { page: page + 1 } : undefined

        return App.createPagedResults({
            results: manga,
            metadata
        })
    }

    async getSearchTags(): Promise<TagSection[]> {
        const getNSFWOption = await getNSFW(this.stateManager)
        const options = App.createRequest({
            url: `${TUMANGA_DOMAIN}/library`,
            method: 'GET'
        })
        const response = await this.requestManager.schedule(options, 1)
        this.CloudFlareError(response.status)
        const $ = cheerio.load(response.data!)

        return this.parser.parseTags($, getNSFWOption)
    }

    async getMangaDetails(mangaId: string): Promise<SourceManga> {
        const options = App.createRequest({
            url: `${TUMANGA_DOMAIN}/library/${mangaId}`,
            method: 'GET'
        })
        const response = await this.requestManager.schedule(options, 1)
        this.CloudFlareError(response.status)
        const $ = cheerio.load(response.data!)

        return this.parser.parseMangaDetails($, mangaId)
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        const options = App.createRequest({
            url: `${TUMANGA_DOMAIN}/library/${mangaId}`,
            method: 'GET'
        })
        const response = await this.requestManager.schedule(options, 1)
        this.CloudFlareError(response.status)
        const $ = cheerio.load(response.data!)

        return this.parser.parseChapters($, mangaId, TUMANGA_DOMAIN)
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const options = App.createRequest({
            url: await this.getChapterURL(chapterId, mangaId),
            method: 'GET'
        })
        const response = await this.requestManager.schedule(options, 1)
        this.CloudFlareError(response.status)
        const $ = cheerio.load(response.data!)

        return this.parser.parseChapterDetails($, mangaId, chapterId)
    }

    async getChapterURL(chapterId: string, mangaId: string): Promise<string> {
        const request = App.createRequest({
            url: `${TUMANGA_DOMAIN}/view_uploads/${chapterId}/`,
            headers: {
                'referer': `${TUMANGA_DOMAIN}/library/${mangaId}`
            },
            method: 'GET'
        })
        const data = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(data.status)
        const $ = cheerio.load(data.data!)

        const button = $('.flex-row button.btn-social').attr('onclick')?.match(/copyToClipboard\(['"`](.*)['"`]\)/i)
        let url
        if (button?.[1]) {
            const chapurl = button[1]
            if(chapurl.includes('paginated')){
                url = chapurl.replace('paginated','') + 'cascade'
            } else {
                url = chapurl
            }
        } else {
            throw new Error(`Failed to parse the chapter url for ${chapterId}`)
        }

        return url
    }

    async getSearchResults(query: SearchRequest, metadata?: Metadata): Promise<PagedResults> {
        const getNSFWOption = await getNSFW(this.stateManager)
        const page = metadata?.page ?? 1
        const search = {
            types: '',
            status: '',
            translationstatus: '',
            demography: '',
            filter: 'title',
            sorting: 'likes_count',
            sortby: 'asc',
            webcomic: '',
            yonkoma: '',
            amateur: '',
            erotic: getNSFWOption ? '' : 'false',
            genres: ''
        }
        const tags = query.includedTags?.map(tag => tag.id) ?? []
        const genres: string[] = []
        tags.map((value) => {
            if (!value.includes('.')) {
                genres.push(`&genders[]=${value}`)
            } else {
                switch (value.split('.')[0]) {
                    case 'types':
                        search.types = value.split('.')[1] ?? ''
                        break
                    case 'status':
                        search.status = value.split('.')[1] ?? ''
                        break
                    case 'trstatus':
                        search.translationstatus = value.split('.')[1] ?? ''
                        break
                    case 'demog':
                        search.demography = value.split('.')[1] ?? ''
                        break
                    case 'filby':
                        search.filter = value.split('.')[1] ?? 'title'
                        break
                    case 'sorting':
                        search.sorting = value.split('.')[1] ?? 'likes_count'
                        break
                    case 'byaplha':
                        search.sortby = value.split('.')[1] ?? 'asc'
                        break
                    case 'contenttype':
                        // eslint-disable-next-line no-case-declarations
                        const contype = value.split('.')[1] ?? ''
                        if(contype == 'webcomic'){
                            search.webcomic = 'true'
                        } else if(contype == 'yonkoma'){
                            search.yonkoma = 'true'
                        } else if(contype == 'amateur'){
                            search.amateur = 'true'
                        } else if(contype== 'erotic'){
                            if(getNSFWOption){
                                search.erotic = 'true'
                            }
                        }
                        break
                }

            }
        })

        search.genres = (genres ?? []).join('')
        let request
        if (query.includedTags?.length == 0) {
            request = App.createRequest({
                url: encodeURI(`${TUMANGA_DOMAIN}/library?title=${query?.title?.replace(/%20/g, '+').replace(/ /g, '+') ?? ''}${getNSFWOption ? '' : '&exclude_genders%5B%5D=6&exclude_genders%5B%5D=17&exclude_genders%5B%5D=18&exclude_genders%5B%5D=19&erotic=false'}&page=${page}&_pg=1`),
                method: 'GET'
            })
        } else {
            request = App.createRequest({
                url: encodeURI(`${TUMANGA_DOMAIN}/library?title=${query?.title?.replace(/%20/g, '+').replace(/ /g, '+') ?? ''}${getNSFWOption ? '' : '&exclude_genders%5B%5D=6&exclude_genders%5B%5D=17&exclude_genders%5B%5D=18&exclude_genders%5B%5D=19&erotic=false'}&page=${page}&_pg=1&type=${search.types}&demography=${search.demography}&status=${search.status}&translation_status=${search.translationstatus}&${search.filter}&order_item=${search.sorting}&order_dir=${search.sortby}&webcomic=${search.webcomic}&yonkoma=${search.yonkoma}&amateur=${search.amateur}&erotic=${search.erotic}${search.genres}`),
                method: 'GET'
            })
        }
        const data = await this.requestManager.schedule(request, 2)
        this.CloudFlareError(data.status)
        const $ = cheerio.load(data.data!)
        const manga = this.parser.parseHomeSection($, TUMANGA_DOMAIN)

        metadata = this.parser.NextPage($) ? { page: page + 1 } : undefined

        return App.createPagedResults({
            results: manga,
            metadata
        })
    }

    CloudFlareError(status: number): void {
        if (status == 503 || status == 403) {
            throw new Error(`CLOUDFLARE BYPASS ERROR:\nPlease go to Settings > Sources > ${TuMangaOnline.name} and press Cloudflare Bypass`)
        }
    }
}
