export interface GenresDa {
    name: string;
    slug: string;
}

export interface MangaDetails {
    comic: Comic;
    artists: GenresDa[];
    authors: GenresDa[];
    genres: GenresDa[];
}

interface MDTitles {
    title: string;
}

export interface Comic {
    title: string;
    status: number;
    hentai: boolean;
    desc: string;
    slug: string;
    country: string;
    md_titles: MDTitles[];
    cover_url: string;
}

interface MDGroups {
    slug: string;
    title: string;
}

export interface ChapterData {
    id: number;
    chap: string;
    title: null | string;
    vol: null | string;
    slug: null | string;
    lang: string;
    created_at: Date;
    updated_at: Date;
    up_count: number;
    down_count: number;
    group_name: string[];
    hid: string;
    md_groups: MDGroups[];
}

export interface ChapterList {
    chapters: ChapterData[];
    total: number;
}

interface PageImage {
    url: string;
}

export interface PageList {
    chapter: {
        images: PageImage[];
    };
}

interface MDComics {
    cover_url: string;
    title: string;
    hid: string;
    last_chapter: string;
}

export interface SearchData {
    hid: string;
    title: string;
    cover_url: string;
    last_chapter: string;
    updated_at?: Date;
    md_comics: MDComics;
}

interface Language {
    name: string;
    CMCode: string;
    emoji: string;
    default?: boolean;
}

class LanguagesClass {
    Languages: Language[] = [
        {
            'name': 'All',
            'CMCode': 'all',
            'emoji': 'all'
        },
        {
            'name': 'English',
            'CMCode': 'en',
            'emoji': '🇬🇧'
        },
        {
            'name': 'português do Brasil',
            'CMCode': 'pt-br',
            'emoji': '🇧🇷'
        },
        {
            'name': 'русский язык',
            'CMCode': 'ru',
            'emoji': '🇷🇺'
        },
        {
            'name': 'français, langue française',
            'CMCode': 'fr',
            'emoji': '🇫🇷'
        },
        {
            'name': 'polski',
            'CMCode': 'pl',
            'emoji': '🇵🇱'
        },
        {
            'name': 'español latinoamericano',
            'CMCode': 'es-419',
            'emoji': '🇦🇷'
        },
        {
            'name': 'Türkçe',
            'CMCode': 'tr',
            'emoji': '🇹🇷'
        },
        {
            'name': 'Italiano',
            'CMCode': 'it',
            'emoji': '🇮🇹'
        },
        {
            'name': 'Bahasa Indonesia',
            'CMCode': 'id',
            'emoji': '🇮🇩'
        },
        {
            'name': 'español, castellano',
            'CMCode': 'es',
            'emoji': '🇪🇸'
        },
        {
            'name': 'Tiếng Việt',
            'CMCode': 'vi',
            'emoji': '🇻🇮'
        },
        {
            'name': 'العربية',
            'CMCode': 'ar',
            'emoji': '🇸🇦'
        },
        {
            'name': '(Hong Kong) 繁體中文',
            'CMCode': 'zh-hk',
            'emoji': '🇭🇰'
        },
        {
            'name': 'Magyar',
            'CMCode': 'hu',
            'emoji': '🇭🇺'
        },
        {
            'name': 'Deutsch',
            'CMCode': 'de',
            'emoji': '🇩🇪'
        },
        {
            'name': 'українська',
            'CMCode': 'uk',
            'emoji': '🇺🇰'
        },
        {
            'name': '中文 (Zhōngwén), 汉语, 漢語',
            'CMCode': 'zh',
            'emoji': '🇿🇭'
        },
        {
            'name': 'ไทย',
            'CMCode': 'th',
            'emoji': '🇹🇭'
        },
        {
            'name': 'Català',
            'CMCode': 'ca',
            'emoji': '🇨🇦'
        },
        {
            'name': 'български език',
            'CMCode': 'bg',
            'emoji': '🇧🇬'
        },
        {
            'name': 'فارسی',
            'CMCode': 'fa',
            'emoji': '🇫🇦'
        },
        {
            'name': 'română',
            'CMCode': 'ro',
            'emoji': '🇷🇴'
        },
        {
            'name': 'монгол',
            'CMCode': 'mn',
            'emoji': '🇲🇳'
        },
        {
            'name': 'עברית',
            'CMCode': 'he',
            'emoji': '🇭🇪'
        },
        {
            'name': 'česky, čeština',
            'CMCode': 'cs',
            'emoji': '🇨🇸'
        },
        {
            'name': 'Português',
            'CMCode': 'pt',
            'emoji': '🇵🇹'
        },
        {
            'name': 'Wikang Tagalog, ᜏᜒᜃᜅ᜔ ᜆᜄᜎᜓᜄ᜔',
            'CMCode': 'tl',
            'emoji': '🇹🇱'
        },
        {
            'name': 'bahasa Melayu, بهاس ملايو‎',
            'CMCode': 'ms',
            'emoji': '🇲🇸'
        },
        {
            'name': 'हिन्दी, हिंदी',
            'CMCode': 'hi',
            'emoji': '🇭🇮'
        },
        {
            'name': '日本語 (にほんご／にっぽんご)',
            'CMCode': 'ja',
            'emoji': '🇯🇦'
        },
        {
            'name': 'ဗမာစာ',
            'CMCode': 'my',
            'emoji': '🇲🇾'
        },
        {
            'name': '한국어 (韓國語), 조선말 (朝鮮語)',
            'CMCode': 'ko',
            'emoji': '🇰🇴'
        },
        {
            'name': 'Nederlands, Vlaams',
            'CMCode': 'nl',
            'emoji': '🇳🇱'
        },
        {
            'name': 'српски језик',
            'CMCode': 'sr',
            'emoji': '🇸🇷'
        },
        {
            'name': 'Қазақ тілі',
            'CMCode': 'kk',
            'emoji': '🇰🇰'
        },
        {
            'name': 'Esperanto',
            'CMCode': 'eo',
            'emoji': '🇪🇴'
        },
        {
            'name': 'svenska',
            'CMCode': 'sv',
            'emoji': '🇸🇻'
        },
        {
            'name': 'Ελληνικά',
            'CMCode': 'el',
            'emoji': '🇪🇱'
        },
        {
            'name': 'தமிழ்',
            'CMCode': 'ta',
            'emoji': '🇹🇦'
        },
        {
            'name': 'বাংলা',
            'CMCode': 'bn',
            'emoji': '🇧🇳'
        },
        {
            'name': 'lietuvių kalba',
            'CMCode': 'lt',
            'emoji': '🇱🇹'
        },
        {
            'name': 'नेपाली',
            'CMCode': 'ne',
            'emoji': '🇳🇪'
        },
        {
            'name': 'Norsk',
            'CMCode': 'no',
            'emoji': '🇳🇴'
        },
        {
            'name': 'latine, lingua latina',
            'CMCode': 'la',
            'emoji': '🇱🇦'
        },
        {
            'name': 'suomi, suomen kieli',
            'CMCode': 'fi',
            'emoji': '🇫🇮'
        },
        {
            'name': 'hrvatski',
            'CMCode': 'hr',
            'emoji': '🇭🇷'
        },
        {
            'name': 'dansk',
            'CMCode': 'da',
            'emoji': '🇩🇦'
        },
        {
            'name': 'slovenčina',
            'CMCode': 'sk',
            'emoji': '🇸🇰'
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

    getEmoji(CMCode: string): string {
        return this.Languages.filter(Language => Language.CMCode == CMCode)[0]?.emoji ?? '⍰'
    }

    getDefault(): string[] {
        return this.Languages.filter(Language => Language.default).map(Language => Language.CMCode)
    }

}

export const CMLanguages = new LanguagesClass
