/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import {
    Chapter,
    ChapterDetails,
    Tag,
    Manga,
    MangaStatus,
    MangaTile,
    TagSection,
    SearchRequest,
    SearchField,
} from 'paperback-extensions-common'

import { 
    ChapterData,
    ChapterDetailsImages,
    Chapterization,
    MangaDetails,
    SearchData, 
    SearchForm, 
    Team
} from './GMangaHelper'

import { decodeHTML } from 'entities'

import '../scopes'

export const parseMangaDetails = (data: MangaDetails, mangaId: string): Manga => {
    const details = data.mangaData

    const titles: string[] = []

    if (details?.title) titles.push(details?.title.trim())
    if (details?.synonyms) titles.push(details?.synonyms.trim())
    if (details?.arabic_title) titles.push(details?.arabic_title.trim())
    if (details?.japanese) titles.push(details?.japanese.trim())
    if (details?.english) titles.push(details?.english.trim())

    const cover = details?.cover?.substringBeforeLast('.') ?? ''
    const image = cover ? `https://media.gmanga.me/uploads/manga/cover/${mangaId}/medium_${cover}.webp` : ''

    const authors: string[] = []
    if (details?.authors) {
        for (const author of details?.authors) {
            const name = author?.name

            if (!name) continue

            authors.push(name)
        }
    }

    const artists: string[] = []
    if (details?.artists) {
        for (const artist of details?.artists) {
            const name = artist?.name

            if (!name) continue

            artists.push(name)
        }
    }

    const arrayTags: Tag[] = []

    if (details?.type) {
        const id = details.type.id ?? ''
        const name = details.type.title ?? details.type.name ?? ''

        if (id && name) {
            arrayTags.push({
                id: `mtype.${id}`,
                label: name
            })
        }
    }

    if (details?.categories) {
        for (const category of details?.categories) {
            const id = category.id ?? ''
            const label = category?.name ?? ''

            if (!id || !label) continue

            arrayTags.push({
                id: `genre.${id}`,
                label
            })
        }
    }

    const tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })]

    let status = MangaStatus.ONGOING

    if (details?.story_status) {
        if (details?.story_status === 2) status = MangaStatus.ONGOING

        if (details?.story_status === 3) status = MangaStatus.COMPLETED
    }
    
    return createManga({
        id: mangaId,
        titles,
        image: image,
        status: status,
        artist: artists.length !== 0 ? artists.join(', ') : '',
        author: authors.length !== 0 ? artists.join(', ') : '',
        tags: tagSections,
        desc: details?.summary ? details?.summary : ''
    })
}

export const parseChapters = (data: ChapterData, mangaId: string): Chapter[] => {
    const chapters: Chapter[] = []
    const chapterList = data


    for (const release of chapterList.releases) {
        const chapterization: Chapterization[] = chapterList.chapterizations.filter(x => x.id === release.chapterization_id) ?? []
        const teams: Team[] = chapterList.teams.filter(x => x.id === release.team_id) ?? []

        if (!chapterization && !chapterization[0] && !teams && !teams[0]) continue

        const chapter = chapterization[0]
        const team = teams[0]

        const id = release?.id ?? ''
        const chapNum = chapter?.chapter ?? 0
        const time = release?.time_stamp * 1000 ?? 0
        const group = team?.name ?? ''
        const name = chapter?.title ? chapter?.title : ''


        if (!id) continue

        chapters.push(createChapter({
            id: id.toString(),
            mangaId,
            name,
            chapNum,
            time: new Date(time),
            group: group,
            // @ts-ignore
            langCode: 'العربية'
        }))
    }

    return chapters
}

export const parseChapterDetails = ($: CheerioStatic, mangaId: string, chapterId: string): ChapterDetails => {
    const pages: string[] = []
    const html = $('.js-react-on-rails-component').html() ?? ''
    const data: ChapterDetailsImages = JSON.parse(html)

    const releaseData = data?.readerDataAction?.readerData?.release 

    const hasWebP = releaseData.webp_pages.length > 0

    for (const page of hasWebP ? releaseData.webp_pages : releaseData.pages) {
        pages.push(encodeURI(`https://media.gmanga.me/uploads/releases/${releaseData.storage_key}/hq${hasWebP ? '_webp' : ''}/${page}`))
    }

    return createChapterDetails({
        id: chapterId,
        mangaId: mangaId,
        pages: pages,
        longStrip: true
    })
}

export const parseSearch = (data: SearchData): MangaTile[] => {
    const results: MangaTile[] = []

    for (const obj of data.mangas) {
        const id = obj?.id?.toString() ?? ''
        const title = obj?.title ?? ''
        const cover = obj?.cover?.substringBeforeLast('.') ?? ''
        const image = cover ? `https://media.gmanga.me/uploads/manga/cover/${id}/medium_${cover}.webp` : ''

        if (!id) continue

        results.push(createMangaTile({
            title: createIconText({ text: decodeHTML(title) }),
            id,
            image
        }))
    }

    return results
}

export const parseHompage = (data: any, selector: string): MangaTile[] => {
    const results: MangaTile[] = []
    const collectedIds: string[] = []

    if (selector !== 'undefined') {
        for (const obj of data[selector ?? 'undefined']) {
            const id = obj?.manga?.id ?? obj?.id ?? ''
            const title =  obj?.manga?.title ?? obj?.title ?? ''
            const cover = obj?.manga?.cover ?? obj?.cover ?? ''
            const image = cover ? `https://media.gmanga.me/uploads/manga/cover/${id}/medium_${cover.substringBeforeLast('.')}.webp` : ''

            if (!id) continue
            if (collectedIds.includes(id)) continue


            results.push(createMangaTile({
                title: createIconText({ text: decodeHTML(title) }),
                id: id.toString(),
                image
            }))
            collectedIds.push(id)
        }
    }

    return results
}

export const parseTags = (): TagSection[] => {
    
    const Genres: Tag[] = [
        {
            label: 'إثارة',
            id: 'genre.1'
        },
        {
            label: 'أكشن',
            id: 'genre.2'
        },
        {
            label: 'الحياة المدرسية',
            id: 'genre.3'
        },
        {
            label: 'الحياة اليومية',
            id: 'genre.4'
        },
        {
            label: 'آليات',
            id: 'genre.5'
        },
        {
            label: 'تاريخي',
            id: 'genre.6'
        },
        {
            label: 'تراجيدي',
            id: 'genre.7'
        },
        {
            label: 'جوسيه',
            id: 'genre.8'
        },
        {
            label: 'حربي',
            id: 'genre.9'
        },
        {
            label: 'خيال',
            id: 'genre.10'
        },
        {
            label: 'خيال علمي',
            id: 'genre.11'
        },
        {
            label: 'دراما',
            id: 'genre.12'
        },
        {
            label: 'رعب',
            id: 'genre.13'
        },
        {
            label: 'رومانسي',
            id: 'genre.14'
        },
        {
            label: 'رياضة',
            id: 'genre.15'
        },
        {
            label: 'ساموراي',
            id: 'genre.16'
        },
        {
            label: 'سحر',
            id: 'genre.17'
        },
        {
            label: 'سينين',
            id: 'genre.18'
        },
        {
            label: 'شوجو',
            id: 'genre.19'
        },
        {
            label: 'شونين',
            id: 'genre.20'
        },
        {
            label: 'عنف',
            id: 'genre.21'
        },
        {
            label: 'غموض',
            id: 'genre.22'
        },
        {
            label: 'فنون قتال',
            id: 'genre.23'
        },
        {
            label: 'قوى خارقة',
            id: 'genre.24'
        },
        {
            label: 'كوميدي',
            id: 'genre.25'
        },
        {
            label: 'مصاصي الدماء',
            id: 'genre.28'
        },
        {
            label: 'مغامرات',
            id: 'genre.29'
        },
        {
            label: 'موسيقى',
            id: 'genre.30'
        },
        {
            label: 'نفسي',
            id: 'genre.31'
        },
        {
            label: 'نينجا',
            id: 'genre.32'
        },
        {
            label: 'شياطين',
            id: 'genre.33'
        },
        {
            label: 'حريم',
            id: 'genre.34'
        },
        {
            label: 'راشد',
            id: 'genre.35'
        },
        {
            label: 'ويب-تون',
            id: 'genre.38'
        },
        {
            label: 'زمنكاني',
            id: 'genre.39'
        },
        {
            label: 'كائنات فضائية',
            id: 'genre.40'
        },
        {
            label: 'مافيا',
            id: 'genre.41'
        },
        {
            label: 'زومبي',
            id: 'genre.42'
        },
        {
            label: 'حيوانات',
            id: 'genre.43'
        },
        {
            label: 'أشباح',
            id: 'genre.44'
        },
        {
            label: 'ألعاب تقليدية',
            id: 'genre.45'
        },
        {
            label: 'طبخ',
            id: 'genre.46'
        },
        {
            label: 'شرطة',
            id: 'genre.47'
        },
        {
            label: 'ألعاب الكترونية',
            id: 'genre.48'
        },
        {
            label: 'جانحون',
            id: 'genre.49'
        },
        {
            label: 'ما بعد نهاية العالم',
            id: 'genre.50'
        },
        {
            label: 'امرأة شريرة',
            id: 'genre.51'
        },
        {
            label: 'تجسيد',
            id: 'genre.53'
        },
        {
            label: 'النجاة',
            id: 'genre.54'
        },
        {
            label: 'واقع إفتراضي',
            id: 'genre.55'
        },
        {
            label: 'جريمة',
            id: 'genre.56'
        },
        {
            label: 'جندر بندر',
            id: 'genre.57'
        },
        {
            label: 'الحريم العكسي',
            id: 'genre.58'
        },
        {
            label: 'ّعامل مكتبي',
            id: 'genre.59'
        },
        {
            label: 'الفتاة الوحش',
            id: 'genre.60'
        },
        {
            label: '4-كوما',
            id: 'genre.61'
        },
        {
            label: 'مقتبسة',
            id: 'genre.62'
        },
        {
            label: ' مجموعة قصص',
            id: 'genre.63'
        },
        {
            label: 'حائز على جائزة',
            id: 'genre.64'
        },
        {
            label: 'هواة',
            id: 'genre.65'
        },
        {
            label: 'تلوين هواة',
            id: 'genre.66'
        },
        {
            label: 'تلوين رسمي',
            id: 'genre.67'
        },
        {
            label: 'مقطع طولي',
            id: 'genre.70'
        },
        {
            label: 'وحوش',
            id: 'genre.71'
        },
        {
            label: 'انتقام',
            id: 'genre.72'
        }
    ]

    const MangaType: Tag[] = [
        {
            label: 'يابانية',
            id: 'mtype.1'
        },
        {
            label: 'كورية',
            id: 'mtype.2'
        },
        {
            label: 'صينية',
            id: 'mtype.3'
        },
        {
            label: 'عربية',
            id: 'mtype.4'
        },
        {
            label: 'كوميك',
            id: 'mtype.5'
        },
        {
            label: 'هواة',
            id: 'mtype.6'
        },
        {
            label: 'إندونيسية',
            id: 'mtype.7'
        },
        {
            label: 'روسية',
            id: 'mtype.8'
        }
    ]

    const OneShot: Tag[] = [
        {
            label: 'نعم',
            id: 'oneshot.yes'
        }
    ]

    const StoryStatus: Tag[] = [
        {
            label: 'مستمرة',
            id: 'storyst.2'
        },
        {
            label: 'منتهية',
            id: 'storyst.3'
        }
    ]
    
    const TranslationStatus: Tag[] = [
        {
            label: 'منتهية',
            id: 'translation.0'
        },
        {
            label: 'مستمرة',
            id: 'translation.1'
        },
        {
            label: 'متوقفة',
            id: 'translation.2'
        },
        {
            label: 'غير مترجمة',
            id: 'translation.3'
        }
    ]

    return [
        createTagSection({ id: 'genres', label: 'التصنيفات', tags: Genres.map(x => createTag(x)) }),
        createTagSection({ id: 'mangatype', label: 'الأصل', tags: MangaType.map(x => createTag(x)) }),
        createTagSection({ id: 'oneshot', label: 'ونشوت؟', tags: OneShot.map(x => createTag(x)) }),
        createTagSection({ id: 'storystatus', label: 'حالة القصة', tags: StoryStatus.map(x => createTag(x)) }),
        createTagSection({ id: 'translationstatus', label: 'حالة الترجمة', tags: TranslationStatus.map(x => createTag(x)) })
    ]
}

export const parseSearchFields = (): SearchField[] =>{
    return [
        createSearchField({id: 'min_chapter_count', name: 'عدد الفصول على الأقل', placeholder: ''}),
        createSearchField({id: 'max_chapter_count', name: 'عدد الفصول على الأكثر', placeholder: ''}),
        createSearchField({id: 'start_date', name: 'تاريخ النشر', placeholder: 'yyyy/MM/dd'}),
        createSearchField({id: 'end_date', name: 'تاريخ الإنتهاء', placeholder: 'yyyy/MM/dd'})
    ]
}

export const parseMetadata = (query: SearchRequest, metadata: any): SearchForm => {
    const page: number = metadata?.page ?? 1


    const data: SearchForm = {
        'oneshot': {
            'value': null
        },
        'title': query.title ?? '',
        'page': page,
        'manga_types': {
            'include': [],
            'exclude': []
        },
        'story_status': {
            'include': [],
            'exclude': []
        },
        'translation_status': {
            'include': [],
            'exclude': []
        },
        'categories': {
            'include': [],
            'exclude': []
        },
        'chapters': {
            // @ts-ignore
            'min': query?.parameters?.['min_chapter_count'] ?? '',
            // @ts-ignore
            'max': query?.parameters?.['max_chapter_count'] ?? ''
        },
        'dates': {
            // @ts-ignore
            'start': query?.parameters?.['start_date'] ?? null,
            // @ts-ignore
            'end': query?.parameters?.['end_date'] ?? null
        }
    }

    query.includedTags?.map(x => {
        const id = x.id
        const SplittedID = id?.split('.')?.pop() ?? ''


        if (id.includes('genre.')) {
            data.categories.include.push(SplittedID)
        }

        if (id.includes('mtype.')) {
            data.manga_types.include.push(SplittedID)
        }

        if (id.includes('oneshot.')) {
            data.oneshot.value = true
        }

        if (id.includes('storyst.')) {
            data.story_status.include.push(SplittedID)
        }

        if (id.includes('translation.')) {
            data.translation_status.include.push(SplittedID)
        }
    })

    query.excludedTags?.map(x => {
        const id = x.id
        const SplittedID = id?.split('.')?.pop() ?? ''

        if (id.includes('genre.')) {
            data.categories.exclude.push(SplittedID)
        }

        if (id.includes('mtype.')) {
            data.manga_types.exclude.push(SplittedID)
        }

        if (id.includes('oneshot.')) {
            data.oneshot.value = false
        }

        if (id.includes('storyst.')) {
            data.story_status.exclude.push(SplittedID)
        }

        if (id.includes('translation.')) {
            data.translation_status.exclude.push(SplittedID)
        }
    })

    if (data.manga_types.include.length === 0) {
        data.manga_types.include.push('1','2','3','4','5','6','7','8')
    }

    if (data.translation_status.exclude.length === 0) {
        data.translation_status.exclude.push('3')
    }

    return data
}

export const popularQuery = (page: number): SearchForm => {
    return {
        'oneshot': {
            'value': false
        },
        'title': '',
        'page': page,
        'manga_types': {
            'include': [
                '1',
                '2',
                '3',
                '4',
                '5',
                '6',
                '7',
                '8'
            ],
            'exclude': []
        },
        'story_status': {
            'include': [],
            'exclude': []
        },
        'translation_status': {
            'include': [],
            'exclude': [
                '3'
            ]
        },
        'categories': {
            'include': [],
            'exclude': []
        },
        'chapters': {
            'min': '',
            'max': ''
        },
        'dates': {
            'start': null,
            'end': null
        }
    }
}

export const months: {[date: string]: number} = {
    'January': 1,
    'February': 2,
    'March': 3,
    'April': 4,
    'May': 5,
    'June': 6,
    'July': 7,
    'August': 8,
    'September': 9,
    'October': 10,
    'November': 11,
    'December': 12,
}