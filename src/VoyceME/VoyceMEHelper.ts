
export interface SearchData {
    data: {
        voyce_series: [
            {
                id:        number
                thumbnail: string
                title:     string
            }
        ]
    }
}

export interface VoyceMangaData {
    data: {
        series: [
            {
                id:          number
                slug:        string
                thumbnail:   string
                title:       string
                description: string
                status:      string
                author: {
                    username: string
                }
                genres: [
                    {
                        genre: {
                            title: string
                            id: number
                        }
                    }
                ]
            }
        ]
    }
}


export interface VoyceChapterData {
    data: {
        series: [
            {
                chapters: [
                    {
                        id:         number
                        title:      string
                        created_at: Date
                    }
                ]
            }
        ]
    }
}

export interface VoyceChapterDetailsData {
    data: {
        images: [
            {
                image:      string
                id:         number
                sort_order: number
            }
        ]
    }
}

export interface HomePageData {
    data: {
        featured: Featured[]
        popular: Featured[]
        trending: Featured[]
        recommended: Featured[]
        recent: Featured[]
        fresh: Featured[]
    }
}

export interface Featured {
    id:            number
    thumbnail:     string
    title:         string
    chapter_count: number
}

export interface SearchType {
    data: {
        types: [
            {
                title: string
                id:    number
            }
        ]
        genres: [
            {
                title: string
                id:    number
            }
        ]
    }
}