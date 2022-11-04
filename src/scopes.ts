export {}

declare global {
    interface String {
        substringAfterLast(string: string): string
        substringBeforeLast(string: string): string
        substringAfterFirst(string: string): string
        substringBeforeFirst(string: string): string
        removePrefix(prefix: string): string
        removeSuffix(suffix: string): string
        removeSurrounding(prefix: string, suffix: string): string
    }
}

String.prototype.substringAfterLast = function (string) {
    const lastIndexOfCharacter = this.lastIndexOf(string)
    return this.substring(lastIndexOfCharacter + 1, this.length + 1)

}

String.prototype.substringBeforeLast = function (string) {
    const lastIndexOfCharacter = this.lastIndexOf(string)
    return this.substring(0, lastIndexOfCharacter)
}

String.prototype.substringAfterFirst = function (string) {
    const startingIndexOfSubstring = this.indexOf(string)
    const endIndexOfSubstring = startingIndexOfSubstring + string.length - 1
    return this.substring(endIndexOfSubstring + 1, this.length)
}

String.prototype.substringBeforeFirst = function (string) {
    const startingIndexOfSubstring = this.indexOf(string)
    return this.substring(0, startingIndexOfSubstring)
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