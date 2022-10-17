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
    LanguageCode,
    SearchField,
    Tag
} from 'paperback-extensions-common'

import { 
    SearchData, 
    SearchType 
} from './TsuminoHelper'

import {
    parseChapterDetails,
    parseChapters,
    parseMangaDetails,
    parseSearch
} from './TsuminoParser'

import './TsuminoHelper'

const TSUMINO_DOMAIN = 'https://www.tsumino.com'

export const TsuminoInfo: SourceInfo = {
    version: '1.0.1',
    name: 'Tsumino',
    icon: 'icon.png',
    author: 'xOnlyFadi',
    authorWebsite: 'https://github.com/xOnlyFadi',
    description: 'Extension that pulls comics from tsumino.com.',
    contentRating: ContentRating.ADULT,
    websiteBaseURL: TSUMINO_DOMAIN,
    language: LanguageCode.ENGLISH,
}


export class Tsumino extends Source {

    requestManager = createRequestManager({
        requestsPerSecond: 2,
        requestTimeout: 15000,
        interceptor: {
            interceptRequest: async (request: Request): Promise<Request> => {

                request.headers = {
                    ...(request.headers ?? {}),
                    ...{
                        'referer': `${TSUMINO_DOMAIN}/`
                    }
                }

                return request
            },

            interceptResponse: async (response: Response): Promise<Response> => {
                return response
            }
        }
    })

    override getMangaShareUrl(mangaId: string): string { return `${TSUMINO_DOMAIN}/entry/${mangaId}` }

    override async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const sections = [
            {
                request: createRequestObject({
                    url: encodeURI(`${TSUMINO_DOMAIN}/Search/Operate/?PageNumber=1&Sort=Popularity`),
                    method: 'GET',
                }),
                section: createHomeSection({
                    id: 'Popularity',
                    title: 'Popularity',
                    view_more: true,
                }),
            },
            {
                request: createRequestObject({
                    url: encodeURI(`${TSUMINO_DOMAIN}/Search/Operate/?PageNumber=1&Sort=Newest`),
                    method: 'GET',
                }),
                section: createHomeSection({
                    id: 'Newest',
                    title: 'Newest',
                    view_more: true,
                }),
            },
            {
                request: createRequestObject({
                    url: encodeURI(`${TSUMINO_DOMAIN}/Search/Operate/?PageNumber=1&Sort=Oldest`),
                    method: 'GET',
                }),
                section: createHomeSection({
                    id: 'Oldest',
                    title: 'Oldest',
                    view_more: true,
                }),
            },
            {
                request: createRequestObject({
                    url: encodeURI(`${TSUMINO_DOMAIN}/Search/Operate/?PageNumber=1&Sort=Views`),
                    method: 'GET',
                }),
                section: createHomeSection({
                    id: 'Views',
                    title: 'Views',
                    view_more: true,
                }),
            },
            {
                request: createRequestObject({
                    url: encodeURI(`${TSUMINO_DOMAIN}/Search/Operate/?PageNumber=1&Sort=Random`),
                    method: 'GET',
                }),
                section: createHomeSection({
                    id: 'Random',
                    title: 'Random',
                    view_more: true,
                }),
            },
            {
                request: createRequestObject({
                    url: encodeURI(`${TSUMINO_DOMAIN}/Search/Operate/?PageNumber=1&Sort=Alphabetical`),
                    method: 'GET',
                }),
                section: createHomeSection({
                    id: 'Alphabetical',
                    title: 'Alphabetical',
                    view_more: true,
                }),
            },
            {
                request: createRequestObject({
                    url: encodeURI(`${TSUMINO_DOMAIN}/Search/Operate/?PageNumber=1&Sort=Rating`),
                    method: 'GET',
                }),
                section: createHomeSection({
                    id: 'Rating',
                    title: 'Rating',
                    view_more: true,
                }),
            },
            {
                request: createRequestObject({
                    url: encodeURI(`${TSUMINO_DOMAIN}/Search/Operate/?PageNumber=1&Sort=Pages`),
                    method: 'GET',
                }),
                section: createHomeSection({
                    id: 'Pages',
                    title: 'Pages',
                    view_more: true,
                }),
            },
            {
                request: createRequestObject({
                    url: encodeURI(`${TSUMINO_DOMAIN}/Search/Operate/?PageNumber=1&Sort=Comments`),
                    method: 'GET',
                }),
                section: createHomeSection({
                    id: 'Comments',
                    title: 'Comments',
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
            url: encodeURI(`${TSUMINO_DOMAIN}/Search/Operate/?PageNumber=${page}&Sort=${homepageSectionId}`),
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

        metadata = data.pageNumber < data.pageCount ? { page: page + 1 } : undefined

        return createPagedResults({
            results: manga,
            metadata
        })
    }

    override async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1

        const SearchArray: SearchType[] = []

        const Sort: string[] = []
        const Length: string[] = []
        const Rating: string[] = []
        const ExcludeParo: string[] = []

        query.includedTags?.map((x: Tag) =>{
            const id = x.id ?? ''
            const SplittedID = id?.split('.').pop() ?? ''
            
            if (id.includes('sort.')) {
                Sort.push(SplittedID)
            }

            if (id.includes('length.')) {
                Length.push(SplittedID)
            }

            if (id.includes('rating.')) {
                Rating.push(SplittedID)
            }

            if (id.includes('excludeparo.')) {
                ExcludeParo.push(SplittedID)
            }

            if (id.includes('genres.')) {
                SearchArray.push({
                    type: '1',
                    text: SplittedID,
                    exclude: 'false'
                })
            }
        })

        const Tags = query.parameters['Tags'] ?? ''
        const Categories = query.parameters['Categories'] ?? ''
        const Collections = query.parameters['Collections'] ?? ''
        const Groups = query.parameters['Groups'] ?? ''
        const Artists = query.parameters['Artists'] ?? ''
        const Parodies = query.parameters['Parodies'] ?? ''
        const Characters = query.parameters['Characters'] ?? ''
        const Uploaders = query.parameters['Uploaders'] ?? ''

        if (Tags) {
            for(const splitted of Tags.toString().split(',')) {
                SearchArray.push({
                    type: '1',
                    text: splitted.removePrefix('-').replaceAll(' ', '+'),
                    exclude: `${splitted.startsWith('-')}`
                })
            }
        }

        if (Categories) {
            for(const splitted of Categories.toString().split(',')) {
                SearchArray.push({
                    type: '2',
                    text: splitted.removePrefix('-').replaceAll(' ', '+'),
                    exclude: `${splitted.startsWith('-')}`
                })
            }
        }

        if (Collections) {
            for(const splitted of Collections.toString().split(',')) {
                SearchArray.push({
                    type: '3',
                    text: splitted.removePrefix('-').replaceAll(' ', '+'),
                    exclude: `${splitted.startsWith('-')}`
                })
            }
        }

        if (Groups) {
            for(const splitted of Groups.toString().split(',')) {
                SearchArray.push({
                    type: '4',
                    text: splitted.removePrefix('-').replaceAll(' ', '+'),
                    exclude: `${splitted.startsWith('-')}`
                })
            }
        }

        if (Artists) {
            for(const splitted of Artists.toString().split(',')) {
                SearchArray.push({
                    type: '5',
                    text: splitted.removePrefix('-').replaceAll(' ', '+'),
                    exclude: `${splitted.startsWith('-')}`
                })
            }
        }

        if (Parodies) {
            for(const splitted of Parodies.toString().split(',')) {
                SearchArray.push({
                    type: '6',
                    text: splitted.removePrefix('-').replaceAll(' ', '+'),
                    exclude: `${splitted.startsWith('-')}`
                })
            }
        }

        if (Characters) {
            for(const splitted of Characters.toString().split(',')) {
                SearchArray.push({
                    type: '7',
                    text: splitted.removePrefix('-').replaceAll(' ', '+'),
                    exclude: `${splitted.startsWith('-')}`
                })
            }
        }

        if (Uploaders) {
            for(const splitted of Uploaders.toString().split(',')) {
                SearchArray.push({
                    type: '8',
                    text: splitted.removePrefix('-').replaceAll(' ', '+'),
                    exclude: `${splitted.startsWith('-')}`
                })
            }
        }

        const Formdata: LooseObject = {
            'PageNumber': page.toString(),
            'Text': query.title ?? '',
            'Sort': Sort.length > 0 ? Sort[0] :'Newest',
            'List': '0',
            'Length': Length.length > 0 ? Length[0] :'0',
            'MinimumRating': Rating.length > 0 ? Rating[0] :'0',
        }

        SearchArray.map((x: SearchType, i: number) => {
            Formdata[`Tags[${i}][Type]`] = x.type
            Formdata[`Tags[${i}][Text]`] = x.text
            Formdata[`Tags[${i}][Exclude]`] = x.exclude
        })

        if (ExcludeParo.length > 0) {
            Formdata['Exclude[]'] = '6'
        }

        const request = createRequestObject({
            url: `${TSUMINO_DOMAIN}/Search/Operate/`,
            method: 'POST',
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
            },
            data: Formdata
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

        metadata = data.pageNumber < data.pageCount ? { page: page + 1 } : undefined

        return createPagedResults({
            results: manga,
            metadata
        })
    }

    override async getMangaDetails(mangaId: string): Promise<Manga> {
        const request = createRequestObject({
            url: `${TSUMINO_DOMAIN}/entry/${mangaId}`,
            method: 'GET',
        })
        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)

        return parseMangaDetails($, mangaId)
    }

    override async getChapters(mangaId: string): Promise<Chapter[]> {
        const request = createRequestObject({
            url: `${TSUMINO_DOMAIN}/entry/${mangaId}`,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)

        return parseChapters($, mangaId)
    }

    override async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const request = createRequestObject({
            url: `${TSUMINO_DOMAIN}/Read/Index/${chapterId}`,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 1)
        this.CloudFlareError(response.status)
        const $ = this.cheerio.load(response.data)

        return parseChapterDetails($, mangaId, chapterId)
    }
    
    CloudFlareError(status: number): void {
        if (status == 503) {
            throw new Error('CLOUDFLARE BYPASS ERROR:\nPlease go to Settings > Sources > Tsumino and press Cloudflare Bypass or press the Cloud image on the right')
        }
    }

    override async getTags(): Promise<TagSection[]> {

        const sortByTags: Tag[] = [
            {
                id: 'sort.Popularity',
                label: 'Popularity'
            },
            {
                id: 'sort.Newest',
                label: 'Newest'
            },
            {
                id: 'sort.Oldest',
                label: 'Oldest'
            },
            {
                id: 'sort.Alphabetical',
                label: 'Alphabetical'
            },
            {
                id: 'sort.Rating',
                label: 'Rating'
            },
            {
                id: 'sort.Pages',
                label: 'Pages'
            },
            {
                id: 'sort.Views',
                label: 'Views'
            },
            {
                id: 'sort.Random',
                label: 'Random'
            },
            {
                id: 'sort.Comments',
                label: 'Comments'
            },
        ]

        const Length: Tag[] = [
            {
                id: 'length.0',
                label: 'Any'
            },
            {
                id: 'length.1',
                label: 'Short'
            },
            {
                id: 'length.2',
                label: 'Medium'
            },
            {
                id: 'length.3',
                label: 'Long'
            }
        ]

        const MinimumRating: Tag[] = [
            {
                id: 'rating.0',
                label: '0 Stars'
            },
            {
                id: 'rating.1',
                label: '1 Stars'
            },
            {
                id: 'rating.2',
                label: '2 Stars'
            },
            {
                id: 'rating.3',
                label: '3 Stars'
            },
            {
                id: 'rating.4',
                label: '4 Stars'
            },
            {
                id: 'rating.5',
                label: '5 Stars'
            }
        ]

        const ExcludeParodies: Tag[] = [
            {
                id: 'excludeparo.6',
                label: 'Yes'
            }
        ]

        return [
            createTagSection({ id: 'sort', label: 'Sort by', tags: sortByTags.map(x => createTag(x)) }),
            createTagSection({ id: 'Length', label: 'Length', tags: Length.map(x => createTag(x)) }),
            createTagSection({ id: 'Rating', label: 'Minimum rating', tags: MinimumRating.map(x => createTag(x)) }),
            createTagSection({ id: 'ExcludeParo', label: 'Exclude parodies', tags: ExcludeParodies.map(x => createTag(x)) })
        ]
    }

    override async getSearchFields(): Promise<SearchField[]> {
        return [
            createSearchField({ id: 'empty', name: 'Separate tags with commas (,)', placeholder: '' }),
            createSearchField({ id: 'empty2', name: 'Prepend with dash (-) to exclude', placeholder: ''}),
            createSearchField({id: 'Tags', name: 'Tags', placeholder: ''}),
            createSearchField({id: 'Categories', name: 'Categories', placeholder: ''}),
            createSearchField({id: 'Collections', name: 'Collections', placeholder: ''}),
            createSearchField({id: 'Groups', name: 'Groups', placeholder: ''}),
            createSearchField({id: 'Artists', name: 'Artists', placeholder: ''}),
            createSearchField({id: 'Parodies', name: 'Parodies', placeholder: ''}),
            createSearchField({id: 'Characters', name: 'Characters', placeholder: ''}),
            createSearchField({id: 'Uploaders', name: 'Uploaders', placeholder: ''}),
        ]
    }



    override async supportsSearchOperators(): Promise<boolean> {
        return true
    }
}

interface LooseObject {
    [key: string]: any
}