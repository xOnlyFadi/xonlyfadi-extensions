/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {Chapter,     
    ChapterDetails,
    LanguageCode, 
    Manga, 
    MangaTile, 
    Tag,
    TagSection} from 'paperback-extensions-common'
import {VoyceData,
    VoyceMangaData,
    VoyceChapterData} from './VoyceMEHelper'
import {decodeHTML} from 'entities'
import {convert} from 'html-to-text'

export class Parser {

    decodeHTMLEntity(str: string): string {
        return str.replace(/&#(\d+)/g, (_match, dec) => {
            return String.fromCharCode(dec)
        })
    }

    parseHomeSections(VoyceD: VoyceData, source: any): MangaTile[] {
        const items: MangaTile[] = []
        for(const data of VoyceD.data.voyce_series){
            const id = data.slug.trim() ?? ''
            const image = encodeURI(`${source.staticURL}${data.thumbnail}`) ?? ''
            const title = data.title.trim() ?? ''
            if(!id || !title) continue
            items.push(createMangaTile({
                id,
                image,
                title: createIconText({
                    text: title
                })
            }))
        }
        return items
    }

    async parseChapterDetails($: CheerioSelector, mangaId: string, chapterId: string,source: any): Promise<ChapterDetails> {
        const pages: string[] = []

        const nextData = $('script#__NEXT_DATA__').get(0).children[0].data
        const nextJson = JSON.parse(nextData)
        const buildId = nextJson.buildId

        const dataResponse = await this.ChapterDetailsApiRequest(buildId,mangaId,chapterId,source)
    
        const dataJson = JSON.parse(dataResponse)
        const comic = dataJson.pageProps.series
        const chapterIdV = chapterId.substringAfterLast('/').substringBeforeFirst('#')
        const chapter = comic.chapters.map((x: any)=>{
            if(x.id == chapterIdV) return x
        })
        if(!chapter) throw new Error('Chapter data not found in website.')
        const info = JSON.parse(JSON.stringify(chapter),(_k, v) => Array.isArray(v) ? v.filter(e => e !== null) : v)
        for(const page of info[0].images){
            pages.push(source.staticURL + page.image)
        }
        return createChapterDetails({
            id: chapterId,
            mangaId: mangaId,
            pages: pages,
            longStrip: true
        })
    }
    async ChapterDetailsApiRequest(buildId: string,mangaId: string, chapterI: string,source:any): Promise<any> {
        const chapterId = chapterI.substringAfterLast('/').substringBeforeFirst('#')
        const options = createRequestObject({
            url: `${source.baseUrl}/_next/data/${buildId}/series/${mangaId}/${chapterId}.json`,
            method: 'GET'
        })
        const response = await source.requestManager.schedule(options, 1)
        if(response.status == 500) throw Error('Chapter Does not info doest not exist on the site')
        return response.data
    }
    parseChapters(VoyceD: VoyceChapterData, mangaId: string, source: any): Chapter[] {
        const data = VoyceD.data.voyce_series[0]
        const chapters: Chapter[] = []
        let sortingIndex = 0
        for (const obj of data?.chapters ?? []) {
            const url = `${data?.slug}/${obj.id}#comic` ?? ''
            const name = obj.title ?? 'No Chpater Name'
            const release_date = obj.created_at
            if (!url) continue
            const chapNum = Number(name.match(/\D*(\d*\-?\d*)\D*$/)?.pop()?.replace(/-/g, '.'))

            chapters.push(createChapter({
                id: url, 
                mangaId: mangaId,
                name: name, 
                chapNum: isNaN(chapNum) ? 0 : chapNum,
                time: new Date(release_date),
                langCode: LanguageCode.ENGLISH,
                // @ts-ignore
                sortingIndex
            }))
            sortingIndex--
        }
        const key = 'name'
        const arrayUniqueByKey = [...new Map(chapters.map(item =>
            [item[key], item])).values()]
        return arrayUniqueByKey
    }

    parseMangaDetails(VoyceD: VoyceMangaData, mangaId: string, source: any): Manga {
        const details = VoyceD.data.voyce_series[0]
        const title = details?.title.trim() ?? ''
        const image = encodeURI(source.staticURL + details?.thumbnail) ?? 'https://paperback.moe/icons/logo-alt.svg'
        let desc = details?.description ?? ''
        if (desc == '') desc = 'No Decscription provided by the source (MangaFreak)'
        const author = details?.author?.username ?? ''
        const status = details?.status ?? ''
        const arrayTags: Tag[] = []
        for (const obj of details?.genres ?? []) {
            const id = encodeURI(obj?.genre.title?.toLocaleLowerCase().trim()) ?? ''
            const title = obj?.genre.title.trim() ?? ''
            if (!id || !title) continue
            arrayTags.push({
                id: id,
                label: title
            })
        }
 
        const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map((x) => createTag(x)) })]

        return createManga({
            id: mangaId,
            titles: [this.decodeHTMLEntity(title)],
            image,
            status: source.parseStatus(status),
            author: this.decodeHTMLEntity(author),
            tags: tagSections,
            desc: convert(decodeHTML(desc),{wordwrap: 130}),
        })
    }
}
export {}

declare global {
    interface String {
        substringAfterLast(character:any): any
        substringBeforeFirst(substring:any): any
    }
}
String.prototype.substringAfterLast = function (character) {
    const lastIndexOfCharacter = this.lastIndexOf(character)
    return this.substring(lastIndexOfCharacter + 1, this.length + 1) //should be 39
}
String.prototype.substringBeforeFirst = function (substring) {
    const startingIndexOfSubstring = this.indexOf(substring)
    return this.substring(0, startingIndexOfSubstring)
}