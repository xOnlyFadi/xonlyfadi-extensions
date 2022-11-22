export interface SearchData {
    current_page: number
    last_page: number
    data: [
        {
            id: number
            title: string
        }
    ]
}

export interface MangaDetails {
    gallery: {
        id:                number
        title:             string
        j_title:           string
        alt_title:         string
        full_title:        string
        summary:           null
        total_pages:       number
        slug:              string
        image_extension:   string
        tags:              Tags
    }
}

export interface Tags {
    Artist:  TagsArray[]
    Circle:     TagsArray[]
    Parody:     TagsArray[]
    Contents:   TagsArray[]
    Category:   TagsArray[]
    Character:  TagsArray[]
    Language:   TagsArray[]
    Scanlator:  TagsArray[]
    Convention:  TagsArray[]
}

export interface TagsArray {
    id:         number
    name:       string
}


export interface SearchForm {
    search: {
        PageNumber: number
        manga: {
            sort:   string
            string: string
        }
        page: {
            range: number[]
        }
        sort:       string
        tag:        {
            items: {
                blacklisted?: ItemID[]
                whitelisted?: ItemID[]
            }
            sort:  string
        }
    }
}

interface ItemID {
    id: number
}