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
    LanguageCode,
    Request,
    Response,
    HomeSectionType
} from "paperback-extensions-common"
import {LatestQuery,popularQuery,Top5Query,SearchQuery,MangaDetailQuery,ChapterDetailQuery} from "./VoyceMEGraphQL"
import {Parser} from "./VoyceMEParser";
const VoyceME_Base = "http://voyce.me"

export const VoyceMEInfo: SourceInfo = {
    author: 'xOnlyFadi',
    description: 'Extension that pulls manga from voyce.me',
    icon: 'icon.png',
    name: 'Voyce.Me',
    version: '1.0.0',
    authorWebsite: 'https://github.com/xOnlyFadi',
    websiteBaseURL: VoyceME_Base,
    contentRating: ContentRating.EVERYONE,
    language: LanguageCode.ENGLISH,
}

export abstract class VoyceME extends Source {
    private readonly parser: Parser = new Parser();
    private readonly graphqlURL: string = 'https://graphql.voyce.me/v1/graphql';
    private readonly staticURL: string = 'https://dlkfxmdtxtzpb.cloudfront.net/';
    private readonly baseUrl: string = VoyceME_Base
    private readonly popularPerPage: Number = 10;
    readonly requestManager = createRequestManager({
        requestsPerSecond: 3,
        requestTimeout: 15000,
        interceptor: {
            interceptRequest: async (request: Request): Promise<Request> => {

                request.headers = {
                    ...(request.headers ?? {}),
                    ...{
                        'Accept': '*/*',
                        'Referer': `${VoyceME_Base}/`,
                        'Origin': VoyceME_Base,
                        'content-type': 'application/json',
                        'accept': 'application/json',
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
        return `${VoyceME_Base}/series/${mangaId}`
    }

    override async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const sections = [
        {
            request: createRequestObject({
                url: this.graphqlURL,
                method: 'POST',
                data: Top5Query()
            }),
            section: createHomeSection({
                id: '0',
                title: 'Top 5 Series',
                type: HomeSectionType.featured,
            }),
        },
        {
            request: createRequestObject({
                url: this.graphqlURL,
                method: 'POST',
                data: LatestQuery(1,this)
            }),
            section: createHomeSection({
                id: '1',
                title: 'Latest Updates',
                view_more: true,
            }),
        },
        {
            request: createRequestObject({
                url: this.graphqlURL,
                method: 'POST',
                data: popularQuery(1,this)
            }),
            section: createHomeSection({
                id: '2',
                title: 'Popular Series',
                view_more: true,
            }),
        },
        ]
        const promises: Promise<void>[] = []
        for (const section of sections) {
            sectionCallback(section.section)
            promises.push(
                this.requestManager.schedule(section.request, 1).then(response => {
                                const json_data = (typeof response.data == 'string') ? JSON.parse(response.data) : response.data
                    section.section.items = this.parser.parseHomeSections(json_data, this)
                    sectionCallback(section.section)
                }),
            )

        }
        await Promise.all(promises)
    }

    override async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        let page = metadata?.page ?? 1
        if (page == -1) return createPagedResults({ results: [], metadata: { page: -1 } })
        let graph
        switch (homepageSectionId) {
            case '1':
                graph = LatestQuery(page,this)
                break
            case '2':
                graph = popularQuery(page,this)
                break
            default:
                throw new Error(`Invalid homeSectionId | ${homepageSectionId}`)
        }
        const request = createRequestObject({
            url: this.graphqlURL,
            method: 'POST',
            data: graph
        })

        const response = await this.requestManager.schedule(request, 1)
        const json_data = (typeof response.data == 'string') ? JSON.parse(response.data) : response.data
        const manga = this.parser.parseHomeSections(json_data, this)

        page++
        if (manga.length !== this.popularPerPage) page = -1
        return createPagedResults({
            results: manga,
            metadata: { page: page }
        })
    }

    async getMangaDetails(mangaId: string): Promise<Manga> {
        const options = createRequestObject({
            url: this.graphqlURL,
            method: 'POST',
            data: MangaDetailQuery(mangaId)
        });
        let response = await this.requestManager.schedule(options, 1);
        const json_data = (typeof response.data == 'string') ? JSON.parse(response.data) : response.data
        return this.parser.parseMangaDetails(json_data, mangaId,this);
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        const options = createRequestObject({
            url: this.graphqlURL,
            method: 'POST',
            data: ChapterDetailQuery(mangaId)
        });
        let response = await this.requestManager.schedule(options, 1);
        const json_data = (typeof response.data == 'string') ? JSON.parse(response.data) : response.data
        return this.parser.parseChapters(json_data, mangaId, this);
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const options = createRequestObject({
            url: `${VoyceME_Base}/series/${chapterId}`,
            method: 'GET'
        });
        let response = await this.requestManager.schedule(options, 1);
        let $ = this.cheerio.load(response.data);
        return this.parser.parseChapterDetails($, mangaId, chapterId,this)
    }

    async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        let page = metadata?.page ?? 1
        if (page == -1) return createPagedResults({ results: [], metadata: { page: -1 } })
        if(!query.title) return createPagedResults({ results: [], metadata: { page: -1 } })
        const request = createRequestObject({
            url: this.graphqlURL,
            method: 'POST',
            data: SearchQuery(this.normalizeSearchQuery(query.title) ?? '',page,this)
        });
        const response = await this.requestManager.schedule(request, 2)
        const json_data = (typeof response.data == 'string') ? JSON.parse(response.data) : response.data
        const manga = this.parser.parseHomeSections(json_data, this)

        page++
        if (manga.length !== this.popularPerPage) page = -1

        return createPagedResults({
            results: manga,
            metadata: { page: page },
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
        query = query.replace(/ /g," ");
        query = query.replace(/%20/g, " ");
        query = query.replace(/_/g," ");
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
}
