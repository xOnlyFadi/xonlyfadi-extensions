/* eslint-disable @typescript-eslint/no-unused-vars */
export {}

declare global {
    interface String {
        substringAfterLast(substring: string): string
        substringBeforeLast(substring: string): string
        substringAfterFirst(substring: string): string
        substringBeforeFirst(substring: string): string
        removePrefix(prefix: string): string
        removeSuffix(suffix: string): string
        removeSurrounding(prefix: string, suffix: string): string
        isEmpty(): boolean
        isNotEmpty(): boolean
    }

    interface Array<T> {
        isEmpty(): boolean
        isNotEmpty(): boolean
        first(): T
    }
}

String.prototype.substringAfterLast = function (substring) {
    const lastIndexOfCharacter = this?.lastIndexOf(substring)
    return this?.substring(lastIndexOfCharacter + 1, this?.length + 1)

}

String.prototype.substringBeforeLast = function (substring) {
    const lastIndexOfCharacter = this?.lastIndexOf(substring)
    return this?.substring(0, lastIndexOfCharacter)
}

String.prototype.substringAfterFirst = function (substring) {
    const startingIndexOfSubstring = this?.indexOf(substring)
    const endIndexOfSubstring = startingIndexOfSubstring + substring?.length - 1
    return this?.substring(endIndexOfSubstring + 1, this?.length)
}

String.prototype.substringBeforeFirst = function (substring) {
    const startingIndexOfSubstring = this?.indexOf(substring)
    return this?.substring(0, startingIndexOfSubstring)
}

String.prototype.removePrefix = function(prefix) {
    if (this?.startsWith(prefix)) {
        return this?.substring(prefix?.length, this?.length)
    }

    return this?.substring(0, this?.length)
}

String.prototype.removeSuffix = function(suffix) {
    if (this?.endsWith(suffix)) {
        return this?.substring(0, this?.length - suffix?.length)
    }

    return this?.substring(0, this?.length)
}

String.prototype.removeSurrounding = function(prefix, suffix) {
    if ((this?.length >= prefix?.length + suffix?.length) && this?.startsWith(prefix) && this?.endsWith(suffix)) {
        return this?.substring(prefix?.length, this?.length - suffix?.length)
    }

    return this?.substring(0, this?.length)
}

String.prototype.isEmpty = function() {
    return this?.length == 0
}

String.prototype.isNotEmpty = function() {
    return this?.length > 0
}

Array.prototype.isEmpty = function() {
    return this?.length == 0
}

Array.prototype.isNotEmpty = function() {
    return this?.length > 0
}

Array.prototype.first = function(){
    if(this?.isEmpty()) throw new Error('List is empty')

    return this?.[0]
}