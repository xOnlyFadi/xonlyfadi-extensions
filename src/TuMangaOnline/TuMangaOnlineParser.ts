import { Chapter,
    ChapterDetails,
    SourceManga,
    PartialSourceManga,
    Tag,
    TagSection } from '@paperback/types'
import '../scopes'
export class Parser {
    decodeHTMLEntity(str: string): string {
        return str.replace(/&#(\d+)/g, (_match, dec) => {
            return String.fromCharCode(dec)
        })
    }
    
    parseHomeSection($: CheerioStatic, source: any): PartialSourceManga[] {
        const items: PartialSourceManga[] = []
        
        for (const obj of $('div.element').toArray()) {
            const info = $('div.element > a',obj)
            const id = this.idCleaner(info.attr('href')?.trim() ?? '',source) ?? ''
            const title = this.decodeHTMLEntity($('h4.text-truncate',info).text().trim()) ?? this.decodeHTMLEntity($('h4.text-truncate',info)?.attr('title')?.trim() ?? '') ?? ''
            const image = $(obj).find('style').toString().substringAfterFirst('(\'').substringBeforeFirst('\')') ?? ''

            if(!id || !title) continue

            items.push(App.createPartialSourceManga({
                image,
                title: this.decodeHTMLEntity(title),
                mangaId: id,
                subtitle: undefined
            }))
        }
        
        return items
    }
    
    parseChapterDetails($: CheerioSelector, mangaId: string, chapterId: string): ChapterDetails {
        const pages: string[] = []

        for (const obj of $('div.viewer-container img').toArray()) {
            const page = $(obj).attr('data-src') ?? $(obj).attr('src') ?? ''
            if (!page) {
                throw new Error(`Could not parse page for ${chapterId}`)
            }

            pages.push(page)
        }

        return App.createChapterDetails({
            id: chapterId,
            mangaId: mangaId,
            pages: pages
        })
    }
    
    parseChapters($: CheerioStatic, mangaId: string, source: any): Chapter[] {
        const chapters: Chapter[] = []
        const ChapterNumRegex = /capítulo ([\d.]+)?|capitulo ([\d.]+)?/i
        
        if($('div.chapters').contents().length == 0){
            for(const obj of $('div.chapter-list-element > ul.list-group li.list-group-item').toArray()){
                const id = this.idCleaner($('div.row > .text-right > a',obj).attr('href') ?? '',source)

                const name = 'One Shot'

                const scanlator = $('div.col-md-6.text-truncate',obj).text().trim() ?? ''

                const date_upload = $('span.badge.badge-primary.p-2',obj).first().text() ?? ''

                if (typeof id === 'undefined') {
                    throw new Error(`Could not parse out ID when getting chapters for ${mangaId}`)
                }

                chapters.push(App.createChapter({
                    id: id,
                    name: name,
                    group: scanlator,
                    chapNum: 1,
                    time: new Date(date_upload),
                    langCode: '🇪🇸'
                }))
            }
        } else {
            for(const obj of $('div.chapters > ul.list-group li.p-0.list-group-item').toArray()){
                const chapStyle = $('a.btn-collapse',obj).text().trim()

                const chapStyleRegex = chapStyle.match(ChapterNumRegex)
                let chapNum

                if(chapStyleRegex && !isNaN(Number(chapStyleRegex[1]))) chapNum = Number(chapStyleRegex[1])

                const name = $('div.col-10.text-truncate',obj).text().trim()

                const scanelement = $('ul.chapter-list > li',obj).toArray()

                for(const allchaps of scanelement){
                    const id = this.idCleaner($('div.row > .text-right > a',allchaps).attr('href') ?? '',source)

                    const scanlator = $('div.col-md-6.text-truncate',allchaps).text().trim() ?? ''

                    const date_upload = $('span.badge.badge-primary.p-2',allchaps).first().text() ?? ''

                    if (typeof id === 'undefined') {
                        throw new Error(`Could not parse out ID when getting chapters for ${mangaId}`)
                    }

                    chapters.push(App.createChapter({
                        id: id,
                        name: name,
                        group: scanlator,
                        chapNum: chapNum ?? 0,
                        time: new Date(date_upload),
                        langCode: '🇪🇸'
                    }))
                }
            }
        }
        
        return chapters
    }
    
    parseMangaDetails($: CheerioStatic, mangaId: string): SourceManga {
        const infotitle = $('h1.element-title').first()
        infotitle.find('small').remove()
        const title = infotitle.text().trim() ?? ''
        const title2 = this.decodeHTMLEntity($('h2.element-subtitle').first().text().trim()) ?? ''

        const image = $('.book-thumbnail').attr('src') ?? 'https://paperback.moe/icons/logo-alt.svg'
        
        const desc = this.decodeHTMLEntity($('p.element-description').text().trim()) ?? ''
        
        const infoAuth = $('h5.card-title')
        const author = this.decodeHTMLEntity(infoAuth.first().text().trim().substringAfterFirst(', ')) ?? ''
        const artist = this.decodeHTMLEntity(infoAuth.last().text().trim().substringAfterFirst(', ')) ?? ''
        
        const status = this.decodeHTMLEntity($('span.book-status').text().trim()) ?? ''
        
        const arrayTags: Tag[] = []
        const genreregex = /genders.*?=(\d+)?/i

        for (const obj of $('a.py-2').toArray()) {
            const link = $(obj)?.attr('href') ?? ''
            const idRegex = link.match(genreregex)
            let id
            if (idRegex && idRegex[1]) id = idRegex[1]
            const label = $(obj).text() ?? ''
            if (!id || !label) continue
            arrayTags.push({
                id,
                label
            })
        }

        return App.createSourceManga({
            id: mangaId,
            mangaInfo: App.createMangaInfo({
                titles: [title, title2],
                image,
                status,
                author: author,
                artist: artist,
                tags: [App.createTagSection({ id: '0', label: 'genres', tags: arrayTags.map((x) => App.createTag(x)) })],
                desc: desc !== '' ? desc : 'La fuente no proporciona ninguna decscripci\u00F3n (TuMangaOnline)'
            })
        })
    }
    
    parseTags($: CheerioStatic, isNSFW: boolean): TagSection[]{
        const arrayTags: Tag[] = []
        
        const arrayTags2: Tag[] = [
            {
                id: 'types.manga',
                label: 'Manga'
            },
            {
                id: 'types.manhua',
                label: 'Manhua'
            },
            {
                id: 'types.manhwa',
                label: 'Manhwa'
            },
            {
                id: 'types.novel',
                label: 'Novela'
            },
            {
                id: 'types.one_shot',
                label: 'One shot'
            },
            {
                id: 'types.doujinshi',
                label: 'Doujinshi'
            },
            {
                id: 'types.oel',
                label: 'Oel'
            }
        ]
        
        const arrayTags3: Tag[] = [
            {
                id: 'status.publishing',
                label: 'Publicándose'
            },
            {
                id: 'status.ended',
                label: 'Finalizado'
            },
            {
                id: 'status.cancelled',
                label: 'Cancelado'
            },
            {
                id: 'status.on_hold',
                label: 'Pausado'
            }
        ]
        
        const arrayTags4: Tag[] = [
            {
                id: 'trstatus.publishing',
                label: 'Activo'
            },
            {
                id: 'trstatus.ended',
                label: 'Finalizado'
            },
            {
                id: 'trstatus.cancelled',
                label: 'Abandonado'
            }
        ]
        
        const arrayTags5: Tag[] = [
            {
                id: 'demog.seinen',
                label: 'Seinen'
            },
            {
                id: 'demog.shoujo',
                label: 'Shoujo'
            },
            {
                id: 'demog.shounen',
                label: 'Shounen'
            },
            {
                id: 'demog.josei',
                label: 'Josei'
            },
            {
                id: 'demog.kodomo',
                label: 'Kodomo'
            }
        ]
        
        const arrayTags6: Tag[] = [
            {
                id: 'filby.title',
                label: 'Título'
            },
            {
                id: 'filby.author',
                label: 'Autor'
            },
            {
                id: 'filby.company',
                label: 'Compañia'
            }
        ]
        
        const arrayTags7: Tag[] = [
            {
                id: 'sorting.likes_count',
                label: 'Me gusta'
            },
            {
                id: 'sorting.alphabetically',
                label: 'Alfabético'
            },
            {
                id: 'sorting.score',
                label: 'Puntuación'
            },
            {
                id: 'sorting.creation',
                label: 'Creación'
            },
            {
                id: 'sorting.release_date',
                label: 'Fecha estreno'
            },
            {
                id: 'sorting.num_chapters',
                label: 'Núm. Capítulos'
            }
        ]
        
        const arrayTags8: Tag[] = [
            {
                id: 'byaplha.asc',
                label: 'Ascendente'
            },
            {
                id: 'byaplha.desc',
                label: 'Descendente'
            }  
        ]
        
        const arrayTags9: Tag[] = [
            {
                id: 'contenttype.webcomic',
                label: 'Webcomic'
            },
            {
                id: 'contenttype.yonkoma',
                label: 'Yonkoma'
            },
            {
                id: 'contenttype.amateur',
                label: 'Amateur'
            },
            {
                id: 'contenttype.erotic',
                label: 'Erótico'
            }
        ]
        
        const NSFWids = []
        
        isNSFW ? NSFWids.push() : NSFWids.push('6', '17', '18', '19')
        for (const tag of $('#books-genders .col-auto .custom-control').toArray()) {
            const label = $('label', tag).text().trim()
            const id = $('input', tag).attr('value') ?? '0'
            if (!NSFWids.includes(id)){ 
                if (!id || !label) continue
                arrayTags.push({ id: id, label: label })
            }
        }
        
        return [
            App.createTagSection({ id: '0', label: 'Géneros', tags: arrayTags.map(x => App.createTag(x)) }),
            App.createTagSection({ id: '1', label: 'Filtrar por tipo', tags: arrayTags2.map(x => App.createTag(x)) }),
            App.createTagSection({ id: '2', label: 'Ignorado sino se filtra por tipo', tags: [] }),
            App.createTagSection({ id: '3', label: 'Filtrar por estado de serie', tags: arrayTags3.map(x => App.createTag(x)) }),
            App.createTagSection({ id: '4', label: 'Ignorado sino se filtra por tipo', tags: [] }),
            App.createTagSection({ id: '5', label: 'Filtrar por estado de traducción', tags: arrayTags4.map(x => App.createTag(x)) }),
            App.createTagSection({ id: '6', label: 'Filtrar por demografía', tags: arrayTags5.map(x => App.createTag(x)) }),
            App.createTagSection({ id: '7', label: 'Filtrar por', tags: arrayTags6.map(x => App.createTag(x)) }),
            App.createTagSection({ id: '8', label: 'Ordenar por', tags: arrayTags7.map(x => App.createTag(x)) }),
            App.createTagSection({ id: '9', label: 'Ordenar por by', tags: arrayTags8.map(x => App.createTag(x)) }),
            App.createTagSection({ id: '10', label: 'Filtrar por tipo de contenido', tags: arrayTags9.map(x => App.createTag(x)) })
        ]
    }
    
    NextPage($: CheerioSelector) {
        const nextPage = $('a.page-link')
        if (nextPage.contents().length !== 0) {
            return true
        }
        else {
            return false
        }
    }
    
    idCleaner = (str: string, source: any): string => {
        const base = source.baseUrl.split('://').pop()
        str = str.replace(/(https:\/\/|http:\/\/)/, '')
        str = str.replace(/\/$/, '')
        str = str.replace(`${base}/`, '')
        str = str.replace('library/', '')
        str = str.replace('view_uploads/', '')
        return str
    };
}
