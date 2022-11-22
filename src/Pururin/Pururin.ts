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
    SearchField,
} from 'paperback-extensions-common'

import {
    parseChapterDetails,
    parseSearch,
    parseMangaDetails,
    parseTags,
    parseSearchFields,
    parseMetadata,
    parseChapters,
} from './PururinParser'


import { 
    MangaDetails,
    SearchData 
} from './PururinHelper'

import '../scopes'

const DOMAIN = 'https://pururin.to'
const SEARCH_URL = `${DOMAIN}/api/search/advance`
const GALLERY_URL = `${DOMAIN}/api/contribute/gallery/info`


export const PururinInfo: SourceInfo = {
    version: '1.0.0',
    name: 'Pururin',
    icon: 'icon.png',
    author: 'xOnlyFadi',
    authorWebsite: 'https://github.com/xOnlyFadi',
    description: 'Extension that pulls from pururin.to.',
    contentRating: ContentRating.ADULT,
    websiteBaseURL: DOMAIN,
}

let slug: string

export class Pururin extends Source {

    requestManager = createRequestManager({
        requestsPerSecond: 2,
        requestTimeout: 15000,
        interceptor: {
            interceptRequest: async (request: Request): Promise<Request> => {

                request.headers = {
                    ...(request.headers ?? {}),
                    ...{
                        'referer': `${DOMAIN}/`,
                        'Origin': DOMAIN,
                        'content-type': 'application/json',
                        'accept': 'application/json',
                    }
                }

                const URL = request.url
                if(URL.includes('intercept:')){
                    const OLD_URL = URL.replace('intercept:', '')
                    const Status = await this.getImageStatus(OLD_URL)

                    switch(Status){
                        case 200:
                            request.url = OLD_URL
                            break
                        case 404:
                            request.url = OLD_URL.substringBeforeLast('.') + '.png'
                            break
                    }
                }

                return request
            },

            interceptResponse: async (response: Response): Promise<Response> => {
                return response
            }
        }
    })

    override getMangaShareUrl(mangaId: string): string { return `${DOMAIN}/gallery/${mangaId}/${slug}` }

    override async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const sections = [
            createHomeSection({
                id: 'most-popular',
                title: 'Most Popular',
                view_more: true,
            }),
            createHomeSection({
                id: 'highest-rated',
                title: 'High Rated',
                view_more: true,
            }),
            createHomeSection({
                id: 'newest',
                title: 'Newest',
                view_more: true,
            })
        ]

        const promises: Promise<void>[] = []
        
        for (const section of sections) {
            sectionCallback(section)

            const Calls: SearchRequest = {
                parameters: {},
                includedTags: []
            }

            Calls.includedTags?.push({id: `sort.${section.id}`, label: `${section.id}`})

            const request = createRequestObject({
                url: SEARCH_URL,
                method: 'POST',
                data: parseMetadata(Calls, {page: 1})
            })
            promises.push(
                this.requestManager.schedule(request, 1).then(response => {
                    this.CloudFlareError(response.status)

                    let data: SearchData
                    try {
                        const FirstData: { results: string } = JSON.parse(response.data)
                        try {
                            data = JSON.parse(FirstData.results)
                        } catch (e) {
                            throw new Error(`${e}`)
                        }
                    } catch (e) {
                        throw new Error(`${e}`)
                    }


                    section.items = parseSearch(data)
                    sectionCallback(section)
                }),
            )
        }

        await Promise.all(promises)
    }

    override async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1
        const Calls: SearchRequest = {
            parameters: {},
            includedTags: []
        }

        Calls.includedTags?.push({id: `sort.${homepageSectionId}`, label: `${homepageSectionId}`})
        const request = createRequestObject({
            url: SEARCH_URL,
            method: 'POST',
            data: parseMetadata(Calls, metadata)
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)

        let data: SearchData
        try {
            const FirstData: { results: string } = JSON.parse(response.data)
            try {
                data = JSON.parse(FirstData.results)
            } catch (e) {
                throw new Error(`${e}`)
            }
        } catch (e) {
            throw new Error(`${e}`)
        }

        const manga = parseSearch(data)

        metadata = data.current_page != data.last_page ? {page: page + 1} : undefined

        return createPagedResults({
            results: manga,
            metadata
        })
    }

    override async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1

        const request = createRequestObject({
            url: SEARCH_URL,
            method: 'POST',
            data: parseMetadata(query, metadata)
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)

        let data: SearchData
        try {
            const FirstData: { results: string } = JSON.parse(response.data)
            try {
                data = JSON.parse(FirstData.results)
            } catch (e) {
                throw new Error(`${e}`)
            }
        } catch (e) {
            throw new Error(`${e}`)
        }

        const manga = parseSearch(data)

        metadata = data.current_page != data.last_page ? {page: page + 1} : undefined

        return createPagedResults({
            results: manga,
            metadata
        })
    }

    override async getMangaDetails(mangaId: string): Promise<Manga> {
        const request = createRequestObject({
            url: GALLERY_URL,
            method: 'POST',
            data: {
                id: mangaId,
                type: '1'
            }
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)

        let data: MangaDetails
        try {
            data = JSON.parse(response.data)
        } catch (e) {
            throw new Error(`${e}`)
        }

        slug = data?.gallery?.slug ?? ''

        return parseMangaDetails(data, mangaId)
    }

    override async getChapters(mangaId: string): Promise<Chapter[]> {
        const request = createRequestObject({
            url: GALLERY_URL,
            method: 'POST',
            data: {
                id: mangaId,
                type: '1'
            }
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
            url: GALLERY_URL,
            method: 'POST',
            data: {
                id: mangaId,
                type: '1'
            }
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)

        let data: MangaDetails
        try {
            data = JSON.parse(response.data)
        } catch (e) {
            throw new Error(`${e}`)
        }

        return parseChapterDetails(data, mangaId, chapterId)
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
            throw new Error('CLOUDFLARE BYPASS ERROR:\nPlease go to Settings > Sources > Pururin and press Cloudflare Bypass or press the Cloud image on the right')
        }
    }

    async getImageStatus(url: string): Promise<number> {
        const request = createRequestObject({
            url: url,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 1)

        return response.status
    }
}
