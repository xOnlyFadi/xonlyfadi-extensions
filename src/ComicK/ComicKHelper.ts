export interface MangaDetails {
    comic:         Comic
    artists:       GenresDa[]
    authors:       GenresDa[]
    genres:        GenresDa[]
}

export interface GenresDa {
    name: string
    slug: string
}

export interface Comic {
    title:               string
    status:              number
    hentai:              boolean
    desc:                string
    slug:                string
    country:             string
    md_titles:[
        {
            title: string
        }          
    ]
    cover_url:           string
}

export interface ChapterDetailsT {
    chapters: [
        {
            id:         number
            chap:       string
            title:      null | string
            vol:        null | string
            slug:       null | string
            lang:       string
            created_at: Date
            updated_at: Date
            up_count:   number
            down_count: number
            group_name: string[]
            hid:        string
            md_groups:[
                {
                    slug:  string
                    title: string
                }
            ]
        }
    ]
    total:    number
}


export interface PageList {
    chapter:{
        images: [
            {
                url: string
            }
        ]
    }
}

export interface SearchData {
    hid:                  string
    title:                 string
    cover_url:             string
    last_chapter:          string
    updated_at?:           Date
    md_comics:{
        cover_url:                    string
        title:                 string
        hid:                  string
        last_chapter:         string
    }
}



interface Language {
    name: string,
    CMCode: string,
    PBCode: string,
    default?: boolean
}

class LanguagesClass {
    Languages: Language[] = [
        {
            'name': 'All',
            'CMCode': 'all',
            'PBCode': 'all',
            'default': true
        },
        {
            'name': 'English',
            'CMCode': 'en',
            'PBCode': 'en'
        },
        {
            'name': 'Português (Brasil)',
            'CMCode': 'pt-br',
            'PBCode': 'pt-br'
        },
        {
            'name': 'Русский',
            'CMCode': 'ru',
            'PBCode': 'ru'
        },
        {
            'name': 'Français',
            'CMCode': 'fr',
            'PBCode': 'fr'
        },
        {
            'name': 'Español (Latinoamérica)',
            'CMCode': 'es-419',
            'PBCode': 'es-419'
        },
        {
            'name': 'Polski',
            'CMCode': 'pl',
            'PBCode': 'pl'
        },
        {
            'name': 'Türkçe',
            'CMCode': 'tr',
            'PBCode': 'tr'
        },
        {
            'name': 'Italiano',
            'CMCode': 'it',
            'PBCode': 'it'
        },
        {
            'name': 'Español',
            'CMCode': 'es',
            'PBCode': 'es'
        },
        {
            'name': 'Bahasa Indonesia',
            'CMCode': 'id',
            'PBCode': 'id'
        },
        {
            'name': 'Magyar',
            'CMCode': 'hu',
            'PBCode': 'hu'
        },
        {
            'name': 'Tiếng Việt',
            'CMCode': 'vi',
            'PBCode': 'vi'
        },
        {
            'name': '中文繁體',
            'CMCode': 'zh-hk',
            'PBCode': 'zh-hk'
        },
        {
            'name': 'العربية',
            'CMCode': 'ar',
            'PBCode': 'ar'
        },
        {
            'name': 'Deutsch',
            'CMCode': 'de',
            'PBCode': 'de'
        },
        {
            'name': '中文简体',
            'CMCode': 'zh',
            'PBCode': 'zh'
        },
        {
            'name': 'Català',
            'CMCode': 'ca',
            'PBCode': 'ca'
        },
        {
            'name': 'Български',
            'CMCode': 'bg',
            'PBCode': 'bg'
        },
        {
            'name': 'ภาษาไทย',
            'CMCode': 'th',
            'PBCode': 'th'
        },
        {
            'name': 'فارسی',
            'CMCode': 'fa',
            'PBCode': 'fa'
        },
        {
            'name': 'Українська',
            'CMCode': 'uk',
            'PBCode': 'uk'
        },
        {
            'name': 'Монгол',
            'CMCode': 'mn',
            'PBCode': 'mn'
        },
        {
            'name': 'Română',
            'CMCode': 'ro',
            'PBCode': 'ro'
        },
        {
            'name': 'עברית‏',
            'CMCode': 'he',
            'PBCode': 'he'
        },
        {
            'name': 'Bahasa Melayu',
            'CMCode': 'ms',
            'PBCode': 'ms'
        },
        {
            'name': 'Tagalog',
            'CMCode': 'tl',
            'PBCode': 'tl'
        },
        {
            'name': '日本語',
            'CMCode': 'ja',
            'PBCode': 'ja'
        },
        {
            'name': 'हिन्दी',
            'CMCode': 'hi',
            'PBCode': 'hi'
        },
        {
            'name': 'ဗမာစကာ',
            'CMCode': 'my',
            'PBCode': 'my'
        },
        {
            'name': '한국어',
            'CMCode': 'ko',
            'PBCode': 'ko'
        },
        {
            'name': 'Čeština',
            'CMCode': 'cs',
            'PBCode': 'cs'
        },
        {
            'name': 'Português',
            'CMCode': 'pt',
            'PBCode': 'pt'
        },
        {
            'name': 'Nederlands',
            'CMCode': 'nl',
            'PBCode': 'nl'
        },
        {
            'name': 'Svenska',
            'CMCode': 'sv',
            'PBCode': 'sv'
        },
        {
            'name': 'বাংলা',
            'CMCode': 'bn',
            'PBCode': 'bn'
        },
        {
            'name': 'Norsk',
            'CMCode': 'no',
            'PBCode': 'no'
        },
        {
            'name': 'Lietuvių',
            'CMCode': 'lt',
            'PBCode': 'lt'
        },
        {
            'name': 'Ελληνικά',
            'CMCode': 'el',
            'PBCode': 'el'
        },
        {
            'name': 'Српски',
            'CMCode': 'sr',
            'PBCode': 'sr'
        },
        {
            'name': 'Dansk',
            'CMCode': 'da',
            'PBCode': 'da'
        }
    ]

    constructor() {
        this.Languages = this.Languages.sort((a, b) => a.name > b.name ? 1 : -1)
    }

    getCMCodeList(): string[] {
        return this.Languages.map(Language => Language.CMCode)
    }

    getName(CMCode: string): string {
        return this.Languages.filter(Language => Language.CMCode == CMCode)[0]?.name ?? 'Unknown'
    }

    getPBCode(CMCode: string): string {
        return this.Languages.filter(Language => Language.CMCode == CMCode)[0]?.PBCode ?? '_unknown'
    }

    getDefault(): string[] {
        return this.Languages.filter(Language => Language.default).map(Language => Language.CMCode)
    }

}

export const CMLanguages = new LanguagesClass