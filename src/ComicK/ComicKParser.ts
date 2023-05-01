
import { 
    Chapter,
    ChapterDetails,
    Tag,
    SourceManga,
    PartialSourceManga,
    TagSection 
} from '@paperback/types'

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

export const parseMangaDetails = (data: MangaDetails, mangaId: string): SourceManga => {
    const comic = data?.comic
    const titles: string[] = [comic?.title]

    if (comic?.md_titles) {
        for (const altTitles of comic?.md_titles) {
            titles.push(altTitles.title)
        }
    }

    const image = comic?.cover_url
    const author = []
    if (data?.authors) {
        for (const authors of data?.authors) {
            author.push(authors?.name)
        }
    }

    const artist = []
    if (data?.artists) {
        for (const authors of data?.artists) {
            artist.push(authors?.name)
        }
    }

    const description = comic?.desc ? convert(decodeHTML(comic?.desc), { wordwrap: 130 }) : ''
    const arrayTags: Tag[] = []

    const countryConvert: { [key: string]: string; } = {
        kr: 'Manhwa',
        jp: 'Manga',
        cn: 'Manhua'
    }

    if (comic?.country) {
        const id = `type.${comic?.country}`
        const label = countryConvert[comic?.country]
        if (id && label) {
            arrayTags.push({
                id,
                label
            })
        }
    }

    if (data?.genres) {
        for (const tag of data?.genres) {
            const label = tag?.name
            const id = `genre.${tag?.slug}`
            if (!id || !label)
                continue
            arrayTags.push({ id: id, label: label })
        }
    }
   
    let status = 'ONGOING'
    if (comic?.status) {
        switch (comic?.status) {
            case 1:
                status = 'ONGOING'
                break
            case 2:
                status = 'COMPLETED'
                break
        }
    }

    return App.createSourceManga({
        id: mangaId,
        mangaInfo: App.createMangaInfo({
            titles: titles,
            image: image,
            hentai: comic?.hentai,
            status: status,
            author: author.join(','),
            artist: artist.join(','),
            tags: [App.createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => App.createTag(x)) })],
            desc: description
        })
    })
}
export const parseChapters = (data: ChapterDetailsT, chapSettings: { show_volume: boolean; show_title: boolean; }): Chapter[] => {
    const chapters: Chapter[] = []

    for (const chapter of data?.chapters) {
        const id = chapter?.hid ?? ''
        const chap = chapter?.chap
        const vol = chapter?.vol

        const chapNum = Number(chap)
        const volume = Number(vol)
        
        const groups = []
        if (chapter?.group_name) {
            for (const group of chapter?.group_name) {
                groups.push(group)
            }
        }
        
        if (!id) continue
        
        chapters.push(App.createChapter({
            id,
            name: `Chapter ${chap}${chapSettings?.show_title ? chapter?.title ? `: ${chapter?.title}` : '' : ''}`,
            chapNum: !isNaN(chapNum) ? chapNum : NaN,
            volume: chapSettings?.show_volume ? !isNaN(volume) ? volume : undefined : undefined,
            time: new Date(chapter?.created_at),
            group: groups?.length !== 0 ? groups?.join(',') : '',
            langCode: CMLanguages?.getEmoji(chapter?.lang)
        }))
    }

    return chapters
}
export const parseChapterDetails = (data: PageList, mangaId: string, chapterId: string): ChapterDetails => {
    const pages: string[] = []
    
    for (const images of data?.chapter?.images) {
        const url = images?.url

        if(!url) continue

        pages.push(url)
    }

    const chapterDetails = App.createChapterDetails({
        id: chapterId,
        mangaId: mangaId,
        pages: pages
    })
    
    return chapterDetails
}

export const parseTags = (data: GenresDa[]): TagSection[] => {
    const arrayTags: Tag[] = []

    for (const tag of data) {
        const label = tag?.name
        const id = tag?.slug
        if (!id || !label)
            continue
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
        App.createTagSection({ id: '0', label: 'NOTE: Ignored if using text search!', tags: [] }),
        App.createTagSection({ id: '1', label: 'Genres', tags: arrayTags.map(x => App.createTag(x)) }),
        App.createTagSection({ id: '2', label: 'Sort', tags: Sort.map(x => App.createTag(x)) }),
        App.createTagSection({ id: '3', label: 'Demographic', tags: Demographic.map(x => App.createTag(x)) }),
        App.createTagSection({ id: '4', label: 'Type', tags: Types.map(x => App.createTag(x)) }),
        App.createTagSection({ id: '5', label: 'Created At', tags: CreatedAt.map(x => App.createTag(x)) })
    ]
}

export const parseSearch = (data: SearchData[]): PartialSourceManga[] => {
    const results: PartialSourceManga[] = []

    for (const manga of data) {
        const id = manga?.hid ?? ''
        const title = manga?.title ?? ''
        const image = manga?.cover_url ?? ''
        const subtitle = manga?.last_chapter ?? ''
        
        if (!id) continue
        
        results.push(App.createPartialSourceManga({
            image,
            title: decodeHTMLEntity(title),
            mangaId: id,
            subtitle: decodeHTMLEntity(subtitle ? `Chapter ${subtitle}` : '')
        }))
    }

    return results
}
const decodeHTMLEntity = (str: string): string => {
    return str.replace(/&#(\d+)/g, (_match, dec) => {
        return String.fromCharCode(dec)
    })
}
