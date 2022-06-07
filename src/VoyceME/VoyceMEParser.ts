import {Chapter,     
    ChapterDetails,
    LanguageCode, 
    Manga, 
    MangaTile, 
    Tag,
    TagSection} from "paperback-extensions-common";
import {VoyceData,VoyceMangaData,VoyceChapterData} from './VoyceMEHelper'
import {decodeHTML} from "entities"
import {convert} from "html-to-text"
export class Parser {
    private readonly chapterTitleRegex = /Chapter|Episode ([\d.]+)/i

    decodeHTMLEntity(str: string): string {
        return str.replace(/&#(\d+);/g, function (_match, dec) {
            return String.fromCharCode(dec);
        })
    }

    parseHomeSections(VoyceD: VoyceData, source: any): MangaTile[] {
        const items: MangaTile[] = []
        for(const data of VoyceD.data.voyce_series){
        items.push(createMangaTile({
            id: data.slug.toString() ?? '',
            image: encodeURI(`${source.staticURL}${data.thumbnail}`) ?? '',
            title: createIconText({
                text: data.title  ?? ''
            })
        }))
    }
        return items
    }

    async parseChapterDetails($: CheerioSelector, mangaId: string, chapterId: string,source: any): Promise<ChapterDetails> {
        let pages: string[] = []

        var nextData = $("script#__NEXT_DATA__").get(0).children[0].data
        var nextJson = JSON.parse(nextData)
        var buildId = nextJson.buildId

        var dataResponse = await this.ChapterDetailsApiRequest(buildId,mangaId,chapterId,source)

        var dataJson = JSON.parse(dataResponse)
        var comic = dataJson.pageProps.series
        var chapterIdV = chapterId.substringAfterLast('/').substringBeforeFirst('#')
        var chapter = comic.chapters.map((x: any)=>{
            if(x.id == chapterIdV) return x
        })
        if(!chapter) throw new Error('Chapter data not found in website.')
        var info = JSON.parse(JSON.stringify(chapter),(_k, v) => Array.isArray(v) ? v.filter(e => e !== null) : v)
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
        var chapterId = chapterI.substringAfterLast('/').substringBeforeFirst('#')
        const options = createRequestObject({
            url: `${source.baseUrl}/_next/data/${buildId}/series/${mangaId}/${chapterId}.json`,
            method: 'GET'
        });
        let response = await source.requestManager.schedule(options, 1);
        return response.data
    }
    parseChapters(VoyceD: VoyceChapterData, mangaId: string, _source: any): Chapter[] {
        var data = VoyceD.data.voyce_series[0]
        const chapters: Chapter[] = [];
        let sortingIndex = 0
        for (const obj of data?.chapters ?? []) {
            var url = `${data?.slug}/${obj.id}#comic` ?? '';
            var name = obj.title ?? 'No Chpater Name';
            var release_date = obj.created_at;
            const chapNum = Number(name.match(/\D*(\d*\-?\d*)\D*$/)?.pop()?.replace(/-/g, '.'))
            chapters.push(createChapter({
            id: encodeURI(url), 
            mangaId: mangaId,
            name: name, 
            chapNum: isNaN(chapNum) ? 0 : chapNum,
            time: new Date(release_date),
            langCode: LanguageCode.ENGLISH,
            // @ts-ignore
            sortingIndex
        }));
        sortingIndex--
        }
        const key = "name"
        const arrayUniqueByKey = [...new Map(chapters.map(item =>
            [item[key], item])).values()];
        return arrayUniqueByKey
    }

    parseMangaDetails(VoyceD: VoyceMangaData, mangaId: string, source: any): Manga {
        var details = VoyceD.data.voyce_series[0]
        const title = details?.title ?? '';
        const image = encodeURI(source.staticURL + details?.thumbnail) ?? 'https://paperback.moe/icons/logo-alt.svg';
        let desc = details?.description ?? '';
        if (desc == '') desc = `No Decscription provided by the source (MangaFreak)`
        let author = details?.author?.username ?? '';
        let status = details?.status ?? '';
        const arrayTags: Tag[] = []
        for (const obj of details?.genres ?? []) {
            arrayTags.push({
                id: encodeURI(obj?.genre.title.toLocaleLowerCase()) ?? '',
                label: obj?.genre.title ?? ''
            })
        }
        const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map((x) => createTag(x)) })];

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
export {};

declare global {
    interface String {
        substringAfterLast(character:any): any
        substringBeforeFirst(substring:any): any
    }
}
String.prototype.substringAfterLast = function (character) {
    var lastIndexOfCharacter = this.lastIndexOf(character);
    return this.substring(lastIndexOfCharacter + 1, this.length + 1); //should be 39
};
String.prototype.substringBeforeFirst = function (substring) {
    var startingIndexOfSubstring = this.indexOf(substring);
    return this.substring(0, startingIndexOfSubstring);
};