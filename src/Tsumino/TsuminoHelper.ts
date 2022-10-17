
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

export {}

declare global {
    interface String {
        removePrefix(prefix: string): string
        removeSuffix(suffix: string): string
        removeSurrounding(prefix: string, suffix: string): string
    }
}

String.prototype.removePrefix = function(prefix) {
    if (this.startsWith(prefix)) {
        return this.substring(prefix.length, this.length)
    }

    return this.substring(0, this.length)
}

String.prototype.removeSuffix = function(suffix) {
    if (this.endsWith(suffix)) {
        return this.substring(0, this.length - suffix.length)
    }

    return this.substring(0, this.length)
}

String.prototype.removeSurrounding = function(prefix, suffix) {
    if ((this.length >= prefix.length + suffix.length) && this.startsWith(prefix) && this.endsWith(suffix)) {
        return this.substring(prefix.length, this.length - suffix.length)
    }

    return this.substring(0, this.length)
}