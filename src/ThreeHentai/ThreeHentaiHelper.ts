import { LanguageCode } from 'paperback-extensions-common'

interface Language {
    name: string,
    THCode: string,
    PBCode: LanguageCode,
    default?: boolean
}

class THLanguagesClass {
    Languages: Language[] = [
        // Include all langauages
        {
            // English
            name: 'English',
            THCode: 'english',
            PBCode: LanguageCode.ENGLISH,
            default: true
        },
        {
            // Japanese
            name: '日本語',
            THCode: 'japanese',
            PBCode: LanguageCode.JAPANESE
        },
        {
            // Chinese (Simplified)
            name: '中文 (简化字)',
            THCode: 'chinese',
            PBCode: LanguageCode.CHINEESE
        },
        {
            // Spanish
            name: 'Español',
            THCode: 'spanish',
            PBCode: LanguageCode.SPANISH
        },
        {
            // French
            name: 'Français',
            THCode: 'french',
            PBCode: LanguageCode.FRENCH
        },
        {
            // Portuguese
            name: 'Português',
            THCode: 'portuguese',
            PBCode: LanguageCode.PORTUGUESE
        },
        {
            // Russian
            name: 'Русский',
            THCode: 'russian',
            PBCode: LanguageCode.RUSSIAN
        },
        {
            // German
            name: 'Deutsch',
            THCode: 'german',
            PBCode: LanguageCode.GERMAN
        },
    ]

    constructor() {
        // Sorts the languages based on name
        this.Languages = this.Languages.sort((a, b) => a.name > b.name ? 1 : -1)
    }

    getTHCodeList(): string[] {
        return this.Languages.map(Language => Language.THCode)
    }

    getName(THCode: string): string {
        return this.Languages.filter(Language => Language.THCode == THCode)[0]?.name ?? 'Unknown'
    }

    getPBCode(THCode: string): LanguageCode {
        return this.Languages.filter(Language => Language.THCode == THCode)[0]?.PBCode ?? LanguageCode.UNKNOWN
    }

    getDefault(): string[] {
        return this.Languages.filter(Language => Language.default).map(Language => Language.THCode)
    }
}

export const THLanguages = new THLanguagesClass()

interface SortOrder {
    name: string,
    THCode: string,
    shortcuts: string[],
    default?: boolean
}

class THSortOrderClass {
    SortOrders: SortOrder[] = [
        {
            // Sort by popular
            name: 'Popular all-time',
            THCode: 'popular',
            shortcuts: ['s:p', 's:popular', 'sort:p', 'sort:popular'],
            default: true
        },
        {
            // Sort by popular this week
            name: 'Popular this week',
            THCode: 'popular-7d',
            shortcuts: ['s:pw', 's:w', 's:popular-week', 'sort:pw', 'sort:w', 'sort:popular-week'],
        },
        {
            // Sort by popular today
            name: 'Popular today',
            THCode: 'popular-24h',
            shortcuts: ['s:pt', 's:t', 's:popular-today', 'sort:pt', 'sort:t', 'sort:popular-today'],
        },
        {
            // Sort by recent
            name: 'Recent',
            THCode: 'date',
            shortcuts: ['s:r', 's:recent', 'sort:r', 'sort:recent'],
        },


    ]

    constructor() {
        // Sorts the sort orders based on name
        this.SortOrders = this.SortOrders.sort((a, b) => a.name > b.name ? 1 : -1)
    }

    containsShortcut(query: string): string[] {
        for (const SortOrder of this.SortOrders) {
            for (const shortcut of SortOrder.shortcuts) {
                if (query.includes(shortcut)) {
                    return [SortOrder.THCode, shortcut]
                }
            }
        }
        return ['', '']
    }

    getTHCodeList(): string[] {
        return this.SortOrders.map(SortOrder => SortOrder.THCode)
    }

    getName(THCode: string): string {
        return this.SortOrders.filter(SortOrder => SortOrder.THCode == THCode)[0]?.name ?? 'Unknown'
    }

    getDefault(): string[] {
        return this.SortOrders.filter(SortOrder => SortOrder.default).map(SortOrder => SortOrder.THCode)
    }
}

export const THSortOrders = new THSortOrderClass()
