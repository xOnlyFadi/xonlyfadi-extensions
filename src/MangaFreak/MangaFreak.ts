import {
    PagedResults,
    Source,
    Manga,
    Chapter,
    ChapterDetails,
    HomeSection,
    SearchRequest,
    SourceInfo,
    MangaStatus,
    ContentRating,
    TagSection,
    LanguageCode,
    Request,
    Response,
    TagType
} from "paperback-extensions-common"

import {Parser} from "./MangaFreakParser";
const MangaFreak_Base = "https://w13.mangafreak.net"

export const MangaFreakInfo: SourceInfo = {
    author: 'xOnlyFadi',
    description: 'Extension that pulls manga from mangafreak.net',
    icon: 'icon.png',
    name: 'MangaFreak',
    version: '1.0.0',
    authorWebsite: 'https://github.com/xOnlyFadi',
    websiteBaseURL: MangaFreak_Base,
    contentRating: ContentRating.EVERYONE,
    language: LanguageCode.ENGLISH,
    sourceTags: [
        {
            text: "Cloudflare",
            type: TagType.RED
        }
    ]
}

export abstract class MangaFreak extends Source {
    private readonly parser: Parser = new Parser();

    readonly requestManager = createRequestManager({
        requestsPerSecond: 3,
        requestTimeout: 30000,
        interceptor: {
            interceptRequest: async (request: Request): Promise<Request> => {

                request.headers = {
                    ...(request.headers ?? {}),
                    ...{
                        'user-agent': `Mozilla/5.0 (iPhone; CPU iPhone OS 15_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile/15E148 Safari/604.1`,
                        'referer': MangaFreak_Base
                    }
                }

                return request
            },

            interceptResponse: async (response: Response): Promise<Response> => {
                return response
            }
        }
    })
    override getMangaShareUrl(mangaId: string): string {
        return `${MangaFreak_Base}/Manga/${mangaId}`
    }
    override getCloudflareBypassRequest() {
            return createRequestObject({
            url: `${MangaFreak_Base}/Genre/All/1`,
            method: 'GET',
            headers: {
                'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile/15E148 Safari/604.1',
            }
        });
    }

    override async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        let options = createRequestObject({
            url: `${MangaFreak_Base}/Latest_Releases/1`,
            method: 'GET'
        });
        let response = await this.requestManager.schedule(options, 1);
        const $ = this.cheerio.load(response.data);
        options = createRequestObject({
            url: `${MangaFreak_Base}/Genre/All/1`,
            method: 'GET'
        });
        response = await this.requestManager.schedule(options, 1);
        const $$ = this.cheerio.load(response.data)
        this.CloudFlareError(response.status)
        return this.parser.parseHomeSections($, $$,sectionCallback, this)
    }

    override async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        let page = metadata?.page ?? 1
        if (page == -1) return createPagedResults({ results: [], metadata: { page: -1 } })
        let param = ''
        let isPop: Boolean = false
        switch (homepageSectionId) {
            case '1':
                param = `/Latest_Releases/${page}`
                isPop = false
                break
            case '2':
                param = `/Genre/All/${page}`
                isPop = true
                break
            default:
                throw new Error(`Invalid homeSectionId | ${homepageSectionId}`)
        }
        const request = createRequestObject({
            url: `${MangaFreak_Base}${param}`,
            method: 'GET',
        })

        const response = await this.requestManager.schedule(request, 1)
        const $ = this.cheerio.load(response.data)
        const manga = this.parser.ViewMoreParse($, this,isPop)

        page++
        if (!this.parser.NextPage($)) page = -1
        return createPagedResults({
            results: manga,
            metadata: { page: page }
        })
    }

    override async getSearchTags(): Promise<TagSection[]> {
        const options = createRequestObject({
            url: `${MangaFreak_Base}/Search`,
            method: 'GET'
        });
        let response = await this.requestManager.schedule(options, 1);
        this.CloudFlareError(response.status)
        let $ = this.cheerio.load(response.data);
        return [createTagSection({
            id: "1",
            label: "Genres",
            tags: this.parser.parseTags($)
        })];
    }

    async getMangaDetails(mangaId: string): Promise<Manga> {
        const options = createRequestObject({
            url: `${MangaFreak_Base}/Manga/${mangaId}`,
            method: 'GET',
        });
        let response = await this.requestManager.schedule(options, 1);
        this.CloudFlareError(response.status)
        let $ = this.cheerio.load(response.data);
        return this.parser.parseMangaDetails($, mangaId,this);
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        const options = createRequestObject({
            url: `${MangaFreak_Base}/Manga/${mangaId}`,
            method: 'GET'
        });
        let response = await this.requestManager.schedule(options, 1);
        this.CloudFlareError(response.status)
        let $ = this.cheerio.load(response.data);
        return this.parser.parseChapters($, mangaId, this);
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const options = createRequestObject({
            url: `${MangaFreak_Base}${chapterId}`,
            method: 'GET'
        });
        let response = await this.requestManager.schedule(options, 1);
        this.CloudFlareError(response.status)
        let $ = this.cheerio.load(response.data);
        return this.parser.parseChapterDetails($, mangaId, chapterId)
    }

    async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        let page = metadata?.page ?? 1
        if (page == -1) return createPagedResults({ results: [], metadata: { page: -1 } })
        const request = this.constructSearchRequest(page, query)
        const data = await this.requestManager.schedule(request, 2)
        this.CloudFlareError(data.status)
        const $ = this.cheerio.load(data.data)
        const manga = this.parser.parseSearchResults($, this)

        page++
        if (!this.parser.NextPage($)) page = -1

        return createPagedResults({
            results: manga,
            metadata: { page: page },
        })
    }

    constructSearchRequest(_page: number, query: SearchRequest): any {
        if (!this.isEmpty(query?.title)){
        if(query.includedTags?.length === 0){
            return createRequestObject({
                url: `${MangaFreak_Base}/Search/${this.normalizeSearchQuery(query?.title)}`,
                method: 'GET',
            })   
        } else {
        var url = MangaFreak_Base;
        if (!this.isEmpty(query?.title)){
            url += `/Search/${this.normalizeSearchQuery(query?.title)}`
        }
        url += '/Genre/'
        var getGenresOrderedKeyList = this.getGenresKeyList();
        var selectedGenreKey = query?.includedTags?.map((x: any) => x.id).toString()
        var selectedGenreKeys = selectedGenreKey?.split(',')
            for(var genreKeyIndex=0; genreKeyIndex<getGenresOrderedKeyList.length; genreKeyIndex++){
                if(selectedGenreKeys?.includes(getGenresOrderedKeyList[genreKeyIndex] ?? '')){
                url += '1'
            } else {
                url += '0'
            }
        }
        url += "/Status/0/Type/0"
        return createRequestObject({
            url: url,
            method: 'GET',
        })
    }
} else {
    throw Error('please search with a title otherwise the search with genres will not work')
}
    }

    normalizeSearchQuery(query: any) {
        var query = query.toLowerCase();
        query = query.replace(/[àáạảãâầấậẩẫăằắặẳẵ]+/g, "a");
        query = query.replace(/[èéẹẻẽêềếệểễ]+/g, "e");
        query = query.replace(/[ìíịỉĩ]+/g, "i");
        query = query.replace(/[òóọỏõôồốộổỗơờớợởỡ]+/g, "o");
        query = query.replace(/[ùúụủũưừứựửữ]+/g, "u");
        query = query.replace(/[ỳýỵỷỹ]+/g, "y");
        query = query.replace(/[đ]+/g, "d");
        query = query.replace(/ /g,"+");
        query = query.replace(/%20/g, "+");
        return query;
        
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
    getGenresKeyList(){
        return [
            "Act",
            "Adult",
            "Adventure",
            "Animated",
            "Comedy",
            "Demons",
            "Drama",
            "Ecchi",
            "Fantasy",
            "Gender%20Bender",
            "Harem",
            "Ancients",
            "Horror",
            "Josei",
            "Magic",
            "Manhwa",
            "Martial%20Arts",
            "Mature",
            "Mecha",
            "Military",
            "Mystery",
            "One%20Shot",
            "Psychological",
            "Romance",
            "School%20Life",
            "Sci%20Fi",
            "Sci%20Fi%20Shounen",
            "Sci%20Fim",
            "Seinen",
            "Shotacon",
            "Shoujo",
            "Shoujo%20Ai",
            "Shoujoai",
            "Shounen",
            "Shounen%20Ai",
            "Shounenai",
            "Slice%20Of%20Life",
            "Smut",
            "Sports",
            "Super%20Power",
            "Superhero",
            "Supernatural",
            "Tragedy",
            "Vampire",
            "Yaoi",
            "Yuri"
         ]
    }
    CloudFlareError(status: any) {
        if(status == 503) {
            throw new Error('CLOUDFLARE BYPASS ERROR:\nPlease go to Settings > Sources > MangaFreak and press Cloudflare Bypass or press the Cloud image on the right')
        }
    }
    isEmpty(str: any) {
        return (!str || 0 === str.length);
    }
}