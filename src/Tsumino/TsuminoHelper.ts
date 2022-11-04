
export interface SearchData {
    pageNumber: number
    pageCount:  number
    data: [
        {
            entry: {
                id:                   number
                title:                string
                thumbnailUrl:         string
            }
        }

    ]
}

export interface SearchType {
    type: string
    text: string
    exclude: string
}