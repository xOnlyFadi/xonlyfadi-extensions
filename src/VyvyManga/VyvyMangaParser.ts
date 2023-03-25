/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {Chapter,     
    ChapterDetails,
    HomeSection,
    LanguageCode, 
    Manga, 
    MangaStatus, 
    MangaTile, 
    Tag,
    TagSection} from 'paperback-extensions-common'

export class Parser {
    private readonly chapterTitleRegex = /Chapter ([\d.]+)/i

    decodeHTMLEntity(str: string): string {
        return str.replace(/&#(\d+)/g, (_match, dec) => {
            return String.fromCharCode(dec)
        })
    }

    async parseHomeSections($: CheerioStatic, sectionCallback: (section: HomeSection) => void, _source: any): Promise<void> {
        const section1 = createHomeSection({ id: '1', title: 'Most Popular Manga', view_more: true})
        const section2 = createHomeSection({ id: '2', title: 'Latest', view_more: true})
        const section3 = createHomeSection({ id: '3', title: 'New Releases', view_more: true})

        const popular : MangaTile[] = []
        const latest     : MangaTile[] = []
        const newManga: MangaTile[] = []

        const arrPopular = $('.weekly-book .slick-detail a').toArray()
        const arrLatest = $('.comic-item',$('.latest-update h4.home-title:contains(\'Latest Update\')').next()).toArray()
        const arrNewRel = $('.comic-item',$('.latest-update h4.home-title:contains(\'New Release\')').next()).toArray()



        for (const obj of arrPopular) {
            const id = $(obj).attr('href')?.split('/')?.pop() ?? ''
            const title = this.decodeHTMLEntity($('h1.title',obj).text().trim()) ?? ''
            const image = $('.img-manga img', obj)?.attr('src') ?? $('.img-manga img', obj)?.attr('data-background-image') ?? ''

            if (!id) continue

            popular.push(
                createMangaTile({
                    id,
                    image,
                    title: createIconText({ text:  this.decodeHTMLEntity(title) }),
                })
            )
        }
        section1.items = popular
        sectionCallback(section1)

        for (const obj of arrLatest) {
            const id = $('a',obj).attr('href')?.split('/')?.pop() ?? ''
            const title = this.decodeHTMLEntity($('.comic-title',obj).text().trim()) ?? ''
            const image = $('.comic-image', obj).attr('data-background-image') ?? ''
            const subTitle = $('.tray-item', obj).text().trim() ?? ''

            if (!id) continue

            latest.push(
                createMangaTile({
                    id,
                    image,
                    title: createIconText({ text:  this.decodeHTMLEntity(title) }),
                    subtitleText: createIconText({ text: subTitle }),
                })
            )
        }
        section2.items = latest
        sectionCallback(section2)

        for (const obj of arrNewRel) {
            const id = $('a',obj).attr('href')?.split('/')?.pop() ?? ''
            const title = this.decodeHTMLEntity($('.comic-title',obj).text().trim()) ?? ''
            const image = $('.comic-image', obj).attr('data-background-image') ?? ''
            const subTitle = $('.tray-item', obj).text().trim() ?? ''

            if (!id) continue

            newManga.push(
                createMangaTile({
                    id,
                    image,
                    title: createIconText({ text:  this.decodeHTMLEntity(title) }),
                    subtitleText: createIconText({ text: subTitle }),
                })
            )
        }
        section3.items = newManga
        sectionCallback(section3)
    }

    parseChapterDetails($: CheerioSelector, mangaId: string, chapterId: string): ChapterDetails {
        const pages: string[] = []

        for (const obj of $('.col-lg-8 .carousel-item img').toArray()) {
            const page = this.getImageSrc($(obj))
            if (!page) {
                throw new Error(`Could not parse page for ${chapterId}`)
            }

            pages.push(page)
        }
        return createChapterDetails({
            id: chapterId,
            mangaId: mangaId,
            pages: pages,
            longStrip: true
        })
    }

    parseChapters($: CheerioStatic, mangaId: string, _source: any): Chapter[] {
        const chapters: Chapter[] = []
        const arrChapters = $('.div-chapter .list-group a').toArray()
        for (const obj of arrChapters) {
            let url = $(obj).attr('href') ?? ''
            if(url.startsWith('/')) url = 'https:' + url
            const time = this.parseDate($('.text-right', obj).text().trim() ?? '')
            const name = this.decodeHTMLEntity($('span', obj).first().text().trim() ?? '')

            const chapNumRegex = name.match(this.chapterTitleRegex)
            let chapNum = 0
            if (chapNumRegex && chapNumRegex[1]) chapNum = Number(chapNumRegex[1])

            chapters.push(createChapter({
                id: url, 
                mangaId: mangaId,
                name: name, 
                chapNum: !isNaN(chapNum) ? chapNum : NaN,
                time: time,
                langCode: LanguageCode.ENGLISH
            }))
        }
        return chapters
    }

    parseMangaDetails($: CheerioStatic, mangaId: string, _source: any): Manga {
        const details = $('.col-lg-8')
        const title = this.decodeHTMLEntity($('.col-md-7 .title',details).first().text().trim() ?? '')
        const image = this.getImageSrc($('.col-md-5 img',details))
        let desc = $('.summary .content').first().children().remove().end().text().replaceAll(/\s{2,}/g, ' ').trim() ?? ''
        if (desc == '') desc = 'No Decscription provided by the source (VyvyManga)'
        let author = ''
        let artist = ''
        let status = ''
        let views = ''
        const arrayTags: Tag[] = []
        const info = $('.col-md-7 p',details).toArray()
        for (const obj of info) {
            const label = $('.pre-title', obj).first().children().remove().end().text().replace(/\s{2,}/, ' ').trim().toLowerCase()
            switch (label) {
                case 'author':
                case 'authors':
                case 'author(s)':
                    $('span', obj).remove().end().text().replace(/\s{2,}/, ' ').trim()
                    author = $(obj).text().trim()
                    break
                case 'artist':
                case 'artists':
                case 'artist(s)':
                    $('span', obj).remove().end().text().replace(/\s{2,}/, ' ').trim()
                    artist = $(obj).text().trim()
                    break
                case 'views':
                    $('span', obj).remove().end().text().replace(/\s{2,}/, ' ').trim()
                    views = $(obj).text().trim()
                    break
                case 'status':
                    $('span', obj).remove().end().text().replace(/\s{2,}/, ' ').trim()
                    status = $(obj).text().trim()
                    break
                case 'genres':
                    $('span', obj).remove().end().text().replace(/\s{2,}/, ' ').trim()
                    for (const genreobj of $('a',obj).toArray()) {
                        const id = $(genreobj)?.attr('href')?.split('/')?.pop() ?? ''
                        const label = $(genreobj).text() ?? ''

                        if(!id || !label) continue

                        arrayTags.push({
                            id: `details.${id}`,
                            label: label
                        })
                    }
                    break
            }
        }

        const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map((x) => createTag(x)) })]

        return createManga({
            id: mangaId,
            titles: [title],
            image,
            status: this.parseStatus(status),
            views: Number(views),
            author,
            artist,
            tags: tagSections,
            desc: this.decodeHTMLEntity(desc),
        })
    }

    parseTags($: CheerioStatic): Tag[] {
        const genres: Tag[] = []
        for (const obj of $('#advance-search .check-genre .form-check').toArray()) {
            const label = $('label',obj).text().trim()
            const id = encodeURI($('input',obj).attr('value') ?? '')

            if(!label || !id) continue

            genres.push(createTag({
                id,
                label
            }))
        }
        return genres
    }

    parseSearchResults($: CheerioSelector): MangaTile[] {
        const results: MangaTile[] = []
        for (const obj of $('.row .col-lg-2').toArray()) {
            const id = $('a',obj).attr('href')?.split('/')?.pop() ?? ''
            const title = this.decodeHTMLEntity($('.comic-title',obj).text().trim()) ?? ''
            const image = $('.comic-image', obj).attr('data-background-image') ?? ''
            const subTitle = $('.tray-item', obj).text().trim() ?? ''
            
            if(!id) continue

            results.push(
                createMangaTile({
                    id,
                    image,
                    title: createIconText({ text: this.decodeHTMLEntity(title) }),
                    subtitleText: createIconText({ text: subTitle }),
                })
            )

        }
        return results
    }

    idCleaner(str: string, source: any): string {
        const base = source.baseUrl.split('://').pop()
        str = str.replace(/(https:\/\/|http:\/\/)/, '')
        str = str.replace(/\/$/, '')
        str = str.replace(`${base}/`, '')
        str = str.replace('/single/', '')
        return str
    }

    // taken from TheNetSky/extension-generic/Madara on Github
    parseDate = (date: string): Date => {
        date = date.toUpperCase()
        let time: Date
        const number = Number((/\d*/.exec(date) ?? [])[0])
        if (date.includes('LESS THAN AN HOUR') || date.includes('JUST NOW')) {
            time = new Date(Date.now())
        } else if (date.includes('YEAR') || date.includes('YEARS')) {
            time = new Date(Date.now() - (number * 31556952000))
        } else if (date.includes('MONTH') || date.includes('MONTHS')) {
            time = new Date(Date.now() - (number * 2592000000))
        } else if (date.includes('WEEK') || date.includes('WEEKS')) {
            time = new Date(Date.now() - (number * 604800000))
        } else if (date.includes('YESTERDAY')) {
            time = new Date(Date.now() - 86400000)
        } else if (date.includes('DAY') || date.includes('DAYS')) {
            time = new Date(Date.now() - (number * 86400000))
        } else if (date.includes('HOUR') || date.includes('HOURS')) {
            time = new Date(Date.now() - (number * 3600000))
        } else if (date.includes('MINUTE') || date.includes('MINUTES')) {
            time = new Date(Date.now() - (number * 60000))
        } else if (date.includes('SECOND') || date.includes('SECONDS')) {
            time = new Date(Date.now() - (number * 1000))
        } else {
            time = new Date(date)
        }
        return time
    }

    parseStatus(str: string): MangaStatus {
        let status = MangaStatus.UNKNOWN
        switch (str.toLowerCase()) {
            case 'ongoing':
                status = MangaStatus.ONGOING
                break
            case 'completed':
                status = MangaStatus.COMPLETED
                break
        }
        return status
    }

    getImageSrc(imageObj: Cheerio | undefined): string {
        let image
        if(typeof imageObj?.attr('data-src') != 'undefined') {
            image = imageObj?.attr('data-src')
        }
        else if (typeof imageObj?.attr('data-lazy-src') != 'undefined') {
            image = imageObj?.attr('data-lazy-src')
        }
        else if (typeof imageObj?.attr('srcset') != 'undefined') {
            image = imageObj?.attr('srcset')?.split(' ')[0] ?? ''
        } 
        else if (typeof imageObj?.attr('src') != 'undefined') {
            image = imageObj?.attr('src')
        }
        else {
            image = 'https://paperback.moe/icons/logo-alt.svg'
        }
            
        return encodeURI(decodeURI(this.decodeHTMLEntity(image?.trim() ?? '')))
    }
}