import {
    Chapter,
    ChapterDetails,
    Tag,
    SourceManga,
    PartialSourceManga,
    TagSection
} from '@paperback/types'

import {
    ChapterDetailsImages,
    MangaDetails,
    SearchData
} from './DesuMEHelper'

import { decodeHTML } from 'entities'

import '../scopes'

export const parseSearch = (data: SearchData): PartialSourceManga[] => {
    const results: PartialSourceManga[] = []

    for (const obj of data.response) {
        const id = obj?.id ?? ''
        const title = obj?.name ?? ''
        const image = obj.image.original ? obj.image.original : ''
        const subtitle = obj?.chapters?.updated?.ch ?? ''

        if (!id) continue

        results.push(App.createPartialSourceManga({
            title: decodeHTML(title),
            image,
            mangaId: `${id}`,
            subtitle: subtitle ? `Глава ${subtitle}` : ''
        }))
    }

    return results
}

export const parseMangaDetails = (data: MangaDetails, mangaId: string): SourceManga => {
    const details = data.response

    const titles: string[] = []
    if (details?.name) titles.push(details?.name.trim())
    if (details?.russian) titles.push(details?.russian.trim())

    const image = details.image.original ? details.image.original : ''
    const author = details.authors ?? ''

    const arrayTags: Tag[] = []
    if (details?.genres) {
        for (const category of details.genres) {
            const id = category.text.replace(/ /g, '+').replace(/%20/g, '+') ?? ''
            const label = category?.russian ?? ''
            if (!id || !label)
                continue
            arrayTags.push({
                id: `genres.${id}`,
                label
            })
        }
    }

    let status = 'ONGOING'
    if (details?.trans_status) {
        switch (details?.trans_status) {
            case 'continued':
                status = 'ONGOING'
                break
            case 'completed':
                status = 'COMPLETED'
                break
        }
    }
    else if (details?.status) {
        switch (details?.status) {
            case 'ongoing':
                status = 'ONGOING'
                break
            case 'released':
                status = 'COMPLETED'
                break
        }
    }

    return App.createSourceManga({
        id: mangaId,
        mangaInfo: App.createMangaInfo({
            titles,
            image: image,
            status: status,
            author: author,
            tags: [App.createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => App.createTag(x)) })],
            desc: details?.description ? details?.description : '',
            hentai: details.adult === 1
        })
    })
}

export const parseChapters = (data: MangaDetails): Chapter[] => {
    const chapters: Chapter[] = []
    let sortingIndex = 0

    for (const chapter of data.response.chapters.list) {
        const id = chapter?.id ?? ''
        const chapNum = chapter?.ch ? Number(chapter.ch) : 0
        const chapVol = chapter?.ch ? Number(chapter.vol) : 0
        const time = chapter?.date ? new Date(chapter?.date * 1000) ?? new Date() : new Date()
        const name = chapter?.title ? chapter?.title : ''

        if (!id) continue

        chapters.push({
            id: `${id}`,
            name,
            chapNum: chapNum,
            volume: chapVol,
            sortingIndex,
            time: time,
            langCode: '🇷🇺',
            group: ''
        })
        sortingIndex--
    }

    return chapters.map(chapter => {
        chapter.sortingIndex += chapters.length
        return App.createChapter(chapter)
    })
}

export const parseChapterDetails = (data: ChapterDetailsImages, mangaId: string, chapterId: string): ChapterDetails => {
    const pages: string[] = []

    for (const page of data.response.pages.list) {
        const url = page.img ?? ''

        if (!url) continue

        pages.push(url)
    }

    return App.createChapterDetails({
        id: chapterId,
        mangaId: mangaId,
        pages: pages
    })
}

export const parseTags = (): TagSection[] => {

    const Genres: Tag[] = [
        {
            label: 'Безумие',
            id: 'genres.Dementia'
        },
        {
            label: 'Боевые искусства',
            id: 'genres.Martial+Arts'
        },
        {
            label: 'В цвете',
            id: 'genres.Color'
        },
        {
            label: 'Вампиры',
            id: 'genres.Vampire'
        },
        {
            label: 'Веб',
            id: 'genres.Web'
        },
        {
            label: 'Гарем',
            id: 'genres.Harem'
        },
        {
            label: 'Героическое фэнтези',
            id: 'genres.Heroic+Fantasy'
        },
        {
            label: 'Демоны',
            id: 'genres.Demons'
        },
        {
            label: 'Детектив',
            id: 'genres.Mystery'
        },
        {
            label: 'Дзёсей',
            id: 'genres.Josei'
        },
        {
            label: 'Драма',
            id: 'genres.Drama'
        },
        {
            label: 'Ёнкома',
            id: 'genres.Yonkoma'
        },
        {
            label: 'Игры',
            id: 'genres.Game'
        },
        {
            label: 'Исекай',
            id: 'genres.Isekai'
        },
        {
            label: 'Исторический',
            id: 'genres.Historical'
        },
        {
            label: 'Комедия',
            id: 'genres.Comedy'
        },
        {
            label: 'Космос',
            id: 'genres.Space'
        },
        {
            label: 'ЛитRPG',
            id: 'genres.LitRPG'
        },
        {
            label: 'Магия',
            id: 'genres.Magic'
        },
        {
            label: 'Меха',
            id: 'genres.Mecha'
        },
        {
            label: 'Мистика',
            id: 'genres.Mystic'
        },
        {
            label: 'Музыка',
            id: 'genres.Music'
        },
        {
            label: 'Научная фантастика',
            id: 'genres.Sci-Fi'
        },
        {
            label: 'Пародия',
            id: 'genres.Parody'
        },
        {
            label: 'Повседневность',
            id: 'genres.Slice+of+Life'
        },
        {
            label: 'Постапокалиптика',
            id: 'genres.Post+Apocalyptic'
        },
        {
            label: 'Приключения',
            id: 'genres.Adventure'
        },
        {
            label: 'Психологическое',
            id: 'genres.Psychological'
        },
        {
            label: 'Романтика',
            id: 'genres.Romance'
        },
        {
            label: 'Самураи',
            id: 'genres.Samurai'
        },
        {
            label: 'Сверхъестественное',
            id: 'genres.Supernatural'
        },
        {
            label: 'Сёдзе',
            id: 'genres.Shoujo'
        },
        {
            label: 'Сёдзе Ай',
            id: 'genres.Shoujo+Ai'
        },
        {
            label: 'Сейнен',
            id: 'genres.Seinen'
        },
        {
            label: 'Сёнен',
            id: 'genres.Shounen'
        },
        {
            label: 'Сёнен Ай',
            id: 'genres.Shounen+Ai'
        },
        {
            label: 'Смена пола',
            id: 'genres.Gender+Bender'
        },
        {
            label: 'Спорт',
            id: 'genres.Sports'
        },
        {
            label: 'Супер сила',
            id: 'genres.Super+Power'
        },
        {
            label: 'Трагедия',
            id: 'genres.Tragedy'
        },
        {
            label: 'Триллер',
            id: 'genres.Thriller'
        },
        {
            label: 'Ужасы',
            id: 'genres.Horror'
        },
        {
            label: 'Фантастика',
            id: 'genres.Fiction'
        },
        {
            label: 'Фэнтези',
            id: 'genres.Fantasy'
        },
        {
            label: 'Хентай',
            id: 'genres.Hentai'
        },
        {
            label: 'Школа',
            id: 'genres.School'
        },
        {
            label: 'Экшен',
            id: 'genres.Action'
        },
        {
            label: 'Этти',
            id: 'genres.Ecchi'
        },
        {
            label: 'Юри',
            id: 'genres.Yuri'
        },
        {
            label: 'Яой',
            id: 'genres.Yaoi'
        }
    ]

    const Types: Tag[] = [
        {
            label: 'Манга',
            id: 'types.manga'
        },
        {
            label: 'Манхва',
            id: 'types.manhwa'
        },
        {
            label: 'Маньхуа',
            id: 'types.manhua'
        },
        {
            label: 'Ваншот',
            id: 'types.one_shot'
        },
        {
            label: 'Комикс',
            id: 'types.comics'
        }
    ]

    const Order: Tag[] = [
        {
            label: 'Популярность',
            id: 'order.popular'
        },
        {
            label: 'Дата',
            id: 'order.updated'
        },
        {
            label: 'Имя',
            id: 'order.name'
        }
    ]

    return [
        App.createTagSection({ id: 'genres', label: 'Жанр', tags: Genres.map(x => App.createTag(x)) }),
        App.createTagSection({ id: 'types', label: 'Тип', tags: Types.map(x => App.createTag(x)) }),
        App.createTagSection({ id: 'order', label: 'Сортировка', tags: Order.map(x => App.createTag(x)) })
    ]
}