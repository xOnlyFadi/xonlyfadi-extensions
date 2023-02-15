
import {
    Chapter,
    ChapterDetails,
    Tag,
    Manga,
    MangaStatus,
    MangaTile,
    TagSection,
    LanguageCode,
    HomeSection,
    HomeSectionType,
} from 'paperback-extensions-common'

const DOMAIN = 'https://mangasect.com'


export const parseMangaDetails = ($: CheerioStatic, mangaId: string): Manga => {
    const title = decodeHTMLEntity($('header h1').text().trim())

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
    const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })]

    const description: string = decodeHTMLEntity($('article #syn-target').text().trim() ?? '')
    
    let status = MangaStatus.ONGOING
    if (rawStatus && rawStatus.includes('completed')) status = MangaStatus.COMPLETED

    return createManga({
        id: mangaId,
        titles: [title],
        image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
        status: status,
        author: author ? author : '',
        tags: tagSections,
        desc: description,
    })
}

export const parseChapters = ($: CheerioStatic, mangaId: string): Chapter[] => {
    const chapters: Chapter[] = []

    for (const chapter of $('article #myUL li')?.toArray()) {
        const AElement = $('a',chapter)
        const title = AElement.text().trim() ?? ''
        const chapterId = AElement.attr('href')?.replace(`${DOMAIN}/manga/`, '')?.split('/').pop() ?? ''
        const time = $('.timeago', chapter)?.attr('datetime') ?? ''
    

        if (!chapterId) continue

        const numRegex = title.match(/Chapter\s+(\d+(?:\.\d+)?)(?::\s+)?\w*/)
        let chapNum
        if (numRegex && numRegex[1]) chapNum = numRegex[1]

        chapters.push(createChapter({
            id: chapterId,
            mangaId,
            name: decodeHTMLEntity(title),
            chapNum: chapNum ? !isNaN(Number(chapNum)) ? Number(chapNum) : 0 : 0,
            time: time ? new Date(Number(time) * 1000) : undefined,
            langCode: LanguageCode.ENGLISH
        }))
    }
    return chapters
}

export const parseChapterDetails = ($: CheerioStatic, mangaId: string, chapterId: string): ChapterDetails => {
    const pages: string[] = []

    for (const page of $('.separator a').toArray()) {
        const url = $(page).attr('href')

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
    const Status: Tag[] = []
    const Sort: Tag[] = []
    const Genres: Tag[] = []

    for (const obj of $('#select-status option')?.toArray()) {
        const id = $(obj).attr('value')
        const label = $(obj).text().trim()

        if (!id) continue
        if(label.toLocaleLowerCase() === 'all') continue
        
        Status.push({
            label,
            id: `status.${id}`
        })
    }

    for (const obj of $('#select-sort option')?.toArray()) {
        const id = $(obj).attr('value')
        const label = $(obj).text().trim()

        if (!id) continue
        if(label.toLocaleLowerCase() === 'default') continue
        
        Sort.push({
            label,
            id: `sort.${id}`
        })
    }


    for (const obj of $('.advanced-genres .advance-item')?.toArray()) {
        const id = $('input', obj).attr('data-genre')
        const label = $('label', obj).text().trim()

        if (!id) continue

        Genres.push({
            label,
            id: `genres.${id}`
        })
    }
    
    return [
        createTagSection({ id: 'status', label: 'Status', tags: Status.map(x => createTag(x)) }),   
        createTagSection({ id: 'sort', label: 'Sort', tags: Sort.map(x => createTag(x)) }),   
        createTagSection({ id: 'genres', label: 'Genres', tags: Genres.map(x => createTag(x)) }),   
    ]
}

export const parseSearch = ($: CheerioStatic): MangaTile[] => {
    const results: MangaTile[] = []

    for (const obj of $('section .r2 .grid >')?.toArray()) {
        const id = $('.text-center a', obj)?.attr('href')?.replace(`${DOMAIN}/manga/`, '') ?? ''
        const title = $('.text-center a', obj)?.text()?.trim() ?? ''
        let image = $('.b-img img', obj)?.attr('data-src') ?? ''
        image = image.startsWith('/') ? DOMAIN + image : image

        if(!id) continue

        results.push(createMangaTile({
            id,
            image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
            title: createIconText({ text: decodeHTMLEntity(title) }),
        }))
    }

    return results
}

export const parseHomeSections = async ($: CheerioStatic, sectionCallback: (section: HomeSection) => void): Promise<void> => {
    const featured_section = createHomeSection({ id: 'featured', title: 'Featured', type: HomeSectionType.featured})
    const recommend_section = createHomeSection({ id: 'recommend', title: 'Recommend', type: HomeSectionType.singleRowNormal})
    const latest_section = createHomeSection({ id: 'latest-updated', title: 'Latest', type: HomeSectionType.singleRowNormal, view_more: true})
    const new_section = createHomeSection({ id: 'new', title: 'New', type: HomeSectionType.singleRowNormal})
    const monthly_section = createHomeSection({ id: 'monthly', title: 'Top Monthly', type: HomeSectionType.singleRowNormal})
    const weekly_section = createHomeSection({ id: 'weekly', title: 'Top Weekly', type: HomeSectionType.singleRowNormal})
    const daily_section = createHomeSection({ id: 'daily', title: 'Top  Daily', type: HomeSectionType.singleRowNormal})
    
    const featured: MangaTile[] = []
    const recommend: MangaTile[] = []
    const latest: MangaTile[] = []
    const newm: MangaTile[] = []
    const monthly: MangaTile[] = []
    const weekly: MangaTile[] = []
    const daily: MangaTile[] = []

    for (const obj of  $('.slides .deslide-item')?.toArray()) {
        const id = $('.desi-head-title a', obj)?.attr('href')?.replace(`${DOMAIN}/manga/`, '') ?? ''
        const title = $('.desi-head-title a', obj)?.text()?.trim() ?? $('.desi-head-title a', obj)?.attr('title')  ?? ''
        const subTitle = $('.desi-sub-text', obj)?.text()?.trim() ?? ''
        let image = $('.deslide-poster img', obj)?.attr('src') ?? ''
        image = image.startsWith('/') ? DOMAIN + image : image

        if(!id) continue

        featured.push(
            createMangaTile({
                id,
                image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
                title: createIconText({ text: title }),
                subtitleText: createIconText({ text: subTitle }),
            })
        )
    }
    featured_section.items = featured
    sectionCallback(featured_section)

    for (const obj of  $('#recommend figure')?.toArray()) {
        const id = $('a.block', obj).first()?.attr('href')?.replace(`${DOMAIN}/manga/`, '') ?? ''
        const title = $('figcaption a', obj)?.text()?.trim() ?? ''
        let image = $('a.block img', obj)?.attr('src') ?? ''
        image = image.startsWith('/') ? DOMAIN + image : image

        if(!id) continue

        recommend.push(
            createMangaTile({
                id,
                image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
                title: createIconText({ text: title }),
            })
        )
    }
    recommend_section.items = recommend
    sectionCallback(recommend_section)
    
    for (const obj of  $('#homeLast .grid >')?.toArray()) {
        const id = $('.text-center a', obj)?.attr('href')?.replace(`${DOMAIN}/manga/`, '') ?? ''
        const title = $('.text-center a', obj)?.text()?.trim() ?? ''
        let image = $('.b-img img', obj)?.attr('data-src') ?? ''
        image = image.startsWith('/') ? DOMAIN + image : image

        if(!id) continue

        latest.push(
            createMangaTile({
                id,
                image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
                title: createIconText({ text: title }),
            })
        )
    }
    latest_section.items = latest
    sectionCallback(latest_section)

    for (const obj of $('#schedule .update-time >')?.toArray()) {
        const id = $('.cover a', obj)?.attr('href')?.replace(`${DOMAIN}/manga/`, '') ?? ''
        const title = $('.data .name a', obj)?.text()?.trim() ?? ''
        let image = $('.cover img', obj)?.attr('src') ?? ''
        image = image.startsWith('/') ? DOMAIN + image : image

        if(!id) continue

        newm.push(
            createMangaTile({
                id,
                image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
                title: createIconText({ text: title }),
            })
        )
    }
    new_section.items = newm
    sectionCallback(new_section)

    for (const obj of $('#series-month article')?.toArray()) {
        const id = $('.item-thumbnail a', obj)?.attr('href')?.replace(`${DOMAIN}/manga/`, '') ?? ''
        const title = $('.post-title a', obj)?.text()?.trim() ?? ''
        let image = $('.item-thumbnail img', obj)?.attr('src') ?? ''
        image = image.startsWith('/') ? DOMAIN + image : image

        if(!id) continue

        monthly.push(
            createMangaTile({
                id,
                image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
                title: createIconText({ text: title }),
            })
        )
    }
    monthly_section.items = monthly
    sectionCallback(monthly_section)

    for (const obj of $('#series-week article')?.toArray()) {
        const id = $('.item-thumbnail a', obj)?.attr('href')?.replace(`${DOMAIN}/manga/`, '') ?? ''
        const title = $('.post-title a', obj)?.text()?.trim() ?? ''
        let image = $('.item-thumbnail img', obj)?.attr('src') ?? ''
        image = image.startsWith('/') ? DOMAIN + image : image

        if(!id) continue

        weekly.push(
            createMangaTile({
                id,
                image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
                title: createIconText({ text: title }),
            })
        )
    }
    weekly_section.items = weekly
    sectionCallback(weekly_section)

    for (const obj of $('#series-day article')?.toArray()) {
        const id = $('.item-thumbnail a', obj)?.attr('href')?.replace(`${DOMAIN}/manga/`, '') ?? ''
        const title = $('.post-title a', obj)?.text()?.trim() ?? ''
        let image = $('.item-thumbnail img', obj)?.attr('src') ?? ''
        image = image.startsWith('/') ? DOMAIN + image : image

        if(!id) continue

        daily.push(
            createMangaTile({
                id,
                image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
                title: createIconText({ text: title }),
            })
        )
    }
    daily_section.items = daily
    sectionCallback(daily_section)
}

const decodeHTMLEntity = (str: string): string => {
    return str.replace(/&#(\d+)/g, (_match, dec) => {
        return String.fromCharCode(dec)
    })
}