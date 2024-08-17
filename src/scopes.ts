export {}

declare global {
    interface String {
        substringAfterFirst(substring: string): string
        substringBeforeFirst(substring: string): string
        isEmpty(): boolean
        isNotEmpty(): boolean
    }

    interface Array<T> {
        isEmpty(): boolean
        isNotEmpty(): boolean
        first(): T
    }
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