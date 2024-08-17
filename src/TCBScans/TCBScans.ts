import {
    SourceManga,
    Chapter,
    ChapterDetails,
    HomeSection,
    SourceInfo,
    ContentRating,
    Request,
    Response,
    SourceIntents,
    ChapterProviding
} from '@paperback/types'

import * as cheerio from 'cheerio'

import { Parser } from './TCBScansParser'

const TCBScans_Base = 'https://tcbscans.me'
export const TCBScansInfo: SourceInfo = {
    author: 'xOnlyFadi',
    description: 'Extension that pulls manga from onepiecechapters.com',
    icon: 'icon.png',
    name: 'TCB Scans',
    version: '2.0.3',
    authorWebsite: 'https://github.com/xOnlyFadi',
    websiteBaseURL: TCBScans_Base,
    contentRating: ContentRating.EVERYONE,
    language: 'ENGLISH',
    intents: SourceIntents.HOMEPAGE_SECTIONS | SourceIntents.MANGA_CHAPTERS | SourceIntents.CLOUDFLARE_BYPASS_REQUIRED
}

export class TCBScans implements ChapterProviding {

    private readonly parser: Parser = new Parser()
    readonly requestManager = App.createRequestManager({
        requestsPerSecond: 4,
        requestTimeout: 15000,
        interceptor: {
            interceptRequest: async (request: Request): Promise<Request> => {
                request.headers = {
                    ...(request.headers ?? {}),
                    ...{
                        'referer': TCBScans_Base,
                        'user-agent': await this.requestManager.getDefaultUserAgent()
                    }
                }
                return request
            },
            interceptResponse: async (response: Response): Promise<Response> => {
                return response
            }
        }
    })

    getMangaShareUrl(mangaId: string): string {
        return `${TCBScans_Base}/mangas/${mangaId}`
    }

    async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const options = App.createRequest({
            url: `${TCBScans_Base}/projects`,
            method: 'GET'
        })
        const response = await this.requestManager.schedule(options, 1)
        const $ = cheerio.load(response.data as string)

        return this.parser.parseHomeSections($, sectionCallback)
    }

    async getMangaDetails(mangaId: string): Promise<SourceManga> {
        const options = App.createRequest({
            url: `${TCBScans_Base}/mangas/${mangaId}`,
            method: 'GET'
        })
        const response = await this.requestManager.schedule(options, 1)
        const $ = cheerio.load(response.data as string)

        return this.parser.parseMangaDetails($, mangaId)
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        const options = App.createRequest({
            url: `${TCBScans_Base}/mangas/${mangaId}`,
            method: 'GET'
        })
        const response = await this.requestManager.schedule(options, 1)
        const $ = cheerio.load(response.data as string)

        return this.parser.parseChapters($)
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const options = App.createRequest({
            url: `${TCBScans_Base}${chapterId}`,
            method: 'GET'
        })
        const response = await this.requestManager.schedule(options, 1)
        const $ = cheerio.load(response.data as string)

        return this.parser.parseChapterDetails($, mangaId, chapterId)
    }

    async getCloudflareBypassRequestAsync(): Promise<Request> {
        return App.createRequest({
            url: TCBScans_Base,
            method: 'GET',
            headers: {
                referer: `${TCBScans_Base}/`,
                'user-agent': await this.requestManager.getDefaultUserAgent()
            }
        })
    }
}
