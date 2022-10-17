
import {
    Chapter,
    ChapterDetails,
    Tag,
    Manga,
    MangaStatus,
    MangaTile,
    TagSection,
    LanguageCode,
} from 'paperback-extensions-common'
import { 
    SearchData 
} from './TsuminoHelper'

import { decodeHTML } from 'entities'

import './TsuminoHelper'

export const parseMangaDetails = ($: CheerioStatic, mangaId: string): Manga => {

    const title = decodeHTML($('meta[property=\'og:title\']')?.first()?.attr('content')?.trim() ?? '')
    const image = $('div.book-page-container img').attr('src') ?? ''

    const artists: string[] = []
    for(const obj of $('#Artist a').toArray()){
        const author = $(obj)?.attr('data-define')?.trim() ?? ''

        if (!author) continue

        artists.push(decodeHTML(author))
    }

    const groups: string[] = []
    for(const obj of $('#Group a').toArray()){
        const group = $(obj)?.attr('data-define')?.trim() ?? ''

        if (!group) continue

        groups.push(decodeHTML(group))
    }

    const arrayTags: Tag[] = []
    for (const tag of $('#Tag a').toArray()) {
        const label = $(tag).attr('data-define')
        const link = $(tag).attr('href') ?? ''
        const idRegex = link.match(/tag=(.*)/i)
        let id
        if (idRegex && idRegex[1]) id = idRegex[1]

        if (!id || !label) continue

        arrayTags.push({ 
            id: `genres.${decodeHTML(id)}`, 
            label 
        })
    }

    const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })]

    return createManga({
        id: mangaId,
        titles: [title],
        image: image,
        status: MangaStatus.COMPLETED,
        artist: artists.length !== 0 ? artists.join(', ') : '',
        author: groups.length !== 0 ? groups.join(', ') : '',
        tags: tagSections
    })
}

export const parseChapters = ($: CheerioStatic, mangaId: string): Chapter[] => {
    const chapters: Chapter[] = []

    const collection = $('.book-collection-table a')
    const date = $('#Uploaded')?.text()?.trim()?.split(' ') ?? ''

    let time: Date | undefined

    if (date && date[0] && date[1] && date[2]) {
        time = new Date(Number(date[0]), Number(months[date[1]]), Number(date[2]))
    }

    if (collection.contents().length !== 0){
        for(const chapter of $('.book-collection-table a').toArray()){
            const id = $(chapter).attr('href')?.split('/').pop() ?? ''
            const chapNum = Number($($('span', chapter)[0]).text() ?? '')
            const name = $($('span', chapter)[1]).text() ?? ''
            
            if (!id) continue

            chapters.push(createChapter({
                id: id,
                mangaId,
                name: decodeHTML(name),
                chapNum: isNaN(chapNum) ? 0 : chapNum,
                langCode: LanguageCode.ENGLISH,
                time
            }))
        }
    } else {
        chapters.push(createChapter({
            id: mangaId, 
            mangaId,
            name: 'Chapter 1', 
            chapNum: 1,
            time,
            langCode: LanguageCode.ENGLISH
        }))
    }

    return chapters
}

export const parseChapterDetails = ($: CheerioStatic, mangaId: string, chapterId: string): ChapterDetails => {
    const pages: string[] = []
    const numPages = $('h1').text()?.split(' ')?.pop()

    for (let i = 0; i < Number(numPages); i++) {
        const url = $('#image-container').attr('data-cdn')?.replace('[PAGE]', `${i + 1}`)

        if (!url) continue

        pages.push(url)
    }

    return createChapterDetails({
        id: chapterId,
        mangaId: mangaId,
        pages: pages,
        longStrip: true
    })
}

export const parseSearch = (data: SearchData): MangaTile[] => {
    const results: MangaTile[] = []

    for (const obj of data.data) {
        const entry = obj.entry ?? ''
        const id = entry.id.toString() ?? ''
        const title = entry.title ?? ''
        const image = entry.thumbnailUrl ?? ''

        if (!id) continue

        results.push(createMangaTile({
            title: createIconText({ text: decodeHTML(title) }),
            id,
            image
        }))
    }

    return results
}

export const months: {[date: string]: number} = {
    'January': 1,
    'February': 2,
    'March': 3,
    'April': 4,
    'May': 5,
    'June': 6,
    'July': 7,
    'August': 8,
    'September': 9,
    'October': 10,
    'November': 11,
    'December': 12,
}