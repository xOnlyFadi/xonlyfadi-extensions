/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import {
    ChapterDetails,
    Tag,
    Manga,
    MangaStatus,
    MangaTile,
    TagSection,
    SearchRequest,
    SearchField,
    Chapter
} from 'paperback-extensions-common'

import { 
    MangaDetails,
    SearchData,
    SearchForm
} from './PururinHelper'

import { decodeHTML } from 'entities'

import '../scopes'

const CDN_URL = 'https://cdn.pururin.to/assets/images/data'

export const parseSearch = (data: SearchData): MangaTile[] => {
    const results: MangaTile[] = []

    for (const obj of data.data) {
        const id = obj?.id ?? ''
        const title = obj?.title ?? ''
        const image = `${CDN_URL}/${id}/cover.jpg`
        if (!id) continue

        results.push(createMangaTile({
            id: `${id}`,
            title: createIconText({ text: decodeHTML(title) }),
            image
        }))
    }

    return results
}

export const parseMangaDetails = (data: MangaDetails, mangaId: string): Manga => {
    const details = data.gallery

    const titles: string[] = []

    if (details?.title) titles.push(details?.title.trim())
    if (details?.j_title) titles.push(details?.j_title.trim())
    if (details?.alt_title) titles.push(details?.alt_title.trim())
    if (details?.full_title) titles.push(details?.full_title.trim())

    const image = `${CDN_URL}/${details.id}/cover.jpg`

    const arrayTags: Tag[] = []
    const tags = details.tags
    const genres = [...tags.Category ?? {},...tags.Convention ?? {}, ...tags?.Parody ?? {}, ...tags.Character ?? {},...tags.Contents ?? {}]

    if (genres.isNotEmpty()) {
        for (const category of genres) {
            const id = category.id ?? ''
            const label = category?.name ?? ''

            if (!id || !label) continue

            arrayTags.push({
                id: `tags.${id}`,
                label
            })
        }
    }

    const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })]

    return createManga({
        id: mangaId,
        titles,
        image: image,
        status: MangaStatus.COMPLETED,
        author: details?.tags?.Circle.isNotEmpty() ? details?.tags?.Circle?.map(x => x.name).join(', ') : '',
        artist: details?.tags?.Artist.isNotEmpty() ? details?.tags?.Artist?.map(x => x.name).join(', ') : '',
        tags: tagSections,
        desc: details?.summary ? details?.summary : '',
        hentai: true
    })
}

export const parseChapters = (data: MangaDetails, mangaId: string): Chapter[] => {
    const details = data.gallery

    return [
        createChapter({
            id: mangaId,
            mangaId,
            chapNum: 1,
            time: undefined,
            group: details?.tags?.Scanlator.isNotEmpty() ? details?.tags?.Scanlator?.map(x => x.name).join(', ') : '',
            // @ts-ignore
            langCode: details?.tags?.Language.isNotEmpty() ? details?.tags?.Language.map(x => x.name)?.[0] : '',
        })
    ]
}

export const parseChapterDetails = (data: MangaDetails, mangaId: string, chapterId: string): ChapterDetails => {
    const pages: string[] = []
    const image_extension = data.gallery.image_extension

    for(let i = 0; i < data.gallery.total_pages; i++){
        pages.push(`intercept:${CDN_URL}/${mangaId}/${i + 1}.${image_extension}`)
    }

    return createChapterDetails({
        id: chapterId,
        mangaId: mangaId,
        pages: pages,
        longStrip: true
    })
}

export const parseMetadata = (query: SearchRequest, metadata: any): SearchForm => {
    const page: number = metadata?.page ?? 1

    const MinRange = query?.parameters?.['min_range'] ? Number(query?.parameters?.['min_range']) : 0
    const MaxRange = query?.parameters?.['max_range'] ? Number(query?.parameters?.['max_range']) : 100

    const Sort: string[] = []
    const TagMode: string[] = []

    if(MinRange >= MaxRange) throw new Error('\'Minimum\' cannot exceed \'Maximum\'')
    if(MaxRange > 1000) throw new Error('\'Maximum\' cannot exceed greater than 1000')

    const data: SearchForm = {
        'search': {
            'PageNumber': page,
            'manga': {
                'sort': '1',
                'string': query.title ?? ''
            },
            'page': {
                'range': [
                    MinRange,
                    MaxRange
                ]
            },
            'sort': 'newest',
            'tag': {
                'items': {
                    'whitelisted': [],
                    'blacklisted': []
                },
                'sort': '1'
            }
        }
    }

    query.includedTags?.map(x =>{
        const id = x.id
        const SplittedID = id?.split('.')?.pop() ?? ''

        if(id.includes('tags.') || id.includes('category.')){
            data?.search?.tag?.items?.whitelisted?.push({id: Number(SplittedID)})
        }

        if(id.includes('sort.')){
            Sort.push(SplittedID)
        }

        if(id.includes('tagmode.')){
            TagMode.push(SplittedID)
        }
    })

    query.excludedTags?.map(x =>{
        const id = x.id
        const SplittedID = id?.split('.')?.pop() ?? ''

        if(id.includes('category.')){
            data?.search?.tag?.items?.blacklisted?.push({id: Number(SplittedID)})
        }
    })

    if(Sort.isNotEmpty()){
        data.search.sort = Sort[0] ?? ''
    }

    if(TagMode.isNotEmpty()){
        data.search.tag.sort = TagMode[0] ?? ''
    }

    return data
}


export const parseTags = (): TagSection[] => {
    const Sort: Tag[] = [
        {
            id: 'sort.newest',
            label: 'Newest'
        },
        {
            id: 'sort.most-popular',
            label: 'Most Popular'
        },
        {
            id: 'sort.highest-rated',
            label: 'Highest Rated'
        },
        {
            id: 'sort.most-viewed',
            label: 'Most Viewed'
        },
        {
            id: 'sort.title',
            label: 'Title'
        }
    ]

    const Category: Tag[] = [
        {
            id: 'category.13003',
            label: 'Doujinshi'
        },
        {
            id: 'category.13004',
            label: 'Manga'
        },
        {
            id: 'category.13006',
            label: 'Artist CG'
        },
        {
            id: 'category.13008',
            label: 'Game CG'
        },
        {
            id: 'category.17783',
            label: 'Artbook'
        },
        {
            id: 'category.27939',
            label: 'Webtoon'
        },
    ]

    const TagMode: Tag[] = [
        {
            id: 'tagmode.1',
            label: 'AND'
        }, 
        {
            id: 'tagmode.2',
            label: 'OR'
        },
    ]

    return [
        createTagSection({ id: 'sort', label: 'Sort by', tags: Sort.map(x => createTag(x)) }),
        createTagSection({ id: 'category', label: 'Categories', tags: Category.map(x => createTag(x)) }),
        createTagSection({ id: 'tagmode', label: 'Tag mode', tags: TagMode.map(x => createTag(x)) })
    ]
}

export const parseSearchFields = (): SearchField[] => {
    return [
        createSearchField({id: 'min_range', name: 'Minimum Pages', placeholder: '1'}),
        createSearchField({id: 'max_range', name: 'Maximum Pages', placeholder: '1000'})
    ]
}