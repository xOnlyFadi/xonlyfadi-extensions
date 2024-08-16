import {
    Chapter,
    ChapterDetails,
    HomeSection,
    HomeSectionType,
    SourceManga,
    PartialSourceManga,
    Tag,
    TagSection
} from '@paperback/types'

import { Cheerio, CheerioAPI } from 'cheerio'
import { Element } from 'domhandler'
import { decodeHTML } from 'entities'

export class Parser {
    private readonly chapterTitleRegex = /Chapter ([\d.]+)/i

    async parseHomeSections($: CheerioAPI, sectionCallback: (section: HomeSection) => void, cdnUrl: string): Promise<void> {
        const top5Section = App.createHomeSection({ id: 'top5', title: 'Top 5', containsMoreItems: false, type: HomeSectionType.featured })
        const popularSection = App.createHomeSection({ id: 'popular', title: 'Popular', containsMoreItems: true, type: HomeSectionType.singleRowNormal })
        const TodayMangaSection = App.createHomeSection({ id: 'today_manga', title: 'Today\'s Manga', containsMoreItems: true, type: HomeSectionType.singleRowNormal })
        const YesterdayMangaSection = App.createHomeSection({ id: 'yesterday_manga', title: 'Yesterday\'s Manga', containsMoreItems: false, type: HomeSectionType.singleRowNormal })
        const OlderMangaSection = App.createHomeSection({ id: 'older_manga', title: 'Older Manga', containsMoreItems: false, type: HomeSectionType.singleRowNormal })

        const Top5: PartialSourceManga[] = []
        const Popular: PartialSourceManga[] = []
        const TodayManga: PartialSourceManga[] = []
        const YesterdayManga: PartialSourceManga[] = []
        const OlderManga: PartialSourceManga[] = []

        for (const obj of $('li', $('.slide_box .rslides')).toArray()) {
            const id = $('a',obj).attr('href')?.split('/').pop() ?? ''
            const title = $('div', obj).text().trim() ?? ''
            const image = `${cdnUrl}/manga_images/${id.toLowerCase()}.jpg`

            if (!id) continue

            Top5.push(App.createPartialSourceManga({
                image,
                title: decodeHTML(title),
                mangaId: id
            }))
        }

        top5Section.items = Top5
        sectionCallback(top5Section)

        for (const obj of $('.featured_item_info', $('.box .featured_list div')).toArray()) {
            const id = $('a',obj).first().attr('href')?.split('/').pop() ?? ''
            const title = $('a', obj).first().text().trim() ?? ''
            const image = `${cdnUrl}/manga_images/${id.toLowerCase()}.jpg`
            const subtitle = $('a#chapter', obj).text().trim()

            if (!id) continue

            Popular.push(App.createPartialSourceManga({
                image,
                title: decodeHTML(title),
                mangaId: id,
                subtitle: decodeHTML(subtitle)
            }))
        }

        popularSection.items = Popular
        sectionCallback(popularSection)

        for (const obj of $('.latest_list div',$('.right div:contains(TODAY\'S MANGA)').next()).toArray()) {
            const id = $('a.image',obj).attr('href')?.split('/').pop() ?? ''
            const title = $('a.name', obj).text().trim() ?? ''
            const image = `${cdnUrl}/manga_images/${id.toLowerCase()}.jpg`
            const subtitle = $('.chapter_box a', obj).text().trim()

            if (!id) continue

            TodayManga.push(App.createPartialSourceManga({
                image,
                title: decodeHTML(title),
                mangaId: id,
                subtitle: decodeHTML(subtitle)
            }))
        }

        TodayMangaSection.items = TodayManga
        sectionCallback(TodayMangaSection)

        for (const obj of $('.latest_list div',$('.right div:contains(YESTERDAY\'S MANGA)').next()).toArray()) {
            const id = $('a.image',obj).attr('href')?.split('/').pop() ?? ''
            const title = $('a.name', obj).text().trim() ?? ''
            const image = `${cdnUrl}/manga_images/${id.toLowerCase()}.jpg`
            const subtitle = $('.chapter_box a', obj).text().trim()

            if (!id) continue

            YesterdayManga.push(App.createPartialSourceManga({
                image,
                title: decodeHTML(title),
                mangaId: id,
                subtitle: decodeHTML(subtitle)
            }))
        }

        YesterdayMangaSection.items = YesterdayManga
        sectionCallback(YesterdayMangaSection)

        for (const obj of $('.latest_list div',$('.right div:contains(OLDER MANGA)').next()).toArray()) {
            const id = $('a.image',obj).attr('href')?.split('/').pop() ?? ''
            const title = $('a.name', obj).text().trim() ?? ''
            const image = `${cdnUrl}/manga_images/${id.toLowerCase()}.jpg`
            const subtitle = $('.chapter_box a', obj).text().trim()

            if (!id) continue

            OlderManga.push(App.createPartialSourceManga({
                image,
                title: decodeHTML(title),
                mangaId: id,
                subtitle: decodeHTML(subtitle)
            }))
        }

        OlderMangaSection.items = OlderManga
        sectionCallback(OlderMangaSection)
    }

    ViewMoreParse($: CheerioAPI, cdnUrl: string, isPopular: boolean): PartialSourceManga[] {
        const results: PartialSourceManga[] = []

        for (const obj of $(isPopular ? '.ranking_list .ranking_item' : '.latest_releases_list .latest_releases_item').toArray()) {
            const id = $('a',obj).attr('href')?.split('/').pop() ?? ''
            const title = $('a h3, a strong', obj).text().trim() ?? ''
            const image = `${cdnUrl}/manga_images/${id.toLowerCase()}.jpg`
            const subtitle = isPopular ? $('.ranking_item_info div:contains(Published)', obj).text().trim().split(' ').shift() ?? '' : $('.latest_releases_info div a', obj).first().text().trim().split(' ').pop() ?? ''

            if (!id) continue

            results.push(App.createPartialSourceManga({
                image,
                title: decodeHTML(title),
                mangaId: id,
                subtitle: decodeHTML(subtitle ? `Chapter ${subtitle}` : '')
            }))
        }

        return results
    }

    parseSearchResults($: CheerioAPI, cdnUrl: string, UsesDeatils: boolean): PartialSourceManga[] {
        const results: PartialSourceManga[] = []

        for (const obj of $(UsesDeatils ? '.ranking_list .ranking_item' :'div.manga_search_item, div.mangaka_search_item').toArray()) {
            const id = $('h3 a, h5 a, a', obj).attr('href')?.split('/').pop() ?? ''
            const title = $('h3 a, h5 a, a h3', obj).text() ?? ''
            const image = `${cdnUrl}/manga_images/${id.toLowerCase()}.jpg`
            const subtitle = $('div:contains(Published), .ranking_item_info div:contains(Published)', obj).text().trim().split(' ').shift()

            if (!id) continue

            results.push(App.createPartialSourceManga({
                image,
                title: decodeHTML(title),
                mangaId: id,
                subtitle: decodeHTML(subtitle ? `Chapter ${subtitle}` : '')
            }))
        }

        return results
    }
    parseChapterDetails($: CheerioAPI, mangaId: string, chapterId: string): ChapterDetails {
        const pages: string[] = []

        for (const obj of $('img#gohere').toArray()) {
            const page = this.getImageSrc($(obj)) ?? ''

            if (!page) {
                throw new Error(`Could not parse page for ${chapterId}`)
            }
            pages.push(page)
        }

        return App.createChapterDetails({
            id: chapterId,
            mangaId: mangaId,
            pages: pages
        })
    }

    parseChapters($: CheerioAPI): Chapter[] {
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

            chapters.push(App.createChapter({
                id: id,
                name: this.encodeText(name),
                chapNum: chapNum ?? 0,
                time: new Date(release_date),
                langCode: '🇬🇧'
            }))
        }

        return chapters
    }

    parseMangaDetails($: CheerioAPI, mangaId: string, cdnUrl: string): SourceManga {
        const title = $('div.manga_series_data h1').first().text().trim() ?? ''
        const image = `${cdnUrl}/manga_images/${mangaId.toLowerCase()}.jpg`


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


        let desc = $('div.manga_series_description p').text().trim() ?? ''
        if (desc == '') desc = 'No Decscription provided by the source (MangaFreak)'

        return App.createSourceManga({
            id: mangaId,
            mangaInfo: App.createMangaInfo({
                titles: [decodeHTML(title)],
                image,
                status: this.parseStatus(status),
                author: decodeHTML(author),
                artist: decodeHTML(artist),
                tags: [App.createTagSection({ id: '0', label: 'genres', tags: arrayTags.map((x) => App.createTag(x)) })],
                desc
            })
        })
    }

    parseTags($: CheerioAPI): TagSection[] {

        const genres: Tag[] = []
        for (const obj of $('.main .select_genre div[id="genrebox"] div').toArray()) {
            const id = $(obj).text().trim()
            const label = $(obj).text().trim()
            if (!id || !label)
                continue
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
            App.createTagSection({ id: 'none', label: 'Using multipule genres tags without', tags: [] }),
            App.createTagSection({ id: 'none2', label: 'title the search will infinitely loop', tags: [] }),
            App.createTagSection({ id: 'none3', label: 'but if it\'s one tag it will work', tags: [] }),
            App.createTagSection({ id: '1', label: 'Genres', tags: genres.map(x => App.createTag(x)) }),
            App.createTagSection({ id: '2', label: 'Manga Type', tags: Types.map(x => App.createTag(x)) }),
            App.createTagSection({ id: '3', label: 'Manga Status', tags: Status.map(x => App.createTag(x)) })
        ]
    }

    NextPage($: CheerioAPI): boolean {
        const nextPage = $('a.next_p')
        if (nextPage.contents().length !== 0) {
            return true
        }
        else {
            return false
        }
    }

    encodeText(str: string): string {
        return str.replace(/&#([0-9]{1,4})/gi, (_, numStr) => {
            const num = parseInt(numStr, 10)
            return String.fromCharCode(num)
        })
    }

    getImageSrc(imageObj: Cheerio<Element> | undefined): string {
        let image

        if (typeof imageObj?.attr('data-src') != 'undefined') {
            image = imageObj?.attr('data-src')
        } else if (typeof imageObj?.attr('data-lazy-src') != 'undefined') {
            image = imageObj?.attr('data-lazy-src')
        } else if (typeof imageObj?.attr('srcset') != 'undefined') {
            image = imageObj?.attr('srcset')?.split(' ')[0] ?? ''
        } else if (typeof imageObj?.attr('data-cfsrc') != 'undefined') {
            image = imageObj?.attr('data-cfsrc')?.split(' ')[0] ?? ''
        } else {
            image = imageObj?.attr('src')
        }

        return encodeURI(decodeURI(decodeHTML(image?.trim() ?? '')))
    }

    parseStatus(str: string): string {
        let status = 'ONGOING'

        switch (str.toLowerCase()) {
            case 'ongoing':
            case 'on-going':
                status = 'ONGOING'
                break
            case 'completed':
                status = 'COMPLETED'
                break
        }

        return status
    }
}
