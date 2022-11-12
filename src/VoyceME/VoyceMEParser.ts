/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    Chapter,     
    ChapterDetails,
    HomeSection,
    HomeSectionType,
    LanguageCode, 
    Manga, 
    MangaStatus, 
    MangaTile, 
    Tag,
    TagSection
} from 'paperback-extensions-common'

import {
    SearchData,
    VoyceMangaData,
    VoyceChapterData,
    SearchType,
    VoyceChapterDetailsData,
    HomePageData
} from './VoyceMEHelper'

import {decodeHTML} from 'entities'

import {convert} from 'html-to-text'

import '../scopes'

export class Parser {

    private readonly staticURL: string = 'https://dlkfxmdtxtzpb.cloudfront.net'

    decodeHTMLEntity(str: string): string {
        return str.replace(/&#(\d+)/g, (_match, dec) => {
            return String.fromCharCode(dec)
        })
    }

    parseSearch(VoyceD: SearchData): MangaTile[] {
        const items: MangaTile[] = []

        for(const data of VoyceD?.data?.voyce_series){
            const id = data?.id ?? ''
            const title = data?.title?.trim() ?? ''
            const image = data?.thumbnail ? encodeURI(`${this.staticURL}/${data?.thumbnail}`) : ''

            if(!id) continue

            items.push(createMangaTile({
                id: `${id}`,
                image,
                title: createIconText({ text: title })
            }))
        }

        return items
    }
    
    parseHomeSections(data: HomePageData, sectionCallback: (section: HomeSection) => void): void {
        const sections = [
            {
                data: data.data.featured,
                section: createHomeSection({
                    id: 'featured',
                    title: 'Featured Series',
                    view_more: true,
                    type: HomeSectionType.featured
                })
            },
            {
                data: data.data.popular,
                section: createHomeSection({
                    id: 'popular',
                    title: 'Popular Series',
                    view_more: true,
                    type: HomeSectionType.singleRowNormal
                })
            },
            {
                data: data.data.trending,
                section: createHomeSection({
                    id: 'trending',
                    title: 'Trending Series',
                    view_more: true,
                    type: HomeSectionType.singleRowNormal
                })
            },
            {
                data: data.data.recommended,
                section: createHomeSection({
                    id: 'recommended',
                    title: 'Recommended Series',
                    view_more: true,
                    type: HomeSectionType.singleRowNormal
                })
            },
            {
                data: data.data.recent,
                section: createHomeSection({
                    id: 'recent',
                    title: 'Recent Episodes',
                    view_more: true,
                    type: HomeSectionType.singleRowNormal
                })
            },
            {
                data: data.data.fresh,
                section: createHomeSection({
                    id: 'fresh',
                    title: 'Fresh Series',
                    view_more: true,
                    type: HomeSectionType.singleRowNormal
                })
            }
        ]
        
        for (const section of sections) {
            const mangaItemsArray: MangaTile[] = []
            const collectedIds: number[] = []

            for (const manga of section.data) {
                const title = manga?.title ?? ''
                const id = manga?.id ?? ''
                const image = manga?.thumbnail ? encodeURI(`${this.staticURL}/${manga.thumbnail}`) : ''
                const subtitle = manga?.chapter_count ? `${manga?.chapter_count} Chapters` : ''
    
                if (!id || collectedIds.includes(id)) continue

                mangaItemsArray.push(createMangaTile({
                    id: `${id}`,
                    title: createIconText({ text: title }),
                    subtitleText: createIconText({ text: subtitle }),
                    image: image
                }))
                collectedIds.push(id)
            }
            section.section.items = mangaItemsArray
            sectionCallback(section.section)
        }
    }

    parseViewMore(homepageSectionId: string, data: HomePageData): MangaTile[] {
        const collectedIds: number[] = []
        const mangaItemsArray: MangaTile[] = []

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
    
                mangaItemsArray.push(createMangaTile({
                    id: `${id}`,
                    title: createIconText({ text: title }),
                    subtitleText: createIconText({ text: subtitle }),
                    image: image
                }))
                collectedIds.push(id)
            }
        }

        return mangaItemsArray
    }

    parseMangaDetails(VoyceD: VoyceMangaData, mangaId: string): Manga {
        const details = VoyceD.data.series.first()

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
 
        const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map((x) => createTag(x)) })]

        return createManga({
            id: mangaId,
            titles: [this.decodeHTMLEntity(title)],
            image,
            status: this.parseStatus(status),
            author: this.decodeHTMLEntity(author),
            tags: tagSections,
            desc: convert(decodeHTML(desc),{wordwrap: 130}),
        })
    }

    parseChapters(VoyceD: VoyceChapterData, mangaId: string): Chapter[] {
        const chapters: Chapter[] = []
        const data = VoyceD?.data?.series?.first()
        let sortingIndex = 0

        for (const obj of data?.chapters ?? []) {
            const id = obj.id ?? ''
            const name = obj.title ?? 'No Chpater Name'
            const release_date = obj.created_at
            const chapNum = Number(name.match(/\d+/)?.pop()?.replace(/-/g, '.'))

            if (!id) continue

            chapters.push(createChapter({
                id: `${id}`, 
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

    async parseChapterDetails(data: VoyceChapterDetailsData, mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const pages: string[] = []

        for(const page of data.data.images){
            const url = page?.image ?? ''

            if(!url) continue

            pages.push(encodeURI(`${this.staticURL}/${url}`))
        }

        return createChapterDetails({
            id: chapterId,
            mangaId: mangaId,
            pages: pages,
            longStrip: true
        })
    }


    parseTags(data: SearchType): TagSection[] {
        const Genres: Tag[] = []

        for(const genre of data?.data?.genres){
            const id = genre?.id ?? ''
            const label = genre?.title ?? ''

            if(!id || !label) continue

            Genres.push({
                id: `genre.${id}`,
                label
            })
        }

        const Types: Tag[] = []

        for(const type of data?.data?.types){
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
            createTagSection({ id: 'genres', label: 'Genres', tags: Genres.map((x) => createTag(x))}),
            createTagSection({ id: 'category', label: 'Category', tags: Category.map((x) => createTag(x))}),
            createTagSection({ id: 'types', label: 'Types', tags: Types.map((x) => createTag(x))}),
            createTagSection({ id: 'status', label: 'Status', tags: Status.map((x) => createTag(x))})
        ]
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
