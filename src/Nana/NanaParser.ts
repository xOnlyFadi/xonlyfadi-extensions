/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {     
    ChapterDetails,
    Manga, 
    MangaStatus, 
    MangaTile, 
    Tag,
    TagSection
} from 'paperback-extensions-common'

import '../scopes'

export class Parser {

    decodeHTMLEntity(str: string): string {
        return str.replace(/&#(\d+)/g, (_match, dec) => {
            return String.fromCharCode(dec)
        })
    }

    parseChapterDetails(npages: chap_thmbnails, mangaId: string, chapterId: string,baseUrl: string): ChapterDetails {
        const pages: string[] = []

        for (const details of npages.pages) {
            pages.push(baseUrl + details.substring(1).replace('thumbnails','page'))
        }
        
        return createChapterDetails({
            id: chapterId,
            mangaId: mangaId,
            pages: pages,
            longStrip: true
        })
    }

    parseMangaDetails($: CheerioStatic, mangaId: string, baseUrl: string): Manga {
        const title = this.decodeHTMLEntity($('title').first().text().substringBeforeFirst('by').trim()) ?? ''
        const author = $('title').first().text().substringAfterFirst('by').substringBeforeFirst('-').trim() ?? ''

        let image = $('a#display img').attr('src') ?? $('a#display img').attr('data-src') ?? ''
        if(image.startsWith('/')) image = baseUrl + image.replace('page','thumbnails')

        const tagsRegex = /Reader.tags = ['"`](.*)['"`]/i
        const arrayTags: Tag[] = []
        const tagsElement = $('script').map((_i: any, x: any) => x.children[0]).filter((_i: any, x: any) => x && x.data.match(tagsRegex)).get(0).data.trim()
        const filteredTagsArray = tagsElement.match(tagsRegex)

        if(filteredTagsArray && filteredTagsArray[1]){
            const filterSplitted = filteredTagsArray[1].split(',')
            for(const tagsArray of filterSplitted) {
                const label = tagsArray.trim()
                const id = encodeURI('details.' + tagsArray.trim()?.replace(/ /g, '+')?.replace(/%20/g, '+'))

                if (!label || !id) continue
                
                arrayTags.push({label,id})
            }
        }

        const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map((x) => createTag(x)) })]

        return createManga({
            id: mangaId,
            titles: [title],
            image,
            status: MangaStatus.COMPLETED,
            author,
            tags: tagSections,
        })
    }

    parseSearchResults($: CheerioSelector, baseUrl: string): MangaTile[] {
        const results: MangaTile[] = []
        
        for (const obj of $('.id3 > a').toArray()) {
            const id = $(obj).attr('href')?.split('/')?.pop() ?? ''
            const title = this.decodeHTMLEntity($(obj).attr('title')?.trim() ?? '') ?? ''

            let image = $('img', obj).attr('src') ?? $('img', obj).attr('data-src') ?? ''
            if(image.startsWith('/')) image = baseUrl + image

            if(!id) continue

            results.push(
                createMangaTile({
                    id,
                    image,
                    title: createIconText({ text: this.decodeHTMLEntity(title) }),
                })
            )
        }

        return results
    }

    NextPage($: CheerioSelector): boolean {
        const nextPage = $('a.paginate_button.current + a.paginate_button')

        if (nextPage.contents().length !== 0) {
            return true
        } else {
            return false
        }

    }
}

export interface chap_thmbnails {
    pages: string[];
}