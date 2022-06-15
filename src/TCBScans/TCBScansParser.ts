import {Chapter,     
    ChapterDetails,
    HomeSection,
    LanguageCode, 
    Manga, 
    MangaTile, 
    MangaStatus} from 'paperback-extensions-common'

export class Parser {
    private readonly chapterTitleRegex = /Chapter ([\d.]+)/i

    decodeHTMLEntity(str: string): string {
        return str.replace(/&#(\d+)/g, (_match, dec) => {
            return String.fromCharCode(dec)
        })
    }

    async parseHomeSections($: CheerioStatic,sectionCallback: (section: HomeSection) => void, _source: any): Promise<void> {
        const section1 = createHomeSection({ id: '1', title: 'Projects', view_more: false})
        const projects  : MangaTile[] = []
        const arrManga = $('.bg-card.border.border-border.rounded.p-3.mb-3').toArray()

        for (const obj of arrManga) {
            const id = $('a.mb-3.text-white.text-lg.font-bold',obj).attr('href')?.replace(/\/mangas\//gi,'') ?? ''
            const title = $('a.mb-3.text-white.text-lg.font-bold',obj).text().trim() ?? ''
            const image = $('.w-24.h-24.object-cover.rounded-lg', obj).attr('src') ?? ''
            projects.push(
                createMangaTile({
                    id,
                    image,
                    title: createIconText({ text:  this.decodeHTMLEntity(title) }),
                })
            )
        }
        section1.items = projects
        sectionCallback(section1)
    }

    parseChapterDetails($: CheerioSelector, mangaId: string, chapterId: string): ChapterDetails {
        const pages: string[] = []

        for (const obj of $('.flex.flex-col.items-center.justify-center picture img').toArray()) {
            const page = $(obj).attr('src') ?? ''
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
        let lastNumber: number | null = null
        const arrChapters = $('.block.border.border-border.bg-card.mb-3.p-3.rounded').toArray()
        for (const obj of arrChapters) {
            const url = $(obj).attr('href') ?? ''
            const name = $('.text-lg.font-bold:not(.flex)',obj).text().trim() ?? 'No Chpater Name'
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
            chapters.push(createChapter({
                id: encodeURI(url), 
                mangaId: mangaId,
                name: name, 
                chapNum: chapNum ?? 0,
                langCode: LanguageCode.ENGLISH
            }))
        }
        return chapters
    }

    parseMangaDetails($: CheerioStatic, mangaId: string, _source: any): Manga {
        const descElement = $('.order-1.bg-card.border.border-border.rounded.py-3')
        const title = $('.my-3.font-bold.text-3xl',descElement).first().text().trim() ?? ''
        const image = $('.flex.items-center.justify-center img',descElement).attr('src') ?? 'https://paperback.moe/icons/logo-alt.svg'
        let desc = $('.leading-6.my-3',descElement).text().trim() ?? ''
        if (desc == '') desc = 'No Decscription provided by the source (TCB Scans)'

        return createManga({
            id: mangaId,
            titles: [this.decodeHTMLEntity(title)],
            image,
            status: MangaStatus.ONGOING,
            desc,
        })
    }
}