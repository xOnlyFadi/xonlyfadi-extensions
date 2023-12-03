import {
    Chapter,
    ChapterDetails,
    Tag,
    SourceManga,
    PartialSourceManga,
    TagSection
} from '@paperback/types'

import { decodeHTML } from 'entities'

export const parseMangaDetails = ($: CheerioStatic, mangaId: string): SourceManga => {
    const contentSection = $('.indexcontainer').first()

    const titles: string[] = [decodeHTML($('h1.EnglishName',contentSection).text().trim().replace('(','').replace(')',''))]

    const image = $('img.manga-cover', contentSection).attr('src') ?? ''
    const authors: string[] = []
    for(const obj of $('div.manga-details-author h4', contentSection).toArray()){
        const author = $(obj).text().trim()

        if(!author) continue

        authors.push(author)
    }
    const description: string = decodeHTML($('div.manga-details-extended h4', contentSection).eq(4).text().trim() ?? '')

    const arrayTags: Tag[] = []
    for (const tag of $('div.manga-details-extended a[href*=tag]', contentSection).toArray()) {
        const label = $(tag).text().trim()
        const link = $(tag).attr('href') ?? ''
        const idRegex = link.match(/tag:(.*)\|/)
        let id
        if (idRegex && idRegex[1]) id = idRegex[1]

        if (!id || !label) continue

        arrayTags.push({
            id: `genres.${id}`,
            label
        })
    }

    const tagSections: TagSection[] = [App.createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => App.createTag(x)) })]
    const status = $('div.manga-details-extended h4', contentSection).first().text().trim().toLowerCase()

    return App.createSourceManga({
        id: mangaId,
        mangaInfo: App.createMangaInfo({
            titles: titles,
            image: image,
            status: status,
            author: authors.length !== 0 ? authors.join(', ') : '',
            tags: tagSections,
            desc: description
        })
    })
}

export const parseChapters = ($: CheerioStatic): Chapter[] => {
    const chapters: Chapter[] = []
    const contentSection = $('.indexcontainer').first()
    const LastUpdated = $('div.manga-details-extended h4', contentSection).eq(3).text().trim()

    for (const chapter of $('li', $('ul.new-manga-chapters')).toArray()) {
        const AElement = $('a',chapter)
        const title = AElement.text() ?? ''
        const chapterId = $('a', chapter).attr('href')?.split('?').shift()?.slice(0, -3)?.split('/').pop() ?? ''

        if (!chapterId) continue

        const chapNum = Number(chapterId)


        if (!chapterId || !title) continue

        chapters.push(App.createChapter({
            id: `${chapterId}/0/allpages`,
            name: decodeHTML(title),
            chapNum: isNaN(chapNum) ? 0 : chapNum,
            time: new Date(LastUpdated),
            langCode: '🇸🇦'
        }))
    }
    return chapters
}

export const parseChapterDetails = ($: CheerioStatic, mangaId: string, chapterId: string): ChapterDetails => {
    const pages: string[] = []

    for (const page of $('div#showchaptercontainer img').toArray()) {
        const url = $(page).attr('src')
        if (!url)
            continue
        pages.push(url)
    }

    return App.createChapterDetails({
        id: chapterId,
        mangaId: mangaId,
        pages: pages
    })
}

export const parseTags = ($: CheerioStatic): TagSection[] => {
    const arrayTags: Tag[] = []

    for (const tag of $('#filter .order:contains(أظهار المانجا التي تحتوي على:) a').toArray()) {
        const label = $(tag).text().trim()
        const link = $(tag).attr('href') ?? ''
        const idRegex = link.match(/tag:(.*)\|/)
        let id
        if (idRegex && idRegex[1]) id = idRegex[1]

        if (!id || !label) continue

        arrayTags.push({
            id: `genres.${id}`,
            label
        })
    }

    const OrderBy: Tag[] = []

    for (const tag of $('#mangadirectory .order:contains(ترتيب المانجا على حسب :) a').toArray()) {

        const label = $(tag).text().trim()
        const link = $(tag).attr('href') ?? ''
        const idRegex = link.match(/order:(.*)\|/)
        let id
        if (idRegex && idRegex[1]) id = idRegex[1]

        if (!id || !label) continue

        OrderBy.push({
            id: `order.${id}`,
            label
        })
    }
    OrderBy.push({
        id: 'order.english_name',
        label: 'اسم المانجا'
    })


    const sortByTags: Tag[] = [
        {
            id: 'sort.plus',
            label: 'تصاعدي'
        },
        {
            id: 'sort.minus',
            label: 'تنازلي'
        }
    ]

    return [
        App.createTagSection({ id: 'empty', label: 'العناوين لن تعمل مع الأنواع', tags: [] }),
        App.createTagSection({ id: '0', label: 'أظهار المانجا التي تحتوي على', tags: arrayTags.map(x => App.createTag(x)) }),
        App.createTagSection({ id: '1', label: 'ترتيب المانجا على حسب', tags: OrderBy.map(x => App.createTag(x)) }),
        App.createTagSection({ id: '2', label: 'ترتيب حسب', tags: sortByTags.map(x => App.createTag(x)) })
    ]
}

export const parseSearch = ($: CheerioStatic, url: string): PartialSourceManga[] => {
    const results: PartialSourceManga[] = []

    for (const obj of $('div.mangacontainer').toArray()) {
        const title = $('a.manga', obj).first().text().trim() ?? ''
        const id = $('a.manga', obj).first().attr('href')?.replace(`${url}/`, '')?.split('?').shift()?.replace(/\/+$/, '') ?? ''
        const lazysrc = $('img', obj)?.attr('data-pagespeed-lazy-src') ?? ''
        const image = !lazysrc ? $('img', obj).attr('src') : lazysrc
        const subtitle = $('.details a', obj).last().text().trim()

        if (!id || !title) continue

        results.push(App.createPartialSourceManga({
            image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
            title: decodeHTML(title),
            mangaId: id,
            subtitle: subtitle ? `أخر فصل : ${subtitle}` : ''
        }))
    }

    return results
}

export const NextPage = ($: CheerioSelector): boolean => {
    const nextPage = $('div.pagination a:last-child:not(.active)')

    if (nextPage.contents().length !== 0) {
        return true
    } else {
        return false
    }
}
