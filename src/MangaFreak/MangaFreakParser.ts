import {Chapter,     
    ChapterDetails,
    HomeSection,
    LanguageCode, 
    Manga, 
    MangaTile, 
    Tag,
    TagSection} from "paperback-extensions-common";

export class Parser {
    private readonly chapterTitleRegex = /Chapter ([\d.]+)/i

    decodeHTMLEntity(str: string): string {
        return str.replace(/&#(\d+);/g, function (_match, dec) {
            return String.fromCharCode(dec);
        })
    }

    async parseHomeSections($: CheerioStatic,$$: CheerioStatic,sectionCallback: (section: HomeSection) => void, _source: any): Promise<void> {
        const section1 = createHomeSection({ id: '1', title: 'Latest', view_more: true})
        const section2 = createHomeSection({ id: '2', title: 'Popular', view_more: true})

        const popular : MangaTile[] = []
        const latest  : MangaTile[] = []

        const arrLatest = $('div.latest_releases_item').toArray()
        const arrPopular = $$('div.ranking_item').toArray()



        for (const obj of arrLatest) {
            const info = $("a",obj)
            const id = info.attr('href')?.replace(/\/manga\//gi,"") ?? ''
            const title = info.text() ?? ''
            const image = this.getImageSrc($('img', obj)).replace('mini','manga').substringBeforeLast('/') + ".jpg" ?? ''
            latest.push(
                createMangaTile({
                    id,
                    image,
                    title: createIconText({ text:  this.decodeHTMLEntity(title) }),
                })
            )
        }
        section1.items = latest
        sectionCallback(section1)

        for (const obj of arrPopular) {
            const info = $$('a',obj)
            const id = info.attr("href")?.replace(/\/manga\//gi,"") ?? ''
            const title = info.text() ?? ''
            const image = this.getImageSrc($$('img', obj)) ?? ''
            popular.push(
                createMangaTile({
                    id,
                    image,
                    title: createIconText({ text:  this.decodeHTMLEntity(title) }),
                })
            )
        }
        section2.items = popular
        sectionCallback(section2)
    }

    parseChapterDetails($: CheerioSelector, mangaId: string, chapterId: string): ChapterDetails {
        let pages: string[] = []

        for (let obj of $("img#gohere").toArray()) {
            let page = $(obj).attr('src') ?? $(obj).attr('data-src') ?? '';
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

    findTextAndReturnRemainder(target: any, variable: any){
        var chopFront = target.substring(target.search(variable)+variable.length,target.length);
        var result = chopFront.substring(0,chopFront.search(";"));
        return result;
    }

    parseChapters($: CheerioStatic, mangaId: string, _source: any): Chapter[] {
        const chapters: Chapter[] = [];
        let lastNumber: number | null = null;
        const arrChapters = $('div.manga_series_list tr:has(a)').toArray()
        for (const obj of arrChapters) {
            var url = $("a",obj).attr('href') ?? '';
            var name = $('td',obj).eq(0).text().trim() ?? 'No Chpater Name';
            var release_date = $("td", obj).eq(1).text();
            const match = name.match(this.chapterTitleRegex);
            let chapNum;
            if (match && !isNaN(Number(match[1]))) {
                chapNum = Number(match[1])
            } else {
            if (lastNumber === null) {
                chapNum = 0;
            } else {
                chapNum = Number((lastNumber + 0.001).toFixed(3))
            }
            }
            lastNumber = chapNum
            chapters.push(createChapter({
            id: encodeURI(url), 
            mangaId: mangaId,
            name: this.encodeText(name), 
            chapNum: chapNum ?? 0,
            time: new Date(release_date),
            langCode: LanguageCode.ENGLISH
        }));
        }
        return chapters
    }

    parseMangaDetails($: CheerioStatic, mangaId: string, source: any): Manga {
        const title = $('div.manga_series_data h5').first().text().trim() ?? '';
        const image = this.getImageSrc($('div.manga_series_image img')) ?? 'https://paperback.moe/icons/logo-alt.svg';
        let desc = $("div.manga_series_description p").text().trim() ?? '';
        if (desc == '') desc = `No Decscription provided by the source (MangaFreak)`
        let author = $("div.manga_series_data > div").eq(2).text().trim() ?? '';
        let artist = $("div.manga_series_data > div").eq(3).text().trim() ?? '';
        let status = $("div.manga_series_data > div").eq(1).text().trim() ?? '';
        const arrayTags: Tag[] = []
        const genres = $('div.series_sub_genre_list a').toArray();
        for (const obj of genres) {
            arrayTags.push({
                id: $(obj)?.attr('href')?? '',
                label: $(obj).text() ?? ''
            })
        }
        const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map((x) => createTag(x)) })];

        return createManga({
            id: mangaId,
            titles: [this.decodeHTMLEntity(title)],
            image,
            status: source.parseStatus(status),
            author: this.decodeHTMLEntity(author),
            artist: this.decodeHTMLEntity(artist),
            tags: tagSections,
            desc,
        })
    }

    parseTags($: CheerioStatic) {
        const genres: Tag[] = [];
        for (const obj of $(".main .select_genre div[id='genrebox'] div").toArray()) {
            genres.push(createTag({
                id: encodeURI($(obj).text().trim()),
                label: $(obj).text().trim()
            }));
        }
        return genres;
    }
    parseSearchResults($: CheerioSelector, _source: any): MangaTile[] {
        const results: MangaTile[] = []
            for (const obj of $('div.manga_search_item , div.mangaka_search_item').toArray()) {
                const info = $('h3 a, h5 a',obj)
                const id = info.attr("href")?.replace(/\/manga\//gi,"") ?? ''
                const title = info.text() ?? ''
                const image = this.getImageSrc($('img', obj)) ?? ''
                results.push(
                    createMangaTile({
                        id,
                        image,
                        title: createIconText({ text:  this.decodeHTMLEntity(title) }),
                    })
                )
            }
        return results
    }

    ViewMoreParse($: CheerioSelector, _source: any, isPopular: Boolean): MangaTile[] {
        const results: MangaTile[] = []
        if(isPopular){
            for (const obj of $('div.ranking_item').toArray()) {
                const info = $('a',obj)
                const id = info.attr("href") ?? ''
                const title = info.text() ?? ''
                const image = this.getImageSrc($('img', obj)) ?? ''
                if(id){
                results.push(
                    createMangaTile({
                        id,
                        image,
                        title: createIconText({ text: this.decodeHTMLEntity(title) }),
                    })
                )
            }
        }
        } else {
            for (const obj of $('div.latest_releases_item').toArray()) {
                const info = $("a",obj)
                const id = info.attr('href')?.replace(/\/manga\//gi,"") ?? ''
                const title = info.text() ?? ''
                const image = this.getImageSrc($('img', obj))?.replace('mini','manga').substringBeforeLast('/') + ".jpg" ?? ''
                results.push(
                    createMangaTile({
                        id,
                        image,
                        title: createIconText({ text:  this.decodeHTMLEntity(title) }),
                    })
                )
            }
        }
        return results
    }

    NextPage($: CheerioSelector) {
        var nextPage = $('a.next_p');
        if (nextPage.contents().length !== 0) {
            return true;
        } else {
            return false;
        }
    }
    encodeText(str: string) {
        return str.replace(/&#([0-9]{1,4});/gi, (_, numStr) => {
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
}
export {};

declare global {
    interface String {
        substringBeforeLast(character:any): any
        substringAfterFirst(substring:any): any
    }
}
String.prototype.substringBeforeLast = function (character) {
    var lastIndexOfCharacter = this.lastIndexOf(character);
    return this.substring(0, lastIndexOfCharacter);
};
String.prototype.substringAfterFirst = function (substring) {
    var startingIndexOfSubstring = this.indexOf(substring);
    var endIndexOfSubstring = startingIndexOfSubstring + substring.length - 1;
    return this.substring(endIndexOfSubstring + 1, this.length);
};