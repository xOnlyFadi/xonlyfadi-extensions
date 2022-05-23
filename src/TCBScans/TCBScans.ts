import {
    PagedResults,
    Source,
    Manga,
    Chapter,
    ChapterDetails,
    HomeSection,
    SearchRequest,
    SourceInfo,
    ContentRating,
    LanguageCode,
    Request,
    Response,
} from "paperback-extensions-common"

import {Parser} from "./TCBScansParser";
const TCBScans_Base = "https://onepiecechapters.com"

export const TCBScansInfo: SourceInfo = {
    author: 'xOnlyFadi',
    description: 'Extension that pulls manga from onepiecechapters.com',
    icon: 'icon.png',
    name: 'TCB Scans',
    version: '1.0.1',
    authorWebsite: 'https://github.com/xOnlyFadi',
    websiteBaseURL: TCBScans_Base,
    contentRating: ContentRating.EVERYONE,
    language: LanguageCode.ENGLISH,
}

export abstract class TCBScans extends Source {
    private readonly parser: Parser = new Parser();

    readonly requestManager = createRequestManager({
        requestsPerSecond: 3,
        requestTimeout: 15000,
        interceptor: {
            interceptRequest: async (request: Request): Promise<Request> => {

                request.headers = {
                    ...(request.headers ?? {}),
                    ...{
                        'referer': TCBScans_Base
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
        return `${TCBScans_Base}/mangas/${mangaId}`
    }

    override async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        let options = createRequestObject({
            url: `${TCBScans_Base}/projects`,
            method: 'GET'
        });
        let response = await this.requestManager.schedule(options, 1);
        const $ = this.cheerio.load(response.data);
        return this.parser.parseHomeSections($,sectionCallback, this)
    }

    async getMangaDetails(mangaId: string): Promise<Manga> {
        const options = createRequestObject({
            url: `${TCBScans_Base}/mangas/${mangaId}`,
            method: 'GET',
        });
        let response = await this.requestManager.schedule(options, 1);
        let $ = this.cheerio.load(response.data);
        return this.parser.parseMangaDetails($, mangaId,this);
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        const options = createRequestObject({
            url: `${TCBScans_Base}/mangas/${mangaId}`,
            method: 'GET'
        });
        let response = await this.requestManager.schedule(options, 1);
        let $ = this.cheerio.load(response.data);
        return this.parser.parseChapters($, mangaId, this);
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const options = createRequestObject({
            url: `${TCBScans_Base}${chapterId}`,
            method: 'GET'
        });
        let response = await this.requestManager.schedule(options, 1);
        let $ = this.cheerio.load(response.data);
        return this.parser.parseChapterDetails($, mangaId, chapterId)
    }

    async getSearchResults(_query: SearchRequest, _metadata: any): Promise<PagedResults> {
        return createPagedResults({
            results: [],
        })
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
}