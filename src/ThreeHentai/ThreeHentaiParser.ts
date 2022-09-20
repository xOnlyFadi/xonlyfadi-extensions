/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {Chapter,     
    ChapterDetails,
    Manga, 
    MangaTile, 
    Tag,
    TagSection,
    MangaStatus} from 'paperback-extensions-common'

import {THLanguages} from './ThreeHentaiHelper'

export class Parser {

    decodeHTMLEntity(str: string): string {
        return str.replace(/&#(\d+)/g, (_match, dec) => {
            return String.fromCharCode(dec)
        })
    }

    parseMangaDetails($: CheerioStatic, mangaId: string, _source: any): Manga {
        const title =  this.decodeHTMLEntity($('#main-info .middle-title').first().text().trim()) ?? ''
        const image = $('.large-container #main-cover a img').attr('src') ?? $('.large-container #main-cover a img').attr('data-src') ?? 'https://paperback.moe/icons/logo-alt.svg'
        const arrayTags: Tag[] = []
        let author
        let artist

        for(const details of $('#main-info .tag-container').toArray()){
            const info = $(details).text().trim().toLocaleLowerCase()

            if(/tags:/i.test(info)){
                for(const tags of $('span',details).toArray()){
                    const label = $('.name',tags).text().trim() ?? ''
                    const id = $('.name',tags).attr('href')?.split('/')?.pop() ?? ''
                    
                    if(!id || !label) continue

                    arrayTags.push({
                        label,
                        id
                    })
                }
            }

            if(/artists:/i.test(info)){
                let i = 0
                for(const artists of $('span',details).toArray()){
                    const names = $('.name',artists).text().trim() ?? ''
                    if(i == 0){
                        artist = names
                    }
                    if(i > 0){
                        artist += `, ${names}`
                    }
                    i++
                }

            }

            if(/groups:/i.test(info)){
                let i = 0
                for(const artists of $('span',details).toArray()){
                    const names = $('.name',artists).text().trim() ?? ''
                    if(i == 0){
                        author = names
                    }
                    if(i > 0){
                        author += `, ${names}`
                    }
                    i++
                }

            }
        }

        const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map((x) => createTag(x)) })]

        return createManga({
            id: mangaId,
            titles: [title],
            image,
            status: MangaStatus.COMPLETED,
            author,
            artist,
            tags: tagSections,
        })
    }

    parseChapters($: CheerioStatic, mangaId: string, LanguageCodes: string,_source: any): Chapter[] {
        const chapters: Chapter[] = []
        const name = this.decodeHTMLEntity($('#main-info .middle-title').first().text().trim()) ?? ''
        let release_date

        for(const details of $('#main-info .tag-container').toArray()){
            const info = $(details).text().trim().toLocaleLowerCase()
            if(/uploaded:/i.test(info)){
                const date = $('time',details).attr('datetime') ?? ''
                release_date = date
            }
        }
        chapters.push(createChapter({
            id: mangaId, 
            mangaId: mangaId,
            name, 
            chapNum: 1,
            time: new Date(release_date ?? ''),
            langCode: THLanguages.getPBCode(LanguageCodes)
        }))
        return chapters
    }

    parseChapterDetails(data: string,mangaId: string, chapterId: string): ChapterDetails {
        const pages: string[] = []
        const scriptData = data.match(/var readerPages = JSON.parse\(atob\([`'"](.*?)[`'"]\)\)/i) ?? []

        if(!scriptData && !scriptData[1]) throw new Error(`Could Not Get info for ${mangaId}`)

        const decodedJson = Buffer.from(scriptData[1] ?? '','base64').toString('utf-8')
        const parsedJson = JSON.parse(decodedJson)
        const cdnUrl = parsedJson.baseUriImg.replace('%s','')

        for(const test in parsedJson.pages){
            pages.push(cdnUrl + parsedJson.pages[test].f)
        }

        return createChapterDetails({
            id: chapterId,
            mangaId: mangaId,
            pages: pages,
            longStrip: true
        })
    }

    parseSearchResults($: CheerioSelector,_source: any): MangaTile[] {
        const results: MangaTile[] = []

        for (const obj of $('#main-content .listing-container .doujin-col').toArray()) {
            const id = $('a',obj).attr('href')?.split('/')?.pop() ?? ''
            const title = $('.title',obj).text().shortenTitle() ?? ''
            const image = $('img', obj).attr('src') ?? $('img', obj).attr('data-src') ?? ''

            if (id || title){
                results.push(
                    createMangaTile({
                        id,
                        image,
                        title: createIconText({ text: this.decodeHTMLEntity(title) }),
                        subtitleText: createIconText({
                            text: THLanguages.getName(this.LanguageFlag($('.title',obj)))
                        }),
                    })
                )
            }
        }
        return results
    }
    
    LanguageFlag($: Cheerio){
        if($.hasClass('flag-eng')){
            return 'english'
        } else if($.hasClass('flag-jpn')){
            return 'japanese'
        } else if($.hasClass('flag-zho')){
            return 'chinese'
        } else if($.hasClass('flag-spa')){
            return 'spanish'
        } else if($.hasClass('flag-fra')){
            return 'french'
        } else if($.hasClass('flag-por')){
            return 'portuguese'
        } else if($.hasClass('flag-rus')){
            return 'russian'
        } else if($.hasClass('flag-deu')){
            return 'german'
        }
        return 'Unknown'
    }

    parseSearchResultsArchive($: CheerioSelector, _source: any,detailsid: string): MangaTile[] {
        const results: MangaTile[] = []
        const id = detailsid ?? ''
        const title = this.decodeHTMLEntity($('#main-info .middle-title').first().text().trim()) ?? ''
        const image = $('.large-container #main-cover a img').attr('src') ?? $('.large-container #main-cover a img').attr('data-src') ?? 'https://paperback.moe/icons/logo-alt.svg'
        let subtitle 
        for(const details of $('#main-info .tag-container').toArray()){
            const info = $(details).text().trim().toLocaleLowerCase()

            if(/languages:/i.test(info)){
                for(const artists of $('span',details).toArray()){
                    const names = $('.name',artists).text().trim() ?? ''
                    if(names !== 'translated'){
                        subtitle = names
                    }
                }

            }
        }
        if (id || title){
            results.push(
                createMangaTile({
                    id,
                    image,
                    title: createIconText({ text: this.decodeHTMLEntity(title) }),
                    subtitleText: createIconText({
                        text: THLanguages.getName(subtitle ?? '')
                    }),
                })
            )
        }
        return results
    }

    NextPage($: CheerioSelector): boolean {
        const nextPage = $('#main-content nav .page-item [rel="next"]')
        if (nextPage.contents().length !== 0) {
            return true
        } else {
            return false
        }
    }
}
export {}

declare global {
    interface String {
        shortenTitle(): string
    }
}
String.prototype.shortenTitle = function () {

    return this.replace(/(\[[^\]]*]|[({][^)}]*[)}])/g,'').trim()
}