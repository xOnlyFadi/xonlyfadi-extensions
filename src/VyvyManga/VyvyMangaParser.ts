import {
    Chapter,
    ChapterDetails,
    HomeSection,
    HomeSectionType,
    PartialSourceManga,
    SourceManga,
    Tag,
    TagSection
} from '@paperback/types'

import { decodeHTML } from 'entities'
import { CheerioAPI } from 'cheerio'
import { Element } from 'domhandler'

export const parseMangaDetails = (
    $: CheerioAPI,
    mangaId: string
): SourceManga => {
    const titles: string[] = []

    titles.push(decodeHTML($('.col-md-7 .title').text().trim() ?? ''))
    const altTitles = $('.col-md-7 .title + p:not(.text-info)').text().trim().split('/')
    for (const title of altTitles) {
        titles.push(decodeHTML(title))
    }

    const description = decodeHTML(
        $('.summary .content').text().trim() ?? ''
    )

    const authorElement = $('.pre-title:contains(Author)').next('a')
    const author = authorElement.length
        ? authorElement
            .children()
            .map((_: number, e: Element) => {
                return $(e).text().trim()
            })
            .toArray()
            .join(', ')
        : ''

    const artistElement = $('.pre-title:contains(Author)').next('a')
    const artist = artistElement.length
        ? artistElement
            .children()
            .map((_: number, e: Element) => {
                return $(e).text().trim()
            })
            .toArray()
            .join(', ')
        : ''

    const arrayTags: Tag[] = []
    for (const tag of $('.pre-title:contains(Genres)')
        .siblings('a')
        .toArray()) {
        const label = $(tag).text().trim()
        const id = $(tag).attr('href')?.split('/genre/').pop() ?? ''

        if (!id || !label) continue
        arrayTags.push({ id: id, label: label })
    }
    const tagSections: TagSection[] = [
        App.createTagSection({
            id: '0',
            label: 'genres',
            tags: arrayTags.map((x) => App.createTag(x))
        })
    ]

    const status = $('.pre-title:contains(Status) ~ span:not(.space)')
        .text()
        .trim()

    const image = $('.img-manga img').attr('src') ?? ''

    return App.createSourceManga({
        id: mangaId,
        mangaInfo: App.createMangaInfo({
            titles: titles,
            image: image,
            status: status,
            author: author,
            artist: artist,
            tags: tagSections,
            desc: description
        })
    })
}

export const parseChapterList = (
    $: CheerioAPI,
    mangaId: string
): Chapter[] => {
    const chapters: Chapter[] = []
    let sortingIndex = 0

    for (const chapter of $('.list-group > a').toArray()) {
        const title: string = $('span', chapter).text().trim()

        const chapterAttr = chapter.attribs
        const chapterId: string = chapterAttr.id ?? ''

        if (!chapterId) continue

        const chapNumRegex = chapterAttr.id?.match(/(\d+)(?:[-.]\d+)?/)

        let chapNum =
            chapNumRegex && chapNumRegex[1]
                ? Number(chapNumRegex[1].replace('-', '.'))
                : 0
        if (isNaN(chapNum)) chapNum = 0

        const date = parseDate($('p', chapter).text().trim())

        chapters.push({
            id: chapterId,
            name: title,
            langCode: 'ENG',
            chapNum: chapNum,
            time: date,
            sortingIndex,
            volume: 0,
            group: ''
        })
        sortingIndex--
    }

    if (chapters.length == 0) {
        throw new Error(`Couldn't find any chapters for mangaId: ${mangaId}!`)
    }

    return chapters.map((chapter) => {
        chapter.sortingIndex += chapters.length
        return App.createChapter(chapter)
    })
}

export const parseChapterURL = (
    $: CheerioAPI,
    chapterId: string
): string => {
    let chapterUrl = ''

    for (const chapter of $('.list-group > a').toArray()) {
        const chapterAttr = chapter.attribs

        if (chapterAttr.id == chapterId) {
            chapterUrl = chapterAttr.href ?? ''
            break
        }
    }

    if (chapterUrl == '') throw new Error(`Failed to find URL for chapterId: ${chapterId}`)

    return chapterUrl
}

export const parseChapterDetails = (
    $: CheerioAPI,
    mangaId: string,
    chapterId: string
): ChapterDetails => {
    const pages: string[] = []

    for (const img of $('img.d-block').toArray()) {
        const page = $(img).attr('data-src') ?? ''
        if (!page) continue
        pages.push(page)
    }

    const chapterDetails = App.createChapterDetails({
        id: chapterId,
        mangaId: mangaId,
        pages: pages
    })
    return chapterDetails
}

export const parseHomeSections = (
    $: CheerioAPI,
    sectionCallback: (section: HomeSection) => void
): void => {
    const popularSection = App.createHomeSection({
        id: 'most_popular',
        title: 'Most Popular',
        containsMoreItems: true,
        type: HomeSectionType.singleRowLarge
    })

    const latestSection = App.createHomeSection({
        id: 'latest_updates',
        title: 'Latest Updates',
        containsMoreItems: true,
        type: HomeSectionType.singleRowNormal
    })

    const newSection = App.createHomeSection({
        id: 'new_releases',
        title: 'New Releases',
        containsMoreItems: true,
        type: HomeSectionType.singleRowNormal
    })

    // Most Popular
    const popularSection_Array: PartialSourceManga[] = []
    for (const manga of $('.weekly-book .slick-detail > a').toArray()) {
        const image: string = $('.img-manga > img', manga).attr('src') ?? ''
        const title: string = $('.title', manga).text().trim() ?? ''
        const subtitle: string = $('.alternative-title', manga).text().trim() ?? ''

        const id = $(manga).attr('href')?.split('/manga/').pop() ?? ''

        if (!id || !title) continue
        popularSection_Array.push(
            App.createPartialSourceManga({
                image: image,
                title: decodeHTML(title),
                mangaId: id,
                subtitle: decodeHTML(subtitle)
            })
        )
    }
    popularSection.items = popularSection_Array
    sectionCallback(popularSection)

    // Latest Updates
    const latestSection_Array: PartialSourceManga[] = []
    const latestSectionElem = $('.home-title:contains("Latest Update")').closest('.latest-update')
    for (const manga of latestSectionElem.find('.book-list .col-4 > .comic-item').toArray()) {
        const image: string = $('.comic-image > img', manga).attr('data-src') ?? ''
        const title: string = $('.comic-title', manga).text().trim() ?? ''
        const subtitle: string = $('.tray-item', manga).text().trim() ?? ''

        const id = $('a', manga).attr('href')?.split('/manga/').pop() ?? ''

        if (!id || !title) continue
        latestSection_Array.push(
            App.createPartialSourceManga({
                image: image,
                title: decodeHTML(title),
                mangaId: id,
                subtitle: decodeHTML(subtitle)
            })
        )
    }
    latestSection.items = latestSection_Array
    sectionCallback(latestSection)

    // New Releases
    const newSection_Array: PartialSourceManga[] = []
    const newSectionElem = $('.home-title:contains("New Release")').closest('.latest-update')
    for (const manga of newSectionElem.find('.book-list .col-4 > .comic-item').toArray()) {
        const image: string = $('.comic-image > img', manga).attr('data-src') ?? ''
        const title: string = $('.comic-title', manga).text().trim() ?? ''
        const subtitle: string = $('.tray-item', manga).text().trim() ?? ''

        const id = $('a', manga).attr('href')?.split('/manga/').pop() ?? ''

        if (!id || !title) continue
        newSection_Array.push(
            App.createPartialSourceManga({
                image: image,
                title: decodeHTML(title),
                mangaId: id,
                subtitle: decodeHTML(subtitle)
            })
        )
    }
    newSection.items = newSection_Array
    sectionCallback(newSection)
}

export const parseViewMore = ($: CheerioAPI): PartialSourceManga[] => {
    const manga: PartialSourceManga[] = []
    const collectedIds: string[] = []

    for (const obj of $('.book-list .col-4 > .comic-item').toArray()) {
        const image: string = $('.comic-image > img', obj).attr('data-src') ?? ''
        const title: string = $('.comic-title', obj).text().trim() ?? ''
        const subtitle: string = $('.tray-item', obj).text().trim() ?? ''
        const id = $('a', obj).attr('href')?.split('/manga/').pop() ?? ''

        if (!id || !title || collectedIds.includes(id)) continue
        manga.push(
            App.createPartialSourceManga({
                image: image,
                title: decodeHTML(title),
                mangaId: id,
                subtitle: decodeHTML(subtitle)
            })
        )
        collectedIds.push(id)
    }

    return manga
}

export const parseSearch = ($: CheerioAPI): PartialSourceManga[] => {
    const mangas: PartialSourceManga[] = []
    for (const obj of $('.book-list .col-4 > .comic-item').toArray()) {
        const image: string = $('.comic-image', obj).attr('data-background-image') ?? ''
        const title: string = $('.comic-title', obj).text().trim() ?? ''
        const subtitle: string = $('.tray-item', obj).text().trim() ?? ''
        const id = $('a', obj).attr('href')?.split('/manga/').pop() ?? ''

        if (!id || !title) continue

        mangas.push(
            App.createPartialSourceManga({
                image: image,
                title: decodeHTML(title),
                mangaId: id,
                subtitle: subtitle
            })
        )
    }
    return mangas
}

export const parseDate = (date: string): Date => {
    date = date.toUpperCase()
    let time: Date
    const number = Number((/\d*/.exec(date) ?? [])[0])
    if (date.includes('LESS THAN AN HOUR') || date.includes('JUST NOW')) {
        time = new Date(Date.now())
    } else if (date.includes('YEAR') || date.includes('YEARS')) {
        time = new Date(Date.now() - number * 31556952000)
    } else if (date.includes('MONTH') || date.includes('MONTHS')) {
        time = new Date(Date.now() - number * 2592000000)
    } else if (date.includes('WEEK') || date.includes('WEEKS')) {
        time = new Date(Date.now() - number * 604800000)
    } else if (date.includes('YESTERDAY')) {
        time = new Date(Date.now() - 86400000)
    } else if (date.includes('DAY') || date.includes('DAYS')) {
        time = new Date(Date.now() - number * 86400000)
    } else if (date.includes('HOUR') || date.includes('HOURS')) {
        time = new Date(Date.now() - number * 3600000)
    } else if (date.includes('MINUTE') || date.includes('MINUTES')) {
        time = new Date(Date.now() - number * 60000)
    } else if (date.includes('SECOND') || date.includes('SECONDS')) {
        time = new Date(Date.now() - number * 1000)
    } else {
        time = new Date(date)
    }
    return time
}

export const parseTags = ($: CheerioAPI): TagSection[] => {
    const arrayTags: Tag[] = []
    for (const tag of $('.dropdown-genre ul li > a').toArray()) {
        const label = $(tag).text().trim() ?? ''
        const id = $(tag).attr('href')?.split('/genre/').pop() ?? ''

        if (!id || !label) continue
        arrayTags.push({ id: id, label: label })
    }
    const tagSections: TagSection[] = [App.createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => App.createTag(x)) })]
    return tagSections
}

export const isLastPage = ($: CheerioAPI): boolean => {
    let isLast = false

    const lastPageLink = $('ul.pagination li.page-item a.page-link').last().attr('href')
    let lastPage = 1
    if (lastPageLink) {
        const match = lastPageLink.match(/page=(\d+)/)
        if (match && match[1]) {
            lastPage = parseInt(match[1], 10)
        }
    }

    const currentPage = Number($('ul.pagination li.page-item.active').text().trim())

    if (currentPage >= lastPage) {
        isLast = true
    }

    return isLast
}
