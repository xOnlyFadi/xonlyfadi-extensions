/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
    Chapter,     
    ChapterDetails,
    HomeSection,
    HomeSectionType,
    LanguageCode, 
    Manga, 
    MangaStatus, 
    MangaTile, 
    Tag,
    TagSection
} from 'paperback-extensions-common'

export class Parser {
    private readonly chapterTitleRegex = /Chapter ([\d.]+)/i

    async parseHomeSections($: CheerioStatic, sectionCallback: (section: HomeSection) => void, source: any): Promise<void> {
        const top5Section = createHomeSection({ id: 'top5', title: 'Top 5', view_more: false, type: HomeSectionType.featured})
        const popularSection = createHomeSection({ id: 'popular', title: 'Popular', view_more: true, type: HomeSectionType.singleRowNormal})
        const TodayMangaSection = createHomeSection({ id: 'today_manga', title: 'Today\'s Manga', view_more: true, type: HomeSectionType.singleRowNormal})
        const YesterdayMangaSection = createHomeSection({ id: 'yesterday_manga', title: 'Yesterday\'s Manga', view_more: false, type: HomeSectionType.singleRowNormal})
        const OlderMangaSection = createHomeSection({ id: 'older_manga', title: 'Older Manga', view_more: false, type: HomeSectionType.singleRowNormal})

        const Top5: MangaTile[] = []
        const Popular: MangaTile[] = []
        const TodayManga: MangaTile[] = []
        const YesterdayManga: MangaTile[] = []
        const OlderManga: MangaTile[] = []

        for (const obj of $('li', $('.slide_box .rslides')).toArray()) {
            const id = $('a',obj).attr('href')?.split('/').pop() ?? ''
            const title = $('div', obj).text().trim() ?? ''
            const image = `${source.baseCdn}/manga_images/${id.toLowerCase()}.jpg`

            if (!id) continue

            Top5.push(
                createMangaTile({
                    id,
                    image,
                    title: createIconText({ text:  this.decodeHTMLEntity(title) }),
                })
            )
        }

        top5Section.items = Top5
        sectionCallback(top5Section)

        for (const obj of $('.featured_item_info', $('.box .featured_list div')).toArray()) {
            const id = $('a',obj).first().attr('href')?.split('/').pop() ?? ''
            const title = $('a', obj).first().text().trim() ?? ''
            const image = `${source.baseCdn}/manga_images/${id.toLowerCase()}.jpg`
            const subtitle = $('a#chapter', obj).text().trim()

            if (!id) continue

            Popular.push(
                createMangaTile({
                    id,
                    image,
                    title: createIconText({ text:  this.decodeHTMLEntity(title) }),
                    subtitleText: createIconText({ text:  this.decodeHTMLEntity(subtitle) }),
                })
            )
        }

        popularSection.items = Popular
        sectionCallback(popularSection)

        for (const obj of $('.latest_list div',$('.right div:contains(TODAY\'S MANGA)').next()).toArray()) {
            const id = $('a.image',obj).attr('href')?.split('/').pop() ?? ''
            const title = $('a.name', obj).text().trim() ?? ''
            const image = `${source.baseCdn}/manga_images/${id.toLowerCase()}.jpg`
            const subtitle = $('.chapter_box a', obj).text().trim()

            if (!id) continue

            TodayManga.push(
                createMangaTile({
                    id,
                    image,
                    title: createIconText({ text:  this.decodeHTMLEntity(title) }),
                    subtitleText: createIconText({ text:  this.decodeHTMLEntity(subtitle) }),
                })
            )
        }

        TodayMangaSection.items = TodayManga
        sectionCallback(TodayMangaSection)

        for (const obj of $('.latest_list div',$('.right div:contains(YESTERDAY\'S MANGA)').next()).toArray()) {
            const id = $('a.image',obj).attr('href')?.split('/').pop() ?? ''
            const title = $('a.name', obj).text().trim() ?? ''
            const image = `${source.baseCdn}/manga_images/${id.toLowerCase()}.jpg`
            const subtitle = $('.chapter_box a', obj).text().trim()

            if (!id) continue

            YesterdayManga.push(
                createMangaTile({
                    id,
                    image,
                    title: createIconText({ text:  this.decodeHTMLEntity(title) }),
                    subtitleText: createIconText({ text:  this.decodeHTMLEntity(subtitle) }),
                })
            )
        }

        YesterdayMangaSection.items = YesterdayManga
        sectionCallback(YesterdayMangaSection)

        for (const obj of $('.latest_list div',$('.right div:contains(OLDER MANGA)').next()).toArray()) {
            const id = $('a.image',obj).attr('href')?.split('/').pop() ?? ''
            const title = $('a.name', obj).text().trim() ?? ''
            const image = `${source.baseCdn}/manga_images/${id.toLowerCase()}.jpg`
            const subtitle = $('.chapter_box a', obj).text().trim()

            if (!id) continue

            OlderManga.push(
                createMangaTile({
                    id,
                    image,
                    title: createIconText({ text:  this.decodeHTMLEntity(title) }),
                    subtitleText: createIconText({ text:  this.decodeHTMLEntity(subtitle) }),
                })
            )
        }

        OlderMangaSection.items = OlderManga
        sectionCallback(OlderMangaSection)
    }

    ViewMoreParse($: CheerioSelector, source: any, isPopular: boolean): MangaTile[] {
        const results: MangaTile[] = []
        for (const obj of $(isPopular ? '.ranking_list .ranking_item' : '.latest_releases_list .latest_releases_item').toArray()) {
            const id = $('a',obj).attr('href')?.split('/').pop() ?? ''
            const title = $('a h3, a strong', obj).text().trim() ?? ''
            const image = `${source.baseCdn}/manga_images/${id.toLowerCase()}.jpg`
            const subtitle = isPopular ? $('.ranking_item_info div:contains(Published)', obj).text().trim().split(' ').shift() ?? '' : $('.latest_releases_info div a', obj).first().text().trim().split(' ').pop() ?? ''

            if (!id) continue

            results.push(
                createMangaTile({
                    id,
                    image,
                    title: createIconText({ text: this.decodeHTMLEntity(title) }),
                    subtitleText: createIconText({ text: this.decodeHTMLEntity(subtitle ? `Chapter ${subtitle}` : '') }),
                }))
        }

        return results
    }

    parseSearchResults($: CheerioSelector, source: any, UsesDeatils: boolean): MangaTile[] {
        const results: MangaTile[] = []

        for (const obj of $(UsesDeatils ? '.ranking_list .ranking_item' :'div.manga_search_item, div.mangaka_search_item').toArray()) {
            const id = $('h3 a, h5 a, a', obj).attr('href')?.split('/').pop() ?? ''
            const title = $('h3 a, h5 a, a h3', obj).text() ?? ''
            const image = `${source.baseCdn}/manga_images/${id.toLowerCase()}.jpg`
            const subtitle = $('div:contains(Published), .ranking_item_info div:contains(Published)', obj).text().trim().split(' ').shift()

            if (!id) continue

            results.push(
                createMangaTile({
                    id,
                    image,
                    title: createIconText({ text:  this.decodeHTMLEntity(title) }),
                    subtitleText: createIconText({ text: this.decodeHTMLEntity(subtitle ? `Chapter ${subtitle}` : '') }),
                })
            )
        }
        return results
    }

    parseChapterDetails($: CheerioSelector, mangaId: string, chapterId: string): ChapterDetails {
        const pages: string[] = []

        for (const obj of $('img#gohere').toArray()) {
            const page = this.getImageSrc($(obj)) ?? ''

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

    parseChapters($: CheerioStatic, mangaId: string): Chapter[] {
        const chapters: Chapter[] = []
        const arrChapters = $('div.manga_series_list tr:has(a)').toArray()

        for (const obj of arrChapters) {
            const id = $('a',obj).attr('href')?.split('/').pop() ?? ''
            const name = $('td',obj).eq(0).text().trim() ?? ''
            const release_date = $('td', obj).eq(1).text()

            if (!id) continue
            
            const match = name.match(this.chapterTitleRegex)
            let chapNum
            if (match && !isNaN(Number(match[1]))) chapNum = Number(match[1])

            chapters.push(createChapter({
                id: id, 
                mangaId: mangaId,
                name: this.encodeText(name), 
                chapNum: chapNum ?? 0,
                time: new Date(release_date),
                langCode: LanguageCode.ENGLISH
            }))
        }
        return chapters
    }

    parseMangaDetails($: CheerioStatic, mangaId: string, source: any): Manga {
        const title = $('div.manga_series_data h5').first().text().trim() ?? ''
        const image = `${source.baseCdn}/manga_images/${mangaId.toLowerCase()}.jpg`


        const author = $('div.manga_series_data > div').eq(2).text().trim() ?? ''
        const artist = $('div.manga_series_data > div').eq(3).text().trim() ?? ''

        const status = $('div.manga_series_data > div').eq(1).text().trim() ?? ''
        
        const arrayTags: Tag[] = []

        for (const obj of $('div.series_sub_genre_list a').toArray()) {
            const id = $(obj)?.attr('href')?.split('/').pop() ?? ''
            const label = $(obj).text() ?? ''

            if (!id || !label) continue

            arrayTags.push({
                id: `details.${id}`,
                label
            })
        }

        const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map((x) => createTag(x)) })]

        let desc = $('div.manga_series_description p').text().trim() ?? ''
        if (desc == '') desc = 'No Decscription provided by the source (MangaFreak)'

        return createManga({
            id: mangaId,
            titles: [this.decodeHTMLEntity(title)],
            image,
            status: this.parseStatus(status),
            author: this.decodeHTMLEntity(author),
            artist: this.decodeHTMLEntity(artist),
            tags: tagSections,
            desc,
        })
    }

    parseTags($: CheerioStatic) {
        const genres: Tag[] = []

        for (const obj of $('.main .select_genre div[id="genrebox"] div').toArray()) {
            const id = $(obj).text().trim()
            const label = $(obj).text().trim()

            if (!id || !label) continue

            genres.push({
                id: `genre.${id}`,
                label
            })
        }

        const Types: Tag[] = [
            {
                id: 'types.0',
                label: 'Both'
            },
            {
                id: 'types.2',
                label: 'Manga'
            },
            {
                id: 'types.1',
                label: 'Manhwa'
            }
        ]

        const Status: Tag[] = [
            {
                id: 'status.0',
                label: 'Both'
            },
            {
                id: 'status.1',
                label: 'Completed'
            },
            {
                id: 'status.2',
                label: 'Ongoing'
            }
        ]

        return [
            createTagSection({id: 'none', label: 'Using multipule genres tags without', tags: [] }),
            createTagSection({id: 'none2', label: 'title the search will infinitely loop', tags: [] }),
            createTagSection({id: 'none3', label: 'but if it\'s one tag it will work', tags: [] }),
            createTagSection({id: '1', label: 'Genres', tags: genres.map(x => createTag(x)) }),
            createTagSection({id: '2', label: 'Manga Type', tags: Types.map(x => createTag(x)) }),
            createTagSection({id: '3', label: 'Manga Status', tags: Status.map(x => createTag(x)) })
        ]
    }

    NextPage($: CheerioSelector) {
        const nextPage = $('a.next_p')
        if (nextPage.contents().length !== 0) {
            return true
        } else {
            return false
        }
    }
    encodeText(str: string) {
        return str.replace(/&#([0-9]{1,4})/gi, (_, numStr) => {
            const num = parseInt(numStr, 10)
            return String.fromCharCode(num)
        })
    }

    getImageSrc(imageObj: Cheerio | undefined): string {
        let image
        if (typeof imageObj?.attr('data-src') != 'undefined') {
            image = imageObj?.attr('data-src')
        }
        else if (typeof imageObj?.attr('data-lazy-src') != 'undefined') {
            image = imageObj?.attr('data-lazy-src')
        }
        else if (typeof imageObj?.attr('srcset') != 'undefined') {
            image = imageObj?.attr('srcset')?.split(' ')[0] ?? ''
        }
        else if (typeof imageObj?.attr('data-cfsrc') != 'undefined') {
            image = imageObj?.attr('data-cfsrc')?.split(' ')[0] ?? ''
        }
        else {
            image = imageObj?.attr('src')
        }
        return encodeURI(decodeURI(this.decodeHTMLEntity(image?.trim() ?? '')))
    }
    
    decodeHTMLEntity(str: string): string {
        return str.replace(/&#(\d+)/g, (_match, dec) => {
            return String.fromCharCode(dec)
        })
    }

    parseStatus(str: string): MangaStatus {
        let status = MangaStatus.UNKNOWN
        switch (str.toLowerCase()) {
            case 'ongoing':
            case 'on-going':
                status = MangaStatus.ONGOING
                break
            case 'completed':
                status = MangaStatus.COMPLETED
                break
        }
        return status
    }
}