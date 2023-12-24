export interface SearchData {
    pageNavParams: {
        count:    number
        page:     number
        limit:    number
    }
    response: [
        {
            id:            number
            name: string
            image: {
                original: string
            }
            chapters: {
                updated: {
                    ch: string
                    date: string
                }
            }
        }
    ]
}

export interface MangaDetails {
    response: {
        id:             number
        name:           string
        russian:        string
        image: {
            original: string
        }
        url:            string
        reading:        string
        ongoing:        number
        anons:          number
        adult:          number
        status:         string
        trans_status:   null
        description:    string
        genres: [
            {
                text:    string
                russian: string
            }
        ]
        authors:        string
        chapters: {
            list: [
                {
                    id:    number
                    vol:   number
                    ch:    number
                    title: string
                    date:  number
                }
            ]
        }
    }
}

export interface ChapterDetailsImages {
    response: {
        pages: {
            list: [
                {
                    img:    string
                }
            ]
        }
    }
}