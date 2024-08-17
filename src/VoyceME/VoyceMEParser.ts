import {
    Chapter,
    ChapterDetails,
    HomeSection,
    HomeSectionType,
    SourceManga,
    PartialSourceManga,
    Tag,
    TagSection
} from '@paperback/types'

import {
    SearchData,
    VoyceMangaData,
    VoyceChapterData,
    SearchType,
    VoyceChapterDetailsData,
    HomePageData
} from './VoyceMEHelper'

import { decodeHTML } from 'entities'
import { convert } from 'html-to-text'

export class Parser {
    private readonly staticURL: string = 'https://dlkfxmdtxtzpb.cloudfront.net'

    parseSearch(VoyceD: SearchData): PartialSourceManga[] {
        const items: PartialSourceManga[] = []

        for(const data of VoyceD.data.voyce_series){
            const id = data?.id ?? ''
            const title = data?.title?.trim() ?? ''
            const image = data?.thumbnail ? encodeURI(`${this.staticURL}/${data?.thumbnail}`) : ''

            if(!id) continue

            items.push(App.createPartialSourceManga({
                image,
                title: title,
                mangaId: `${id}`
            }))
        }

        return items
    }

    parseHomeSections(data: HomePageData, sectionCallback: (section: HomeSection) => void): void {
        const sections = [
            {
                data: data.data.featured,
                section: App.createHomeSection({
                    id: 'featured',
                    title: 'Featured Series',
                    containsMoreItems: true,
                    type: HomeSectionType.featured
                })
            },
            {
                data: data.data.popular,
                section: App.createHomeSection({
                    id: 'popular',
                    title: 'Popular Series',
                    containsMoreItems: true,
                    type: HomeSectionType.singleRowNormal
                })
            },
            {
                data: data.data.trending,
                section: App.createHomeSection({
                    id: 'trending',
                    title: 'Trending Series',
                    containsMoreItems: true,
                    type: HomeSectionType.singleRowNormal
                })
            },
            {
                data: data.data.recommended,
                section: App.createHomeSection({
                    id: 'recommended',
                    title: 'Recommended Series',
                    containsMoreItems: true,
                    type: HomeSectionType.singleRowNormal
                })
            },
            {
                data: data.data.recent,
                section: App.createHomeSection({
                    id: 'recent',
                    title: 'Recent Episodes',
                    containsMoreItems: true,
                    type: HomeSectionType.singleRowNormal
                })
            },
            {
                data: data.data.fresh,
                section: App.createHomeSection({
                    id: 'fresh',
                    title: 'Fresh Series',
                    containsMoreItems: true,
                    type: HomeSectionType.singleRowNormal
                })
            }
        ]
        for (const section of sections) {
            const mangaItemsArray: PartialSourceManga[] = []
            const collectedIds: number[] = []

            for (const manga of section.data) {
                const title = manga?.title ?? ''
                const id = manga?.id ?? ''
                const image = manga?.thumbnail ? encodeURI(`${this.staticURL}/${manga.thumbnail}`) : ''
                const subtitle = manga?.chapter_count ? `${manga?.chapter_count} Chapters` : ''

                if (!id || collectedIds.includes(id)) continue

                mangaItemsArray.push(App.createPartialSourceManga({
                    title: title,
                    image: image,
                    mangaId: `${id}`,
                    subtitle: subtitle
                }))
                collectedIds.push(id)
            }
            section.section.items = mangaItemsArray
            sectionCallback(section.section)
        }
    }

    parseViewMore(homepageSectionId: string, data: HomePageData): PartialSourceManga[] {
        const collectedIds: number[] = []
        const mangaItemsArray: PartialSourceManga[] = []

        let mangaData
        switch (homepageSectionId) {
            case 'popular':
                mangaData = data.data.popular
                break
            case 'trending':
                mangaData = data.data.trending
                break
            case 'recommended':
                mangaData = data.data.recommended
                break
            case 'recent':
                mangaData = data.data.recent
                break
            case 'fresh':
                mangaData = data.data.fresh
                break
        }

        if(mangaData){
            for (const manga of mangaData) {
                const title = manga?.title ?? ''
                const id = manga?.id ?? ''
                const image = manga?.thumbnail ? encodeURI(`${this.staticURL}/${manga.thumbnail}`) : ''
                const subtitle = manga?.chapter_count ? `${manga?.chapter_count} Chapters` : ''

                if (!id || collectedIds.includes(id)) continue

                mangaItemsArray.push(App.createPartialSourceManga({
                    title: title,
                    image: image,
                    mangaId: `${id}`,
                    subtitle: subtitle
                }))
                collectedIds.push(id)
            }
        }

        return mangaItemsArray
    }

    parseMangaDetails(VoyceD: VoyceMangaData, mangaId: string): SourceManga {
        const details = VoyceD.data.series[0]

        const title = details?.title.trim() ?? ''
        const image = details?.thumbnail ? encodeURI(`${this.staticURL}/${details?.thumbnail}`) : ''

        let desc = details?.description ?? ''
        if (desc == '') desc = 'No Decscription provided by the source (VoyceME)'

        const author = details?.author?.username ?? ''
        const status = details?.status ?? ''

        const arrayTags: Tag[] = []
        for (const obj of details?.genres ?? []) {
            const id = obj.genre.id ?? ''
            const title = obj?.genre.title.trim() ?? ''

            if (!id || !title) continue

            arrayTags.push({
                id: `genre.${id}`,
                label: title
            })
        }

        return App.createSourceManga({
            id: mangaId,
            mangaInfo: App.createMangaInfo({
                titles: [decodeHTML(title)],
                image,
                status: this.parseStatus(status),
                author: decodeHTML(author),
                tags: [App.createTagSection({ id: '0', label: 'genres', tags: arrayTags.map((x) => App.createTag(x)) })],
                desc: convert(decodeHTML(desc), { wordwrap: 130 })
            })
        })
    }

    parseChapters(VoyceD: VoyceChapterData): Chapter[] {
        const chapters: Chapter[] = []
        const data = VoyceD?.data?.series[0]
        let sortingIndex = 0

        for (const obj of data?.chapters ?? []) {
            const id = obj.id ?? ''
            const name = obj.title ?? 'No Chpater Name'
            const release_date = obj.created_at
            const chapNum = Number(name.match(/\d+/)?.pop()?.replace(/-/g, '.'))

            if (!id) continue

            chapters.push(App.createChapter({
                id: `${id}`,
                name: name,
                chapNum: isNaN(chapNum) ? 0 : chapNum,
                time: new Date(release_date),
                langCode: '🇬🇧',
                sortingIndex
            }))
            sortingIndex--
        }

        const chaps = chapters.map(chapter => {
            chapter.sortingIndex += chapters.length
            return App.createChapter(chapter)

        })

        const key = 'name'
        const arrayUniqueByKey = [...new Map(chaps.map(item => [item[key], item])).values()]
        return arrayUniqueByKey
    }

    async parseChapterDetails(data: VoyceChapterDetailsData, mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const pages: string[] = []

        for(const page of data.data.images){
            const url = page?.image ?? ''

            if(!url) continue

            pages.push(encodeURI(`${this.staticURL}/${url}`))
        }
        return App.createChapterDetails({
            id: chapterId,
            mangaId: mangaId,
            pages: pages
        })
    }
    parseTags(data: SearchType): TagSection[] {
        const Genres: Tag[] = []

        for(const genre of data.data.genres){
            const id = genre?.id ?? ''
            const label = genre?.title ?? ''

            if(!id || !label) continue

            Genres.push({
                id: `genre.${id}`,
                label
            })
        }

        const Types: Tag[] = []

        for(const type of data.data.types){
            const id = type?.id ?? ''
            const label = type?.title ?? ''

            if(!id || !label) continue

            if(label.toLowerCase().includes('novel')) continue

            Types.push({
                id: `types.${id}`,
                label
            })
        }

        const Category: Tag[] = [
            {
                id: 'category.1',
                label: 'Originals'
            }
        ]

        const Status: Tag[] = [
            {
                id: 'status.ongoing',
                label: 'Ongoing'
            },
            {
                id: 'status.completed',
                label: 'Completed'
            }
        ]

        return [
            App.createTagSection({ id: 'genres', label: 'Genres', tags: Genres.map((x) => App.createTag(x)) }),
            App.createTagSection({ id: 'category', label: 'Category', tags: Category.map((x) => App.createTag(x)) }),
            App.createTagSection({ id: 'types', label: 'Types', tags: Types.map((x) => App.createTag(x)) }),
            App.createTagSection({ id: 'status', label: 'Status', tags: Status.map((x) => App.createTag(x)) })
        ]
    }
    parseStatus(str: string): string {
        let status = 'ONGOIG'
        switch (str.toLowerCase()) {
            case 'ongoing':
            case 'on-going':
                status = 'ONGOIG'
                break
            case 'completed':
                status = 'ONGOIG'
                break
        }
        return status
    }
}
