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
    TagSection,
    TagType,
    LanguageCode,
    MangaUpdates,
} from 'paperback-extensions-common'

import {
    parseChapterDetails,
    parseChapters,
    parseSearch,
    parseMangaDetails,
    parseTags,
} from './DesuMEParser'


import { 
    ChapterDetailsImages,
    MangaDetails,
    SearchData 
} from './DesuMEHelper'

import moment from 'moment'

import '../scopes'

const DOMAIN = 'https://desu.me'
const API = `${DOMAIN}/manga/api`
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36'

export const DesuMEInfo: SourceInfo = {
    version: '1.0.0',
    name: 'Desu',
    icon: 'icon.png',
    author: 'xOnlyFadi',
    authorWebsite: 'https://github.com/xOnlyFadi',
    description: 'Extension that pulls from desu.me.',
    contentRating: ContentRating.EVERYONE,
    websiteBaseURL: DOMAIN,
    language: LanguageCode.RUSSIAN,
    sourceTags: [
        {
            text: 'Notifications',
            type: TagType.GREEN
        },
        {
            text: 'Russian',
            type: TagType.GREY
        }
    ]
}

export class DesuME extends Source {

    requestManager = createRequestManager({
        requestsPerSecond: 2,
        requestTimeout: 15000,
        interceptor: {
            interceptRequest: async (request: Request): Promise<Request> => {

                request.headers = {
                    ...(request.headers ?? {}),
                    ...{
                        'user-agent': userAgent,
                        'referer': `${DOMAIN}/`
                    }
                }

                return request
            },

            interceptResponse: async (response: Response): Promise<Response> => {
                return response
            }
        }
    })

    limit = 50

    override getMangaShareUrl(mangaId: string): string { return `${DOMAIN}/manga/${mangaId}` }

    override async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const sections = [
            {
                request: createRequestObject({
                    url: `${API}/?limit=${this.limit}&order=popular&page=1`,
                    method: 'GET',
                }),
                section: createHomeSection({
                    id: 'popular',
                    title: 'популярный',
                    view_more: true,
                }),
            },
            {
                request: createRequestObject({
                    url: `${API}/?limit=${this.limit}&order=updated&page=1`,
                    method: 'GET',
                }),
                section: createHomeSection({
                    id: 'updated',
                    title: 'обновленный',
                    view_more: true,
                }),
            },
            {
                request: createRequestObject({
                    url: `${API}/?limit=${this.limit}&order=name&page=1`,
                    method: 'GET',
                }),
                section: createHomeSection({
                    id: 'name',
                    title: 'по алфавиту',
                    view_more: true,
                }),
            }
        ]

        const promises: Promise<void>[] = []
        
        for (const section of sections) {
            sectionCallback(section.section)
            promises.push(
                this.requestManager.schedule(section.request, 1).then(response => {
                    this.CloudFlareError(response.status)

                    let data: SearchData
                    try {
                        data = JSON.parse(response.data)
                    } catch (e) {
                        throw new Error(`${e}`)
                    }

                    section.section.items = parseSearch(data)
                    sectionCallback(section.section)
                }),
            )
        }

        await Promise.all(promises)
    }

    override async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1
        
        const request = createRequestObject({
            url: `${API}/?limit=${this.limit}&order=${homepageSectionId}&page=${page}`,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)

        let data: SearchData
        try {
            data = JSON.parse(response.data)
        } catch (e) {
            throw new Error(`${e}`)
        }

        const manga = parseSearch(data)

        metadata = data.pageNavParams.count > data.pageNavParams.page * data.pageNavParams.limit ? {page: page + 1} : undefined

        return createPagedResults({
            results: manga,
            metadata
        })
    }

    override async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1
        
        let url = `${API}/?limit=${this.limit}&page=${page}`

        const Genres: string[] = []
        const Types: string[] = []
        const Order: string[] = []

        query.includedTags?.map(x => {
            const id = x?.id
            const SplittedID = id?.split('.')?.pop() ?? ''    

            if(id.includes('genres.')){
                Genres.push(SplittedID)
            }

            if(id.includes('types.')){
                Types.push(SplittedID)
            }

            if(id.includes('order.')){
                Order.push(SplittedID)
            }
        })

        if(query?.title){
            url += `&search=${query?.title.replace(/ /g, '+').replace(/%20/g, '+')}`
        }

        if(Genres.isNotEmpty()){
            url += `&genres=${Genres.join(',')}`
        }

        if(Types.isNotEmpty()){
            url += `&kinds=${Types.join(',')}`
        }

        if(Order.isNotEmpty()){
            url += `&order=${Order[0]}`
        }

        const request = createRequestObject({
            url: url,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)

        let data: SearchData
        try {
            data = JSON.parse(response.data)
        } catch (e) {
            throw new Error(`${e}`)
        }

        const manga = parseSearch(data)

        metadata = data.pageNavParams.count > data.pageNavParams.page * data.pageNavParams.limit ? {page: page + 1} : undefined

        return createPagedResults({
            results: manga,
            metadata
        })
    }

    override async getMangaDetails(mangaId: string): Promise<Manga> {
        const request = createRequestObject({
            url: `${API}/${mangaId}`,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)

        let data: MangaDetails
        try {
            data = JSON.parse(response.data)
        } catch (e) {
            throw new Error(`${e}`)
        }

        return parseMangaDetails(data, mangaId)
    }

    override async getChapters(mangaId: string): Promise<Chapter[]> {
        const request = createRequestObject({
            url: `${API}/${mangaId}`,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)


        let data: MangaDetails
        try {
            data = JSON.parse(response.data)
        } catch (e) {
            throw new Error(`${e}`)
        }

        return parseChapters(data, mangaId)
    }

    override async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const request = createRequestObject({
            url: `${API}/${mangaId}/chapter/${chapterId}`,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)

        let data: ChapterDetailsImages
        try {
            data = JSON.parse(response.data)
        } catch (e) {
            throw new Error(`${e}`)
        }

        return parseChapterDetails(data, mangaId, chapterId)
    }
    
    override async filterUpdatedManga(mangaUpdatesFoundCallback: (updates: MangaUpdates) => void, time: Date, ids: string[]): Promise<void> {
        const updatedManga: string[] = []
        let page = 0

        while (page < 5) {

            const mangaToUpdate: string[] = []

            const request = createRequestObject({
                url: `${API}/?limit=${this.limit}&order=updated&page=${page}`,
                method: 'GET',
            })

            const response = await this.requestManager.schedule(request, 1)

            this.CloudFlareError(response.status)


            let data: SearchData

            try {
                data = JSON.parse(response.data)
            } catch (e) {
                throw new Error(`${e}`)
            }


            for (const chapter of data.response) {
                const id = chapter.id ?? ''
                const chaptime = new Date(Number(chapter.chapters.updated.date) * 1000)
                const FormatedCurrentDate = moment(time).format('YYYY-MM-DD')
                const FormatedChapterDate = moment(chaptime).format('YYYY-MM-DD')

                if (!id) continue

                if (ids.includes(`${id}`) && !updatedManga.includes(`${id}`)) {
                    if (FormatedChapterDate === FormatedCurrentDate) {
                        mangaToUpdate.push(`${id}`)
                        updatedManga.push(`${id}`)
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

    override async getTags(): Promise<TagSection[]> {
        return parseTags()
    }

    CloudFlareError(status: number): void {
        if (status == 503) {
            throw new Error('CLOUDFLARE BYPASS ERROR:\nPlease go to Settings > Sources > GManga and press Cloudflare Bypass or press the Cloud image on the right')
        }
    }
}
