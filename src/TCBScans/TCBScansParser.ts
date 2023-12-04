import {
    Chapter,
    ChapterDetails,
    HomeSection,
    SourceManga,
    PartialSourceManga
} from '@paperback/types'

import { decodeHTML } from 'entities'

export class Parser {
    private readonly chapterTitleRegex = /Chapter ([\d.]+)/i

    async parseHomeSections($: cheerio.Root, sectionCallback: (section: HomeSection) => void): Promise<void> {
        const section1 = App.createHomeSection({ id: '1', title: 'Projects', containsMoreItems: false, type: 'singleRowNormal'})

        const projects: PartialSourceManga[] = []
        const arrManga = $('.bg-card.border.border-border.rounded.p-3.mb-3').toArray()

        for (const obj of arrManga) {
            const id = $('a.mb-3.text-white.text-lg.font-bold',obj).attr('href')?.replace(/\/mangas\//gi,'') ?? ''
            const title = $('a.mb-3.text-white.text-lg.font-bold',obj).text().trim() ?? ''
            const image = $('.w-24.h-24.object-cover.rounded-lg', obj).attr('src') ?? ''

            if (!id) continue

            projects.push(App.createPartialSourceManga({
                image,
                title: decodeHTML(title),
                mangaId: id,
                subtitle: undefined
            }))
        }
        section1.items = projects
        sectionCallback(section1)
    }

    parseChapterDetails($: cheerio.Selector, mangaId: string, chapterId: string): ChapterDetails {
        const pages: string[] = []

        for (const obj of $('.flex.flex-col.items-center.justify-center picture img').toArray()) {
            const page = $(obj).attr('src') ?? ''
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

    parseChapters($: cheerio.Root): Chapter[] {
        const chapters: Chapter[] = []
        let lastNumber = null

        const arrChapters = $('.block.border.border-border.bg-card.mb-3.p-3.rounded').toArray()
        for (const obj of arrChapters) {
            const url = $(obj).attr('href') ?? ''
            const name = $('.text-lg.font-bold:not(.flex)',obj).text().trim() ?? 'No Chpater Name'

            if(!url) continue

            const match = name.match(this.chapterTitleRegex)
            let chapNum
            if (match && !isNaN(Number(match[1]))) {
                chapNum = Number(match[1])
            } else {
                if (lastNumber === null) {
                    chapNum = 0
                } else {
                    chapNum = Number((lastNumber + 0.001).toFixed(3))
                }
            }
            lastNumber = chapNum

            chapters.push(App.createChapter({
                id: encodeURI(url),
                name: name,
                chapNum: chapNum ?? 0,
                langCode: '🇬🇧'
            }))
        }

        return chapters
    }

    parseMangaDetails($: cheerio.Root, mangaId: string): SourceManga {
        const descElement = $('.order-1.bg-card.border.border-border.rounded.py-3')
        const title = $('.my-3.font-bold.text-3xl',descElement).first().text().trim() ?? ''
        const image = $('.flex.items-center.justify-center img',descElement).attr('src') ?? 'https://paperback.moe/icons/logo-alt.svg'
        let desc = $('.leading-6.my-3',descElement).text().trim() ?? ''
        if (desc == '') desc = 'No Decscription provided by the source (TCB Scans)'

        return App.createSourceManga({
            id: mangaId,
            mangaInfo: App.createMangaInfo({
                titles: [decodeHTML(title)],
                image,
                status: 'ONGOING',
                desc
            })
        })
    }
}
