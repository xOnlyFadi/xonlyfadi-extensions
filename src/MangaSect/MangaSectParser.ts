import {
    Chapter,
    ChapterDetails,
    Tag,
    SourceManga,
    PartialSourceManga,
    TagSection,
    HomeSection,
    HomeSectionType
} from '@paperback/types'

import { decodeHTML } from 'entities'

const DOMAIN = 'https://mangasect.com'

export const parseMangaDetails = ($: cheerio.Root, mangaId: string): SourceManga => {
    const title = decodeHTML($('header h1').text().trim())

    let image = $('.a1 figure img')?.attr('src') ?? ''
    image = image.startsWith('/') ? DOMAIN + image : image

    let author
    let rawStatus

    for(const obj of $('.y6x11p').toArray()){
        const type = $(obj).text().trim().replace(/\s+/g, ' ')
        const text = $('span', obj).text().trim()

        if (type.toLowerCase().includes('authors')) {
            if(text.toLowerCase() === 'updating') continue
            author = text.trim()
        }

        if (type.toLowerCase().includes('status')) {
            rawStatus = text.trim().toLocaleLowerCase()
        }
    }

    const arrayTags: Tag[] = []
    for (const tag of $('article .mt-15 a').toArray()) {
        const label = $(tag).text().trim()
        const id = $(tag).attr('href')?.split('/').pop() ?? ''

        if (!id) continue

        arrayTags.push({
            id: `mgenres.${id}`,
            label
        })
    }

    const description: string = decodeHTML($('article #syn-target').text().trim() ?? '')

    return App.createSourceManga({
        id: mangaId,
        mangaInfo: App.createMangaInfo({
            titles: [title],
            image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
            status: rawStatus ?? '',
            author: author ? author : '',
            tags: [App.createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => App.createTag(x)) })],
            desc: description
        })
    })
}

export const parseChapters = ($: cheerio.Root): Chapter[] => {
    const chapters: Chapter[] = []

    for (const chapter of $('article #myUL li').toArray()) {
        const AElement = $('a',chapter)
        const title = AElement.text().trim() ?? ''
        const chapterId = AElement.attr('href')?.replace(`${DOMAIN}/manga/`, '')?.split('/').pop() ?? ''
        const time = $('.timeago', chapter)?.attr('datetime') ?? ''


        if (!chapterId) continue

        const numRegex = title.match(/Chapter\s+(\d+(?:\.\d+)?)(?::\s+)?\w*/)
        let chapNum
        if (numRegex && numRegex[1]) chapNum = numRegex[1]

        chapters.push(App.createChapter({
            id: chapterId,
            name: decodeHTML(title),
            chapNum: chapNum ? !isNaN(Number(chapNum)) ? Number(chapNum) : 0 : 0,
            time: time ? new Date(Number(time) * 1000) : undefined,
            langCode: '🇬🇧'
        }))
    }

    return chapters
}

export const parseChapterDetails = ($: cheerio.Root, mangaId: string, chapterId: string): ChapterDetails => {
    const pages: string[] = []

    for (const page of $('.separator a').toArray()) {
        const url = $(page).attr('href')

        if(!url) continue

        pages.push(url)
    }

    return App.createChapterDetails({
        id: chapterId,
        mangaId: mangaId,
        pages: pages
    })
}

export const parseTags = ($: cheerio.Root): TagSection[] => {
    const Status: Tag[] = []
    const Sort: Tag[] = []
    const Genres: Tag[] = []

    for (const obj of $('#select-status option').toArray()) {
        const id = $(obj).attr('value')
        const label = $(obj).text().trim()

        if (!id) continue
        if(label.toLocaleLowerCase() === 'all') continue

        Status.push({
            label,
            id: `status.${id}`
        })
    }

    for (const obj of $('#select-sort option').toArray()) {
        const id = $(obj).attr('value')
        const label = $(obj).text().trim()

        if (!id) continue
        if(label.toLocaleLowerCase() === 'default') continue

        Sort.push({
            label,
            id: `sort.${id}`
        })
    }


    for (const obj of $('.advanced-genres .advance-item').toArray()) {
        const id = $('input', obj).attr('data-genre')
        const label = $('label', obj).text().trim()

        if (!id) continue

        Genres.push({
            label,
            id: `genres.${id}`
        })
    }

    return [
        App.createTagSection({ id: 'status', label: 'Status', tags: Status.map(x => App.createTag(x)) }),
        App.createTagSection({ id: 'sort', label: 'Sort', tags: Sort.map(x => App.createTag(x)) }),
        App.createTagSection({ id: 'genres', label: 'Genres', tags: Genres.map(x => App.createTag(x)) })
    ]
}

export const parseSearch = ($: cheerio.Root): PartialSourceManga[] => {
    const results: PartialSourceManga[] = []

    for (const obj of $('section .r2 .grid >').toArray()) {
        const id = $('.text-center a', obj)?.attr('href')?.replace(`${DOMAIN}/manga/`, '') ?? ''
        const title = $('.text-center a', obj)?.text()?.trim() ?? ''
        let image = $('.b-img img', obj)?.attr('data-src') ?? ''
        image = image.startsWith('/') ? DOMAIN + image : image

        if (!id) continue

        results.push(App.createPartialSourceManga({
            image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
            title: decodeHTML(title),
            mangaId: id
        }))
    }

    return results
}

export const parseHomeSections = async ($: cheerio.Root, sectionCallback: (section: HomeSection) => void): Promise<void> => {
    const featured_section = App.createHomeSection({ id: 'featured', title: 'Featured', type: HomeSectionType.featured, containsMoreItems: false})
    const recommend_section = App.createHomeSection({ id: 'recommend', title: 'Recommend', type: HomeSectionType.singleRowNormal, containsMoreItems: false})
    const latest_section = App.createHomeSection({ id: 'latest-updated', title: 'Latest', type: HomeSectionType.singleRowNormal, containsMoreItems: true})
    const new_section = App.createHomeSection({ id: 'new', title: 'New', type: HomeSectionType.singleRowNormal, containsMoreItems: false})
    const monthly_section = App.createHomeSection({ id: 'monthly', title: 'Top Monthly', type: HomeSectionType.singleRowNormal, containsMoreItems: false})
    const weekly_section = App.createHomeSection({ id: 'weekly', title: 'Top Weekly', type: HomeSectionType.singleRowNormal, containsMoreItems: false})
    const daily_section = App.createHomeSection({ id: 'daily', title: 'Top  Daily', type: HomeSectionType.singleRowNormal, containsMoreItems: false})

    const featured: PartialSourceManga[] = []
    const recommend: PartialSourceManga[] = []
    const latest: PartialSourceManga[] = []
    const newm: PartialSourceManga[] = []
    const monthly: PartialSourceManga[] = []
    const weekly: PartialSourceManga[] = []
    const daily: PartialSourceManga[] = []

    for (const obj of  $('.slides .deslide-item').toArray()) {
        const id = $('.desi-head-title a', obj)?.attr('href')?.replace(`${DOMAIN}/manga/`, '') ?? ''
        const title = $('.desi-head-title a', obj)?.text()?.trim() ?? $('.desi-head-title a', obj)?.attr('title')  ?? ''
        const subTitle = $('.desi-sub-text', obj)?.text()?.trim() ?? ''
        let image = $('.deslide-poster img', obj)?.attr('src') ?? ''
        image = image.startsWith('/') ? DOMAIN + image : image

        if (!id) continue

        featured.push(App.createPartialSourceManga({
            image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
            title: title,
            mangaId: id,
            subtitle: subTitle
        }))
    }
    featured_section.items = featured
    sectionCallback(featured_section)

    for (const obj of  $('#recommend figure').toArray()) {
        const id = $('a.block', obj).first()?.attr('href')?.replace(`${DOMAIN}/manga/`, '') ?? ''
        const title = $('figcaption a', obj)?.text()?.trim() ?? ''
        let image = $('a.block img', obj)?.attr('src') ?? ''
        image = image.startsWith('/') ? DOMAIN + image : image

        if (!id) continue

        recommend.push(App.createPartialSourceManga({
            image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
            title: title,
            mangaId: id
        }))
    }
    recommend_section.items = recommend
    sectionCallback(recommend_section)

    for (const obj of  $('#homeLast .grid >').toArray()) {
        const id = $('.text-center a', obj)?.attr('href')?.replace(`${DOMAIN}/manga/`, '') ?? ''
        const title = $('.text-center a', obj)?.text()?.trim() ?? ''
        let image = $('.b-img img', obj)?.attr('data-src') ?? ''
        image = image.startsWith('/') ? DOMAIN + image : image

        if (!id) continue

        latest.push(App.createPartialSourceManga({
            image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
            title: title,
            mangaId: id
        }))
    }

    latest_section.items = latest
    sectionCallback(latest_section)
    for (const obj of $('#schedule .update-time >').toArray()) {
        const id = $('.cover a', obj)?.attr('href')?.replace(`${DOMAIN}/manga/`, '') ?? ''
        const title = $('.data .name a', obj)?.text()?.trim() ?? ''
        let image = $('.cover img', obj)?.attr('src') ?? ''
        image = image.startsWith('/') ? DOMAIN + image : image

        if (!id) continue

        newm.push(App.createPartialSourceManga({
            image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
            title: title,
            mangaId: id
        }))
    }
    new_section.items = newm
    sectionCallback(new_section)

    for (const obj of $('#series-month article').toArray()) {
        const id = $('.item-thumbnail a', obj)?.attr('href')?.replace(`${DOMAIN}/manga/`, '') ?? ''
        const title = $('.post-title a', obj)?.text()?.trim() ?? ''
        let image = $('.item-thumbnail img', obj)?.attr('src') ?? ''
        image = image.startsWith('/') ? DOMAIN + image : image

        if (!id) continue

        monthly.push(App.createPartialSourceManga({
            image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
            title: title,
            mangaId: id
        }))
    }
    monthly_section.items = monthly
    sectionCallback(monthly_section)

    for (const obj of $('#series-week article').toArray()) {
        const id = $('.item-thumbnail a', obj)?.attr('href')?.replace(`${DOMAIN}/manga/`, '') ?? ''
        const title = $('.post-title a', obj)?.text()?.trim() ?? ''
        let image = $('.item-thumbnail img', obj)?.attr('src') ?? ''
        image = image.startsWith('/') ? DOMAIN + image : image

        if (!id) continue

        weekly.push(App.createPartialSourceManga({
            image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
            title: title,
            mangaId: id
        }))
    }
    weekly_section.items = weekly
    sectionCallback(weekly_section)


    for (const obj of $('#series-day article').toArray()) {
        const id = $('.item-thumbnail a', obj)?.attr('href')?.replace(`${DOMAIN}/manga/`, '') ?? ''
        const title = $('.post-title a', obj)?.text()?.trim() ?? ''
        let image = $('.item-thumbnail img', obj)?.attr('src') ?? ''
        image = image.startsWith('/') ? DOMAIN + image : image

        if (!id) continue

        daily.push(App.createPartialSourceManga({
            image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
            title: title,
            mangaId: id
        }))
    }
    daily_section.items = daily
    sectionCallback(daily_section)
}
