
export interface VoyceData {
    data: Data;
}

export interface Data {
    voyce_series: VoyceSery[];
}

export interface VoyceSery {
    id:        number;
    slug:      string;
    thumbnail: string;
    title:     string;
}

export interface VoyceMangaData {
    data: Data2;
}

export interface Data2 {
    voyce_series: VoyceSery2[];
}

export interface VoyceSery2 {
    id:          number;
    slug:        string;
    thumbnail:   string;
    title:       string;
    description: string;
    status:      string;
    author:      Author;
    genres:      GenreElement[];
}

export interface Author {
    username: string;
}

export interface GenreElement {
    genre: GenreGenre;
}

export interface GenreGenre {
    title: string;
}


export interface VoyceChapterData {
    data: Data3;
}

export interface Data3 {
    voyce_series: VoyceSery3[];
}

export interface VoyceSery3 {
    slug:     string;
    chapters: Chapter[];
}

export interface Chapter {
    id:         number;
    title:      string;
    created_at: Date;
}