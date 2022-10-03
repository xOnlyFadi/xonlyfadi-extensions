/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    Chapter,
    ChapterDetails,
    Tag,
    Manga,
    MangaStatus,
    MangaTile,
    TagSection
} from 'paperback-extensions-common'

import { 
    ChapterDetailsT, 
    GenresDa, 
    MangaDetails, 
    PageList,
    SearchData
} from './ComicKHelper'

import { CMLanguages } from './ComicKHelper'

import { decodeHTML } from 'entities'
import { convert } from 'html-to-text'

export const parseMangaDetails = (data: MangaDetails, mangaId: string): Manga => {
    const comic = data.comic

    const titles: string[] = []
    titles.push(comic.title)
    if (comic.md_titles) {
        for (const altTitles of comic.md_titles){
            titles.push(altTitles.title)
        }
    }
    const image = comic.cover_url

    const author = []
    if (data.authors) {
        for (const authors of data.authors){
            author.push(authors.name)
        }
    }

    const artist = []
    if (data.artists) {
        for (const authors of data.artists){
            artist.push(authors.name)
        }
    }

    const description = convert(decodeHTML(comic.desc),{wordwrap: 130})

    const arrayTags: Tag[] = []

    const countryConvert: {[key:string]: string} = {
        kr: 'Manhwa',
        jp: 'Manga',
        cn: 'Manhua',
    }

    if (comic.country) {
        const id = `type.${comic.country}`
        const label = countryConvert[comic.country]

        if (id && label) {
            arrayTags.push({
                id,
                label
            })
        }
    }

    if (data.genres) {
        for (const tag of data.genres) {
            const label = tag.name
            const id = `genre.${tag.slug}`

            if (!id || !label) continue

            arrayTags.push({ id: id, label: label })
        }
    }
    
    const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })]

    let status = MangaStatus.UNKNOWN
    if (comic.status) {
        switch(comic.status){
            case 1:
                status = MangaStatus.ONGOING
                break
            case 2:
                status = MangaStatus.COMPLETED
                break
        }
    }
    return createManga({
        id: mangaId,
        titles: titles,
        image: image,
        hentai: comic.hentai,
        status: status,
        author: author.join(','),
        artist: artist.join(','),
        tags: tagSections,
        desc: description,
    })
}

export const parseChapters = (data: ChapterDetailsT, mangaId: string, chapSettings: {show_volume: boolean, show_title: boolean}): Chapter[] => {
    const chapters: Chapter[] = []
    for (const chapter of data.chapters) {
        const chapNum = Number(chapter.chap)
        const volume = Number(chapter.vol)

        const groups = []
        if (chapter.group_name) {
            for (const group of chapter.group_name){
                groups.push(group)
            }
        }

        chapters.push(createChapter({
            id: chapter.hid,
            mangaId,
            name: `Chapter ${chapter.chap}${chapSettings.show_title ? chapter.title ? `: ${chapter.title}` : '' : ''}`,
            chapNum: !isNaN(chapNum) ? chapNum : NaN,
            volume: chapSettings.show_volume ? !isNaN(volume) ? volume : undefined : undefined,
            time: new Date(chapter.created_at),
            group: groups.length !== 0 ? groups.join(',') : '',
            // @ts-ignore
            langCode: CMLanguages.getName(chapter.lang)
        }))
    }

    return chapters
}

export const parseChapterDetails = (data: PageList, mangaId: string, chapterId: string): ChapterDetails => {
    const pages: string[] = []

    for (const images of data.chapter.images) {
        pages.push(images.url)
    }

    const chapterDetails = createChapterDetails({
        id: chapterId,
        mangaId: mangaId,
        pages: pages,
        longStrip: true
    })

    return chapterDetails
}

export const parseTags = (data: GenresDa[]): TagSection[] => {
    const arrayTags: Tag[] = []
    
    for (const tag of data) {
        const label = tag.name
        const id = tag.slug

        if (!id || !label) continue

        arrayTags.push({ id: `genre.${id}`, label: label })
    }

    const Sort: Tag[] = [
        {
            label: 'Most follows',
            id: 'sort.follow'
        },
        {
            label: 'Most views',
            id: 'sort.view'
        },
        {
            label: 'High rating',
            id: 'sort.rating'
        },
        {
            label: 'Last updated',
            id: 'sort.uploaded'
        }
    ]

    const Demographic: Tag[] = [
        {
            label: 'Shonen',
            id: 'demographic.1'
        },
        {
            label: 'Shoujo',
            id: 'demographic.2'
        },
        {
            label: 'Seinen',
            id: 'demographic.3'
        },
        {
            label: 'Josei',
            id: 'demographic.4'
        }
    ]

    const Types: Tag[] = [
        {
            label: 'Manga',
            id: 'type.jp'
        },
        {
            label: 'Manhwa',
            id: 'type.kr'
        },
        {
            label: 'Manhua',
            id: 'type.cn'
        }
    ]

    const CreatedAt: Tag[] = [
        {
            label: '30 days',
            id: 'createdat.30'
        },
        {
            label: '3 months',
            id: 'createdat.90'
        },
        {
            label: '6 months',
            id: 'createdat.180'
        },
        {
            label: '1 year',
            id: 'createdat.365'
        },
    ]

    return [
        createTagSection({ id: '0', label: 'NOTE: Ignored if using text search!', tags: [] }),
        createTagSection({ id: '1', label: 'Genres', tags: arrayTags.map(x => createTag(x)) }),
        createTagSection({ id: '2', label: 'Sort', tags: Sort.map(x => createTag(x)) }),
        createTagSection({ id: '3', label: 'Demographic', tags: Demographic.map(x => createTag(x)) }),
        createTagSection({ id: '4', label: 'Type', tags: Types.map(x => createTag(x)) }),
        createTagSection({ id: '5', label: 'Created At', tags: CreatedAt.map(x => createTag(x)) })
    ]
}

export const parseSearch = (data: SearchData[], usesSearch?: boolean): MangaTile[] => {
    const results: MangaTile[] = []

    for (const manga of data) {
        const id = usesSearch ? manga.slug : manga.md_comics.slug
        const title = usesSearch ? manga.title : manga.md_comics.title
        const image = usesSearch ? manga.cover_url : manga.md_comics.cover_url
        const subtitle = usesSearch ? manga.last_chapter : manga.md_comics.last_chapter

        if (!id) continue

        results.push(createMangaTile({
            id,
            image,
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: decodeHTMLEntity(subtitle ? `Chapter ${subtitle}` : '') })
        }))

    }

    return results
}

const decodeHTMLEntity = (str: string): string => {
    return str.replace(/&#(\d+)/g, (_match, dec) => {
        return String.fromCharCode(dec)
    })
}






