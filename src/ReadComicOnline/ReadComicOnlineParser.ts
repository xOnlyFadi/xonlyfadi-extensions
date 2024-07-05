import { Chapter,
    ChapterDetails,
    Tag,
    HomeSection,
    SourceManga,
    PartialSourceManga,
    TagSection,
    HomeSectionType} from '@paperback/types'

import { decodeHTML } from 'entities'

const RCO_DOMAIN = 'https://readcomiconline.li'

export const parseMangaDetails = ($: cheerio.Root, mangaId: string): SourceManga => {
    const contentSection = $('div.barContent').first()

    const titles: string[] = [decodeHTML($('a.bigChar').text().trim())]

    let image: string = $('img', $('.rightBox')).attr('src') ?? 'https://i.imgur.com/GYUxEX8.png'
    image = image.startsWith('/') ? RCO_DOMAIN + image : image

    const author: string = $('a', $('span:contains(Writer)', contentSection).parent()).text().trim() ?? ''
    const artist: string = $('a', $('span:contains(Artist)', contentSection).parent()).text().trim() ?? ''
    const description: string = decodeHTML($('span:contains(Summary)', contentSection).parent().next().text().trim() ?? '')

    let hentai = false
    const arrayTags: Tag[] = []
    for (const tag of $('a', $('span:contains(Genres)', contentSection).parent()).toArray()) {
        const label: string = $(tag).text().trim()
        const id: string = $(tag).attr('href')?.replace(/\/genre\//i, '') ?? ''

        if (!id || !label) continue
        if (['ADULT', 'SMUT', 'MATURE'].includes(label.toUpperCase())) hentai = true
        arrayTags.push({ id: id, label: label })
    }
    const status: string = $('span:contains(Status)', contentSection).parent().text().trim().toLowerCase()

    return App.createSourceManga({
        id: mangaId,
        mangaInfo: App.createMangaInfo({
            titles: titles,
            image: image,
            hentai: hentai,
            status: status,
            author: author,
            artist: artist,
            tags: [App.createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => App.createTag(x)) })],
            desc: description
        })
    })
}

export const parseChapters = ($: cheerio.Root): Chapter[] => {
    const chapters: Chapter[] = []

    for (const chapter of $('tr', $('.listing').first()).toArray()) {
        const title: string = $('a', chapter).first().text().trim() ?? ''
        const chapterId: string = $('a', chapter).attr('href')?.split('/').pop()?.split('?').shift() ?? ''

        if (!chapterId) continue

        const chapNumRegex = chapterId.match(/(\d+\.?\d?)+/)
        let chapNum = 0
        if (chapNumRegex && chapNumRegex[1]) chapNum = Number(chapNumRegex[1])

        const date: Date = new Date($('td', chapter).last().text().trim())

        if (!chapterId || !title) continue

        chapters.push(App.createChapter({
            id: chapterId,
            name: decodeHTML(title),
            langCode: '🇬🇧',
            chapNum: isNaN(chapNum) ? 0 : chapNum,
            time: date
        }))
    }

    return chapters
}

export const parseChapterDetails = (data: string, mangaId: string, chapterId: string): ChapterDetails => {
    const pages: string[] = []
    const imageMatches = data.matchAll(/lstImages\.push\(['"](.*)['"]\)/gi)
    for (const match of imageMatches) {
        if (!match[1]) continue

        let url = match[1].replace(/pw_.g28x/g, 'b').replace(/d2pr.x_27/g, 'h');

        if (url.indexOf("https") != 0) {
            const sliced = url.slice(url.indexOf('?'))
            const containsS0 = url.includes('=s0')
            url = url.slice(0, containsS0 ? url.indexOf('=s0?') : url.indexOf('=s1600?'))
            url = url.slice(6, 24) + url.slice(28)
            url = url.slice(0, -10) + url.slice(-2)
            url = decodeURIComponent(escape(atob(url)))
            url = url.slice(0, 13) + url.slice(17)
            url = url.slice(0, -2) +  (containsS0 ? '=s0' : '=s1600')
            pages.push(`https://2.bp.blogspot.com/${url+sliced}`)
        }
    }

    return App.createChapterDetails({
        id: chapterId,
        mangaId: mangaId,
        pages: pages
    })
}

export interface UpdatedManga {
    ids: string[];
    loadMore: boolean;
}

export const parseHomeSections = ($: cheerio.Root, sectionCallback: (section: HomeSection) => void): void => {
    const latestSection = App.createHomeSection({ id: 'latest_comic', title: 'Latest Updated Comics', containsMoreItems: true, type: HomeSectionType.singleRowNormal })
    const newSection = App.createHomeSection({ id: 'new_comic', title: 'New Comics', containsMoreItems: true, type: HomeSectionType.singleRowNormal })
    const popularSection = App.createHomeSection({ id: 'popular_comic', title: 'Most Popular Comics', containsMoreItems: true, type: HomeSectionType.singleRowNormal })
    const TopDaySection = App.createHomeSection({ id: 'top_day_comic', title: 'Top Day Comics', containsMoreItems: false, type: HomeSectionType.singleRowNormal })
    const TopWeekSection = App.createHomeSection({ id: 'top_week_comic', title: 'Top Week Comics', containsMoreItems: false, type: HomeSectionType.singleRowNormal })
    const TopMonthSection = App.createHomeSection({ id: 'top_month_comic', title: 'Top Month Comics', containsMoreItems: false, type: HomeSectionType.singleRowNormal })

    //Latest Updated Comic
    const latestSection_Array: PartialSourceManga[] = []
    for (const comic of $('a', $('div.items', 'div.bigBarContainer')).toArray()) {
        let image: string = $('img', comic).first().attr('src') ?? ''
        if (image == '') image = $('img', comic).first().attr('srctemp') ?? ''
        image = image.startsWith('/') ? RCO_DOMAIN + image : image

        const title: string = $(comic).contents().not('span').text().trim() ?? ''
        const id: string = $(comic).attr('href')?.replace(/comic\//i, '') ?? ''
        const subtitle: string = $(comic).attr('title') ?? ''

        if (!id || !title) continue
        latestSection_Array.push(App.createPartialSourceManga({
            image: image,
            title: decodeHTML(title),
            mangaId: id,
            subtitle: subtitle
        }))
    }
    latestSection.items = latestSection_Array
    sectionCallback(latestSection)

    //New Comic
    const newSection_Array: PartialSourceManga[] = []
    for (const comic of $('div', 'div#tab-newest').toArray()) {
        let image: string = $('img', comic).first().attr('src') ?? 'https://i.imgur.com/GYUxEX8.png'
        image = image.startsWith('/') ? RCO_DOMAIN + image : image

        const title: string = $('a.title', comic).last().text().trim() ?? ''
        const id: string = $('a', comic).attr('href')?.replace(/comic\//i, '') ?? ''
        const subtitle: string = $('span:contains(Latest)', comic).next().text().trim()

        if (!id || !title) continue

        newSection_Array.push(App.createPartialSourceManga({
            image: image,
            title: decodeHTML(title),
            mangaId: id,
            subtitle: subtitle
        }))
    }
    newSection.items = newSection_Array
    sectionCallback(newSection)

    //Most Popular
    const popularSection_Array: PartialSourceManga[] = []
    for (const comic of $('div', 'div#tab-mostview').toArray()) {
        let image: string = $('img', comic).first().attr('src') ?? 'https://i.imgur.com/GYUxEX8.png'
        image = image.startsWith('/') ? RCO_DOMAIN + image : image

        const title: string = $('a.title', comic).last().text().trim() ?? ''
        const id: string = $('a', comic).attr('href')?.replace(/comic\//i, '') ?? ''
        const subtitle: string = $('span:contains(Latest)', comic).next().text().trim()

        if (!id || !title) continue

        popularSection_Array.push(App.createPartialSourceManga({
            image: image,
            title: decodeHTML(title),
            mangaId: id,
            subtitle: subtitle
        }))
    }
    popularSection.items = popularSection_Array
    sectionCallback(popularSection)

    //Top Day
    const TopDaySection_Array: PartialSourceManga[] = []
    for (const comic of $('div', 'div#tab-top-day').toArray()) {
        let image: string = $('img', comic).first().attr('src') ?? 'https://i.imgur.com/GYUxEX8.png'
        image = image.startsWith('/') ? RCO_DOMAIN + image : image

        const title: string = $('a.title', comic).last().text().trim() ?? ''
        const id: string = $('a', comic).attr('href')?.replace(/comic\//i, '') ?? ''
        const subtitle: string = $('span:contains(Latest)', comic).next().text().trim()

        if (!id || !title) continue

        TopDaySection_Array.push(App.createPartialSourceManga({
            image: image,
            title: decodeHTML(title),
            mangaId: id,
            subtitle: subtitle
        }))
    }
    TopDaySection.items = TopDaySection_Array
    sectionCallback(TopDaySection)

    //Top Week
    const TopWeekSection_Array: PartialSourceManga[] = []
    for (const comic of $('div', 'div#tab-top-week').toArray()) {
        let image: string = $('img', comic).first().attr('src') ?? 'https://i.imgur.com/GYUxEX8.png'
        image = image.startsWith('/') ? RCO_DOMAIN + image : image

        const title: string = $('a.title', comic).last().text().trim() ?? ''
        const id: string = $('a', comic).attr('href')?.replace(/comic\//i, '') ?? ''
        const subtitle: string = $('span:contains(Latest)', comic).next().text().trim()

        if (!id || !title) continue

        TopWeekSection_Array.push(App.createPartialSourceManga({
            image: image,
            title: decodeHTML(title),
            mangaId: id,
            subtitle: subtitle
        }))
    }
    TopWeekSection.items = TopWeekSection_Array
    sectionCallback(TopWeekSection)

    //Top Month
    const TopMonthSection_Array: PartialSourceManga[] = []
    for (const comic of $('div', 'div#tab-top-month').toArray()) {
        let image: string = $('img', comic).first().attr('src') ?? 'https://i.imgur.com/GYUxEX8.png'
        image = image.startsWith('/') ? RCO_DOMAIN + image : image

        const title: string = $('a.title', comic).last().text().trim() ?? ''
        const id: string = $('a', comic).attr('href')?.replace(/comic\//i, '') ?? ''
        const subtitle: string = $('span:contains(Latest)', comic).next().text().trim()

        if (!id || !title) continue

        TopMonthSection_Array.push(App.createPartialSourceManga({
            image: image,
            title: decodeHTML(title),
            mangaId: id,
            subtitle: subtitle
        }))
    }
    TopMonthSection.items = TopMonthSection_Array
    sectionCallback(TopMonthSection)
}

export const parseViewMore = ($: cheerio.Root): PartialSourceManga[] => {
    const comics: PartialSourceManga[] = []
    const collectedIds: string[] = []

    for (const item of $('.list-comic > .item > a:first-child').toArray()) {
        const title: string = $(item).first().text().trim() ?? ''
        const id: string = $(item).attr('href')?.split('/').pop()?.split('?').shift() ?? ''
        let image: string = $('img',item).attr('src') ?? 'https://i.imgur.com/GYUxEX8.png'
        image = image.startsWith('/') ? RCO_DOMAIN + image : image
        const subtitle: string = $('td', item).last().text().trim()
        if (!id || !title) continue

        if (collectedIds.includes(id)) continue
        comics.push(App.createPartialSourceManga({
            image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
            title: decodeHTML(title),
            mangaId: id,
            subtitle: subtitle
        }))
        collectedIds.push(id)
    }

    return comics
}

export const parseTags = ($: cheerio.Root): TagSection[] => {
    const arrayTags: Tag[] = []

    const rightBox = $('#rightside div.barContent').get(1)
    for (const tag of $('a', rightBox).toArray()) {

        const label = $(tag).text().trim()
        const id = $(tag).attr('href')?.replace(/\/genre\//i, '') ?? ''

        if (!id || !label) continue
        arrayTags.push({ id: id, label: label })
    }

    return [App.createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => App.createTag(x)) })]
}

export const parseSearch = ($: cheerio.Root): PartialSourceManga[] => {
    const comics: PartialSourceManga[] = []
    const collectedIds: string[] = []
    //Thanks Aurora!
    const directMatch = $('.barTitle', $('.rightBox')).first().text().trim()
    //Parse direct comic result page
    if (directMatch.toLocaleLowerCase() == 'cover') {
        const title: string = $('a.bigChar').text().trim()
        const id: string = ($('a'), $('.bigChar').attr('href')?.replace(/comic\//i, '')) ?? ''

        let image: string = $('img', $('.rightBox')).attr('src') ?? 'https://i.imgur.com/GYUxEX8.png'
        image = image.startsWith('/') ? RCO_DOMAIN + image : image

        if (!id || !title) throw new Error(`Unable to parse title: ${title} or id: ${id}!`)

        comics.push(App.createPartialSourceManga({
            image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
            title: decodeHTML(title),
            mangaId: id
        }))
    } else {
        //Parse search results page
        for (const item of $('.list-comic > .item > a:first-child').toArray()) {
            const title: string = $(item).first().text().trim() ?? ''
            const id: string = $(item).attr('href')?.split('/').pop()?.split('?').shift() ?? ''
            let image: string = $('img',item).attr('src') ?? 'https://i.imgur.com/GYUxEX8.png'
            image = image.startsWith('/') ? RCO_DOMAIN + image : image
            const subtitle: string = $('td', item).last().text().trim()
            if (!id || !title) continue

            if (collectedIds.includes(id)) continue

            comics.push(App.createPartialSourceManga({
                image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
                title: decodeHTML(title),
                mangaId: id,
                subtitle: subtitle
            }))
            collectedIds.push(id)
        }
    }

    return comics
}

export const isLastPage = ($: cheerio.Root): boolean => {
    const lastPage = $('.pager').text().includes('Next')
    return !lastPage
}
