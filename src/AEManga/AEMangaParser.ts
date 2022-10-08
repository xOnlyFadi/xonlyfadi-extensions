
import {
    Chapter,
    ChapterDetails,
    Tag,
    Manga,
    MangaStatus,
    MangaTile,
    TagSection,
} from 'paperback-extensions-common'

export const parseMangaDetails = ($: CheerioStatic, mangaId: string): Manga => {
    const contentSection = $('.indexcontainer').first()

    const titles: string[] = []
    titles.push(decodeHTMLEntity($('h1.EnglishName',contentSection).text().trim().replace('(','').replace(')','')))

    const image = $('img.manga-cover', contentSection).attr('src') ?? ''
    const authors: string[] = []
    for(const obj of $('div.manga-details-author h4', contentSection).toArray()){
        const author = $(obj).text().trim()

        if(!author) continue

        authors.push(author)
    }
    const description: string = decodeHTMLEntity($('div.manga-details-extended h4', contentSection).eq(4).text().trim() ?? '')

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
    const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })]

    const rawStatus = $('div.manga-details-extended h4', contentSection).first().text().trim().toLowerCase()
    let status = MangaStatus.ONGOING
    if (rawStatus.includes('مكتملة')) status = MangaStatus.COMPLETED

    return createManga({
        id: mangaId,
        titles: titles,
        image: image,
        status: status,
        author: authors.length !== 0 ? authors.join(', ') : '',
        tags: tagSections,
        desc: description,
    })
}

export const parseChapters = ($: CheerioStatic, mangaId: string): Chapter[] => {
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

        chapters.push(createChapter({
            id: `${chapterId}/0/allpages`,
            mangaId,
            name: decodeHTMLEntity(title),
            chapNum: isNaN(chapNum) ? 0 : chapNum,
            time: new Date(LastUpdated),
            //@ts-ignore
            langCode: 'العربية'
        }))
    }
    return chapters
}

export const parseChapterDetails = ($: CheerioStatic, mangaId: string, chapterId: string): ChapterDetails => {
    const pages: string[] = []

    for (const page of $('div#showchaptercontainer img').toArray()) {
        const url = $(page).attr('src')

        if(!url) continue

        pages.push(url)
    }

    return createChapterDetails({
        id: chapterId,
        mangaId: mangaId,
        pages: pages,
        longStrip: true
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
        createTagSection({ id: 'empty', label: 'العناوين لن تعمل مع الأنواع', tags: [] }),
        createTagSection({ id: '0', label: 'أظهار المانجا التي تحتوي على', tags: arrayTags.map(x => createTag(x)) }),
        createTagSection({ id: '1', label: 'ترتيب المانجا على حسب', tags: OrderBy.map(x => createTag(x)) }),
        createTagSection({ id: '2', label: 'ترتيب حسب', tags: sortByTags.map(x => createTag(x)) })
    ]
}

export const parseSearch = ($: CheerioStatic, source: any): MangaTile[] => {
    const results: MangaTile[] = []

    for (const obj of $('div.mangacontainer').toArray()) {
        const title = $('a.manga',obj).first().text().trim() ?? ''
        const id = $('a.manga', obj).first().attr('href')?.replace(`${source.baseUrl}/`,'')?.split('?').shift()?.replace(/\/+$/, '') ?? ''
        const lazysrc = $('img', obj)?.attr('data-pagespeed-lazy-src') ?? ''
        const image = !lazysrc ? $('img', obj).attr('src') : lazysrc
        const subtitle = $('.details a', obj).last().text().trim()

        if (!id || !title) continue

        results.push(createMangaTile({
            id,
            image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: subtitle ? `أخر فصل : ${subtitle}` : '' }),
        }))
    }

    return results
}

export const getUpdatedManga = ($: CheerioStatic, time: Date, ids: string[], source: any): string[] => {
    const mangaToUpdate: string[] = []


    for (const obj of $('div.mangacontainer').toArray()) {
        const id = $('a.manga', obj).first().attr('href')?.replace(`${source.baseUrl}/`,'')?.split('?').shift()?.replace(/\/+$/, '') ?? ''
        const ChapDate = new Date($('.details small', obj).text().trim() ?? '')

        if(!id) continue

        if(ChapDate <= time){
            if(ids.includes(id)){
                mangaToUpdate.push(id)
            }
        }

    }
    
    return mangaToUpdate
}

const decodeHTMLEntity = (str: string): string => {
    return str.replace(/&#(\d+)/g, (_match, dec) => {
        return String.fromCharCode(dec)
    })
}

export const NextPage = ($: CheerioSelector): boolean => {
    const nextPage = $('div.pagination a:last-child:not(.active)')
    if (nextPage.contents().length !== 0) {
        return true
    } else {
        return false
    }
}