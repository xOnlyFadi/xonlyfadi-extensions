export interface SearchData {
    mangas: [
        {
            id: number
            title: string
            cover: string
        }
    ]
}

export interface LatestData {
    releases: [
        {
            new_chapters: [
                {
                    manga_id: number
                    time_stamp: number
                }
            ]
        }

    ]
}

export interface SearchForm {
    oneshot: {
        value: boolean | null
    }
    title: string
    page: number
    manga_types: {
        include: string[]
        exclude: string[]
    }
    story_status: {
        include: string[]
        exclude: string[]
    }
    translation_status: {
        include: string[]
        exclude: string[]
    }
    categories: {
        include: string[]
        exclude: string[]
    }
    chapters: {
        min: string
        max: string
    }
    dates: {
        start: string | null
        end: string | null
    }
}

export interface MangaDetails {
    mangaData: {   
        arabic_title: string
        artists: [
            {
                name: string
            }
        ]
        authors: [
            {
                name: string
            }
        ]
        categories: [
            {
                id: number
                name: string
            }
        ]
        cover: string
        english: string
        japanese: string
        story_status: number
        summary: string
        synonyms: string
        title: string
        type: {
            id: number
            name: string
            title: string
        }

    }
}

export interface ChapterData {
    chapterizations: Chapterization[]
    releases: Release[]
    teams: Team[]
}

export interface Chapterization {
    chapter: number
    id: number
    time_stamp: number
    title: string
    volume: number
}


export interface Release {
    chapterization_id: number
    id: number
    team_id: number
    teams: number[]
    time_stamp: number
    views: number
}

export interface Team {
    id: number
    name: string
}


export interface ChapterDetailsImages {
    readerDataAction: {
        readerData: {
            release: {
                pages: string[]
                webp_pages: string[]
                storage_key: string
            } 
        }
    }
}

export {}

declare global {
    interface String {
        substringBeforeLast(character: string): string
    }
}

String.prototype.substringBeforeLast = function (character) {
    const lastIndexOfCharacter = this.lastIndexOf(character)
    return this.substring(0, lastIndexOfCharacter)
}