(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Sources = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeXML = exports.decodeHTMLStrict = exports.decodeHTML = exports.determineBranch = exports.BinTrieFlags = exports.fromCodePoint = exports.replaceCodePoint = exports.decodeCodePoint = exports.xmlDecodeTree = exports.htmlDecodeTree = void 0;
var decode_data_html_js_1 = __importDefault(require("./generated/decode-data-html.js"));
exports.htmlDecodeTree = decode_data_html_js_1.default;
var decode_data_xml_js_1 = __importDefault(require("./generated/decode-data-xml.js"));
exports.xmlDecodeTree = decode_data_xml_js_1.default;
var decode_codepoint_js_1 = __importDefault(require("./decode_codepoint.js"));
exports.decodeCodePoint = decode_codepoint_js_1.default;
var decode_codepoint_js_2 = require("./decode_codepoint.js");
Object.defineProperty(exports, "replaceCodePoint", { enumerable: true, get: function () { return decode_codepoint_js_2.replaceCodePoint; } });
Object.defineProperty(exports, "fromCodePoint", { enumerable: true, get: function () { return decode_codepoint_js_2.fromCodePoint; } });
var CharCodes;
(function (CharCodes) {
    CharCodes[CharCodes["NUM"] = 35] = "NUM";
    CharCodes[CharCodes["SEMI"] = 59] = "SEMI";
    CharCodes[CharCodes["ZERO"] = 48] = "ZERO";
    CharCodes[CharCodes["NINE"] = 57] = "NINE";
    CharCodes[CharCodes["LOWER_A"] = 97] = "LOWER_A";
    CharCodes[CharCodes["LOWER_F"] = 102] = "LOWER_F";
    CharCodes[CharCodes["LOWER_X"] = 120] = "LOWER_X";
    /** Bit that needs to be set to convert an upper case ASCII character to lower case */
    CharCodes[CharCodes["To_LOWER_BIT"] = 32] = "To_LOWER_BIT";
})(CharCodes || (CharCodes = {}));
var BinTrieFlags;
(function (BinTrieFlags) {
    BinTrieFlags[BinTrieFlags["VALUE_LENGTH"] = 49152] = "VALUE_LENGTH";
    BinTrieFlags[BinTrieFlags["BRANCH_LENGTH"] = 16256] = "BRANCH_LENGTH";
    BinTrieFlags[BinTrieFlags["JUMP_TABLE"] = 127] = "JUMP_TABLE";
})(BinTrieFlags = exports.BinTrieFlags || (exports.BinTrieFlags = {}));
function getDecoder(decodeTree) {
    return function decodeHTMLBinary(str, strict) {
        var ret = "";
        var lastIdx = 0;
        var strIdx = 0;
        while ((strIdx = str.indexOf("&", strIdx)) >= 0) {
            ret += str.slice(lastIdx, strIdx);
            lastIdx = strIdx;
            // Skip the "&"
            strIdx += 1;
            // If we have a numeric entity, handle this separately.
            if (str.charCodeAt(strIdx) === CharCodes.NUM) {
                // Skip the leading "&#". For hex entities, also skip the leading "x".
                var start = strIdx + 1;
                var base = 10;
                var cp = str.charCodeAt(start);
                if ((cp | CharCodes.To_LOWER_BIT) === CharCodes.LOWER_X) {
                    base = 16;
                    strIdx += 1;
                    start += 1;
                }
                do
                    cp = str.charCodeAt(++strIdx);
                while ((cp >= CharCodes.ZERO && cp <= CharCodes.NINE) ||
                    (base === 16 &&
                        (cp | CharCodes.To_LOWER_BIT) >= CharCodes.LOWER_A &&
                        (cp | CharCodes.To_LOWER_BIT) <= CharCodes.LOWER_F));
                if (start !== strIdx) {
                    var entity = str.substring(start, strIdx);
                    var parsed = parseInt(entity, base);
                    if (str.charCodeAt(strIdx) === CharCodes.SEMI) {
                        strIdx += 1;
                    }
                    else if (strict) {
                        continue;
                    }
                    ret += (0, decode_codepoint_js_1.default)(parsed);
                    lastIdx = strIdx;
                }
                continue;
            }
            var resultIdx = 0;
            var excess = 1;
            var treeIdx = 0;
            var current = decodeTree[treeIdx];
            for (; strIdx < str.length; strIdx++, excess++) {
                treeIdx = determineBranch(decodeTree, current, treeIdx + 1, str.charCodeAt(strIdx));
                if (treeIdx < 0)
                    break;
                current = decodeTree[treeIdx];
                var masked = current & BinTrieFlags.VALUE_LENGTH;
                // If the branch is a value, store it and continue
                if (masked) {
                    // If we have a legacy entity while parsing strictly, just skip the number of bytes
                    if (!strict || str.charCodeAt(strIdx) === CharCodes.SEMI) {
                        resultIdx = treeIdx;
                        excess = 0;
                    }
                    // The mask is the number of bytes of the value, including the current byte.
                    var valueLength = (masked >> 14) - 1;
                    if (valueLength === 0)
                        break;
                    treeIdx += valueLength;
                }
            }
            if (resultIdx !== 0) {
                var valueLength = (decodeTree[resultIdx] & BinTrieFlags.VALUE_LENGTH) >> 14;
                ret +=
                    valueLength === 1
                        ? String.fromCharCode(decodeTree[resultIdx] & ~BinTrieFlags.VALUE_LENGTH)
                        : valueLength === 2
                            ? String.fromCharCode(decodeTree[resultIdx + 1])
                            : String.fromCharCode(decodeTree[resultIdx + 1], decodeTree[resultIdx + 2]);
                lastIdx = strIdx - excess + 1;
            }
        }
        return ret + str.slice(lastIdx);
    };
}
function determineBranch(decodeTree, current, nodeIdx, char) {
    var branchCount = (current & BinTrieFlags.BRANCH_LENGTH) >> 7;
    var jumpOffset = current & BinTrieFlags.JUMP_TABLE;
    // Case 1: Single branch encoded in jump offset
    if (branchCount === 0) {
        return jumpOffset !== 0 && char === jumpOffset ? nodeIdx : -1;
    }
    // Case 2: Multiple branches encoded in jump table
    if (jumpOffset) {
        var value = char - jumpOffset;
        return value < 0 || value > branchCount
            ? -1
            : decodeTree[nodeIdx + value] - 1;
    }
    // Case 3: Multiple branches encoded in dictionary
    // Binary search for the character.
    var lo = nodeIdx;
    var hi = lo + branchCount - 1;
    while (lo <= hi) {
        var mid = (lo + hi) >>> 1;
        var midVal = decodeTree[mid];
        if (midVal < char) {
            lo = mid + 1;
        }
        else if (midVal > char) {
            hi = mid - 1;
        }
        else {
            return decodeTree[mid + branchCount];
        }
    }
    return -1;
}
exports.determineBranch = determineBranch;
var htmlDecoder = getDecoder(decode_data_html_js_1.default);
var xmlDecoder = getDecoder(decode_data_xml_js_1.default);
function decodeHTML(str) {
    return htmlDecoder(str, false);
}
exports.decodeHTML = decodeHTML;
function decodeHTMLStrict(str) {
    return htmlDecoder(str, true);
}
exports.decodeHTMLStrict = decodeHTMLStrict;
function decodeXML(str) {
    return xmlDecoder(str, true);
}
exports.decodeXML = decodeXML;

},{"./decode_codepoint.js":3,"./generated/decode-data-html.js":6,"./generated/decode-data-xml.js":7}],3:[function(require,module,exports){
"use strict";
// Adapted from https://github.com/mathiasbynens/he/blob/36afe179392226cf1b6ccdb16ebbb7a5a844d93a/src/he.js#L106-L134
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceCodePoint = exports.fromCodePoint = void 0;
var decodeMap = new Map([
    [0, 65533],
    [128, 8364],
    [130, 8218],
    [131, 402],
    [132, 8222],
    [133, 8230],
    [134, 8224],
    [135, 8225],
    [136, 710],
    [137, 8240],
    [138, 352],
    [139, 8249],
    [140, 338],
    [142, 381],
    [145, 8216],
    [146, 8217],
    [147, 8220],
    [148, 8221],
    [149, 8226],
    [150, 8211],
    [151, 8212],
    [152, 732],
    [153, 8482],
    [154, 353],
    [155, 8250],
    [156, 339],
    [158, 382],
    [159, 376],
]);
exports.fromCodePoint = 
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, node/no-unsupported-features/es-builtins
(_a = String.fromCodePoint) !== null && _a !== void 0 ? _a : function (codePoint) {
    var output = "";
    if (codePoint > 0xffff) {
        codePoint -= 0x10000;
        output += String.fromCharCode(((codePoint >>> 10) & 0x3ff) | 0xd800);
        codePoint = 0xdc00 | (codePoint & 0x3ff);
    }
    output += String.fromCharCode(codePoint);
    return output;
};
function replaceCodePoint(codePoint) {
    var _a;
    if ((codePoint >= 0xd800 && codePoint <= 0xdfff) || codePoint > 0x10ffff) {
        return 0xfffd;
    }
    return (_a = decodeMap.get(codePoint)) !== null && _a !== void 0 ? _a : codePoint;
}
exports.replaceCodePoint = replaceCodePoint;
function decodeCodePoint(codePoint) {
    return (0, exports.fromCodePoint)(replaceCodePoint(codePoint));
}
exports.default = decodeCodePoint;

},{}],4:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeNonAsciiHTML = exports.encodeHTML = void 0;
var encode_html_js_1 = __importDefault(require("./generated/encode-html.js"));
var escape_js_1 = require("./escape.js");
var htmlReplacer = /[\t\n!-,./:-@[-`\f{-}$\x80-\uFFFF]/g;
/**
 * Encodes all entities and non-ASCII characters in the input.
 *
 * This includes characters that are valid ASCII characters in HTML documents.
 * For example `#` will be encoded as `&num;`. To get a more compact output,
 * consider using the `encodeNonAsciiHTML` function.
 *
 * If a character has no equivalent entity, a
 * numeric hexadecimal reference (eg. `&#xfc;`) will be used.
 */
function encodeHTML(data) {
    return encodeHTMLTrieRe(htmlReplacer, data);
}
exports.encodeHTML = encodeHTML;
/**
 * Encodes all non-ASCII characters, as well as characters not valid in HTML
 * documents using HTML entities.
 *
 * If a character has no equivalent entity, a
 * numeric hexadecimal reference (eg. `&#xfc;`) will be used.
 */
function encodeNonAsciiHTML(data) {
    return encodeHTMLTrieRe(escape_js_1.xmlReplacer, data);
}
exports.encodeNonAsciiHTML = encodeNonAsciiHTML;
function encodeHTMLTrieRe(regExp, str) {
    var ret = "";
    var lastIdx = 0;
    var match;
    while ((match = regExp.exec(str)) !== null) {
        var i = match.index;
        ret += str.substring(lastIdx, i);
        var char = str.charCodeAt(i);
        var next = encode_html_js_1.default.get(char);
        if (typeof next === "object") {
            // We are in a branch. Try to match the next char.
            if (i + 1 < str.length) {
                var nextChar = str.charCodeAt(i + 1);
                var value = typeof next.n === "number"
                    ? next.n === nextChar
                        ? next.o
                        : undefined
                    : next.n.get(nextChar);
                if (value !== undefined) {
                    ret += value;
                    lastIdx = regExp.lastIndex += 1;
                    continue;
                }
            }
            next = next.v;
        }
        // We might have a tree node without a value; skip and use a numeric entitiy.
        if (next !== undefined) {
            ret += next;
            lastIdx = i + 1;
        }
        else {
            var cp = (0, escape_js_1.getCodePoint)(str, i);
            ret += "&#x".concat(cp.toString(16), ";");
            // Increase by 1 if we have a surrogate pair
            lastIdx = regExp.lastIndex += Number(cp !== char);
        }
    }
    return ret + str.substr(lastIdx);
}

},{"./escape.js":5,"./generated/encode-html.js":8}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.escapeText = exports.escapeAttribute = exports.escapeUTF8 = exports.escape = exports.encodeXML = exports.getCodePoint = exports.xmlReplacer = void 0;
exports.xmlReplacer = /["&'<>$\x80-\uFFFF]/g;
var xmlCodeMap = new Map([
    [34, "&quot;"],
    [38, "&amp;"],
    [39, "&apos;"],
    [60, "&lt;"],
    [62, "&gt;"],
]);
// For compatibility with node < 4, we wrap `codePointAt`
exports.getCodePoint = 
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
String.prototype.codePointAt != null
    ? function (str, index) { return str.codePointAt(index); }
    : // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        function (c, index) {
            return (c.charCodeAt(index) & 0xfc00) === 0xd800
                ? (c.charCodeAt(index) - 0xd800) * 0x400 +
                    c.charCodeAt(index + 1) -
                    0xdc00 +
                    0x10000
                : c.charCodeAt(index);
        };
/**
 * Encodes all non-ASCII characters, as well as characters not valid in XML
 * documents using XML entities.
 *
 * If a character has no equivalent entity, a
 * numeric hexadecimal reference (eg. `&#xfc;`) will be used.
 */
function encodeXML(str) {
    var ret = "";
    var lastIdx = 0;
    var match;
    while ((match = exports.xmlReplacer.exec(str)) !== null) {
        var i = match.index;
        var char = str.charCodeAt(i);
        var next = xmlCodeMap.get(char);
        if (next !== undefined) {
            ret += str.substring(lastIdx, i) + next;
            lastIdx = i + 1;
        }
        else {
            ret += "".concat(str.substring(lastIdx, i), "&#x").concat((0, exports.getCodePoint)(str, i).toString(16), ";");
            // Increase by 1 if we have a surrogate pair
            lastIdx = exports.xmlReplacer.lastIndex += Number((char & 0xfc00) === 0xd800);
        }
    }
    return ret + str.substr(lastIdx);
}
exports.encodeXML = encodeXML;
/**
 * Encodes all non-ASCII characters, as well as characters not valid in XML
 * documents using numeric hexadecimal reference (eg. `&#xfc;`).
 *
 * Have a look at `escapeUTF8` if you want a more concise output at the expense
 * of reduced transportability.
 *
 * @param data String to escape.
 */
exports.escape = encodeXML;
function getEscaper(regex, map) {
    return function escape(data) {
        var match;
        var lastIdx = 0;
        var result = "";
        while ((match = regex.exec(data))) {
            if (lastIdx !== match.index) {
                result += data.substring(lastIdx, match.index);
            }
            // We know that this chararcter will be in the map.
            result += map.get(match[0].charCodeAt(0));
            // Every match will be of length 1
            lastIdx = match.index + 1;
        }
        return result + data.substring(lastIdx);
    };
}
/**
 * Encodes all characters not valid in XML documents using XML entities.
 *
 * Note that the output will be character-set dependent.
 *
 * @param data String to escape.
 */
exports.escapeUTF8 = getEscaper(/[&<>'"]/g, xmlCodeMap);
/**
 * Encodes all characters that have to be escaped in HTML attributes,
 * following {@link https://html.spec.whatwg.org/multipage/parsing.html#escapingString}.
 *
 * @param data String to escape.
 */
exports.escapeAttribute = getEscaper(/["&\u00A0]/g, new Map([
    [34, "&quot;"],
    [38, "&amp;"],
    [160, "&nbsp;"],
]));
/**
 * Encodes all characters that have to be escaped in HTML text,
 * following {@link https://html.spec.whatwg.org/multipage/parsing.html#escapingString}.
 *
 * @param data String to escape.
 */
exports.escapeText = getEscaper(/[&<>\u00A0]/g, new Map([
    [38, "&amp;"],
    [60, "&lt;"],
    [62, "&gt;"],
    [160, "&nbsp;"],
]));

},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Generated using scripts/write-decode-map.ts
// prettier-ignore
exports.default = new Uint16Array([7489, 60, 213, 305, 650, 1181, 1403, 1488, 1653, 1758, 1954, 2006, 2063, 2634, 2705, 3489, 3693, 3849, 3878, 4298, 4648, 4833, 5141, 5277, 5315, 5343, 5413, 0, 0, 0, 0, 0, 0, 5483, 5837, 6541, 7186, 7645, 8062, 8288, 8624, 8845, 9152, 9211, 9282, 10276, 10514, 11528, 11848, 12238, 12310, 12986, 13881, 14252, 14590, 14888, 14961, 15072, 15150, 2048, 69, 77, 97, 98, 99, 102, 103, 108, 109, 110, 111, 112, 114, 115, 116, 117, 92, 98, 102, 109, 115, 127, 132, 139, 144, 149, 152, 166, 179, 185, 200, 207, 108, 105, 103, 32827, 198, 16582, 80, 32827, 38, 16422, 99, 117, 116, 101, 32827, 193, 16577, 114, 101, 118, 101, 59, 16642, 256, 105, 121, 120, 125, 114, 99, 32827, 194, 16578, 59, 17424, 114, 59, 49152, 55349, 56580, 114, 97, 118, 101, 32827, 192, 16576, 112, 104, 97, 59, 17297, 97, 99, 114, 59, 16640, 100, 59, 27219, 256, 103, 112, 157, 161, 111, 110, 59, 16644, 102, 59, 49152, 55349, 56632, 112, 108, 121, 70, 117, 110, 99, 116, 105, 111, 110, 59, 24673, 105, 110, 103, 32827, 197, 16581, 256, 99, 115, 190, 195, 114, 59, 49152, 55349, 56476, 105, 103, 110, 59, 25172, 105, 108, 100, 101, 32827, 195, 16579, 109, 108, 32827, 196, 16580, 1024, 97, 99, 101, 102, 111, 114, 115, 117, 229, 251, 254, 279, 284, 290, 295, 298, 256, 99, 114, 234, 242, 107, 115, 108, 97, 115, 104, 59, 25110, 374, 246, 248, 59, 27367, 101, 100, 59, 25350, 121, 59, 17425, 384, 99, 114, 116, 261, 267, 276, 97, 117, 115, 101, 59, 25141, 110, 111, 117, 108, 108, 105, 115, 59, 24876, 97, 59, 17298, 114, 59, 49152, 55349, 56581, 112, 102, 59, 49152, 55349, 56633, 101, 118, 101, 59, 17112, 99, 242, 275, 109, 112, 101, 113, 59, 25166, 1792, 72, 79, 97, 99, 100, 101, 102, 104, 105, 108, 111, 114, 115, 117, 333, 337, 342, 384, 414, 418, 437, 439, 442, 476, 533, 627, 632, 638, 99, 121, 59, 17447, 80, 89, 32827, 169, 16553, 384, 99, 112, 121, 349, 354, 378, 117, 116, 101, 59, 16646, 256, 59, 105, 359, 360, 25298, 116, 97, 108, 68, 105, 102, 102, 101, 114, 101, 110, 116, 105, 97, 108, 68, 59, 24901, 108, 101, 121, 115, 59, 24877, 512, 97, 101, 105, 111, 393, 398, 404, 408, 114, 111, 110, 59, 16652, 100, 105, 108, 32827, 199, 16583, 114, 99, 59, 16648, 110, 105, 110, 116, 59, 25136, 111, 116, 59, 16650, 256, 100, 110, 423, 429, 105, 108, 108, 97, 59, 16568, 116, 101, 114, 68, 111, 116, 59, 16567, 242, 383, 105, 59, 17319, 114, 99, 108, 101, 512, 68, 77, 80, 84, 455, 459, 465, 470, 111, 116, 59, 25241, 105, 110, 117, 115, 59, 25238, 108, 117, 115, 59, 25237, 105, 109, 101, 115, 59, 25239, 111, 256, 99, 115, 482, 504, 107, 119, 105, 115, 101, 67, 111, 110, 116, 111, 117, 114, 73, 110, 116, 101, 103, 114, 97, 108, 59, 25138, 101, 67, 117, 114, 108, 121, 256, 68, 81, 515, 527, 111, 117, 98, 108, 101, 81, 117, 111, 116, 101, 59, 24605, 117, 111, 116, 101, 59, 24601, 512, 108, 110, 112, 117, 542, 552, 583, 597, 111, 110, 256, 59, 101, 549, 550, 25143, 59, 27252, 384, 103, 105, 116, 559, 566, 570, 114, 117, 101, 110, 116, 59, 25185, 110, 116, 59, 25135, 111, 117, 114, 73, 110, 116, 101, 103, 114, 97, 108, 59, 25134, 256, 102, 114, 588, 590, 59, 24834, 111, 100, 117, 99, 116, 59, 25104, 110, 116, 101, 114, 67, 108, 111, 99, 107, 119, 105, 115, 101, 67, 111, 110, 116, 111, 117, 114, 73, 110, 116, 101, 103, 114, 97, 108, 59, 25139, 111, 115, 115, 59, 27183, 99, 114, 59, 49152, 55349, 56478, 112, 256, 59, 67, 644, 645, 25299, 97, 112, 59, 25165, 1408, 68, 74, 83, 90, 97, 99, 101, 102, 105, 111, 115, 672, 684, 688, 692, 696, 715, 727, 737, 742, 819, 1165, 256, 59, 111, 377, 677, 116, 114, 97, 104, 100, 59, 26897, 99, 121, 59, 17410, 99, 121, 59, 17413, 99, 121, 59, 17423, 384, 103, 114, 115, 703, 708, 711, 103, 101, 114, 59, 24609, 114, 59, 24993, 104, 118, 59, 27364, 256, 97, 121, 720, 725, 114, 111, 110, 59, 16654, 59, 17428, 108, 256, 59, 116, 733, 734, 25095, 97, 59, 17300, 114, 59, 49152, 55349, 56583, 256, 97, 102, 747, 807, 256, 99, 109, 752, 802, 114, 105, 116, 105, 99, 97, 108, 512, 65, 68, 71, 84, 768, 774, 790, 796, 99, 117, 116, 101, 59, 16564, 111, 372, 779, 781, 59, 17113, 98, 108, 101, 65, 99, 117, 116, 101, 59, 17117, 114, 97, 118, 101, 59, 16480, 105, 108, 100, 101, 59, 17116, 111, 110, 100, 59, 25284, 102, 101, 114, 101, 110, 116, 105, 97, 108, 68, 59, 24902, 1136, 829, 0, 0, 0, 834, 852, 0, 1029, 102, 59, 49152, 55349, 56635, 384, 59, 68, 69, 840, 841, 845, 16552, 111, 116, 59, 24796, 113, 117, 97, 108, 59, 25168, 98, 108, 101, 768, 67, 68, 76, 82, 85, 86, 867, 882, 898, 975, 994, 1016, 111, 110, 116, 111, 117, 114, 73, 110, 116, 101, 103, 114, 97, 236, 569, 111, 628, 889, 0, 0, 891, 187, 841, 110, 65, 114, 114, 111, 119, 59, 25043, 256, 101, 111, 903, 932, 102, 116, 384, 65, 82, 84, 912, 918, 929, 114, 114, 111, 119, 59, 25040, 105, 103, 104, 116, 65, 114, 114, 111, 119, 59, 25044, 101, 229, 714, 110, 103, 256, 76, 82, 939, 964, 101, 102, 116, 256, 65, 82, 947, 953, 114, 114, 111, 119, 59, 26616, 105, 103, 104, 116, 65, 114, 114, 111, 119, 59, 26618, 105, 103, 104, 116, 65, 114, 114, 111, 119, 59, 26617, 105, 103, 104, 116, 256, 65, 84, 984, 990, 114, 114, 111, 119, 59, 25042, 101, 101, 59, 25256, 112, 577, 1001, 0, 0, 1007, 114, 114, 111, 119, 59, 25041, 111, 119, 110, 65, 114, 114, 111, 119, 59, 25045, 101, 114, 116, 105, 99, 97, 108, 66, 97, 114, 59, 25125, 110, 768, 65, 66, 76, 82, 84, 97, 1042, 1066, 1072, 1118, 1151, 892, 114, 114, 111, 119, 384, 59, 66, 85, 1053, 1054, 1058, 24979, 97, 114, 59, 26899, 112, 65, 114, 114, 111, 119, 59, 25077, 114, 101, 118, 101, 59, 17169, 101, 102, 116, 722, 1082, 0, 1094, 0, 1104, 105, 103, 104, 116, 86, 101, 99, 116, 111, 114, 59, 26960, 101, 101, 86, 101, 99, 116, 111, 114, 59, 26974, 101, 99, 116, 111, 114, 256, 59, 66, 1113, 1114, 25021, 97, 114, 59, 26966, 105, 103, 104, 116, 468, 1127, 0, 1137, 101, 101, 86, 101, 99, 116, 111, 114, 59, 26975, 101, 99, 116, 111, 114, 256, 59, 66, 1146, 1147, 25025, 97, 114, 59, 26967, 101, 101, 256, 59, 65, 1158, 1159, 25252, 114, 114, 111, 119, 59, 24999, 256, 99, 116, 1170, 1175, 114, 59, 49152, 55349, 56479, 114, 111, 107, 59, 16656, 2048, 78, 84, 97, 99, 100, 102, 103, 108, 109, 111, 112, 113, 115, 116, 117, 120, 1213, 1216, 1220, 1227, 1246, 1250, 1255, 1262, 1269, 1313, 1327, 1334, 1362, 1373, 1376, 1381, 71, 59, 16714, 72, 32827, 208, 16592, 99, 117, 116, 101, 32827, 201, 16585, 384, 97, 105, 121, 1234, 1239, 1244, 114, 111, 110, 59, 16666, 114, 99, 32827, 202, 16586, 59, 17453, 111, 116, 59, 16662, 114, 59, 49152, 55349, 56584, 114, 97, 118, 101, 32827, 200, 16584, 101, 109, 101, 110, 116, 59, 25096, 256, 97, 112, 1274, 1278, 99, 114, 59, 16658, 116, 121, 595, 1286, 0, 0, 1298, 109, 97, 108, 108, 83, 113, 117, 97, 114, 101, 59, 26107, 101, 114, 121, 83, 109, 97, 108, 108, 83, 113, 117, 97, 114, 101, 59, 26027, 256, 103, 112, 1318, 1322, 111, 110, 59, 16664, 102, 59, 49152, 55349, 56636, 115, 105, 108, 111, 110, 59, 17301, 117, 256, 97, 105, 1340, 1353, 108, 256, 59, 84, 1346, 1347, 27253, 105, 108, 100, 101, 59, 25154, 108, 105, 98, 114, 105, 117, 109, 59, 25036, 256, 99, 105, 1367, 1370, 114, 59, 24880, 109, 59, 27251, 97, 59, 17303, 109, 108, 32827, 203, 16587, 256, 105, 112, 1386, 1391, 115, 116, 115, 59, 25091, 111, 110, 101, 110, 116, 105, 97, 108, 69, 59, 24903, 640, 99, 102, 105, 111, 115, 1413, 1416, 1421, 1458, 1484, 121, 59, 17444, 114, 59, 49152, 55349, 56585, 108, 108, 101, 100, 595, 1431, 0, 0, 1443, 109, 97, 108, 108, 83, 113, 117, 97, 114, 101, 59, 26108, 101, 114, 121, 83, 109, 97, 108, 108, 83, 113, 117, 97, 114, 101, 59, 26026, 880, 1466, 0, 1471, 0, 0, 1476, 102, 59, 49152, 55349, 56637, 65, 108, 108, 59, 25088, 114, 105, 101, 114, 116, 114, 102, 59, 24881, 99, 242, 1483, 1536, 74, 84, 97, 98, 99, 100, 102, 103, 111, 114, 115, 116, 1512, 1516, 1519, 1530, 1536, 1554, 1558, 1563, 1565, 1571, 1644, 1650, 99, 121, 59, 17411, 32827, 62, 16446, 109, 109, 97, 256, 59, 100, 1527, 1528, 17299, 59, 17372, 114, 101, 118, 101, 59, 16670, 384, 101, 105, 121, 1543, 1548, 1552, 100, 105, 108, 59, 16674, 114, 99, 59, 16668, 59, 17427, 111, 116, 59, 16672, 114, 59, 49152, 55349, 56586, 59, 25305, 112, 102, 59, 49152, 55349, 56638, 101, 97, 116, 101, 114, 768, 69, 70, 71, 76, 83, 84, 1589, 1604, 1614, 1622, 1627, 1638, 113, 117, 97, 108, 256, 59, 76, 1598, 1599, 25189, 101, 115, 115, 59, 25307, 117, 108, 108, 69, 113, 117, 97, 108, 59, 25191, 114, 101, 97, 116, 101, 114, 59, 27298, 101, 115, 115, 59, 25207, 108, 97, 110, 116, 69, 113, 117, 97, 108, 59, 27262, 105, 108, 100, 101, 59, 25203, 99, 114, 59, 49152, 55349, 56482, 59, 25195, 1024, 65, 97, 99, 102, 105, 111, 115, 117, 1669, 1675, 1686, 1691, 1694, 1706, 1726, 1738, 82, 68, 99, 121, 59, 17450, 256, 99, 116, 1680, 1684, 101, 107, 59, 17095, 59, 16478, 105, 114, 99, 59, 16676, 114, 59, 24844, 108, 98, 101, 114, 116, 83, 112, 97, 99, 101, 59, 24843, 496, 1711, 0, 1714, 102, 59, 24845, 105, 122, 111, 110, 116, 97, 108, 76, 105, 110, 101, 59, 25856, 256, 99, 116, 1731, 1733, 242, 1705, 114, 111, 107, 59, 16678, 109, 112, 324, 1744, 1752, 111, 119, 110, 72, 117, 109, 240, 303, 113, 117, 97, 108, 59, 25167, 1792, 69, 74, 79, 97, 99, 100, 102, 103, 109, 110, 111, 115, 116, 117, 1786, 1790, 1795, 1799, 1806, 1818, 1822, 1825, 1832, 1860, 1912, 1931, 1935, 1941, 99, 121, 59, 17429, 108, 105, 103, 59, 16690, 99, 121, 59, 17409, 99, 117, 116, 101, 32827, 205, 16589, 256, 105, 121, 1811, 1816, 114, 99, 32827, 206, 16590, 59, 17432, 111, 116, 59, 16688, 114, 59, 24849, 114, 97, 118, 101, 32827, 204, 16588, 384, 59, 97, 112, 1824, 1839, 1855, 256, 99, 103, 1844, 1847, 114, 59, 16682, 105, 110, 97, 114, 121, 73, 59, 24904, 108, 105, 101, 243, 989, 500, 1865, 0, 1890, 256, 59, 101, 1869, 1870, 25132, 256, 103, 114, 1875, 1880, 114, 97, 108, 59, 25131, 115, 101, 99, 116, 105, 111, 110, 59, 25282, 105, 115, 105, 98, 108, 101, 256, 67, 84, 1900, 1906, 111, 109, 109, 97, 59, 24675, 105, 109, 101, 115, 59, 24674, 384, 103, 112, 116, 1919, 1923, 1928, 111, 110, 59, 16686, 102, 59, 49152, 55349, 56640, 97, 59, 17305, 99, 114, 59, 24848, 105, 108, 100, 101, 59, 16680, 491, 1946, 0, 1950, 99, 121, 59, 17414, 108, 32827, 207, 16591, 640, 99, 102, 111, 115, 117, 1964, 1975, 1980, 1986, 2000, 256, 105, 121, 1969, 1973, 114, 99, 59, 16692, 59, 17433, 114, 59, 49152, 55349, 56589, 112, 102, 59, 49152, 55349, 56641, 483, 1991, 0, 1996, 114, 59, 49152, 55349, 56485, 114, 99, 121, 59, 17416, 107, 99, 121, 59, 17412, 896, 72, 74, 97, 99, 102, 111, 115, 2020, 2024, 2028, 2033, 2045, 2050, 2056, 99, 121, 59, 17445, 99, 121, 59, 17420, 112, 112, 97, 59, 17306, 256, 101, 121, 2038, 2043, 100, 105, 108, 59, 16694, 59, 17434, 114, 59, 49152, 55349, 56590, 112, 102, 59, 49152, 55349, 56642, 99, 114, 59, 49152, 55349, 56486, 1408, 74, 84, 97, 99, 101, 102, 108, 109, 111, 115, 116, 2085, 2089, 2092, 2128, 2147, 2483, 2488, 2503, 2509, 2615, 2631, 99, 121, 59, 17417, 32827, 60, 16444, 640, 99, 109, 110, 112, 114, 2103, 2108, 2113, 2116, 2125, 117, 116, 101, 59, 16697, 98, 100, 97, 59, 17307, 103, 59, 26602, 108, 97, 99, 101, 116, 114, 102, 59, 24850, 114, 59, 24990, 384, 97, 101, 121, 2135, 2140, 2145, 114, 111, 110, 59, 16701, 100, 105, 108, 59, 16699, 59, 17435, 256, 102, 115, 2152, 2416, 116, 1280, 65, 67, 68, 70, 82, 84, 85, 86, 97, 114, 2174, 2217, 2225, 2272, 2278, 2300, 2351, 2395, 912, 2410, 256, 110, 114, 2179, 2191, 103, 108, 101, 66, 114, 97, 99, 107, 101, 116, 59, 26600, 114, 111, 119, 384, 59, 66, 82, 2201, 2202, 2206, 24976, 97, 114, 59, 25060, 105, 103, 104, 116, 65, 114, 114, 111, 119, 59, 25030, 101, 105, 108, 105, 110, 103, 59, 25352, 111, 501, 2231, 0, 2243, 98, 108, 101, 66, 114, 97, 99, 107, 101, 116, 59, 26598, 110, 468, 2248, 0, 2258, 101, 101, 86, 101, 99, 116, 111, 114, 59, 26977, 101, 99, 116, 111, 114, 256, 59, 66, 2267, 2268, 25027, 97, 114, 59, 26969, 108, 111, 111, 114, 59, 25354, 105, 103, 104, 116, 256, 65, 86, 2287, 2293, 114, 114, 111, 119, 59, 24980, 101, 99, 116, 111, 114, 59, 26958, 256, 101, 114, 2305, 2327, 101, 384, 59, 65, 86, 2313, 2314, 2320, 25251, 114, 114, 111, 119, 59, 24996, 101, 99, 116, 111, 114, 59, 26970, 105, 97, 110, 103, 108, 101, 384, 59, 66, 69, 2340, 2341, 2345, 25266, 97, 114, 59, 27087, 113, 117, 97, 108, 59, 25268, 112, 384, 68, 84, 86, 2359, 2370, 2380, 111, 119, 110, 86, 101, 99, 116, 111, 114, 59, 26961, 101, 101, 86, 101, 99, 116, 111, 114, 59, 26976, 101, 99, 116, 111, 114, 256, 59, 66, 2390, 2391, 25023, 97, 114, 59, 26968, 101, 99, 116, 111, 114, 256, 59, 66, 2405, 2406, 25020, 97, 114, 59, 26962, 105, 103, 104, 116, 225, 924, 115, 768, 69, 70, 71, 76, 83, 84, 2430, 2443, 2453, 2461, 2466, 2477, 113, 117, 97, 108, 71, 114, 101, 97, 116, 101, 114, 59, 25306, 117, 108, 108, 69, 113, 117, 97, 108, 59, 25190, 114, 101, 97, 116, 101, 114, 59, 25206, 101, 115, 115, 59, 27297, 108, 97, 110, 116, 69, 113, 117, 97, 108, 59, 27261, 105, 108, 100, 101, 59, 25202, 114, 59, 49152, 55349, 56591, 256, 59, 101, 2493, 2494, 25304, 102, 116, 97, 114, 114, 111, 119, 59, 25050, 105, 100, 111, 116, 59, 16703, 384, 110, 112, 119, 2516, 2582, 2587, 103, 512, 76, 82, 108, 114, 2526, 2551, 2562, 2576, 101, 102, 116, 256, 65, 82, 2534, 2540, 114, 114, 111, 119, 59, 26613, 105, 103, 104, 116, 65, 114, 114, 111, 119, 59, 26615, 105, 103, 104, 116, 65, 114, 114, 111, 119, 59, 26614, 101, 102, 116, 256, 97, 114, 947, 2570, 105, 103, 104, 116, 225, 959, 105, 103, 104, 116, 225, 970, 102, 59, 49152, 55349, 56643, 101, 114, 256, 76, 82, 2594, 2604, 101, 102, 116, 65, 114, 114, 111, 119, 59, 24985, 105, 103, 104, 116, 65, 114, 114, 111, 119, 59, 24984, 384, 99, 104, 116, 2622, 2624, 2626, 242, 2124, 59, 25008, 114, 111, 107, 59, 16705, 59, 25194, 1024, 97, 99, 101, 102, 105, 111, 115, 117, 2650, 2653, 2656, 2679, 2684, 2693, 2699, 2702, 112, 59, 26885, 121, 59, 17436, 256, 100, 108, 2661, 2671, 105, 117, 109, 83, 112, 97, 99, 101, 59, 24671, 108, 105, 110, 116, 114, 102, 59, 24883, 114, 59, 49152, 55349, 56592, 110, 117, 115, 80, 108, 117, 115, 59, 25107, 112, 102, 59, 49152, 55349, 56644, 99, 242, 2678, 59, 17308, 1152, 74, 97, 99, 101, 102, 111, 115, 116, 117, 2723, 2727, 2733, 2752, 2836, 2841, 3473, 3479, 3486, 99, 121, 59, 17418, 99, 117, 116, 101, 59, 16707, 384, 97, 101, 121, 2740, 2745, 2750, 114, 111, 110, 59, 16711, 100, 105, 108, 59, 16709, 59, 17437, 384, 103, 115, 119, 2759, 2800, 2830, 97, 116, 105, 118, 101, 384, 77, 84, 86, 2771, 2783, 2792, 101, 100, 105, 117, 109, 83, 112, 97, 99, 101, 59, 24587, 104, 105, 256, 99, 110, 2790, 2776, 235, 2777, 101, 114, 121, 84, 104, 105, 238, 2777, 116, 101, 100, 256, 71, 76, 2808, 2822, 114, 101, 97, 116, 101, 114, 71, 114, 101, 97, 116, 101, 242, 1651, 101, 115, 115, 76, 101, 115, 243, 2632, 76, 105, 110, 101, 59, 16394, 114, 59, 49152, 55349, 56593, 512, 66, 110, 112, 116, 2850, 2856, 2871, 2874, 114, 101, 97, 107, 59, 24672, 66, 114, 101, 97, 107, 105, 110, 103, 83, 112, 97, 99, 101, 59, 16544, 102, 59, 24853, 1664, 59, 67, 68, 69, 71, 72, 76, 78, 80, 82, 83, 84, 86, 2901, 2902, 2922, 2940, 2977, 3051, 3076, 3166, 3204, 3238, 3288, 3425, 3461, 27372, 256, 111, 117, 2907, 2916, 110, 103, 114, 117, 101, 110, 116, 59, 25186, 112, 67, 97, 112, 59, 25197, 111, 117, 98, 108, 101, 86, 101, 114, 116, 105, 99, 97, 108, 66, 97, 114, 59, 25126, 384, 108, 113, 120, 2947, 2954, 2971, 101, 109, 101, 110, 116, 59, 25097, 117, 97, 108, 256, 59, 84, 2962, 2963, 25184, 105, 108, 100, 101, 59, 49152, 8770, 824, 105, 115, 116, 115, 59, 25092, 114, 101, 97, 116, 101, 114, 896, 59, 69, 70, 71, 76, 83, 84, 2998, 2999, 3005, 3017, 3027, 3032, 3045, 25199, 113, 117, 97, 108, 59, 25201, 117, 108, 108, 69, 113, 117, 97, 108, 59, 49152, 8807, 824, 114, 101, 97, 116, 101, 114, 59, 49152, 8811, 824, 101, 115, 115, 59, 25209, 108, 97, 110, 116, 69, 113, 117, 97, 108, 59, 49152, 10878, 824, 105, 108, 100, 101, 59, 25205, 117, 109, 112, 324, 3058, 3069, 111, 119, 110, 72, 117, 109, 112, 59, 49152, 8782, 824, 113, 117, 97, 108, 59, 49152, 8783, 824, 101, 256, 102, 115, 3082, 3111, 116, 84, 114, 105, 97, 110, 103, 108, 101, 384, 59, 66, 69, 3098, 3099, 3105, 25322, 97, 114, 59, 49152, 10703, 824, 113, 117, 97, 108, 59, 25324, 115, 768, 59, 69, 71, 76, 83, 84, 3125, 3126, 3132, 3140, 3147, 3160, 25198, 113, 117, 97, 108, 59, 25200, 114, 101, 97, 116, 101, 114, 59, 25208, 101, 115, 115, 59, 49152, 8810, 824, 108, 97, 110, 116, 69, 113, 117, 97, 108, 59, 49152, 10877, 824, 105, 108, 100, 101, 59, 25204, 101, 115, 116, 101, 100, 256, 71, 76, 3176, 3193, 114, 101, 97, 116, 101, 114, 71, 114, 101, 97, 116, 101, 114, 59, 49152, 10914, 824, 101, 115, 115, 76, 101, 115, 115, 59, 49152, 10913, 824, 114, 101, 99, 101, 100, 101, 115, 384, 59, 69, 83, 3218, 3219, 3227, 25216, 113, 117, 97, 108, 59, 49152, 10927, 824, 108, 97, 110, 116, 69, 113, 117, 97, 108, 59, 25312, 256, 101, 105, 3243, 3257, 118, 101, 114, 115, 101, 69, 108, 101, 109, 101, 110, 116, 59, 25100, 103, 104, 116, 84, 114, 105, 97, 110, 103, 108, 101, 384, 59, 66, 69, 3275, 3276, 3282, 25323, 97, 114, 59, 49152, 10704, 824, 113, 117, 97, 108, 59, 25325, 256, 113, 117, 3293, 3340, 117, 97, 114, 101, 83, 117, 256, 98, 112, 3304, 3321, 115, 101, 116, 256, 59, 69, 3312, 3315, 49152, 8847, 824, 113, 117, 97, 108, 59, 25314, 101, 114, 115, 101, 116, 256, 59, 69, 3331, 3334, 49152, 8848, 824, 113, 117, 97, 108, 59, 25315, 384, 98, 99, 112, 3347, 3364, 3406, 115, 101, 116, 256, 59, 69, 3355, 3358, 49152, 8834, 8402, 113, 117, 97, 108, 59, 25224, 99, 101, 101, 100, 115, 512, 59, 69, 83, 84, 3378, 3379, 3387, 3398, 25217, 113, 117, 97, 108, 59, 49152, 10928, 824, 108, 97, 110, 116, 69, 113, 117, 97, 108, 59, 25313, 105, 108, 100, 101, 59, 49152, 8831, 824, 101, 114, 115, 101, 116, 256, 59, 69, 3416, 3419, 49152, 8835, 8402, 113, 117, 97, 108, 59, 25225, 105, 108, 100, 101, 512, 59, 69, 70, 84, 3438, 3439, 3445, 3455, 25153, 113, 117, 97, 108, 59, 25156, 117, 108, 108, 69, 113, 117, 97, 108, 59, 25159, 105, 108, 100, 101, 59, 25161, 101, 114, 116, 105, 99, 97, 108, 66, 97, 114, 59, 25124, 99, 114, 59, 49152, 55349, 56489, 105, 108, 100, 101, 32827, 209, 16593, 59, 17309, 1792, 69, 97, 99, 100, 102, 103, 109, 111, 112, 114, 115, 116, 117, 118, 3517, 3522, 3529, 3541, 3547, 3552, 3559, 3580, 3586, 3616, 3618, 3634, 3647, 3652, 108, 105, 103, 59, 16722, 99, 117, 116, 101, 32827, 211, 16595, 256, 105, 121, 3534, 3539, 114, 99, 32827, 212, 16596, 59, 17438, 98, 108, 97, 99, 59, 16720, 114, 59, 49152, 55349, 56594, 114, 97, 118, 101, 32827, 210, 16594, 384, 97, 101, 105, 3566, 3570, 3574, 99, 114, 59, 16716, 103, 97, 59, 17321, 99, 114, 111, 110, 59, 17311, 112, 102, 59, 49152, 55349, 56646, 101, 110, 67, 117, 114, 108, 121, 256, 68, 81, 3598, 3610, 111, 117, 98, 108, 101, 81, 117, 111, 116, 101, 59, 24604, 117, 111, 116, 101, 59, 24600, 59, 27220, 256, 99, 108, 3623, 3628, 114, 59, 49152, 55349, 56490, 97, 115, 104, 32827, 216, 16600, 105, 364, 3639, 3644, 100, 101, 32827, 213, 16597, 101, 115, 59, 27191, 109, 108, 32827, 214, 16598, 101, 114, 256, 66, 80, 3659, 3680, 256, 97, 114, 3664, 3667, 114, 59, 24638, 97, 99, 256, 101, 107, 3674, 3676, 59, 25566, 101, 116, 59, 25524, 97, 114, 101, 110, 116, 104, 101, 115, 105, 115, 59, 25564, 1152, 97, 99, 102, 104, 105, 108, 111, 114, 115, 3711, 3719, 3722, 3727, 3730, 3732, 3741, 3760, 3836, 114, 116, 105, 97, 108, 68, 59, 25090, 121, 59, 17439, 114, 59, 49152, 55349, 56595, 105, 59, 17318, 59, 17312, 117, 115, 77, 105, 110, 117, 115, 59, 16561, 256, 105, 112, 3746, 3757, 110, 99, 97, 114, 101, 112, 108, 97, 110, 229, 1693, 102, 59, 24857, 512, 59, 101, 105, 111, 3769, 3770, 3808, 3812, 27323, 99, 101, 100, 101, 115, 512, 59, 69, 83, 84, 3784, 3785, 3791, 3802, 25210, 113, 117, 97, 108, 59, 27311, 108, 97, 110, 116, 69, 113, 117, 97, 108, 59, 25212, 105, 108, 100, 101, 59, 25214, 109, 101, 59, 24627, 256, 100, 112, 3817, 3822, 117, 99, 116, 59, 25103, 111, 114, 116, 105, 111, 110, 256, 59, 97, 549, 3833, 108, 59, 25117, 256, 99, 105, 3841, 3846, 114, 59, 49152, 55349, 56491, 59, 17320, 512, 85, 102, 111, 115, 3857, 3862, 3867, 3871, 79, 84, 32827, 34, 16418, 114, 59, 49152, 55349, 56596, 112, 102, 59, 24858, 99, 114, 59, 49152, 55349, 56492, 1536, 66, 69, 97, 99, 101, 102, 104, 105, 111, 114, 115, 117, 3902, 3907, 3911, 3936, 3955, 4007, 4010, 4013, 4246, 4265, 4276, 4286, 97, 114, 114, 59, 26896, 71, 32827, 174, 16558, 384, 99, 110, 114, 3918, 3923, 3926, 117, 116, 101, 59, 16724, 103, 59, 26603, 114, 256, 59, 116, 3932, 3933, 24992, 108, 59, 26902, 384, 97, 101, 121, 3943, 3948, 3953, 114, 111, 110, 59, 16728, 100, 105, 108, 59, 16726, 59, 17440, 256, 59, 118, 3960, 3961, 24860, 101, 114, 115, 101, 256, 69, 85, 3970, 3993, 256, 108, 113, 3975, 3982, 101, 109, 101, 110, 116, 59, 25099, 117, 105, 108, 105, 98, 114, 105, 117, 109, 59, 25035, 112, 69, 113, 117, 105, 108, 105, 98, 114, 105, 117, 109, 59, 26991, 114, 187, 3961, 111, 59, 17313, 103, 104, 116, 1024, 65, 67, 68, 70, 84, 85, 86, 97, 4033, 4075, 4083, 4130, 4136, 4187, 4231, 984, 256, 110, 114, 4038, 4050, 103, 108, 101, 66, 114, 97, 99, 107, 101, 116, 59, 26601, 114, 111, 119, 384, 59, 66, 76, 4060, 4061, 4065, 24978, 97, 114, 59, 25061, 101, 102, 116, 65, 114, 114, 111, 119, 59, 25028, 101, 105, 108, 105, 110, 103, 59, 25353, 111, 501, 4089, 0, 4101, 98, 108, 101, 66, 114, 97, 99, 107, 101, 116, 59, 26599, 110, 468, 4106, 0, 4116, 101, 101, 86, 101, 99, 116, 111, 114, 59, 26973, 101, 99, 116, 111, 114, 256, 59, 66, 4125, 4126, 25026, 97, 114, 59, 26965, 108, 111, 111, 114, 59, 25355, 256, 101, 114, 4141, 4163, 101, 384, 59, 65, 86, 4149, 4150, 4156, 25250, 114, 114, 111, 119, 59, 24998, 101, 99, 116, 111, 114, 59, 26971, 105, 97, 110, 103, 108, 101, 384, 59, 66, 69, 4176, 4177, 4181, 25267, 97, 114, 59, 27088, 113, 117, 97, 108, 59, 25269, 112, 384, 68, 84, 86, 4195, 4206, 4216, 111, 119, 110, 86, 101, 99, 116, 111, 114, 59, 26959, 101, 101, 86, 101, 99, 116, 111, 114, 59, 26972, 101, 99, 116, 111, 114, 256, 59, 66, 4226, 4227, 25022, 97, 114, 59, 26964, 101, 99, 116, 111, 114, 256, 59, 66, 4241, 4242, 25024, 97, 114, 59, 26963, 256, 112, 117, 4251, 4254, 102, 59, 24861, 110, 100, 73, 109, 112, 108, 105, 101, 115, 59, 26992, 105, 103, 104, 116, 97, 114, 114, 111, 119, 59, 25051, 256, 99, 104, 4281, 4284, 114, 59, 24859, 59, 25009, 108, 101, 68, 101, 108, 97, 121, 101, 100, 59, 27124, 1664, 72, 79, 97, 99, 102, 104, 105, 109, 111, 113, 115, 116, 117, 4324, 4337, 4343, 4349, 4377, 4382, 4433, 4438, 4449, 4455, 4533, 4539, 4543, 256, 67, 99, 4329, 4334, 72, 99, 121, 59, 17449, 121, 59, 17448, 70, 84, 99, 121, 59, 17452, 99, 117, 116, 101, 59, 16730, 640, 59, 97, 101, 105, 121, 4360, 4361, 4366, 4371, 4375, 27324, 114, 111, 110, 59, 16736, 100, 105, 108, 59, 16734, 114, 99, 59, 16732, 59, 17441, 114, 59, 49152, 55349, 56598, 111, 114, 116, 512, 68, 76, 82, 85, 4394, 4404, 4414, 4425, 111, 119, 110, 65, 114, 114, 111, 119, 187, 1054, 101, 102, 116, 65, 114, 114, 111, 119, 187, 2202, 105, 103, 104, 116, 65, 114, 114, 111, 119, 187, 4061, 112, 65, 114, 114, 111, 119, 59, 24977, 103, 109, 97, 59, 17315, 97, 108, 108, 67, 105, 114, 99, 108, 101, 59, 25112, 112, 102, 59, 49152, 55349, 56650, 626, 4461, 0, 0, 4464, 116, 59, 25114, 97, 114, 101, 512, 59, 73, 83, 85, 4475, 4476, 4489, 4527, 26017, 110, 116, 101, 114, 115, 101, 99, 116, 105, 111, 110, 59, 25235, 117, 256, 98, 112, 4495, 4510, 115, 101, 116, 256, 59, 69, 4503, 4504, 25231, 113, 117, 97, 108, 59, 25233, 101, 114, 115, 101, 116, 256, 59, 69, 4520, 4521, 25232, 113, 117, 97, 108, 59, 25234, 110, 105, 111, 110, 59, 25236, 99, 114, 59, 49152, 55349, 56494, 97, 114, 59, 25286, 512, 98, 99, 109, 112, 4552, 4571, 4617, 4619, 256, 59, 115, 4557, 4558, 25296, 101, 116, 256, 59, 69, 4557, 4565, 113, 117, 97, 108, 59, 25222, 256, 99, 104, 4576, 4613, 101, 101, 100, 115, 512, 59, 69, 83, 84, 4589, 4590, 4596, 4607, 25211, 113, 117, 97, 108, 59, 27312, 108, 97, 110, 116, 69, 113, 117, 97, 108, 59, 25213, 105, 108, 100, 101, 59, 25215, 84, 104, 225, 3980, 59, 25105, 384, 59, 101, 115, 4626, 4627, 4643, 25297, 114, 115, 101, 116, 256, 59, 69, 4636, 4637, 25219, 113, 117, 97, 108, 59, 25223, 101, 116, 187, 4627, 1408, 72, 82, 83, 97, 99, 102, 104, 105, 111, 114, 115, 4670, 4676, 4681, 4693, 4702, 4721, 4726, 4767, 4802, 4808, 4817, 79, 82, 78, 32827, 222, 16606, 65, 68, 69, 59, 24866, 256, 72, 99, 4686, 4690, 99, 121, 59, 17419, 121, 59, 17446, 256, 98, 117, 4698, 4700, 59, 16393, 59, 17316, 384, 97, 101, 121, 4709, 4714, 4719, 114, 111, 110, 59, 16740, 100, 105, 108, 59, 16738, 59, 17442, 114, 59, 49152, 55349, 56599, 256, 101, 105, 4731, 4745, 498, 4736, 0, 4743, 101, 102, 111, 114, 101, 59, 25140, 97, 59, 17304, 256, 99, 110, 4750, 4760, 107, 83, 112, 97, 99, 101, 59, 49152, 8287, 8202, 83, 112, 97, 99, 101, 59, 24585, 108, 100, 101, 512, 59, 69, 70, 84, 4779, 4780, 4786, 4796, 25148, 113, 117, 97, 108, 59, 25155, 117, 108, 108, 69, 113, 117, 97, 108, 59, 25157, 105, 108, 100, 101, 59, 25160, 112, 102, 59, 49152, 55349, 56651, 105, 112, 108, 101, 68, 111, 116, 59, 24795, 256, 99, 116, 4822, 4827, 114, 59, 49152, 55349, 56495, 114, 111, 107, 59, 16742, 2785, 4855, 4878, 4890, 4902, 0, 4908, 4913, 0, 0, 0, 0, 0, 4920, 4925, 4983, 4997, 0, 5119, 5124, 5130, 5136, 256, 99, 114, 4859, 4865, 117, 116, 101, 32827, 218, 16602, 114, 256, 59, 111, 4871, 4872, 24991, 99, 105, 114, 59, 26953, 114, 483, 4883, 0, 4886, 121, 59, 17422, 118, 101, 59, 16748, 256, 105, 121, 4894, 4899, 114, 99, 32827, 219, 16603, 59, 17443, 98, 108, 97, 99, 59, 16752, 114, 59, 49152, 55349, 56600, 114, 97, 118, 101, 32827, 217, 16601, 97, 99, 114, 59, 16746, 256, 100, 105, 4929, 4969, 101, 114, 256, 66, 80, 4936, 4957, 256, 97, 114, 4941, 4944, 114, 59, 16479, 97, 99, 256, 101, 107, 4951, 4953, 59, 25567, 101, 116, 59, 25525, 97, 114, 101, 110, 116, 104, 101, 115, 105, 115, 59, 25565, 111, 110, 256, 59, 80, 4976, 4977, 25283, 108, 117, 115, 59, 25230, 256, 103, 112, 4987, 4991, 111, 110, 59, 16754, 102, 59, 49152, 55349, 56652, 1024, 65, 68, 69, 84, 97, 100, 112, 115, 5013, 5038, 5048, 5060, 1000, 5074, 5079, 5107, 114, 114, 111, 119, 384, 59, 66, 68, 4432, 5024, 5028, 97, 114, 59, 26898, 111, 119, 110, 65, 114, 114, 111, 119, 59, 25029, 111, 119, 110, 65, 114, 114, 111, 119, 59, 24981, 113, 117, 105, 108, 105, 98, 114, 105, 117, 109, 59, 26990, 101, 101, 256, 59, 65, 5067, 5068, 25253, 114, 114, 111, 119, 59, 24997, 111, 119, 110, 225, 1011, 101, 114, 256, 76, 82, 5086, 5096, 101, 102, 116, 65, 114, 114, 111, 119, 59, 24982, 105, 103, 104, 116, 65, 114, 114, 111, 119, 59, 24983, 105, 256, 59, 108, 5113, 5114, 17362, 111, 110, 59, 17317, 105, 110, 103, 59, 16750, 99, 114, 59, 49152, 55349, 56496, 105, 108, 100, 101, 59, 16744, 109, 108, 32827, 220, 16604, 1152, 68, 98, 99, 100, 101, 102, 111, 115, 118, 5159, 5164, 5168, 5171, 5182, 5253, 5258, 5264, 5270, 97, 115, 104, 59, 25259, 97, 114, 59, 27371, 121, 59, 17426, 97, 115, 104, 256, 59, 108, 5179, 5180, 25257, 59, 27366, 256, 101, 114, 5187, 5189, 59, 25281, 384, 98, 116, 121, 5196, 5200, 5242, 97, 114, 59, 24598, 256, 59, 105, 5199, 5205, 99, 97, 108, 512, 66, 76, 83, 84, 5217, 5221, 5226, 5236, 97, 114, 59, 25123, 105, 110, 101, 59, 16508, 101, 112, 97, 114, 97, 116, 111, 114, 59, 26456, 105, 108, 100, 101, 59, 25152, 84, 104, 105, 110, 83, 112, 97, 99, 101, 59, 24586, 114, 59, 49152, 55349, 56601, 112, 102, 59, 49152, 55349, 56653, 99, 114, 59, 49152, 55349, 56497, 100, 97, 115, 104, 59, 25258, 640, 99, 101, 102, 111, 115, 5287, 5292, 5297, 5302, 5308, 105, 114, 99, 59, 16756, 100, 103, 101, 59, 25280, 114, 59, 49152, 55349, 56602, 112, 102, 59, 49152, 55349, 56654, 99, 114, 59, 49152, 55349, 56498, 512, 102, 105, 111, 115, 5323, 5328, 5330, 5336, 114, 59, 49152, 55349, 56603, 59, 17310, 112, 102, 59, 49152, 55349, 56655, 99, 114, 59, 49152, 55349, 56499, 1152, 65, 73, 85, 97, 99, 102, 111, 115, 117, 5361, 5365, 5369, 5373, 5380, 5391, 5396, 5402, 5408, 99, 121, 59, 17455, 99, 121, 59, 17415, 99, 121, 59, 17454, 99, 117, 116, 101, 32827, 221, 16605, 256, 105, 121, 5385, 5389, 114, 99, 59, 16758, 59, 17451, 114, 59, 49152, 55349, 56604, 112, 102, 59, 49152, 55349, 56656, 99, 114, 59, 49152, 55349, 56500, 109, 108, 59, 16760, 1024, 72, 97, 99, 100, 101, 102, 111, 115, 5429, 5433, 5439, 5451, 5455, 5469, 5472, 5476, 99, 121, 59, 17430, 99, 117, 116, 101, 59, 16761, 256, 97, 121, 5444, 5449, 114, 111, 110, 59, 16765, 59, 17431, 111, 116, 59, 16763, 498, 5460, 0, 5467, 111, 87, 105, 100, 116, 232, 2777, 97, 59, 17302, 114, 59, 24872, 112, 102, 59, 24868, 99, 114, 59, 49152, 55349, 56501, 3041, 5507, 5514, 5520, 0, 5552, 5558, 5567, 0, 0, 0, 0, 5574, 5595, 5611, 5727, 5741, 0, 5781, 5787, 5810, 5817, 0, 5822, 99, 117, 116, 101, 32827, 225, 16609, 114, 101, 118, 101, 59, 16643, 768, 59, 69, 100, 105, 117, 121, 5532, 5533, 5537, 5539, 5544, 5549, 25150, 59, 49152, 8766, 819, 59, 25151, 114, 99, 32827, 226, 16610, 116, 101, 32955, 180, 774, 59, 17456, 108, 105, 103, 32827, 230, 16614, 256, 59, 114, 178, 5562, 59, 49152, 55349, 56606, 114, 97, 118, 101, 32827, 224, 16608, 256, 101, 112, 5578, 5590, 256, 102, 112, 5583, 5588, 115, 121, 109, 59, 24885, 232, 5587, 104, 97, 59, 17329, 256, 97, 112, 5599, 99, 256, 99, 108, 5604, 5607, 114, 59, 16641, 103, 59, 27199, 612, 5616, 0, 0, 5642, 640, 59, 97, 100, 115, 118, 5626, 5627, 5631, 5633, 5639, 25127, 110, 100, 59, 27221, 59, 27228, 108, 111, 112, 101, 59, 27224, 59, 27226, 896, 59, 101, 108, 109, 114, 115, 122, 5656, 5657, 5659, 5662, 5695, 5711, 5721, 25120, 59, 27044, 101, 187, 5657, 115, 100, 256, 59, 97, 5669, 5670, 25121, 1121, 5680, 5682, 5684, 5686, 5688, 5690, 5692, 5694, 59, 27048, 59, 27049, 59, 27050, 59, 27051, 59, 27052, 59, 27053, 59, 27054, 59, 27055, 116, 256, 59, 118, 5701, 5702, 25119, 98, 256, 59, 100, 5708, 5709, 25278, 59, 27037, 256, 112, 116, 5716, 5719, 104, 59, 25122, 187, 185, 97, 114, 114, 59, 25468, 256, 103, 112, 5731, 5735, 111, 110, 59, 16645, 102, 59, 49152, 55349, 56658, 896, 59, 69, 97, 101, 105, 111, 112, 4801, 5755, 5757, 5762, 5764, 5767, 5770, 59, 27248, 99, 105, 114, 59, 27247, 59, 25162, 100, 59, 25163, 115, 59, 16423, 114, 111, 120, 256, 59, 101, 4801, 5778, 241, 5763, 105, 110, 103, 32827, 229, 16613, 384, 99, 116, 121, 5793, 5798, 5800, 114, 59, 49152, 55349, 56502, 59, 16426, 109, 112, 256, 59, 101, 4801, 5807, 241, 648, 105, 108, 100, 101, 32827, 227, 16611, 109, 108, 32827, 228, 16612, 256, 99, 105, 5826, 5832, 111, 110, 105, 110, 244, 626, 110, 116, 59, 27153, 2048, 78, 97, 98, 99, 100, 101, 102, 105, 107, 108, 110, 111, 112, 114, 115, 117, 5869, 5873, 5936, 5948, 5955, 5960, 6008, 6013, 6112, 6118, 6201, 6224, 5901, 6461, 6472, 6512, 111, 116, 59, 27373, 256, 99, 114, 5878, 5918, 107, 512, 99, 101, 112, 115, 5888, 5893, 5901, 5907, 111, 110, 103, 59, 25164, 112, 115, 105, 108, 111, 110, 59, 17398, 114, 105, 109, 101, 59, 24629, 105, 109, 256, 59, 101, 5914, 5915, 25149, 113, 59, 25293, 374, 5922, 5926, 101, 101, 59, 25277, 101, 100, 256, 59, 103, 5932, 5933, 25349, 101, 187, 5933, 114, 107, 256, 59, 116, 4956, 5943, 98, 114, 107, 59, 25526, 256, 111, 121, 5889, 5953, 59, 17457, 113, 117, 111, 59, 24606, 640, 99, 109, 112, 114, 116, 5971, 5979, 5985, 5988, 5992, 97, 117, 115, 256, 59, 101, 266, 265, 112, 116, 121, 118, 59, 27056, 115, 233, 5900, 110, 111, 245, 275, 384, 97, 104, 119, 5999, 6001, 6003, 59, 17330, 59, 24886, 101, 101, 110, 59, 25196, 114, 59, 49152, 55349, 56607, 103, 896, 99, 111, 115, 116, 117, 118, 119, 6029, 6045, 6067, 6081, 6101, 6107, 6110, 384, 97, 105, 117, 6036, 6038, 6042, 240, 1888, 114, 99, 59, 26095, 112, 187, 4977, 384, 100, 112, 116, 6052, 6056, 6061, 111, 116, 59, 27136, 108, 117, 115, 59, 27137, 105, 109, 101, 115, 59, 27138, 625, 6073, 0, 0, 6078, 99, 117, 112, 59, 27142, 97, 114, 59, 26117, 114, 105, 97, 110, 103, 108, 101, 256, 100, 117, 6093, 6098, 111, 119, 110, 59, 26045, 112, 59, 26035, 112, 108, 117, 115, 59, 27140, 101, 229, 5188, 229, 5293, 97, 114, 111, 119, 59, 26893, 384, 97, 107, 111, 6125, 6182, 6197, 256, 99, 110, 6130, 6179, 107, 384, 108, 115, 116, 6138, 1451, 6146, 111, 122, 101, 110, 103, 101, 59, 27115, 114, 105, 97, 110, 103, 108, 101, 512, 59, 100, 108, 114, 6162, 6163, 6168, 6173, 26036, 111, 119, 110, 59, 26046, 101, 102, 116, 59, 26050, 105, 103, 104, 116, 59, 26040, 107, 59, 25635, 433, 6187, 0, 6195, 434, 6191, 0, 6193, 59, 26002, 59, 26001, 52, 59, 26003, 99, 107, 59, 25992, 256, 101, 111, 6206, 6221, 256, 59, 113, 6211, 6214, 49152, 61, 8421, 117, 105, 118, 59, 49152, 8801, 8421, 116, 59, 25360, 512, 112, 116, 119, 120, 6233, 6238, 6247, 6252, 102, 59, 49152, 55349, 56659, 256, 59, 116, 5067, 6243, 111, 109, 187, 5068, 116, 105, 101, 59, 25288, 1536, 68, 72, 85, 86, 98, 100, 104, 109, 112, 116, 117, 118, 6277, 6294, 6314, 6331, 6359, 6363, 6380, 6399, 6405, 6410, 6416, 6433, 512, 76, 82, 108, 114, 6286, 6288, 6290, 6292, 59, 25943, 59, 25940, 59, 25942, 59, 25939, 640, 59, 68, 85, 100, 117, 6305, 6306, 6308, 6310, 6312, 25936, 59, 25958, 59, 25961, 59, 25956, 59, 25959, 512, 76, 82, 108, 114, 6323, 6325, 6327, 6329, 59, 25949, 59, 25946, 59, 25948, 59, 25945, 896, 59, 72, 76, 82, 104, 108, 114, 6346, 6347, 6349, 6351, 6353, 6355, 6357, 25937, 59, 25964, 59, 25955, 59, 25952, 59, 25963, 59, 25954, 59, 25951, 111, 120, 59, 27081, 512, 76, 82, 108, 114, 6372, 6374, 6376, 6378, 59, 25941, 59, 25938, 59, 25872, 59, 25868, 640, 59, 68, 85, 100, 117, 1725, 6391, 6393, 6395, 6397, 59, 25957, 59, 25960, 59, 25900, 59, 25908, 105, 110, 117, 115, 59, 25247, 108, 117, 115, 59, 25246, 105, 109, 101, 115, 59, 25248, 512, 76, 82, 108, 114, 6425, 6427, 6429, 6431, 59, 25947, 59, 25944, 59, 25880, 59, 25876, 896, 59, 72, 76, 82, 104, 108, 114, 6448, 6449, 6451, 6453, 6455, 6457, 6459, 25858, 59, 25962, 59, 25953, 59, 25950, 59, 25916, 59, 25892, 59, 25884, 256, 101, 118, 291, 6466, 98, 97, 114, 32827, 166, 16550, 512, 99, 101, 105, 111, 6481, 6486, 6490, 6496, 114, 59, 49152, 55349, 56503, 109, 105, 59, 24655, 109, 256, 59, 101, 5914, 5916, 108, 384, 59, 98, 104, 6504, 6505, 6507, 16476, 59, 27077, 115, 117, 98, 59, 26568, 364, 6516, 6526, 108, 256, 59, 101, 6521, 6522, 24610, 116, 187, 6522, 112, 384, 59, 69, 101, 303, 6533, 6535, 59, 27310, 256, 59, 113, 1756, 1755, 3297, 6567, 0, 6632, 6673, 6677, 6706, 0, 6711, 6736, 0, 0, 6836, 0, 0, 6849, 0, 0, 6945, 6958, 6989, 6994, 0, 7165, 0, 7180, 384, 99, 112, 114, 6573, 6578, 6621, 117, 116, 101, 59, 16647, 768, 59, 97, 98, 99, 100, 115, 6591, 6592, 6596, 6602, 6613, 6617, 25129, 110, 100, 59, 27204, 114, 99, 117, 112, 59, 27209, 256, 97, 117, 6607, 6610, 112, 59, 27211, 112, 59, 27207, 111, 116, 59, 27200, 59, 49152, 8745, 65024, 256, 101, 111, 6626, 6629, 116, 59, 24641, 238, 1683, 512, 97, 101, 105, 117, 6640, 6651, 6657, 6661, 496, 6645, 0, 6648, 115, 59, 27213, 111, 110, 59, 16653, 100, 105, 108, 32827, 231, 16615, 114, 99, 59, 16649, 112, 115, 256, 59, 115, 6668, 6669, 27212, 109, 59, 27216, 111, 116, 59, 16651, 384, 100, 109, 110, 6683, 6688, 6694, 105, 108, 32955, 184, 429, 112, 116, 121, 118, 59, 27058, 116, 33024, 162, 59, 101, 6701, 6702, 16546, 114, 228, 434, 114, 59, 49152, 55349, 56608, 384, 99, 101, 105, 6717, 6720, 6733, 121, 59, 17479, 99, 107, 256, 59, 109, 6727, 6728, 26387, 97, 114, 107, 187, 6728, 59, 17351, 114, 896, 59, 69, 99, 101, 102, 109, 115, 6751, 6752, 6754, 6763, 6820, 6826, 6830, 26059, 59, 27075, 384, 59, 101, 108, 6761, 6762, 6765, 17094, 113, 59, 25175, 101, 609, 6772, 0, 0, 6792, 114, 114, 111, 119, 256, 108, 114, 6780, 6785, 101, 102, 116, 59, 25018, 105, 103, 104, 116, 59, 25019, 640, 82, 83, 97, 99, 100, 6802, 6804, 6806, 6810, 6815, 187, 3911, 59, 25800, 115, 116, 59, 25243, 105, 114, 99, 59, 25242, 97, 115, 104, 59, 25245, 110, 105, 110, 116, 59, 27152, 105, 100, 59, 27375, 99, 105, 114, 59, 27074, 117, 98, 115, 256, 59, 117, 6843, 6844, 26211, 105, 116, 187, 6844, 748, 6855, 6868, 6906, 0, 6922, 111, 110, 256, 59, 101, 6861, 6862, 16442, 256, 59, 113, 199, 198, 621, 6873, 0, 0, 6882, 97, 256, 59, 116, 6878, 6879, 16428, 59, 16448, 384, 59, 102, 108, 6888, 6889, 6891, 25089, 238, 4448, 101, 256, 109, 120, 6897, 6902, 101, 110, 116, 187, 6889, 101, 243, 589, 487, 6910, 0, 6919, 256, 59, 100, 4795, 6914, 111, 116, 59, 27245, 110, 244, 582, 384, 102, 114, 121, 6928, 6932, 6935, 59, 49152, 55349, 56660, 111, 228, 596, 33024, 169, 59, 115, 341, 6941, 114, 59, 24855, 256, 97, 111, 6949, 6953, 114, 114, 59, 25013, 115, 115, 59, 26391, 256, 99, 117, 6962, 6967, 114, 59, 49152, 55349, 56504, 256, 98, 112, 6972, 6980, 256, 59, 101, 6977, 6978, 27343, 59, 27345, 256, 59, 101, 6985, 6986, 27344, 59, 27346, 100, 111, 116, 59, 25327, 896, 100, 101, 108, 112, 114, 118, 119, 7008, 7020, 7031, 7042, 7084, 7124, 7161, 97, 114, 114, 256, 108, 114, 7016, 7018, 59, 26936, 59, 26933, 624, 7026, 0, 0, 7029, 114, 59, 25310, 99, 59, 25311, 97, 114, 114, 256, 59, 112, 7039, 7040, 25014, 59, 26941, 768, 59, 98, 99, 100, 111, 115, 7055, 7056, 7062, 7073, 7077, 7080, 25130, 114, 99, 97, 112, 59, 27208, 256, 97, 117, 7067, 7070, 112, 59, 27206, 112, 59, 27210, 111, 116, 59, 25229, 114, 59, 27205, 59, 49152, 8746, 65024, 512, 97, 108, 114, 118, 7093, 7103, 7134, 7139, 114, 114, 256, 59, 109, 7100, 7101, 25015, 59, 26940, 121, 384, 101, 118, 119, 7111, 7124, 7128, 113, 624, 7118, 0, 0, 7122, 114, 101, 227, 7027, 117, 227, 7029, 101, 101, 59, 25294, 101, 100, 103, 101, 59, 25295, 101, 110, 32827, 164, 16548, 101, 97, 114, 114, 111, 119, 256, 108, 114, 7150, 7155, 101, 102, 116, 187, 7040, 105, 103, 104, 116, 187, 7101, 101, 228, 7133, 256, 99, 105, 7169, 7175, 111, 110, 105, 110, 244, 503, 110, 116, 59, 25137, 108, 99, 116, 121, 59, 25389, 2432, 65, 72, 97, 98, 99, 100, 101, 102, 104, 105, 106, 108, 111, 114, 115, 116, 117, 119, 122, 7224, 7227, 7231, 7261, 7273, 7285, 7306, 7326, 7340, 7351, 7419, 7423, 7437, 7547, 7569, 7595, 7611, 7622, 7629, 114, 242, 897, 97, 114, 59, 26981, 512, 103, 108, 114, 115, 7240, 7245, 7250, 7252, 103, 101, 114, 59, 24608, 101, 116, 104, 59, 24888, 242, 4403, 104, 256, 59, 118, 7258, 7259, 24592, 187, 2314, 363, 7265, 7271, 97, 114, 111, 119, 59, 26895, 97, 227, 789, 256, 97, 121, 7278, 7283, 114, 111, 110, 59, 16655, 59, 17460, 384, 59, 97, 111, 818, 7292, 7300, 256, 103, 114, 703, 7297, 114, 59, 25034, 116, 115, 101, 113, 59, 27255, 384, 103, 108, 109, 7313, 7316, 7320, 32827, 176, 16560, 116, 97, 59, 17332, 112, 116, 121, 118, 59, 27057, 256, 105, 114, 7331, 7336, 115, 104, 116, 59, 27007, 59, 49152, 55349, 56609, 97, 114, 256, 108, 114, 7347, 7349, 187, 2268, 187, 4126, 640, 97, 101, 103, 115, 118, 7362, 888, 7382, 7388, 7392, 109, 384, 59, 111, 115, 806, 7370, 7380, 110, 100, 256, 59, 115, 806, 7377, 117, 105, 116, 59, 26214, 97, 109, 109, 97, 59, 17373, 105, 110, 59, 25330, 384, 59, 105, 111, 7399, 7400, 7416, 16631, 100, 101, 33024, 247, 59, 111, 7399, 7408, 110, 116, 105, 109, 101, 115, 59, 25287, 110, 248, 7415, 99, 121, 59, 17490, 99, 623, 7430, 0, 0, 7434, 114, 110, 59, 25374, 111, 112, 59, 25357, 640, 108, 112, 116, 117, 119, 7448, 7453, 7458, 7497, 7509, 108, 97, 114, 59, 16420, 102, 59, 49152, 55349, 56661, 640, 59, 101, 109, 112, 115, 779, 7469, 7479, 7485, 7490, 113, 256, 59, 100, 850, 7475, 111, 116, 59, 25169, 105, 110, 117, 115, 59, 25144, 108, 117, 115, 59, 25108, 113, 117, 97, 114, 101, 59, 25249, 98, 108, 101, 98, 97, 114, 119, 101, 100, 103, 229, 250, 110, 384, 97, 100, 104, 4398, 7517, 7527, 111, 119, 110, 97, 114, 114, 111, 119, 243, 7299, 97, 114, 112, 111, 111, 110, 256, 108, 114, 7538, 7542, 101, 102, 244, 7348, 105, 103, 104, 244, 7350, 354, 7551, 7557, 107, 97, 114, 111, 247, 3906, 623, 7562, 0, 0, 7566, 114, 110, 59, 25375, 111, 112, 59, 25356, 384, 99, 111, 116, 7576, 7587, 7590, 256, 114, 121, 7581, 7585, 59, 49152, 55349, 56505, 59, 17493, 108, 59, 27126, 114, 111, 107, 59, 16657, 256, 100, 114, 7600, 7604, 111, 116, 59, 25329, 105, 256, 59, 102, 7610, 6166, 26047, 256, 97, 104, 7616, 7619, 114, 242, 1065, 97, 242, 4006, 97, 110, 103, 108, 101, 59, 27046, 256, 99, 105, 7634, 7637, 121, 59, 17503, 103, 114, 97, 114, 114, 59, 26623, 2304, 68, 97, 99, 100, 101, 102, 103, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 120, 7681, 7689, 7705, 7736, 1400, 7740, 7753, 7777, 7806, 7845, 7855, 7869, 7905, 7978, 7991, 8004, 8014, 8026, 256, 68, 111, 7686, 7476, 111, 244, 7305, 256, 99, 115, 7694, 7700, 117, 116, 101, 32827, 233, 16617, 116, 101, 114, 59, 27246, 512, 97, 105, 111, 121, 7714, 7719, 7729, 7734, 114, 111, 110, 59, 16667, 114, 256, 59, 99, 7725, 7726, 25174, 32827, 234, 16618, 108, 111, 110, 59, 25173, 59, 17485, 111, 116, 59, 16663, 256, 68, 114, 7745, 7749, 111, 116, 59, 25170, 59, 49152, 55349, 56610, 384, 59, 114, 115, 7760, 7761, 7767, 27290, 97, 118, 101, 32827, 232, 16616, 256, 59, 100, 7772, 7773, 27286, 111, 116, 59, 27288, 512, 59, 105, 108, 115, 7786, 7787, 7794, 7796, 27289, 110, 116, 101, 114, 115, 59, 25575, 59, 24851, 256, 59, 100, 7801, 7802, 27285, 111, 116, 59, 27287, 384, 97, 112, 115, 7813, 7817, 7831, 99, 114, 59, 16659, 116, 121, 384, 59, 115, 118, 7826, 7827, 7829, 25093, 101, 116, 187, 7827, 112, 256, 49, 59, 7837, 7844, 307, 7841, 7843, 59, 24580, 59, 24581, 24579, 256, 103, 115, 7850, 7852, 59, 16715, 112, 59, 24578, 256, 103, 112, 7860, 7864, 111, 110, 59, 16665, 102, 59, 49152, 55349, 56662, 384, 97, 108, 115, 7876, 7886, 7890, 114, 256, 59, 115, 7882, 7883, 25301, 108, 59, 27107, 117, 115, 59, 27249, 105, 384, 59, 108, 118, 7898, 7899, 7903, 17333, 111, 110, 187, 7899, 59, 17397, 512, 99, 115, 117, 118, 7914, 7923, 7947, 7971, 256, 105, 111, 7919, 7729, 114, 99, 187, 7726, 617, 7929, 0, 0, 7931, 237, 1352, 97, 110, 116, 256, 103, 108, 7938, 7942, 116, 114, 187, 7773, 101, 115, 115, 187, 7802, 384, 97, 101, 105, 7954, 7958, 7962, 108, 115, 59, 16445, 115, 116, 59, 25183, 118, 256, 59, 68, 565, 7968, 68, 59, 27256, 112, 97, 114, 115, 108, 59, 27109, 256, 68, 97, 7983, 7987, 111, 116, 59, 25171, 114, 114, 59, 26993, 384, 99, 100, 105, 7998, 8001, 7928, 114, 59, 24879, 111, 244, 850, 256, 97, 104, 8009, 8011, 59, 17335, 32827, 240, 16624, 256, 109, 114, 8019, 8023, 108, 32827, 235, 16619, 111, 59, 24748, 384, 99, 105, 112, 8033, 8036, 8039, 108, 59, 16417, 115, 244, 1390, 256, 101, 111, 8044, 8052, 99, 116, 97, 116, 105, 111, 238, 1369, 110, 101, 110, 116, 105, 97, 108, 229, 1401, 2529, 8082, 0, 8094, 0, 8097, 8103, 0, 0, 8134, 8140, 0, 8147, 0, 8166, 8170, 8192, 0, 8200, 8282, 108, 108, 105, 110, 103, 100, 111, 116, 115, 101, 241, 7748, 121, 59, 17476, 109, 97, 108, 101, 59, 26176, 384, 105, 108, 114, 8109, 8115, 8129, 108, 105, 103, 59, 32768, 64259, 617, 8121, 0, 0, 8125, 103, 59, 32768, 64256, 105, 103, 59, 32768, 64260, 59, 49152, 55349, 56611, 108, 105, 103, 59, 32768, 64257, 108, 105, 103, 59, 49152, 102, 106, 384, 97, 108, 116, 8153, 8156, 8161, 116, 59, 26221, 105, 103, 59, 32768, 64258, 110, 115, 59, 26033, 111, 102, 59, 16786, 496, 8174, 0, 8179, 102, 59, 49152, 55349, 56663, 256, 97, 107, 1471, 8183, 256, 59, 118, 8188, 8189, 25300, 59, 27353, 97, 114, 116, 105, 110, 116, 59, 27149, 256, 97, 111, 8204, 8277, 256, 99, 115, 8209, 8274, 945, 8218, 8240, 8248, 8261, 8264, 0, 8272, 946, 8226, 8229, 8231, 8234, 8236, 0, 8238, 32827, 189, 16573, 59, 24915, 32827, 188, 16572, 59, 24917, 59, 24921, 59, 24923, 435, 8244, 0, 8246, 59, 24916, 59, 24918, 692, 8254, 8257, 0, 0, 8259, 32827, 190, 16574, 59, 24919, 59, 24924, 53, 59, 24920, 438, 8268, 0, 8270, 59, 24922, 59, 24925, 56, 59, 24926, 108, 59, 24644, 119, 110, 59, 25378, 99, 114, 59, 49152, 55349, 56507, 2176, 69, 97, 98, 99, 100, 101, 102, 103, 105, 106, 108, 110, 111, 114, 115, 116, 118, 8322, 8329, 8351, 8357, 8368, 8372, 8432, 8437, 8442, 8447, 8451, 8466, 8504, 791, 8510, 8530, 8606, 256, 59, 108, 1613, 8327, 59, 27276, 384, 99, 109, 112, 8336, 8341, 8349, 117, 116, 101, 59, 16885, 109, 97, 256, 59, 100, 8348, 7386, 17331, 59, 27270, 114, 101, 118, 101, 59, 16671, 256, 105, 121, 8362, 8366, 114, 99, 59, 16669, 59, 17459, 111, 116, 59, 16673, 512, 59, 108, 113, 115, 1598, 1602, 8381, 8393, 384, 59, 113, 115, 1598, 1612, 8388, 108, 97, 110, 244, 1637, 512, 59, 99, 100, 108, 1637, 8402, 8405, 8421, 99, 59, 27305, 111, 116, 256, 59, 111, 8412, 8413, 27264, 256, 59, 108, 8418, 8419, 27266, 59, 27268, 256, 59, 101, 8426, 8429, 49152, 8923, 65024, 115, 59, 27284, 114, 59, 49152, 55349, 56612, 256, 59, 103, 1651, 1563, 109, 101, 108, 59, 24887, 99, 121, 59, 17491, 512, 59, 69, 97, 106, 1626, 8460, 8462, 8464, 59, 27282, 59, 27301, 59, 27300, 512, 69, 97, 101, 115, 8475, 8477, 8489, 8500, 59, 25193, 112, 256, 59, 112, 8483, 8484, 27274, 114, 111, 120, 187, 8484, 256, 59, 113, 8494, 8495, 27272, 256, 59, 113, 8494, 8475, 105, 109, 59, 25319, 112, 102, 59, 49152, 55349, 56664, 256, 99, 105, 8515, 8518, 114, 59, 24842, 109, 384, 59, 101, 108, 1643, 8526, 8528, 59, 27278, 59, 27280, 33536, 62, 59, 99, 100, 108, 113, 114, 1518, 8544, 8554, 8558, 8563, 8569, 256, 99, 105, 8549, 8551, 59, 27303, 114, 59, 27258, 111, 116, 59, 25303, 80, 97, 114, 59, 27029, 117, 101, 115, 116, 59, 27260, 640, 97, 100, 101, 108, 115, 8580, 8554, 8592, 1622, 8603, 496, 8585, 0, 8590, 112, 114, 111, 248, 8350, 114, 59, 27000, 113, 256, 108, 113, 1599, 8598, 108, 101, 115, 243, 8328, 105, 237, 1643, 256, 101, 110, 8611, 8621, 114, 116, 110, 101, 113, 113, 59, 49152, 8809, 65024, 197, 8618, 1280, 65, 97, 98, 99, 101, 102, 107, 111, 115, 121, 8644, 8647, 8689, 8693, 8698, 8728, 8733, 8751, 8808, 8829, 114, 242, 928, 512, 105, 108, 109, 114, 8656, 8660, 8663, 8667, 114, 115, 240, 5252, 102, 187, 8228, 105, 108, 244, 1705, 256, 100, 114, 8672, 8676, 99, 121, 59, 17482, 384, 59, 99, 119, 2292, 8683, 8687, 105, 114, 59, 26952, 59, 25005, 97, 114, 59, 24847, 105, 114, 99, 59, 16677, 384, 97, 108, 114, 8705, 8718, 8723, 114, 116, 115, 256, 59, 117, 8713, 8714, 26213, 105, 116, 187, 8714, 108, 105, 112, 59, 24614, 99, 111, 110, 59, 25273, 114, 59, 49152, 55349, 56613, 115, 256, 101, 119, 8739, 8745, 97, 114, 111, 119, 59, 26917, 97, 114, 111, 119, 59, 26918, 640, 97, 109, 111, 112, 114, 8762, 8766, 8771, 8798, 8803, 114, 114, 59, 25087, 116, 104, 116, 59, 25147, 107, 256, 108, 114, 8777, 8787, 101, 102, 116, 97, 114, 114, 111, 119, 59, 25001, 105, 103, 104, 116, 97, 114, 114, 111, 119, 59, 25002, 102, 59, 49152, 55349, 56665, 98, 97, 114, 59, 24597, 384, 99, 108, 116, 8815, 8820, 8824, 114, 59, 49152, 55349, 56509, 97, 115, 232, 8692, 114, 111, 107, 59, 16679, 256, 98, 112, 8834, 8839, 117, 108, 108, 59, 24643, 104, 101, 110, 187, 7259, 2785, 8867, 0, 8874, 0, 8888, 8901, 8910, 0, 8917, 8947, 0, 0, 8952, 8994, 9063, 9058, 9087, 0, 9094, 9130, 9140, 99, 117, 116, 101, 32827, 237, 16621, 384, 59, 105, 121, 1905, 8880, 8885, 114, 99, 32827, 238, 16622, 59, 17464, 256, 99, 120, 8892, 8895, 121, 59, 17461, 99, 108, 32827, 161, 16545, 256, 102, 114, 927, 8905, 59, 49152, 55349, 56614, 114, 97, 118, 101, 32827, 236, 16620, 512, 59, 105, 110, 111, 1854, 8925, 8937, 8942, 256, 105, 110, 8930, 8934, 110, 116, 59, 27148, 116, 59, 25133, 102, 105, 110, 59, 27100, 116, 97, 59, 24873, 108, 105, 103, 59, 16691, 384, 97, 111, 112, 8958, 8986, 8989, 384, 99, 103, 116, 8965, 8968, 8983, 114, 59, 16683, 384, 101, 108, 112, 1823, 8975, 8979, 105, 110, 229, 1934, 97, 114, 244, 1824, 104, 59, 16689, 102, 59, 25271, 101, 100, 59, 16821, 640, 59, 99, 102, 111, 116, 1268, 9004, 9009, 9021, 9025, 97, 114, 101, 59, 24837, 105, 110, 256, 59, 116, 9016, 9017, 25118, 105, 101, 59, 27101, 100, 111, 244, 8985, 640, 59, 99, 101, 108, 112, 1879, 9036, 9040, 9051, 9057, 97, 108, 59, 25274, 256, 103, 114, 9045, 9049, 101, 114, 243, 5475, 227, 9037, 97, 114, 104, 107, 59, 27159, 114, 111, 100, 59, 27196, 512, 99, 103, 112, 116, 9071, 9074, 9078, 9083, 121, 59, 17489, 111, 110, 59, 16687, 102, 59, 49152, 55349, 56666, 97, 59, 17337, 117, 101, 115, 116, 32827, 191, 16575, 256, 99, 105, 9098, 9103, 114, 59, 49152, 55349, 56510, 110, 640, 59, 69, 100, 115, 118, 1268, 9115, 9117, 9121, 1267, 59, 25337, 111, 116, 59, 25333, 256, 59, 118, 9126, 9127, 25332, 59, 25331, 256, 59, 105, 1911, 9134, 108, 100, 101, 59, 16681, 491, 9144, 0, 9148, 99, 121, 59, 17494, 108, 32827, 239, 16623, 768, 99, 102, 109, 111, 115, 117, 9164, 9175, 9180, 9185, 9191, 9205, 256, 105, 121, 9169, 9173, 114, 99, 59, 16693, 59, 17465, 114, 59, 49152, 55349, 56615, 97, 116, 104, 59, 16951, 112, 102, 59, 49152, 55349, 56667, 483, 9196, 0, 9201, 114, 59, 49152, 55349, 56511, 114, 99, 121, 59, 17496, 107, 99, 121, 59, 17492, 1024, 97, 99, 102, 103, 104, 106, 111, 115, 9227, 9238, 9250, 9255, 9261, 9265, 9269, 9275, 112, 112, 97, 256, 59, 118, 9235, 9236, 17338, 59, 17392, 256, 101, 121, 9243, 9248, 100, 105, 108, 59, 16695, 59, 17466, 114, 59, 49152, 55349, 56616, 114, 101, 101, 110, 59, 16696, 99, 121, 59, 17477, 99, 121, 59, 17500, 112, 102, 59, 49152, 55349, 56668, 99, 114, 59, 49152, 55349, 56512, 2944, 65, 66, 69, 72, 97, 98, 99, 100, 101, 102, 103, 104, 106, 108, 109, 110, 111, 112, 114, 115, 116, 117, 118, 9328, 9345, 9350, 9357, 9361, 9486, 9533, 9562, 9600, 9806, 9822, 9829, 9849, 9853, 9882, 9906, 9944, 10077, 10088, 10123, 10176, 10241, 10258, 384, 97, 114, 116, 9335, 9338, 9340, 114, 242, 2502, 242, 917, 97, 105, 108, 59, 26907, 97, 114, 114, 59, 26894, 256, 59, 103, 2452, 9355, 59, 27275, 97, 114, 59, 26978, 2403, 9381, 0, 9386, 0, 9393, 0, 0, 0, 0, 0, 9397, 9402, 0, 9414, 9416, 9421, 0, 9465, 117, 116, 101, 59, 16698, 109, 112, 116, 121, 118, 59, 27060, 114, 97, 238, 2124, 98, 100, 97, 59, 17339, 103, 384, 59, 100, 108, 2190, 9409, 9411, 59, 27025, 229, 2190, 59, 27269, 117, 111, 32827, 171, 16555, 114, 1024, 59, 98, 102, 104, 108, 112, 115, 116, 2201, 9438, 9446, 9449, 9451, 9454, 9457, 9461, 256, 59, 102, 2205, 9443, 115, 59, 26911, 115, 59, 26909, 235, 8786, 112, 59, 25003, 108, 59, 26937, 105, 109, 59, 26995, 108, 59, 24994, 384, 59, 97, 101, 9471, 9472, 9476, 27307, 105, 108, 59, 26905, 256, 59, 115, 9481, 9482, 27309, 59, 49152, 10925, 65024, 384, 97, 98, 114, 9493, 9497, 9501, 114, 114, 59, 26892, 114, 107, 59, 26482, 256, 97, 107, 9506, 9516, 99, 256, 101, 107, 9512, 9514, 59, 16507, 59, 16475, 256, 101, 115, 9521, 9523, 59, 27019, 108, 256, 100, 117, 9529, 9531, 59, 27023, 59, 27021, 512, 97, 101, 117, 121, 9542, 9547, 9558, 9560, 114, 111, 110, 59, 16702, 256, 100, 105, 9552, 9556, 105, 108, 59, 16700, 236, 2224, 226, 9513, 59, 17467, 512, 99, 113, 114, 115, 9571, 9574, 9581, 9597, 97, 59, 26934, 117, 111, 256, 59, 114, 3609, 5958, 256, 100, 117, 9586, 9591, 104, 97, 114, 59, 26983, 115, 104, 97, 114, 59, 26955, 104, 59, 25010, 640, 59, 102, 103, 113, 115, 9611, 9612, 2441, 9715, 9727, 25188, 116, 640, 97, 104, 108, 114, 116, 9624, 9636, 9655, 9666, 9704, 114, 114, 111, 119, 256, 59, 116, 2201, 9633, 97, 233, 9462, 97, 114, 112, 111, 111, 110, 256, 100, 117, 9647, 9652, 111, 119, 110, 187, 1114, 112, 187, 2406, 101, 102, 116, 97, 114, 114, 111, 119, 115, 59, 25031, 105, 103, 104, 116, 384, 97, 104, 115, 9677, 9686, 9694, 114, 114, 111, 119, 256, 59, 115, 2292, 2215, 97, 114, 112, 111, 111, 110, 243, 3992, 113, 117, 105, 103, 97, 114, 114, 111, 247, 8688, 104, 114, 101, 101, 116, 105, 109, 101, 115, 59, 25291, 384, 59, 113, 115, 9611, 2451, 9722, 108, 97, 110, 244, 2476, 640, 59, 99, 100, 103, 115, 2476, 9738, 9741, 9757, 9768, 99, 59, 27304, 111, 116, 256, 59, 111, 9748, 9749, 27263, 256, 59, 114, 9754, 9755, 27265, 59, 27267, 256, 59, 101, 9762, 9765, 49152, 8922, 65024, 115, 59, 27283, 640, 97, 100, 101, 103, 115, 9779, 9785, 9789, 9801, 9803, 112, 112, 114, 111, 248, 9414, 111, 116, 59, 25302, 113, 256, 103, 113, 9795, 9797, 244, 2441, 103, 116, 242, 9356, 244, 2459, 105, 237, 2482, 384, 105, 108, 114, 9813, 2273, 9818, 115, 104, 116, 59, 27004, 59, 49152, 55349, 56617, 256, 59, 69, 2460, 9827, 59, 27281, 353, 9833, 9846, 114, 256, 100, 117, 9650, 9838, 256, 59, 108, 2405, 9843, 59, 26986, 108, 107, 59, 25988, 99, 121, 59, 17497, 640, 59, 97, 99, 104, 116, 2632, 9864, 9867, 9873, 9878, 114, 242, 9665, 111, 114, 110, 101, 242, 7432, 97, 114, 100, 59, 26987, 114, 105, 59, 26106, 256, 105, 111, 9887, 9892, 100, 111, 116, 59, 16704, 117, 115, 116, 256, 59, 97, 9900, 9901, 25520, 99, 104, 101, 187, 9901, 512, 69, 97, 101, 115, 9915, 9917, 9929, 9940, 59, 25192, 112, 256, 59, 112, 9923, 9924, 27273, 114, 111, 120, 187, 9924, 256, 59, 113, 9934, 9935, 27271, 256, 59, 113, 9934, 9915, 105, 109, 59, 25318, 1024, 97, 98, 110, 111, 112, 116, 119, 122, 9961, 9972, 9975, 10010, 10031, 10049, 10055, 10064, 256, 110, 114, 9966, 9969, 103, 59, 26604, 114, 59, 25085, 114, 235, 2241, 103, 384, 108, 109, 114, 9983, 9997, 10004, 101, 102, 116, 256, 97, 114, 2534, 9991, 105, 103, 104, 116, 225, 2546, 97, 112, 115, 116, 111, 59, 26620, 105, 103, 104, 116, 225, 2557, 112, 97, 114, 114, 111, 119, 256, 108, 114, 10021, 10025, 101, 102, 244, 9453, 105, 103, 104, 116, 59, 25004, 384, 97, 102, 108, 10038, 10041, 10045, 114, 59, 27013, 59, 49152, 55349, 56669, 117, 115, 59, 27181, 105, 109, 101, 115, 59, 27188, 353, 10059, 10063, 115, 116, 59, 25111, 225, 4942, 384, 59, 101, 102, 10071, 10072, 6144, 26058, 110, 103, 101, 187, 10072, 97, 114, 256, 59, 108, 10084, 10085, 16424, 116, 59, 27027, 640, 97, 99, 104, 109, 116, 10099, 10102, 10108, 10117, 10119, 114, 242, 2216, 111, 114, 110, 101, 242, 7564, 97, 114, 256, 59, 100, 3992, 10115, 59, 26989, 59, 24590, 114, 105, 59, 25279, 768, 97, 99, 104, 105, 113, 116, 10136, 10141, 2624, 10146, 10158, 10171, 113, 117, 111, 59, 24633, 114, 59, 49152, 55349, 56513, 109, 384, 59, 101, 103, 2482, 10154, 10156, 59, 27277, 59, 27279, 256, 98, 117, 9514, 10163, 111, 256, 59, 114, 3615, 10169, 59, 24602, 114, 111, 107, 59, 16706, 33792, 60, 59, 99, 100, 104, 105, 108, 113, 114, 2091, 10194, 9785, 10204, 10208, 10213, 10218, 10224, 256, 99, 105, 10199, 10201, 59, 27302, 114, 59, 27257, 114, 101, 229, 9714, 109, 101, 115, 59, 25289, 97, 114, 114, 59, 26998, 117, 101, 115, 116, 59, 27259, 256, 80, 105, 10229, 10233, 97, 114, 59, 27030, 384, 59, 101, 102, 10240, 2349, 6171, 26051, 114, 256, 100, 117, 10247, 10253, 115, 104, 97, 114, 59, 26954, 104, 97, 114, 59, 26982, 256, 101, 110, 10263, 10273, 114, 116, 110, 101, 113, 113, 59, 49152, 8808, 65024, 197, 10270, 1792, 68, 97, 99, 100, 101, 102, 104, 105, 108, 110, 111, 112, 115, 117, 10304, 10309, 10370, 10382, 10387, 10400, 10405, 10408, 10458, 10466, 10468, 2691, 10483, 10498, 68, 111, 116, 59, 25146, 512, 99, 108, 112, 114, 10318, 10322, 10339, 10365, 114, 32827, 175, 16559, 256, 101, 116, 10327, 10329, 59, 26178, 256, 59, 101, 10334, 10335, 26400, 115, 101, 187, 10335, 256, 59, 115, 4155, 10344, 116, 111, 512, 59, 100, 108, 117, 4155, 10355, 10359, 10363, 111, 119, 238, 1164, 101, 102, 244, 2319, 240, 5073, 107, 101, 114, 59, 26030, 256, 111, 121, 10375, 10380, 109, 109, 97, 59, 27177, 59, 17468, 97, 115, 104, 59, 24596, 97, 115, 117, 114, 101, 100, 97, 110, 103, 108, 101, 187, 5670, 114, 59, 49152, 55349, 56618, 111, 59, 24871, 384, 99, 100, 110, 10415, 10420, 10441, 114, 111, 32827, 181, 16565, 512, 59, 97, 99, 100, 5220, 10429, 10432, 10436, 115, 244, 5799, 105, 114, 59, 27376, 111, 116, 32955, 183, 437, 117, 115, 384, 59, 98, 100, 10450, 6403, 10451, 25106, 256, 59, 117, 7484, 10456, 59, 27178, 355, 10462, 10465, 112, 59, 27355, 242, 8722, 240, 2689, 256, 100, 112, 10473, 10478, 101, 108, 115, 59, 25255, 102, 59, 49152, 55349, 56670, 256, 99, 116, 10488, 10493, 114, 59, 49152, 55349, 56514, 112, 111, 115, 187, 5533, 384, 59, 108, 109, 10505, 10506, 10509, 17340, 116, 105, 109, 97, 112, 59, 25272, 3072, 71, 76, 82, 86, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 108, 109, 111, 112, 114, 115, 116, 117, 118, 119, 10562, 10579, 10622, 10633, 10648, 10714, 10729, 10773, 10778, 10840, 10845, 10883, 10901, 10916, 10920, 11012, 11015, 11076, 11135, 11182, 11316, 11367, 11388, 11497, 256, 103, 116, 10567, 10571, 59, 49152, 8921, 824, 256, 59, 118, 10576, 3023, 49152, 8811, 8402, 384, 101, 108, 116, 10586, 10610, 10614, 102, 116, 256, 97, 114, 10593, 10599, 114, 114, 111, 119, 59, 25037, 105, 103, 104, 116, 97, 114, 114, 111, 119, 59, 25038, 59, 49152, 8920, 824, 256, 59, 118, 10619, 3143, 49152, 8810, 8402, 105, 103, 104, 116, 97, 114, 114, 111, 119, 59, 25039, 256, 68, 100, 10638, 10643, 97, 115, 104, 59, 25263, 97, 115, 104, 59, 25262, 640, 98, 99, 110, 112, 116, 10659, 10663, 10668, 10673, 10700, 108, 97, 187, 734, 117, 116, 101, 59, 16708, 103, 59, 49152, 8736, 8402, 640, 59, 69, 105, 111, 112, 3460, 10684, 10688, 10693, 10696, 59, 49152, 10864, 824, 100, 59, 49152, 8779, 824, 115, 59, 16713, 114, 111, 248, 3460, 117, 114, 256, 59, 97, 10707, 10708, 26222, 108, 256, 59, 115, 10707, 2872, 499, 10719, 0, 10723, 112, 32955, 160, 2871, 109, 112, 256, 59, 101, 3065, 3072, 640, 97, 101, 111, 117, 121, 10740, 10750, 10755, 10768, 10771, 496, 10745, 0, 10747, 59, 27203, 111, 110, 59, 16712, 100, 105, 108, 59, 16710, 110, 103, 256, 59, 100, 3454, 10762, 111, 116, 59, 49152, 10861, 824, 112, 59, 27202, 59, 17469, 97, 115, 104, 59, 24595, 896, 59, 65, 97, 100, 113, 115, 120, 2962, 10793, 10797, 10811, 10817, 10821, 10832, 114, 114, 59, 25047, 114, 256, 104, 114, 10803, 10806, 107, 59, 26916, 256, 59, 111, 5106, 5104, 111, 116, 59, 49152, 8784, 824, 117, 105, 246, 2915, 256, 101, 105, 10826, 10830, 97, 114, 59, 26920, 237, 2968, 105, 115, 116, 256, 59, 115, 2976, 2975, 114, 59, 49152, 55349, 56619, 512, 69, 101, 115, 116, 3013, 10854, 10873, 10876, 384, 59, 113, 115, 3004, 10861, 3041, 384, 59, 113, 115, 3004, 3013, 10868, 108, 97, 110, 244, 3042, 105, 237, 3050, 256, 59, 114, 2998, 10881, 187, 2999, 384, 65, 97, 112, 10890, 10893, 10897, 114, 242, 10609, 114, 114, 59, 25006, 97, 114, 59, 27378, 384, 59, 115, 118, 3981, 10908, 3980, 256, 59, 100, 10913, 10914, 25340, 59, 25338, 99, 121, 59, 17498, 896, 65, 69, 97, 100, 101, 115, 116, 10935, 10938, 10942, 10946, 10949, 10998, 11001, 114, 242, 10598, 59, 49152, 8806, 824, 114, 114, 59, 24986, 114, 59, 24613, 512, 59, 102, 113, 115, 3131, 10958, 10979, 10991, 116, 256, 97, 114, 10964, 10969, 114, 114, 111, 247, 10945, 105, 103, 104, 116, 97, 114, 114, 111, 247, 10896, 384, 59, 113, 115, 3131, 10938, 10986, 108, 97, 110, 244, 3157, 256, 59, 115, 3157, 10996, 187, 3126, 105, 237, 3165, 256, 59, 114, 3125, 11006, 105, 256, 59, 101, 3098, 3109, 105, 228, 3472, 256, 112, 116, 11020, 11025, 102, 59, 49152, 55349, 56671, 33152, 172, 59, 105, 110, 11033, 11034, 11062, 16556, 110, 512, 59, 69, 100, 118, 2953, 11044, 11048, 11054, 59, 49152, 8953, 824, 111, 116, 59, 49152, 8949, 824, 481, 2953, 11059, 11061, 59, 25335, 59, 25334, 105, 256, 59, 118, 3256, 11068, 481, 3256, 11073, 11075, 59, 25342, 59, 25341, 384, 97, 111, 114, 11083, 11107, 11113, 114, 512, 59, 97, 115, 116, 2939, 11093, 11098, 11103, 108, 108, 101, 236, 2939, 108, 59, 49152, 11005, 8421, 59, 49152, 8706, 824, 108, 105, 110, 116, 59, 27156, 384, 59, 99, 101, 3218, 11120, 11123, 117, 229, 3237, 256, 59, 99, 3224, 11128, 256, 59, 101, 3218, 11133, 241, 3224, 512, 65, 97, 105, 116, 11144, 11147, 11165, 11175, 114, 242, 10632, 114, 114, 384, 59, 99, 119, 11156, 11157, 11161, 24987, 59, 49152, 10547, 824, 59, 49152, 8605, 824, 103, 104, 116, 97, 114, 114, 111, 119, 187, 11157, 114, 105, 256, 59, 101, 3275, 3286, 896, 99, 104, 105, 109, 112, 113, 117, 11197, 11213, 11225, 11012, 2936, 11236, 11247, 512, 59, 99, 101, 114, 3378, 11206, 3383, 11209, 117, 229, 3397, 59, 49152, 55349, 56515, 111, 114, 116, 621, 11013, 0, 0, 11222, 97, 114, 225, 11094, 109, 256, 59, 101, 3438, 11231, 256, 59, 113, 3444, 3443, 115, 117, 256, 98, 112, 11243, 11245, 229, 3320, 229, 3339, 384, 98, 99, 112, 11254, 11281, 11289, 512, 59, 69, 101, 115, 11263, 11264, 3362, 11268, 25220, 59, 49152, 10949, 824, 101, 116, 256, 59, 101, 3355, 11275, 113, 256, 59, 113, 3363, 11264, 99, 256, 59, 101, 3378, 11287, 241, 3384, 512, 59, 69, 101, 115, 11298, 11299, 3423, 11303, 25221, 59, 49152, 10950, 824, 101, 116, 256, 59, 101, 3416, 11310, 113, 256, 59, 113, 3424, 11299, 512, 103, 105, 108, 114, 11325, 11327, 11333, 11335, 236, 3031, 108, 100, 101, 32827, 241, 16625, 231, 3139, 105, 97, 110, 103, 108, 101, 256, 108, 114, 11346, 11356, 101, 102, 116, 256, 59, 101, 3098, 11354, 241, 3110, 105, 103, 104, 116, 256, 59, 101, 3275, 11365, 241, 3287, 256, 59, 109, 11372, 11373, 17341, 384, 59, 101, 115, 11380, 11381, 11385, 16419, 114, 111, 59, 24854, 112, 59, 24583, 1152, 68, 72, 97, 100, 103, 105, 108, 114, 115, 11407, 11412, 11417, 11422, 11427, 11440, 11446, 11475, 11491, 97, 115, 104, 59, 25261, 97, 114, 114, 59, 26884, 112, 59, 49152, 8781, 8402, 97, 115, 104, 59, 25260, 256, 101, 116, 11432, 11436, 59, 49152, 8805, 8402, 59, 49152, 62, 8402, 110, 102, 105, 110, 59, 27102, 384, 65, 101, 116, 11453, 11457, 11461, 114, 114, 59, 26882, 59, 49152, 8804, 8402, 256, 59, 114, 11466, 11469, 49152, 60, 8402, 105, 101, 59, 49152, 8884, 8402, 256, 65, 116, 11480, 11484, 114, 114, 59, 26883, 114, 105, 101, 59, 49152, 8885, 8402, 105, 109, 59, 49152, 8764, 8402, 384, 65, 97, 110, 11504, 11508, 11522, 114, 114, 59, 25046, 114, 256, 104, 114, 11514, 11517, 107, 59, 26915, 256, 59, 111, 5095, 5093, 101, 97, 114, 59, 26919, 4691, 6805, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 11565, 0, 11576, 11592, 11616, 11621, 11634, 11652, 6919, 0, 0, 11661, 11691, 0, 11720, 11726, 0, 11740, 11801, 11819, 11838, 11843, 256, 99, 115, 11569, 6807, 117, 116, 101, 32827, 243, 16627, 256, 105, 121, 11580, 11589, 114, 256, 59, 99, 6814, 11586, 32827, 244, 16628, 59, 17470, 640, 97, 98, 105, 111, 115, 6816, 11602, 11607, 456, 11610, 108, 97, 99, 59, 16721, 118, 59, 27192, 111, 108, 100, 59, 27068, 108, 105, 103, 59, 16723, 256, 99, 114, 11625, 11629, 105, 114, 59, 27071, 59, 49152, 55349, 56620, 879, 11641, 0, 0, 11644, 0, 11650, 110, 59, 17115, 97, 118, 101, 32827, 242, 16626, 59, 27073, 256, 98, 109, 11656, 3572, 97, 114, 59, 27061, 512, 97, 99, 105, 116, 11669, 11672, 11685, 11688, 114, 242, 6784, 256, 105, 114, 11677, 11680, 114, 59, 27070, 111, 115, 115, 59, 27067, 110, 229, 3666, 59, 27072, 384, 97, 101, 105, 11697, 11701, 11705, 99, 114, 59, 16717, 103, 97, 59, 17353, 384, 99, 100, 110, 11712, 11717, 461, 114, 111, 110, 59, 17343, 59, 27062, 112, 102, 59, 49152, 55349, 56672, 384, 97, 101, 108, 11732, 11735, 466, 114, 59, 27063, 114, 112, 59, 27065, 896, 59, 97, 100, 105, 111, 115, 118, 11754, 11755, 11758, 11784, 11789, 11792, 11798, 25128, 114, 242, 6790, 512, 59, 101, 102, 109, 11767, 11768, 11778, 11781, 27229, 114, 256, 59, 111, 11774, 11775, 24884, 102, 187, 11775, 32827, 170, 16554, 32827, 186, 16570, 103, 111, 102, 59, 25270, 114, 59, 27222, 108, 111, 112, 101, 59, 27223, 59, 27227, 384, 99, 108, 111, 11807, 11809, 11815, 242, 11777, 97, 115, 104, 32827, 248, 16632, 108, 59, 25240, 105, 364, 11823, 11828, 100, 101, 32827, 245, 16629, 101, 115, 256, 59, 97, 475, 11834, 115, 59, 27190, 109, 108, 32827, 246, 16630, 98, 97, 114, 59, 25405, 2785, 11870, 0, 11901, 0, 11904, 11933, 0, 11938, 11961, 0, 0, 11979, 3740, 0, 12051, 0, 0, 12075, 12220, 0, 12232, 114, 512, 59, 97, 115, 116, 1027, 11879, 11890, 3717, 33024, 182, 59, 108, 11885, 11886, 16566, 108, 101, 236, 1027, 617, 11896, 0, 0, 11899, 109, 59, 27379, 59, 27389, 121, 59, 17471, 114, 640, 99, 105, 109, 112, 116, 11915, 11919, 11923, 6245, 11927, 110, 116, 59, 16421, 111, 100, 59, 16430, 105, 108, 59, 24624, 101, 110, 107, 59, 24625, 114, 59, 49152, 55349, 56621, 384, 105, 109, 111, 11944, 11952, 11956, 256, 59, 118, 11949, 11950, 17350, 59, 17365, 109, 97, 244, 2678, 110, 101, 59, 26126, 384, 59, 116, 118, 11967, 11968, 11976, 17344, 99, 104, 102, 111, 114, 107, 187, 8189, 59, 17366, 256, 97, 117, 11983, 11999, 110, 256, 99, 107, 11989, 11997, 107, 256, 59, 104, 8692, 11995, 59, 24846, 246, 8692, 115, 1152, 59, 97, 98, 99, 100, 101, 109, 115, 116, 12019, 12020, 6408, 12025, 12029, 12036, 12038, 12042, 12046, 16427, 99, 105, 114, 59, 27171, 105, 114, 59, 27170, 256, 111, 117, 7488, 12034, 59, 27173, 59, 27250, 110, 32955, 177, 3741, 105, 109, 59, 27174, 119, 111, 59, 27175, 384, 105, 112, 117, 12057, 12064, 12069, 110, 116, 105, 110, 116, 59, 27157, 102, 59, 49152, 55349, 56673, 110, 100, 32827, 163, 16547, 1280, 59, 69, 97, 99, 101, 105, 110, 111, 115, 117, 3784, 12095, 12097, 12100, 12103, 12161, 12169, 12178, 12158, 12214, 59, 27315, 112, 59, 27319, 117, 229, 3801, 256, 59, 99, 3790, 12108, 768, 59, 97, 99, 101, 110, 115, 3784, 12121, 12127, 12134, 12136, 12158, 112, 112, 114, 111, 248, 12099, 117, 114, 108, 121, 101, 241, 3801, 241, 3790, 384, 97, 101, 115, 12143, 12150, 12154, 112, 112, 114, 111, 120, 59, 27321, 113, 113, 59, 27317, 105, 109, 59, 25320, 105, 237, 3807, 109, 101, 256, 59, 115, 12168, 3758, 24626, 384, 69, 97, 115, 12152, 12176, 12154, 240, 12149, 384, 100, 102, 112, 3820, 12185, 12207, 384, 97, 108, 115, 12192, 12197, 12202, 108, 97, 114, 59, 25390, 105, 110, 101, 59, 25362, 117, 114, 102, 59, 25363, 256, 59, 116, 3835, 12212, 239, 3835, 114, 101, 108, 59, 25264, 256, 99, 105, 12224, 12229, 114, 59, 49152, 55349, 56517, 59, 17352, 110, 99, 115, 112, 59, 24584, 768, 102, 105, 111, 112, 115, 117, 12250, 8930, 12255, 12261, 12267, 12273, 114, 59, 49152, 55349, 56622, 112, 102, 59, 49152, 55349, 56674, 114, 105, 109, 101, 59, 24663, 99, 114, 59, 49152, 55349, 56518, 384, 97, 101, 111, 12280, 12297, 12307, 116, 256, 101, 105, 12286, 12293, 114, 110, 105, 111, 110, 243, 1712, 110, 116, 59, 27158, 115, 116, 256, 59, 101, 12304, 12305, 16447, 241, 7961, 244, 3860, 2688, 65, 66, 72, 97, 98, 99, 100, 101, 102, 104, 105, 108, 109, 110, 111, 112, 114, 115, 116, 117, 120, 12352, 12369, 12373, 12377, 12512, 12558, 12587, 12615, 12642, 12658, 12686, 12806, 12821, 12836, 12841, 12888, 12910, 12914, 12944, 12976, 12983, 384, 97, 114, 116, 12359, 12362, 12364, 114, 242, 4275, 242, 989, 97, 105, 108, 59, 26908, 97, 114, 242, 7269, 97, 114, 59, 26980, 896, 99, 100, 101, 110, 113, 114, 116, 12392, 12405, 12408, 12415, 12431, 12436, 12492, 256, 101, 117, 12397, 12401, 59, 49152, 8765, 817, 116, 101, 59, 16725, 105, 227, 4462, 109, 112, 116, 121, 118, 59, 27059, 103, 512, 59, 100, 101, 108, 4049, 12425, 12427, 12429, 59, 27026, 59, 27045, 229, 4049, 117, 111, 32827, 187, 16571, 114, 1408, 59, 97, 98, 99, 102, 104, 108, 112, 115, 116, 119, 4060, 12460, 12463, 12471, 12473, 12476, 12478, 12480, 12483, 12487, 12490, 112, 59, 26997, 256, 59, 102, 4064, 12468, 115, 59, 26912, 59, 26931, 115, 59, 26910, 235, 8797, 240, 10030, 108, 59, 26949, 105, 109, 59, 26996, 108, 59, 24995, 59, 24989, 256, 97, 105, 12497, 12501, 105, 108, 59, 26906, 111, 256, 59, 110, 12507, 12508, 25142, 97, 108, 243, 3870, 384, 97, 98, 114, 12519, 12522, 12526, 114, 242, 6117, 114, 107, 59, 26483, 256, 97, 107, 12531, 12541, 99, 256, 101, 107, 12537, 12539, 59, 16509, 59, 16477, 256, 101, 115, 12546, 12548, 59, 27020, 108, 256, 100, 117, 12554, 12556, 59, 27022, 59, 27024, 512, 97, 101, 117, 121, 12567, 12572, 12583, 12585, 114, 111, 110, 59, 16729, 256, 100, 105, 12577, 12581, 105, 108, 59, 16727, 236, 4082, 226, 12538, 59, 17472, 512, 99, 108, 113, 115, 12596, 12599, 12605, 12612, 97, 59, 26935, 100, 104, 97, 114, 59, 26985, 117, 111, 256, 59, 114, 526, 525, 104, 59, 25011, 384, 97, 99, 103, 12622, 12639, 3908, 108, 512, 59, 105, 112, 115, 3960, 12632, 12635, 4252, 110, 229, 4283, 97, 114, 244, 4009, 116, 59, 26029, 384, 105, 108, 114, 12649, 4131, 12654, 115, 104, 116, 59, 27005, 59, 49152, 55349, 56623, 256, 97, 111, 12663, 12678, 114, 256, 100, 117, 12669, 12671, 187, 1147, 256, 59, 108, 4241, 12676, 59, 26988, 256, 59, 118, 12683, 12684, 17345, 59, 17393, 384, 103, 110, 115, 12693, 12793, 12796, 104, 116, 768, 97, 104, 108, 114, 115, 116, 12708, 12720, 12738, 12760, 12772, 12782, 114, 114, 111, 119, 256, 59, 116, 4060, 12717, 97, 233, 12488, 97, 114, 112, 111, 111, 110, 256, 100, 117, 12731, 12735, 111, 119, 238, 12670, 112, 187, 4242, 101, 102, 116, 256, 97, 104, 12746, 12752, 114, 114, 111, 119, 243, 4074, 97, 114, 112, 111, 111, 110, 243, 1361, 105, 103, 104, 116, 97, 114, 114, 111, 119, 115, 59, 25033, 113, 117, 105, 103, 97, 114, 114, 111, 247, 12491, 104, 114, 101, 101, 116, 105, 109, 101, 115, 59, 25292, 103, 59, 17114, 105, 110, 103, 100, 111, 116, 115, 101, 241, 7986, 384, 97, 104, 109, 12813, 12816, 12819, 114, 242, 4074, 97, 242, 1361, 59, 24591, 111, 117, 115, 116, 256, 59, 97, 12830, 12831, 25521, 99, 104, 101, 187, 12831, 109, 105, 100, 59, 27374, 512, 97, 98, 112, 116, 12850, 12861, 12864, 12882, 256, 110, 114, 12855, 12858, 103, 59, 26605, 114, 59, 25086, 114, 235, 4099, 384, 97, 102, 108, 12871, 12874, 12878, 114, 59, 27014, 59, 49152, 55349, 56675, 117, 115, 59, 27182, 105, 109, 101, 115, 59, 27189, 256, 97, 112, 12893, 12903, 114, 256, 59, 103, 12899, 12900, 16425, 116, 59, 27028, 111, 108, 105, 110, 116, 59, 27154, 97, 114, 242, 12771, 512, 97, 99, 104, 113, 12923, 12928, 4284, 12933, 113, 117, 111, 59, 24634, 114, 59, 49152, 55349, 56519, 256, 98, 117, 12539, 12938, 111, 256, 59, 114, 532, 531, 384, 104, 105, 114, 12951, 12955, 12960, 114, 101, 229, 12792, 109, 101, 115, 59, 25290, 105, 512, 59, 101, 102, 108, 12970, 4185, 6177, 12971, 26041, 116, 114, 105, 59, 27086, 108, 117, 104, 97, 114, 59, 26984, 59, 24862, 3425, 13013, 13019, 13023, 13100, 13112, 13169, 0, 13178, 13220, 0, 0, 13292, 13296, 0, 13352, 13384, 13402, 13485, 13489, 13514, 13553, 0, 13846, 0, 0, 13875, 99, 117, 116, 101, 59, 16731, 113, 117, 239, 10170, 1280, 59, 69, 97, 99, 101, 105, 110, 112, 115, 121, 4589, 13043, 13045, 13055, 13058, 13067, 13071, 13087, 13094, 13097, 59, 27316, 496, 13050, 0, 13052, 59, 27320, 111, 110, 59, 16737, 117, 229, 4606, 256, 59, 100, 4595, 13063, 105, 108, 59, 16735, 114, 99, 59, 16733, 384, 69, 97, 115, 13078, 13080, 13083, 59, 27318, 112, 59, 27322, 105, 109, 59, 25321, 111, 108, 105, 110, 116, 59, 27155, 105, 237, 4612, 59, 17473, 111, 116, 384, 59, 98, 101, 13108, 7495, 13109, 25285, 59, 27238, 896, 65, 97, 99, 109, 115, 116, 120, 13126, 13130, 13143, 13147, 13150, 13155, 13165, 114, 114, 59, 25048, 114, 256, 104, 114, 13136, 13138, 235, 8744, 256, 59, 111, 2614, 2612, 116, 32827, 167, 16551, 105, 59, 16443, 119, 97, 114, 59, 26921, 109, 256, 105, 110, 13161, 240, 110, 117, 243, 241, 116, 59, 26422, 114, 256, 59, 111, 13174, 8277, 49152, 55349, 56624, 512, 97, 99, 111, 121, 13186, 13190, 13201, 13216, 114, 112, 59, 26223, 256, 104, 121, 13195, 13199, 99, 121, 59, 17481, 59, 17480, 114, 116, 621, 13209, 0, 0, 13212, 105, 228, 5220, 97, 114, 97, 236, 11887, 32827, 173, 16557, 256, 103, 109, 13224, 13236, 109, 97, 384, 59, 102, 118, 13233, 13234, 13234, 17347, 59, 17346, 1024, 59, 100, 101, 103, 108, 110, 112, 114, 4779, 13253, 13257, 13262, 13270, 13278, 13281, 13286, 111, 116, 59, 27242, 256, 59, 113, 4785, 4784, 256, 59, 69, 13267, 13268, 27294, 59, 27296, 256, 59, 69, 13275, 13276, 27293, 59, 27295, 101, 59, 25158, 108, 117, 115, 59, 27172, 97, 114, 114, 59, 26994, 97, 114, 242, 4413, 512, 97, 101, 105, 116, 13304, 13320, 13327, 13335, 256, 108, 115, 13309, 13316, 108, 115, 101, 116, 109, 233, 13162, 104, 112, 59, 27187, 112, 97, 114, 115, 108, 59, 27108, 256, 100, 108, 5219, 13332, 101, 59, 25379, 256, 59, 101, 13340, 13341, 27306, 256, 59, 115, 13346, 13347, 27308, 59, 49152, 10924, 65024, 384, 102, 108, 112, 13358, 13363, 13378, 116, 99, 121, 59, 17484, 256, 59, 98, 13368, 13369, 16431, 256, 59, 97, 13374, 13375, 27076, 114, 59, 25407, 102, 59, 49152, 55349, 56676, 97, 256, 100, 114, 13389, 1026, 101, 115, 256, 59, 117, 13396, 13397, 26208, 105, 116, 187, 13397, 384, 99, 115, 117, 13408, 13433, 13471, 256, 97, 117, 13413, 13423, 112, 256, 59, 115, 4488, 13419, 59, 49152, 8851, 65024, 112, 256, 59, 115, 4532, 13429, 59, 49152, 8852, 65024, 117, 256, 98, 112, 13439, 13455, 384, 59, 101, 115, 4503, 4508, 13446, 101, 116, 256, 59, 101, 4503, 13453, 241, 4509, 384, 59, 101, 115, 4520, 4525, 13462, 101, 116, 256, 59, 101, 4520, 13469, 241, 4526, 384, 59, 97, 102, 4475, 13478, 1456, 114, 357, 13483, 1457, 187, 4476, 97, 114, 242, 4424, 512, 99, 101, 109, 116, 13497, 13502, 13506, 13509, 114, 59, 49152, 55349, 56520, 116, 109, 238, 241, 105, 236, 13333, 97, 114, 230, 4542, 256, 97, 114, 13518, 13525, 114, 256, 59, 102, 13524, 6079, 26118, 256, 97, 110, 13530, 13549, 105, 103, 104, 116, 256, 101, 112, 13539, 13546, 112, 115, 105, 108, 111, 238, 7904, 104, 233, 11951, 115, 187, 10322, 640, 98, 99, 109, 110, 112, 13563, 13662, 4617, 13707, 13710, 1152, 59, 69, 100, 101, 109, 110, 112, 114, 115, 13582, 13583, 13585, 13589, 13598, 13603, 13612, 13617, 13622, 25218, 59, 27333, 111, 116, 59, 27325, 256, 59, 100, 4570, 13594, 111, 116, 59, 27331, 117, 108, 116, 59, 27329, 256, 69, 101, 13608, 13610, 59, 27339, 59, 25226, 108, 117, 115, 59, 27327, 97, 114, 114, 59, 27001, 384, 101, 105, 117, 13629, 13650, 13653, 116, 384, 59, 101, 110, 13582, 13637, 13643, 113, 256, 59, 113, 4570, 13583, 101, 113, 256, 59, 113, 13611, 13608, 109, 59, 27335, 256, 98, 112, 13658, 13660, 59, 27349, 59, 27347, 99, 768, 59, 97, 99, 101, 110, 115, 4589, 13676, 13682, 13689, 13691, 13094, 112, 112, 114, 111, 248, 13050, 117, 114, 108, 121, 101, 241, 4606, 241, 4595, 384, 97, 101, 115, 13698, 13704, 13083, 112, 112, 114, 111, 248, 13082, 113, 241, 13079, 103, 59, 26218, 1664, 49, 50, 51, 59, 69, 100, 101, 104, 108, 109, 110, 112, 115, 13737, 13740, 13743, 4636, 13746, 13748, 13760, 13769, 13781, 13786, 13791, 13800, 13805, 32827, 185, 16569, 32827, 178, 16562, 32827, 179, 16563, 59, 27334, 256, 111, 115, 13753, 13756, 116, 59, 27326, 117, 98, 59, 27352, 256, 59, 100, 4642, 13765, 111, 116, 59, 27332, 115, 256, 111, 117, 13775, 13778, 108, 59, 26569, 98, 59, 27351, 97, 114, 114, 59, 27003, 117, 108, 116, 59, 27330, 256, 69, 101, 13796, 13798, 59, 27340, 59, 25227, 108, 117, 115, 59, 27328, 384, 101, 105, 117, 13812, 13833, 13836, 116, 384, 59, 101, 110, 4636, 13820, 13826, 113, 256, 59, 113, 4642, 13746, 101, 113, 256, 59, 113, 13799, 13796, 109, 59, 27336, 256, 98, 112, 13841, 13843, 59, 27348, 59, 27350, 384, 65, 97, 110, 13852, 13856, 13869, 114, 114, 59, 25049, 114, 256, 104, 114, 13862, 13864, 235, 8750, 256, 59, 111, 2603, 2601, 119, 97, 114, 59, 26922, 108, 105, 103, 32827, 223, 16607, 3041, 13905, 13917, 13920, 4814, 13939, 13945, 0, 13950, 14018, 0, 0, 0, 0, 0, 14043, 14083, 0, 14089, 14188, 0, 0, 0, 14215, 626, 13910, 0, 0, 13915, 103, 101, 116, 59, 25366, 59, 17348, 114, 235, 3679, 384, 97, 101, 121, 13926, 13931, 13936, 114, 111, 110, 59, 16741, 100, 105, 108, 59, 16739, 59, 17474, 108, 114, 101, 99, 59, 25365, 114, 59, 49152, 55349, 56625, 512, 101, 105, 107, 111, 13958, 13981, 14005, 14012, 498, 13963, 0, 13969, 101, 256, 52, 102, 4740, 4737, 97, 384, 59, 115, 118, 13976, 13977, 13979, 17336, 121, 109, 59, 17361, 256, 99, 110, 13986, 14002, 107, 256, 97, 115, 13992, 13998, 112, 112, 114, 111, 248, 4801, 105, 109, 187, 4780, 115, 240, 4766, 256, 97, 115, 14010, 13998, 240, 4801, 114, 110, 32827, 254, 16638, 492, 799, 14022, 8935, 101, 115, 33152, 215, 59, 98, 100, 14031, 14032, 14040, 16599, 256, 59, 97, 6415, 14037, 114, 59, 27185, 59, 27184, 384, 101, 112, 115, 14049, 14051, 14080, 225, 10829, 512, 59, 98, 99, 102, 1158, 14060, 14064, 14068, 111, 116, 59, 25398, 105, 114, 59, 27377, 256, 59, 111, 14073, 14076, 49152, 55349, 56677, 114, 107, 59, 27354, 225, 13154, 114, 105, 109, 101, 59, 24628, 384, 97, 105, 112, 14095, 14098, 14180, 100, 229, 4680, 896, 97, 100, 101, 109, 112, 115, 116, 14113, 14157, 14144, 14161, 14167, 14172, 14175, 110, 103, 108, 101, 640, 59, 100, 108, 113, 114, 14128, 14129, 14134, 14144, 14146, 26037, 111, 119, 110, 187, 7611, 101, 102, 116, 256, 59, 101, 10240, 14142, 241, 2350, 59, 25180, 105, 103, 104, 116, 256, 59, 101, 12970, 14155, 241, 4186, 111, 116, 59, 26092, 105, 110, 117, 115, 59, 27194, 108, 117, 115, 59, 27193, 98, 59, 27085, 105, 109, 101, 59, 27195, 101, 122, 105, 117, 109, 59, 25570, 384, 99, 104, 116, 14194, 14205, 14209, 256, 114, 121, 14199, 14203, 59, 49152, 55349, 56521, 59, 17478, 99, 121, 59, 17499, 114, 111, 107, 59, 16743, 256, 105, 111, 14219, 14222, 120, 244, 6007, 104, 101, 97, 100, 256, 108, 114, 14231, 14240, 101, 102, 116, 97, 114, 114, 111, 247, 2127, 105, 103, 104, 116, 97, 114, 114, 111, 119, 187, 3933, 2304, 65, 72, 97, 98, 99, 100, 102, 103, 104, 108, 109, 111, 112, 114, 115, 116, 117, 119, 14288, 14291, 14295, 14308, 14320, 14332, 14350, 14364, 14371, 14388, 14417, 14429, 14443, 14505, 14540, 14546, 14570, 14582, 114, 242, 1005, 97, 114, 59, 26979, 256, 99, 114, 14300, 14306, 117, 116, 101, 32827, 250, 16634, 242, 4432, 114, 483, 14314, 0, 14317, 121, 59, 17502, 118, 101, 59, 16749, 256, 105, 121, 14325, 14330, 114, 99, 32827, 251, 16635, 59, 17475, 384, 97, 98, 104, 14339, 14342, 14347, 114, 242, 5037, 108, 97, 99, 59, 16753, 97, 242, 5059, 256, 105, 114, 14355, 14360, 115, 104, 116, 59, 27006, 59, 49152, 55349, 56626, 114, 97, 118, 101, 32827, 249, 16633, 353, 14375, 14385, 114, 256, 108, 114, 14380, 14382, 187, 2391, 187, 4227, 108, 107, 59, 25984, 256, 99, 116, 14393, 14413, 623, 14399, 0, 0, 14410, 114, 110, 256, 59, 101, 14405, 14406, 25372, 114, 187, 14406, 111, 112, 59, 25359, 114, 105, 59, 26104, 256, 97, 108, 14422, 14426, 99, 114, 59, 16747, 32955, 168, 841, 256, 103, 112, 14434, 14438, 111, 110, 59, 16755, 102, 59, 49152, 55349, 56678, 768, 97, 100, 104, 108, 115, 117, 4427, 14456, 14461, 4978, 14481, 14496, 111, 119, 110, 225, 5043, 97, 114, 112, 111, 111, 110, 256, 108, 114, 14472, 14476, 101, 102, 244, 14381, 105, 103, 104, 244, 14383, 105, 384, 59, 104, 108, 14489, 14490, 14492, 17349, 187, 5114, 111, 110, 187, 14490, 112, 97, 114, 114, 111, 119, 115, 59, 25032, 384, 99, 105, 116, 14512, 14532, 14536, 623, 14518, 0, 0, 14529, 114, 110, 256, 59, 101, 14524, 14525, 25373, 114, 187, 14525, 111, 112, 59, 25358, 110, 103, 59, 16751, 114, 105, 59, 26105, 99, 114, 59, 49152, 55349, 56522, 384, 100, 105, 114, 14553, 14557, 14562, 111, 116, 59, 25328, 108, 100, 101, 59, 16745, 105, 256, 59, 102, 14128, 14568, 187, 6163, 256, 97, 109, 14575, 14578, 114, 242, 14504, 108, 32827, 252, 16636, 97, 110, 103, 108, 101, 59, 27047, 1920, 65, 66, 68, 97, 99, 100, 101, 102, 108, 110, 111, 112, 114, 115, 122, 14620, 14623, 14633, 14637, 14773, 14776, 14781, 14815, 14820, 14824, 14835, 14841, 14845, 14849, 14880, 114, 242, 1015, 97, 114, 256, 59, 118, 14630, 14631, 27368, 59, 27369, 97, 115, 232, 993, 256, 110, 114, 14642, 14647, 103, 114, 116, 59, 27036, 896, 101, 107, 110, 112, 114, 115, 116, 13539, 14662, 14667, 14674, 14685, 14692, 14742, 97, 112, 112, 225, 9237, 111, 116, 104, 105, 110, 231, 7830, 384, 104, 105, 114, 13547, 11976, 14681, 111, 112, 244, 12213, 256, 59, 104, 5047, 14690, 239, 12685, 256, 105, 117, 14697, 14701, 103, 109, 225, 13235, 256, 98, 112, 14706, 14724, 115, 101, 116, 110, 101, 113, 256, 59, 113, 14717, 14720, 49152, 8842, 65024, 59, 49152, 10955, 65024, 115, 101, 116, 110, 101, 113, 256, 59, 113, 14735, 14738, 49152, 8843, 65024, 59, 49152, 10956, 65024, 256, 104, 114, 14747, 14751, 101, 116, 225, 13980, 105, 97, 110, 103, 108, 101, 256, 108, 114, 14762, 14767, 101, 102, 116, 187, 2341, 105, 103, 104, 116, 187, 4177, 121, 59, 17458, 97, 115, 104, 187, 4150, 384, 101, 108, 114, 14788, 14802, 14807, 384, 59, 98, 101, 11754, 14795, 14799, 97, 114, 59, 25275, 113, 59, 25178, 108, 105, 112, 59, 25326, 256, 98, 116, 14812, 5224, 97, 242, 5225, 114, 59, 49152, 55349, 56627, 116, 114, 233, 14766, 115, 117, 256, 98, 112, 14831, 14833, 187, 3356, 187, 3417, 112, 102, 59, 49152, 55349, 56679, 114, 111, 240, 3835, 116, 114, 233, 14772, 256, 99, 117, 14854, 14859, 114, 59, 49152, 55349, 56523, 256, 98, 112, 14864, 14872, 110, 256, 69, 101, 14720, 14870, 187, 14718, 110, 256, 69, 101, 14738, 14878, 187, 14736, 105, 103, 122, 97, 103, 59, 27034, 896, 99, 101, 102, 111, 112, 114, 115, 14902, 14907, 14934, 14939, 14932, 14945, 14954, 105, 114, 99, 59, 16757, 256, 100, 105, 14912, 14929, 256, 98, 103, 14917, 14921, 97, 114, 59, 27231, 101, 256, 59, 113, 5626, 14927, 59, 25177, 101, 114, 112, 59, 24856, 114, 59, 49152, 55349, 56628, 112, 102, 59, 49152, 55349, 56680, 256, 59, 101, 5241, 14950, 97, 116, 232, 5241, 99, 114, 59, 49152, 55349, 56524, 2787, 6030, 14983, 0, 14987, 0, 14992, 15003, 0, 0, 15005, 15016, 15019, 15023, 0, 0, 15043, 15054, 0, 15064, 6108, 6111, 116, 114, 233, 6097, 114, 59, 49152, 55349, 56629, 256, 65, 97, 14996, 14999, 114, 242, 963, 114, 242, 2550, 59, 17342, 256, 65, 97, 15009, 15012, 114, 242, 952, 114, 242, 2539, 97, 240, 10003, 105, 115, 59, 25339, 384, 100, 112, 116, 6052, 15029, 15038, 256, 102, 108, 15034, 6057, 59, 49152, 55349, 56681, 105, 109, 229, 6066, 256, 65, 97, 15047, 15050, 114, 242, 974, 114, 242, 2561, 256, 99, 113, 15058, 6072, 114, 59, 49152, 55349, 56525, 256, 112, 116, 6102, 15068, 114, 233, 6100, 1024, 97, 99, 101, 102, 105, 111, 115, 117, 15088, 15101, 15112, 15116, 15121, 15125, 15131, 15137, 99, 256, 117, 121, 15094, 15099, 116, 101, 32827, 253, 16637, 59, 17487, 256, 105, 121, 15106, 15110, 114, 99, 59, 16759, 59, 17483, 110, 32827, 165, 16549, 114, 59, 49152, 55349, 56630, 99, 121, 59, 17495, 112, 102, 59, 49152, 55349, 56682, 99, 114, 59, 49152, 55349, 56526, 256, 99, 109, 15142, 15145, 121, 59, 17486, 108, 32827, 255, 16639, 1280, 97, 99, 100, 101, 102, 104, 105, 111, 115, 119, 15170, 15176, 15188, 15192, 15204, 15209, 15213, 15220, 15226, 15232, 99, 117, 116, 101, 59, 16762, 256, 97, 121, 15181, 15186, 114, 111, 110, 59, 16766, 59, 17463, 111, 116, 59, 16764, 256, 101, 116, 15197, 15201, 116, 114, 230, 5471, 97, 59, 17334, 114, 59, 49152, 55349, 56631, 99, 121, 59, 17462, 103, 114, 97, 114, 114, 59, 25053, 112, 102, 59, 49152, 55349, 56683, 99, 114, 59, 49152, 55349, 56527, 256, 106, 110, 15237, 15239, 59, 24589, 106, 59, 24588]);

},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Generated using scripts/write-decode-map.ts
// prettier-ignore
exports.default = new Uint16Array([512, 97, 103, 108, 113, 9, 21, 24, 27, 621, 15, 0, 0, 18, 112, 59, 16422, 111, 115, 59, 16423, 116, 59, 16446, 116, 59, 16444, 117, 111, 116, 59, 16418]);

},{}],8:[function(require,module,exports){
"use strict";
// Generated using scripts/write-encode-map.ts
Object.defineProperty(exports, "__esModule", { value: true });
// prettier-ignore
exports.default = new Map([[9, "&Tab;"], [10, "&NewLine;"], [33, "&excl;"], [34, "&quot;"], [35, "&num;"], [36, "&dollar;"], [37, "&percnt;"], [38, "&amp;"], [39, "&apos;"], [40, "&lpar;"], [41, "&rpar;"], [42, "&ast;"], [43, "&plus;"], [44, "&comma;"], [46, "&period;"], [47, "&sol;"], [58, "&colon;"], [59, "&semi;"], [60, { v: "&lt;", n: 8402, o: "&nvlt;" }], [61, { v: "&equals;", n: 8421, o: "&bne;" }], [62, { v: "&gt;", n: 8402, o: "&nvgt;" }], [63, "&quest;"], [64, "&commat;"], [91, "&lbrack;"], [92, "&bsol;"], [93, "&rbrack;"], [94, "&Hat;"], [95, "&lowbar;"], [96, "&DiacriticalGrave;"], [102, { n: 106, o: "&fjlig;" }], [123, "&lbrace;"], [124, "&verbar;"], [125, "&rbrace;"], [160, "&nbsp;"], [161, "&iexcl;"], [162, "&cent;"], [163, "&pound;"], [164, "&curren;"], [165, "&yen;"], [166, "&brvbar;"], [167, "&sect;"], [168, "&die;"], [169, "&copy;"], [170, "&ordf;"], [171, "&laquo;"], [172, "&not;"], [173, "&shy;"], [174, "&circledR;"], [175, "&macr;"], [176, "&deg;"], [177, "&PlusMinus;"], [178, "&sup2;"], [179, "&sup3;"], [180, "&acute;"], [181, "&micro;"], [182, "&para;"], [183, "&centerdot;"], [184, "&cedil;"], [185, "&sup1;"], [186, "&ordm;"], [187, "&raquo;"], [188, "&frac14;"], [189, "&frac12;"], [190, "&frac34;"], [191, "&iquest;"], [192, "&Agrave;"], [193, "&Aacute;"], [194, "&Acirc;"], [195, "&Atilde;"], [196, "&Auml;"], [197, "&angst;"], [198, "&AElig;"], [199, "&Ccedil;"], [200, "&Egrave;"], [201, "&Eacute;"], [202, "&Ecirc;"], [203, "&Euml;"], [204, "&Igrave;"], [205, "&Iacute;"], [206, "&Icirc;"], [207, "&Iuml;"], [208, "&ETH;"], [209, "&Ntilde;"], [210, "&Ograve;"], [211, "&Oacute;"], [212, "&Ocirc;"], [213, "&Otilde;"], [214, "&Ouml;"], [215, "&times;"], [216, "&Oslash;"], [217, "&Ugrave;"], [218, "&Uacute;"], [219, "&Ucirc;"], [220, "&Uuml;"], [221, "&Yacute;"], [222, "&THORN;"], [223, "&szlig;"], [224, "&agrave;"], [225, "&aacute;"], [226, "&acirc;"], [227, "&atilde;"], [228, "&auml;"], [229, "&aring;"], [230, "&aelig;"], [231, "&ccedil;"], [232, "&egrave;"], [233, "&eacute;"], [234, "&ecirc;"], [235, "&euml;"], [236, "&igrave;"], [237, "&iacute;"], [238, "&icirc;"], [239, "&iuml;"], [240, "&eth;"], [241, "&ntilde;"], [242, "&ograve;"], [243, "&oacute;"], [244, "&ocirc;"], [245, "&otilde;"], [246, "&ouml;"], [247, "&div;"], [248, "&oslash;"], [249, "&ugrave;"], [250, "&uacute;"], [251, "&ucirc;"], [252, "&uuml;"], [253, "&yacute;"], [254, "&thorn;"], [255, "&yuml;"], [256, "&Amacr;"], [257, "&amacr;"], [258, "&Abreve;"], [259, "&abreve;"], [260, "&Aogon;"], [261, "&aogon;"], [262, "&Cacute;"], [263, "&cacute;"], [264, "&Ccirc;"], [265, "&ccirc;"], [266, "&Cdot;"], [267, "&cdot;"], [268, "&Ccaron;"], [269, "&ccaron;"], [270, "&Dcaron;"], [271, "&dcaron;"], [272, "&Dstrok;"], [273, "&dstrok;"], [274, "&Emacr;"], [275, "&emacr;"], [278, "&Edot;"], [279, "&edot;"], [280, "&Eogon;"], [281, "&eogon;"], [282, "&Ecaron;"], [283, "&ecaron;"], [284, "&Gcirc;"], [285, "&gcirc;"], [286, "&Gbreve;"], [287, "&gbreve;"], [288, "&Gdot;"], [289, "&gdot;"], [290, "&Gcedil;"], [292, "&Hcirc;"], [293, "&hcirc;"], [294, "&Hstrok;"], [295, "&hstrok;"], [296, "&Itilde;"], [297, "&itilde;"], [298, "&Imacr;"], [299, "&imacr;"], [302, "&Iogon;"], [303, "&iogon;"], [304, "&Idot;"], [305, "&imath;"], [306, "&IJlig;"], [307, "&ijlig;"], [308, "&Jcirc;"], [309, "&jcirc;"], [310, "&Kcedil;"], [311, "&kcedil;"], [312, "&kgreen;"], [313, "&Lacute;"], [314, "&lacute;"], [315, "&Lcedil;"], [316, "&lcedil;"], [317, "&Lcaron;"], [318, "&lcaron;"], [319, "&Lmidot;"], [320, "&lmidot;"], [321, "&Lstrok;"], [322, "&lstrok;"], [323, "&Nacute;"], [324, "&nacute;"], [325, "&Ncedil;"], [326, "&ncedil;"], [327, "&Ncaron;"], [328, "&ncaron;"], [329, "&napos;"], [330, "&ENG;"], [331, "&eng;"], [332, "&Omacr;"], [333, "&omacr;"], [336, "&Odblac;"], [337, "&odblac;"], [338, "&OElig;"], [339, "&oelig;"], [340, "&Racute;"], [341, "&racute;"], [342, "&Rcedil;"], [343, "&rcedil;"], [344, "&Rcaron;"], [345, "&rcaron;"], [346, "&Sacute;"], [347, "&sacute;"], [348, "&Scirc;"], [349, "&scirc;"], [350, "&Scedil;"], [351, "&scedil;"], [352, "&Scaron;"], [353, "&scaron;"], [354, "&Tcedil;"], [355, "&tcedil;"], [356, "&Tcaron;"], [357, "&tcaron;"], [358, "&Tstrok;"], [359, "&tstrok;"], [360, "&Utilde;"], [361, "&utilde;"], [362, "&Umacr;"], [363, "&umacr;"], [364, "&Ubreve;"], [365, "&ubreve;"], [366, "&Uring;"], [367, "&uring;"], [368, "&Udblac;"], [369, "&udblac;"], [370, "&Uogon;"], [371, "&uogon;"], [372, "&Wcirc;"], [373, "&wcirc;"], [374, "&Ycirc;"], [375, "&ycirc;"], [376, "&Yuml;"], [377, "&Zacute;"], [378, "&zacute;"], [379, "&Zdot;"], [380, "&zdot;"], [381, "&Zcaron;"], [382, "&zcaron;"], [402, "&fnof;"], [437, "&imped;"], [501, "&gacute;"], [567, "&jmath;"], [710, "&circ;"], [711, "&caron;"], [728, "&breve;"], [729, "&DiacriticalDot;"], [730, "&ring;"], [731, "&ogon;"], [732, "&DiacriticalTilde;"], [733, "&dblac;"], [785, "&DownBreve;"], [913, "&Alpha;"], [914, "&Beta;"], [915, "&Gamma;"], [916, "&Delta;"], [917, "&Epsilon;"], [918, "&Zeta;"], [919, "&Eta;"], [920, "&Theta;"], [921, "&Iota;"], [922, "&Kappa;"], [923, "&Lambda;"], [924, "&Mu;"], [925, "&Nu;"], [926, "&Xi;"], [927, "&Omicron;"], [928, "&Pi;"], [929, "&Rho;"], [931, "&Sigma;"], [932, "&Tau;"], [933, "&Upsilon;"], [934, "&Phi;"], [935, "&Chi;"], [936, "&Psi;"], [937, "&ohm;"], [945, "&alpha;"], [946, "&beta;"], [947, "&gamma;"], [948, "&delta;"], [949, "&epsi;"], [950, "&zeta;"], [951, "&eta;"], [952, "&theta;"], [953, "&iota;"], [954, "&kappa;"], [955, "&lambda;"], [956, "&mu;"], [957, "&nu;"], [958, "&xi;"], [959, "&omicron;"], [960, "&pi;"], [961, "&rho;"], [962, "&sigmaf;"], [963, "&sigma;"], [964, "&tau;"], [965, "&upsi;"], [966, "&phi;"], [967, "&chi;"], [968, "&psi;"], [969, "&omega;"], [977, "&thetasym;"], [978, "&Upsi;"], [981, "&phiv;"], [982, "&piv;"], [988, "&Gammad;"], [989, "&digamma;"], [1008, "&kappav;"], [1009, "&rhov;"], [1013, "&epsiv;"], [1014, "&backepsilon;"], [1025, "&IOcy;"], [1026, "&DJcy;"], [1027, "&GJcy;"], [1028, "&Jukcy;"], [1029, "&DScy;"], [1030, "&Iukcy;"], [1031, "&YIcy;"], [1032, "&Jsercy;"], [1033, "&LJcy;"], [1034, "&NJcy;"], [1035, "&TSHcy;"], [1036, "&KJcy;"], [1038, "&Ubrcy;"], [1039, "&DZcy;"], [1040, "&Acy;"], [1041, "&Bcy;"], [1042, "&Vcy;"], [1043, "&Gcy;"], [1044, "&Dcy;"], [1045, "&IEcy;"], [1046, "&ZHcy;"], [1047, "&Zcy;"], [1048, "&Icy;"], [1049, "&Jcy;"], [1050, "&Kcy;"], [1051, "&Lcy;"], [1052, "&Mcy;"], [1053, "&Ncy;"], [1054, "&Ocy;"], [1055, "&Pcy;"], [1056, "&Rcy;"], [1057, "&Scy;"], [1058, "&Tcy;"], [1059, "&Ucy;"], [1060, "&Fcy;"], [1061, "&KHcy;"], [1062, "&TScy;"], [1063, "&CHcy;"], [1064, "&SHcy;"], [1065, "&SHCHcy;"], [1066, "&HARDcy;"], [1067, "&Ycy;"], [1068, "&SOFTcy;"], [1069, "&Ecy;"], [1070, "&YUcy;"], [1071, "&YAcy;"], [1072, "&acy;"], [1073, "&bcy;"], [1074, "&vcy;"], [1075, "&gcy;"], [1076, "&dcy;"], [1077, "&iecy;"], [1078, "&zhcy;"], [1079, "&zcy;"], [1080, "&icy;"], [1081, "&jcy;"], [1082, "&kcy;"], [1083, "&lcy;"], [1084, "&mcy;"], [1085, "&ncy;"], [1086, "&ocy;"], [1087, "&pcy;"], [1088, "&rcy;"], [1089, "&scy;"], [1090, "&tcy;"], [1091, "&ucy;"], [1092, "&fcy;"], [1093, "&khcy;"], [1094, "&tscy;"], [1095, "&chcy;"], [1096, "&shcy;"], [1097, "&shchcy;"], [1098, "&hardcy;"], [1099, "&ycy;"], [1100, "&softcy;"], [1101, "&ecy;"], [1102, "&yucy;"], [1103, "&yacy;"], [1105, "&iocy;"], [1106, "&djcy;"], [1107, "&gjcy;"], [1108, "&jukcy;"], [1109, "&dscy;"], [1110, "&iukcy;"], [1111, "&yicy;"], [1112, "&jsercy;"], [1113, "&ljcy;"], [1114, "&njcy;"], [1115, "&tshcy;"], [1116, "&kjcy;"], [1118, "&ubrcy;"], [1119, "&dzcy;"], [8194, "&ensp;"], [8195, "&emsp;"], [8196, "&emsp13;"], [8197, "&emsp14;"], [8199, "&numsp;"], [8200, "&puncsp;"], [8201, "&ThinSpace;"], [8202, "&hairsp;"], [8203, "&NegativeMediumSpace;"], [8204, "&zwnj;"], [8205, "&zwj;"], [8206, "&lrm;"], [8207, "&rlm;"], [8208, "&dash;"], [8211, "&ndash;"], [8212, "&mdash;"], [8213, "&horbar;"], [8214, "&Verbar;"], [8216, "&lsquo;"], [8217, "&CloseCurlyQuote;"], [8218, "&lsquor;"], [8220, "&ldquo;"], [8221, "&CloseCurlyDoubleQuote;"], [8222, "&bdquo;"], [8224, "&dagger;"], [8225, "&Dagger;"], [8226, "&bull;"], [8229, "&nldr;"], [8230, "&hellip;"], [8240, "&permil;"], [8241, "&pertenk;"], [8242, "&prime;"], [8243, "&Prime;"], [8244, "&tprime;"], [8245, "&backprime;"], [8249, "&lsaquo;"], [8250, "&rsaquo;"], [8254, "&oline;"], [8257, "&caret;"], [8259, "&hybull;"], [8260, "&frasl;"], [8271, "&bsemi;"], [8279, "&qprime;"], [8287, { v: "&MediumSpace;", n: 8202, o: "&ThickSpace;" }], [8288, "&NoBreak;"], [8289, "&af;"], [8290, "&InvisibleTimes;"], [8291, "&ic;"], [8364, "&euro;"], [8411, "&tdot;"], [8412, "&DotDot;"], [8450, "&complexes;"], [8453, "&incare;"], [8458, "&gscr;"], [8459, "&hamilt;"], [8460, "&Hfr;"], [8461, "&Hopf;"], [8462, "&planckh;"], [8463, "&hbar;"], [8464, "&imagline;"], [8465, "&Ifr;"], [8466, "&lagran;"], [8467, "&ell;"], [8469, "&naturals;"], [8470, "&numero;"], [8471, "&copysr;"], [8472, "&weierp;"], [8473, "&Popf;"], [8474, "&Qopf;"], [8475, "&realine;"], [8476, "&real;"], [8477, "&reals;"], [8478, "&rx;"], [8482, "&trade;"], [8484, "&integers;"], [8487, "&mho;"], [8488, "&zeetrf;"], [8489, "&iiota;"], [8492, "&bernou;"], [8493, "&Cayleys;"], [8495, "&escr;"], [8496, "&Escr;"], [8497, "&Fouriertrf;"], [8499, "&Mellintrf;"], [8500, "&order;"], [8501, "&alefsym;"], [8502, "&beth;"], [8503, "&gimel;"], [8504, "&daleth;"], [8517, "&CapitalDifferentialD;"], [8518, "&dd;"], [8519, "&ee;"], [8520, "&ii;"], [8531, "&frac13;"], [8532, "&frac23;"], [8533, "&frac15;"], [8534, "&frac25;"], [8535, "&frac35;"], [8536, "&frac45;"], [8537, "&frac16;"], [8538, "&frac56;"], [8539, "&frac18;"], [8540, "&frac38;"], [8541, "&frac58;"], [8542, "&frac78;"], [8592, "&larr;"], [8593, "&ShortUpArrow;"], [8594, "&rarr;"], [8595, "&darr;"], [8596, "&harr;"], [8597, "&updownarrow;"], [8598, "&nwarr;"], [8599, "&nearr;"], [8600, "&LowerRightArrow;"], [8601, "&LowerLeftArrow;"], [8602, "&nlarr;"], [8603, "&nrarr;"], [8605, { v: "&rarrw;", n: 824, o: "&nrarrw;" }], [8606, "&Larr;"], [8607, "&Uarr;"], [8608, "&Rarr;"], [8609, "&Darr;"], [8610, "&larrtl;"], [8611, "&rarrtl;"], [8612, "&LeftTeeArrow;"], [8613, "&mapstoup;"], [8614, "&map;"], [8615, "&DownTeeArrow;"], [8617, "&hookleftarrow;"], [8618, "&hookrightarrow;"], [8619, "&larrlp;"], [8620, "&looparrowright;"], [8621, "&harrw;"], [8622, "&nharr;"], [8624, "&lsh;"], [8625, "&rsh;"], [8626, "&ldsh;"], [8627, "&rdsh;"], [8629, "&crarr;"], [8630, "&cularr;"], [8631, "&curarr;"], [8634, "&circlearrowleft;"], [8635, "&circlearrowright;"], [8636, "&leftharpoonup;"], [8637, "&DownLeftVector;"], [8638, "&RightUpVector;"], [8639, "&LeftUpVector;"], [8640, "&rharu;"], [8641, "&DownRightVector;"], [8642, "&dharr;"], [8643, "&dharl;"], [8644, "&RightArrowLeftArrow;"], [8645, "&udarr;"], [8646, "&LeftArrowRightArrow;"], [8647, "&leftleftarrows;"], [8648, "&upuparrows;"], [8649, "&rightrightarrows;"], [8650, "&ddarr;"], [8651, "&leftrightharpoons;"], [8652, "&Equilibrium;"], [8653, "&nlArr;"], [8654, "&nhArr;"], [8655, "&nrArr;"], [8656, "&DoubleLeftArrow;"], [8657, "&DoubleUpArrow;"], [8658, "&DoubleRightArrow;"], [8659, "&dArr;"], [8660, "&DoubleLeftRightArrow;"], [8661, "&DoubleUpDownArrow;"], [8662, "&nwArr;"], [8663, "&neArr;"], [8664, "&seArr;"], [8665, "&swArr;"], [8666, "&lAarr;"], [8667, "&rAarr;"], [8669, "&zigrarr;"], [8676, "&larrb;"], [8677, "&rarrb;"], [8693, "&DownArrowUpArrow;"], [8701, "&loarr;"], [8702, "&roarr;"], [8703, "&hoarr;"], [8704, "&forall;"], [8705, "&comp;"], [8706, { v: "&part;", n: 824, o: "&npart;" }], [8707, "&exist;"], [8708, "&nexist;"], [8709, "&empty;"], [8711, "&Del;"], [8712, "&Element;"], [8713, "&NotElement;"], [8715, "&ni;"], [8716, "&notni;"], [8719, "&prod;"], [8720, "&coprod;"], [8721, "&sum;"], [8722, "&minus;"], [8723, "&MinusPlus;"], [8724, "&dotplus;"], [8726, "&Backslash;"], [8727, "&lowast;"], [8728, "&compfn;"], [8730, "&radic;"], [8733, "&prop;"], [8734, "&infin;"], [8735, "&angrt;"], [8736, { v: "&ang;", n: 8402, o: "&nang;" }], [8737, "&angmsd;"], [8738, "&angsph;"], [8739, "&mid;"], [8740, "&nmid;"], [8741, "&DoubleVerticalBar;"], [8742, "&NotDoubleVerticalBar;"], [8743, "&and;"], [8744, "&or;"], [8745, { v: "&cap;", n: 65024, o: "&caps;" }], [8746, { v: "&cup;", n: 65024, o: "&cups;" }], [8747, "&int;"], [8748, "&Int;"], [8749, "&iiint;"], [8750, "&conint;"], [8751, "&Conint;"], [8752, "&Cconint;"], [8753, "&cwint;"], [8754, "&ClockwiseContourIntegral;"], [8755, "&awconint;"], [8756, "&there4;"], [8757, "&becaus;"], [8758, "&ratio;"], [8759, "&Colon;"], [8760, "&dotminus;"], [8762, "&mDDot;"], [8763, "&homtht;"], [8764, { v: "&sim;", n: 8402, o: "&nvsim;" }], [8765, { v: "&backsim;", n: 817, o: "&race;" }], [8766, { v: "&ac;", n: 819, o: "&acE;" }], [8767, "&acd;"], [8768, "&VerticalTilde;"], [8769, "&NotTilde;"], [8770, { v: "&eqsim;", n: 824, o: "&nesim;" }], [8771, "&sime;"], [8772, "&NotTildeEqual;"], [8773, "&cong;"], [8774, "&simne;"], [8775, "&ncong;"], [8776, "&ap;"], [8777, "&nap;"], [8778, "&ape;"], [8779, { v: "&apid;", n: 824, o: "&napid;" }], [8780, "&backcong;"], [8781, { v: "&asympeq;", n: 8402, o: "&nvap;" }], [8782, { v: "&bump;", n: 824, o: "&nbump;" }], [8783, { v: "&bumpe;", n: 824, o: "&nbumpe;" }], [8784, { v: "&doteq;", n: 824, o: "&nedot;" }], [8785, "&doteqdot;"], [8786, "&efDot;"], [8787, "&erDot;"], [8788, "&Assign;"], [8789, "&ecolon;"], [8790, "&ecir;"], [8791, "&circeq;"], [8793, "&wedgeq;"], [8794, "&veeeq;"], [8796, "&triangleq;"], [8799, "&equest;"], [8800, "&ne;"], [8801, { v: "&Congruent;", n: 8421, o: "&bnequiv;" }], [8802, "&nequiv;"], [8804, { v: "&le;", n: 8402, o: "&nvle;" }], [8805, { v: "&ge;", n: 8402, o: "&nvge;" }], [8806, { v: "&lE;", n: 824, o: "&nlE;" }], [8807, { v: "&gE;", n: 824, o: "&ngE;" }], [8808, { v: "&lnE;", n: 65024, o: "&lvertneqq;" }], [8809, { v: "&gnE;", n: 65024, o: "&gvertneqq;" }], [8810, { v: "&ll;", n: new Map([[824, "&nLtv;"], [8402, "&nLt;"]]) }], [8811, { v: "&gg;", n: new Map([[824, "&nGtv;"], [8402, "&nGt;"]]) }], [8812, "&between;"], [8813, "&NotCupCap;"], [8814, "&nless;"], [8815, "&ngt;"], [8816, "&nle;"], [8817, "&nge;"], [8818, "&lesssim;"], [8819, "&GreaterTilde;"], [8820, "&nlsim;"], [8821, "&ngsim;"], [8822, "&LessGreater;"], [8823, "&gl;"], [8824, "&NotLessGreater;"], [8825, "&NotGreaterLess;"], [8826, "&pr;"], [8827, "&sc;"], [8828, "&prcue;"], [8829, "&sccue;"], [8830, "&PrecedesTilde;"], [8831, { v: "&scsim;", n: 824, o: "&NotSucceedsTilde;" }], [8832, "&NotPrecedes;"], [8833, "&NotSucceeds;"], [8834, { v: "&sub;", n: 8402, o: "&NotSubset;" }], [8835, { v: "&sup;", n: 8402, o: "&NotSuperset;" }], [8836, "&nsub;"], [8837, "&nsup;"], [8838, "&sube;"], [8839, "&supe;"], [8840, "&NotSubsetEqual;"], [8841, "&NotSupersetEqual;"], [8842, { v: "&subne;", n: 65024, o: "&varsubsetneq;" }], [8843, { v: "&supne;", n: 65024, o: "&varsupsetneq;" }], [8845, "&cupdot;"], [8846, "&UnionPlus;"], [8847, { v: "&sqsub;", n: 824, o: "&NotSquareSubset;" }], [8848, { v: "&sqsup;", n: 824, o: "&NotSquareSuperset;" }], [8849, "&sqsube;"], [8850, "&sqsupe;"], [8851, { v: "&sqcap;", n: 65024, o: "&sqcaps;" }], [8852, { v: "&sqcup;", n: 65024, o: "&sqcups;" }], [8853, "&CirclePlus;"], [8854, "&CircleMinus;"], [8855, "&CircleTimes;"], [8856, "&osol;"], [8857, "&CircleDot;"], [8858, "&circledcirc;"], [8859, "&circledast;"], [8861, "&circleddash;"], [8862, "&boxplus;"], [8863, "&boxminus;"], [8864, "&boxtimes;"], [8865, "&dotsquare;"], [8866, "&RightTee;"], [8867, "&dashv;"], [8868, "&DownTee;"], [8869, "&bot;"], [8871, "&models;"], [8872, "&DoubleRightTee;"], [8873, "&Vdash;"], [8874, "&Vvdash;"], [8875, "&VDash;"], [8876, "&nvdash;"], [8877, "&nvDash;"], [8878, "&nVdash;"], [8879, "&nVDash;"], [8880, "&prurel;"], [8882, "&LeftTriangle;"], [8883, "&RightTriangle;"], [8884, { v: "&LeftTriangleEqual;", n: 8402, o: "&nvltrie;" }], [8885, { v: "&RightTriangleEqual;", n: 8402, o: "&nvrtrie;" }], [8886, "&origof;"], [8887, "&imof;"], [8888, "&multimap;"], [8889, "&hercon;"], [8890, "&intcal;"], [8891, "&veebar;"], [8893, "&barvee;"], [8894, "&angrtvb;"], [8895, "&lrtri;"], [8896, "&bigwedge;"], [8897, "&bigvee;"], [8898, "&bigcap;"], [8899, "&bigcup;"], [8900, "&diam;"], [8901, "&sdot;"], [8902, "&sstarf;"], [8903, "&divideontimes;"], [8904, "&bowtie;"], [8905, "&ltimes;"], [8906, "&rtimes;"], [8907, "&leftthreetimes;"], [8908, "&rightthreetimes;"], [8909, "&backsimeq;"], [8910, "&curlyvee;"], [8911, "&curlywedge;"], [8912, "&Sub;"], [8913, "&Sup;"], [8914, "&Cap;"], [8915, "&Cup;"], [8916, "&fork;"], [8917, "&epar;"], [8918, "&lessdot;"], [8919, "&gtdot;"], [8920, { v: "&Ll;", n: 824, o: "&nLl;" }], [8921, { v: "&Gg;", n: 824, o: "&nGg;" }], [8922, { v: "&leg;", n: 65024, o: "&lesg;" }], [8923, { v: "&gel;", n: 65024, o: "&gesl;" }], [8926, "&cuepr;"], [8927, "&cuesc;"], [8928, "&NotPrecedesSlantEqual;"], [8929, "&NotSucceedsSlantEqual;"], [8930, "&NotSquareSubsetEqual;"], [8931, "&NotSquareSupersetEqual;"], [8934, "&lnsim;"], [8935, "&gnsim;"], [8936, "&precnsim;"], [8937, "&scnsim;"], [8938, "&nltri;"], [8939, "&NotRightTriangle;"], [8940, "&nltrie;"], [8941, "&NotRightTriangleEqual;"], [8942, "&vellip;"], [8943, "&ctdot;"], [8944, "&utdot;"], [8945, "&dtdot;"], [8946, "&disin;"], [8947, "&isinsv;"], [8948, "&isins;"], [8949, { v: "&isindot;", n: 824, o: "&notindot;" }], [8950, "&notinvc;"], [8951, "&notinvb;"], [8953, { v: "&isinE;", n: 824, o: "&notinE;" }], [8954, "&nisd;"], [8955, "&xnis;"], [8956, "&nis;"], [8957, "&notnivc;"], [8958, "&notnivb;"], [8965, "&barwed;"], [8966, "&Barwed;"], [8968, "&lceil;"], [8969, "&rceil;"], [8970, "&LeftFloor;"], [8971, "&rfloor;"], [8972, "&drcrop;"], [8973, "&dlcrop;"], [8974, "&urcrop;"], [8975, "&ulcrop;"], [8976, "&bnot;"], [8978, "&profline;"], [8979, "&profsurf;"], [8981, "&telrec;"], [8982, "&target;"], [8988, "&ulcorn;"], [8989, "&urcorn;"], [8990, "&dlcorn;"], [8991, "&drcorn;"], [8994, "&frown;"], [8995, "&smile;"], [9005, "&cylcty;"], [9006, "&profalar;"], [9014, "&topbot;"], [9021, "&ovbar;"], [9023, "&solbar;"], [9084, "&angzarr;"], [9136, "&lmoustache;"], [9137, "&rmoustache;"], [9140, "&OverBracket;"], [9141, "&bbrk;"], [9142, "&bbrktbrk;"], [9180, "&OverParenthesis;"], [9181, "&UnderParenthesis;"], [9182, "&OverBrace;"], [9183, "&UnderBrace;"], [9186, "&trpezium;"], [9191, "&elinters;"], [9251, "&blank;"], [9416, "&circledS;"], [9472, "&boxh;"], [9474, "&boxv;"], [9484, "&boxdr;"], [9488, "&boxdl;"], [9492, "&boxur;"], [9496, "&boxul;"], [9500, "&boxvr;"], [9508, "&boxvl;"], [9516, "&boxhd;"], [9524, "&boxhu;"], [9532, "&boxvh;"], [9552, "&boxH;"], [9553, "&boxV;"], [9554, "&boxdR;"], [9555, "&boxDr;"], [9556, "&boxDR;"], [9557, "&boxdL;"], [9558, "&boxDl;"], [9559, "&boxDL;"], [9560, "&boxuR;"], [9561, "&boxUr;"], [9562, "&boxUR;"], [9563, "&boxuL;"], [9564, "&boxUl;"], [9565, "&boxUL;"], [9566, "&boxvR;"], [9567, "&boxVr;"], [9568, "&boxVR;"], [9569, "&boxvL;"], [9570, "&boxVl;"], [9571, "&boxVL;"], [9572, "&boxHd;"], [9573, "&boxhD;"], [9574, "&boxHD;"], [9575, "&boxHu;"], [9576, "&boxhU;"], [9577, "&boxHU;"], [9578, "&boxvH;"], [9579, "&boxVh;"], [9580, "&boxVH;"], [9600, "&uhblk;"], [9604, "&lhblk;"], [9608, "&block;"], [9617, "&blk14;"], [9618, "&blk12;"], [9619, "&blk34;"], [9633, "&square;"], [9642, "&blacksquare;"], [9643, "&EmptyVerySmallSquare;"], [9645, "&rect;"], [9646, "&marker;"], [9649, "&fltns;"], [9651, "&bigtriangleup;"], [9652, "&blacktriangle;"], [9653, "&triangle;"], [9656, "&blacktriangleright;"], [9657, "&rtri;"], [9661, "&bigtriangledown;"], [9662, "&blacktriangledown;"], [9663, "&dtri;"], [9666, "&blacktriangleleft;"], [9667, "&ltri;"], [9674, "&loz;"], [9675, "&cir;"], [9708, "&tridot;"], [9711, "&bigcirc;"], [9720, "&ultri;"], [9721, "&urtri;"], [9722, "&lltri;"], [9723, "&EmptySmallSquare;"], [9724, "&FilledSmallSquare;"], [9733, "&bigstar;"], [9734, "&star;"], [9742, "&phone;"], [9792, "&female;"], [9794, "&male;"], [9824, "&spades;"], [9827, "&clubs;"], [9829, "&hearts;"], [9830, "&diamondsuit;"], [9834, "&sung;"], [9837, "&flat;"], [9838, "&natural;"], [9839, "&sharp;"], [10003, "&check;"], [10007, "&cross;"], [10016, "&malt;"], [10038, "&sext;"], [10072, "&VerticalSeparator;"], [10098, "&lbbrk;"], [10099, "&rbbrk;"], [10184, "&bsolhsub;"], [10185, "&suphsol;"], [10214, "&LeftDoubleBracket;"], [10215, "&RightDoubleBracket;"], [10216, "&lang;"], [10217, "&rang;"], [10218, "&Lang;"], [10219, "&Rang;"], [10220, "&loang;"], [10221, "&roang;"], [10229, "&longleftarrow;"], [10230, "&longrightarrow;"], [10231, "&longleftrightarrow;"], [10232, "&DoubleLongLeftArrow;"], [10233, "&DoubleLongRightArrow;"], [10234, "&DoubleLongLeftRightArrow;"], [10236, "&longmapsto;"], [10239, "&dzigrarr;"], [10498, "&nvlArr;"], [10499, "&nvrArr;"], [10500, "&nvHarr;"], [10501, "&Map;"], [10508, "&lbarr;"], [10509, "&bkarow;"], [10510, "&lBarr;"], [10511, "&dbkarow;"], [10512, "&drbkarow;"], [10513, "&DDotrahd;"], [10514, "&UpArrowBar;"], [10515, "&DownArrowBar;"], [10518, "&Rarrtl;"], [10521, "&latail;"], [10522, "&ratail;"], [10523, "&lAtail;"], [10524, "&rAtail;"], [10525, "&larrfs;"], [10526, "&rarrfs;"], [10527, "&larrbfs;"], [10528, "&rarrbfs;"], [10531, "&nwarhk;"], [10532, "&nearhk;"], [10533, "&hksearow;"], [10534, "&hkswarow;"], [10535, "&nwnear;"], [10536, "&nesear;"], [10537, "&seswar;"], [10538, "&swnwar;"], [10547, { v: "&rarrc;", n: 824, o: "&nrarrc;" }], [10549, "&cudarrr;"], [10550, "&ldca;"], [10551, "&rdca;"], [10552, "&cudarrl;"], [10553, "&larrpl;"], [10556, "&curarrm;"], [10557, "&cularrp;"], [10565, "&rarrpl;"], [10568, "&harrcir;"], [10569, "&Uarrocir;"], [10570, "&lurdshar;"], [10571, "&ldrushar;"], [10574, "&LeftRightVector;"], [10575, "&RightUpDownVector;"], [10576, "&DownLeftRightVector;"], [10577, "&LeftUpDownVector;"], [10578, "&LeftVectorBar;"], [10579, "&RightVectorBar;"], [10580, "&RightUpVectorBar;"], [10581, "&RightDownVectorBar;"], [10582, "&DownLeftVectorBar;"], [10583, "&DownRightVectorBar;"], [10584, "&LeftUpVectorBar;"], [10585, "&LeftDownVectorBar;"], [10586, "&LeftTeeVector;"], [10587, "&RightTeeVector;"], [10588, "&RightUpTeeVector;"], [10589, "&RightDownTeeVector;"], [10590, "&DownLeftTeeVector;"], [10591, "&DownRightTeeVector;"], [10592, "&LeftUpTeeVector;"], [10593, "&LeftDownTeeVector;"], [10594, "&lHar;"], [10595, "&uHar;"], [10596, "&rHar;"], [10597, "&dHar;"], [10598, "&luruhar;"], [10599, "&ldrdhar;"], [10600, "&ruluhar;"], [10601, "&rdldhar;"], [10602, "&lharul;"], [10603, "&llhard;"], [10604, "&rharul;"], [10605, "&lrhard;"], [10606, "&udhar;"], [10607, "&duhar;"], [10608, "&RoundImplies;"], [10609, "&erarr;"], [10610, "&simrarr;"], [10611, "&larrsim;"], [10612, "&rarrsim;"], [10613, "&rarrap;"], [10614, "&ltlarr;"], [10616, "&gtrarr;"], [10617, "&subrarr;"], [10619, "&suplarr;"], [10620, "&lfisht;"], [10621, "&rfisht;"], [10622, "&ufisht;"], [10623, "&dfisht;"], [10629, "&lopar;"], [10630, "&ropar;"], [10635, "&lbrke;"], [10636, "&rbrke;"], [10637, "&lbrkslu;"], [10638, "&rbrksld;"], [10639, "&lbrksld;"], [10640, "&rbrkslu;"], [10641, "&langd;"], [10642, "&rangd;"], [10643, "&lparlt;"], [10644, "&rpargt;"], [10645, "&gtlPar;"], [10646, "&ltrPar;"], [10650, "&vzigzag;"], [10652, "&vangrt;"], [10653, "&angrtvbd;"], [10660, "&ange;"], [10661, "&range;"], [10662, "&dwangle;"], [10663, "&uwangle;"], [10664, "&angmsdaa;"], [10665, "&angmsdab;"], [10666, "&angmsdac;"], [10667, "&angmsdad;"], [10668, "&angmsdae;"], [10669, "&angmsdaf;"], [10670, "&angmsdag;"], [10671, "&angmsdah;"], [10672, "&bemptyv;"], [10673, "&demptyv;"], [10674, "&cemptyv;"], [10675, "&raemptyv;"], [10676, "&laemptyv;"], [10677, "&ohbar;"], [10678, "&omid;"], [10679, "&opar;"], [10681, "&operp;"], [10683, "&olcross;"], [10684, "&odsold;"], [10686, "&olcir;"], [10687, "&ofcir;"], [10688, "&olt;"], [10689, "&ogt;"], [10690, "&cirscir;"], [10691, "&cirE;"], [10692, "&solb;"], [10693, "&bsolb;"], [10697, "&boxbox;"], [10701, "&trisb;"], [10702, "&rtriltri;"], [10703, { v: "&LeftTriangleBar;", n: 824, o: "&NotLeftTriangleBar;" }], [10704, { v: "&RightTriangleBar;", n: 824, o: "&NotRightTriangleBar;" }], [10716, "&iinfin;"], [10717, "&infintie;"], [10718, "&nvinfin;"], [10723, "&eparsl;"], [10724, "&smeparsl;"], [10725, "&eqvparsl;"], [10731, "&blacklozenge;"], [10740, "&RuleDelayed;"], [10742, "&dsol;"], [10752, "&bigodot;"], [10753, "&bigoplus;"], [10754, "&bigotimes;"], [10756, "&biguplus;"], [10758, "&bigsqcup;"], [10764, "&iiiint;"], [10765, "&fpartint;"], [10768, "&cirfnint;"], [10769, "&awint;"], [10770, "&rppolint;"], [10771, "&scpolint;"], [10772, "&npolint;"], [10773, "&pointint;"], [10774, "&quatint;"], [10775, "&intlarhk;"], [10786, "&pluscir;"], [10787, "&plusacir;"], [10788, "&simplus;"], [10789, "&plusdu;"], [10790, "&plussim;"], [10791, "&plustwo;"], [10793, "&mcomma;"], [10794, "&minusdu;"], [10797, "&loplus;"], [10798, "&roplus;"], [10799, "&Cross;"], [10800, "&timesd;"], [10801, "&timesbar;"], [10803, "&smashp;"], [10804, "&lotimes;"], [10805, "&rotimes;"], [10806, "&otimesas;"], [10807, "&Otimes;"], [10808, "&odiv;"], [10809, "&triplus;"], [10810, "&triminus;"], [10811, "&tritime;"], [10812, "&intprod;"], [10815, "&amalg;"], [10816, "&capdot;"], [10818, "&ncup;"], [10819, "&ncap;"], [10820, "&capand;"], [10821, "&cupor;"], [10822, "&cupcap;"], [10823, "&capcup;"], [10824, "&cupbrcap;"], [10825, "&capbrcup;"], [10826, "&cupcup;"], [10827, "&capcap;"], [10828, "&ccups;"], [10829, "&ccaps;"], [10832, "&ccupssm;"], [10835, "&And;"], [10836, "&Or;"], [10837, "&andand;"], [10838, "&oror;"], [10839, "&orslope;"], [10840, "&andslope;"], [10842, "&andv;"], [10843, "&orv;"], [10844, "&andd;"], [10845, "&ord;"], [10847, "&wedbar;"], [10854, "&sdote;"], [10858, "&simdot;"], [10861, { v: "&congdot;", n: 824, o: "&ncongdot;" }], [10862, "&easter;"], [10863, "&apacir;"], [10864, { v: "&apE;", n: 824, o: "&napE;" }], [10865, "&eplus;"], [10866, "&pluse;"], [10867, "&Esim;"], [10868, "&Colone;"], [10869, "&Equal;"], [10871, "&ddotseq;"], [10872, "&equivDD;"], [10873, "&ltcir;"], [10874, "&gtcir;"], [10875, "&ltquest;"], [10876, "&gtquest;"], [10877, { v: "&leqslant;", n: 824, o: "&nleqslant;" }], [10878, { v: "&geqslant;", n: 824, o: "&ngeqslant;" }], [10879, "&lesdot;"], [10880, "&gesdot;"], [10881, "&lesdoto;"], [10882, "&gesdoto;"], [10883, "&lesdotor;"], [10884, "&gesdotol;"], [10885, "&lap;"], [10886, "&gap;"], [10887, "&lne;"], [10888, "&gne;"], [10889, "&lnap;"], [10890, "&gnap;"], [10891, "&lEg;"], [10892, "&gEl;"], [10893, "&lsime;"], [10894, "&gsime;"], [10895, "&lsimg;"], [10896, "&gsiml;"], [10897, "&lgE;"], [10898, "&glE;"], [10899, "&lesges;"], [10900, "&gesles;"], [10901, "&els;"], [10902, "&egs;"], [10903, "&elsdot;"], [10904, "&egsdot;"], [10905, "&el;"], [10906, "&eg;"], [10909, "&siml;"], [10910, "&simg;"], [10911, "&simlE;"], [10912, "&simgE;"], [10913, { v: "&LessLess;", n: 824, o: "&NotNestedLessLess;" }], [10914, { v: "&GreaterGreater;", n: 824, o: "&NotNestedGreaterGreater;" }], [10916, "&glj;"], [10917, "&gla;"], [10918, "&ltcc;"], [10919, "&gtcc;"], [10920, "&lescc;"], [10921, "&gescc;"], [10922, "&smt;"], [10923, "&lat;"], [10924, { v: "&smte;", n: 65024, o: "&smtes;" }], [10925, { v: "&late;", n: 65024, o: "&lates;" }], [10926, "&bumpE;"], [10927, { v: "&PrecedesEqual;", n: 824, o: "&NotPrecedesEqual;" }], [10928, { v: "&sce;", n: 824, o: "&NotSucceedsEqual;" }], [10931, "&prE;"], [10932, "&scE;"], [10933, "&precneqq;"], [10934, "&scnE;"], [10935, "&prap;"], [10936, "&scap;"], [10937, "&precnapprox;"], [10938, "&scnap;"], [10939, "&Pr;"], [10940, "&Sc;"], [10941, "&subdot;"], [10942, "&supdot;"], [10943, "&subplus;"], [10944, "&supplus;"], [10945, "&submult;"], [10946, "&supmult;"], [10947, "&subedot;"], [10948, "&supedot;"], [10949, { v: "&subE;", n: 824, o: "&nsubE;" }], [10950, { v: "&supE;", n: 824, o: "&nsupE;" }], [10951, "&subsim;"], [10952, "&supsim;"], [10955, { v: "&subnE;", n: 65024, o: "&varsubsetneqq;" }], [10956, { v: "&supnE;", n: 65024, o: "&varsupsetneqq;" }], [10959, "&csub;"], [10960, "&csup;"], [10961, "&csube;"], [10962, "&csupe;"], [10963, "&subsup;"], [10964, "&supsub;"], [10965, "&subsub;"], [10966, "&supsup;"], [10967, "&suphsub;"], [10968, "&supdsub;"], [10969, "&forkv;"], [10970, "&topfork;"], [10971, "&mlcp;"], [10980, "&Dashv;"], [10982, "&Vdashl;"], [10983, "&Barv;"], [10984, "&vBar;"], [10985, "&vBarv;"], [10987, "&Vbar;"], [10988, "&Not;"], [10989, "&bNot;"], [10990, "&rnmid;"], [10991, "&cirmid;"], [10992, "&midcir;"], [10993, "&topcir;"], [10994, "&nhpar;"], [10995, "&parsim;"], [11005, { v: "&parsl;", n: 8421, o: "&nparsl;" }], [55349, { n: new Map([[56476, "&Ascr;"], [56478, "&Cscr;"], [56479, "&Dscr;"], [56482, "&Gscr;"], [56485, "&Jscr;"], [56486, "&Kscr;"], [56489, "&Nscr;"], [56490, "&Oscr;"], [56491, "&Pscr;"], [56492, "&Qscr;"], [56494, "&Sscr;"], [56495, "&Tscr;"], [56496, "&Uscr;"], [56497, "&Vscr;"], [56498, "&Wscr;"], [56499, "&Xscr;"], [56500, "&Yscr;"], [56501, "&Zscr;"], [56502, "&ascr;"], [56503, "&bscr;"], [56504, "&cscr;"], [56505, "&dscr;"], [56507, "&fscr;"], [56509, "&hscr;"], [56510, "&iscr;"], [56511, "&jscr;"], [56512, "&kscr;"], [56513, "&lscr;"], [56514, "&mscr;"], [56515, "&nscr;"], [56517, "&pscr;"], [56518, "&qscr;"], [56519, "&rscr;"], [56520, "&sscr;"], [56521, "&tscr;"], [56522, "&uscr;"], [56523, "&vscr;"], [56524, "&wscr;"], [56525, "&xscr;"], [56526, "&yscr;"], [56527, "&zscr;"], [56580, "&Afr;"], [56581, "&Bfr;"], [56583, "&Dfr;"], [56584, "&Efr;"], [56585, "&Ffr;"], [56586, "&Gfr;"], [56589, "&Jfr;"], [56590, "&Kfr;"], [56591, "&Lfr;"], [56592, "&Mfr;"], [56593, "&Nfr;"], [56594, "&Ofr;"], [56595, "&Pfr;"], [56596, "&Qfr;"], [56598, "&Sfr;"], [56599, "&Tfr;"], [56600, "&Ufr;"], [56601, "&Vfr;"], [56602, "&Wfr;"], [56603, "&Xfr;"], [56604, "&Yfr;"], [56606, "&afr;"], [56607, "&bfr;"], [56608, "&cfr;"], [56609, "&dfr;"], [56610, "&efr;"], [56611, "&ffr;"], [56612, "&gfr;"], [56613, "&hfr;"], [56614, "&ifr;"], [56615, "&jfr;"], [56616, "&kfr;"], [56617, "&lfr;"], [56618, "&mfr;"], [56619, "&nfr;"], [56620, "&ofr;"], [56621, "&pfr;"], [56622, "&qfr;"], [56623, "&rfr;"], [56624, "&sfr;"], [56625, "&tfr;"], [56626, "&ufr;"], [56627, "&vfr;"], [56628, "&wfr;"], [56629, "&xfr;"], [56630, "&yfr;"], [56631, "&zfr;"], [56632, "&Aopf;"], [56633, "&Bopf;"], [56635, "&Dopf;"], [56636, "&Eopf;"], [56637, "&Fopf;"], [56638, "&Gopf;"], [56640, "&Iopf;"], [56641, "&Jopf;"], [56642, "&Kopf;"], [56643, "&Lopf;"], [56644, "&Mopf;"], [56646, "&Oopf;"], [56650, "&Sopf;"], [56651, "&Topf;"], [56652, "&Uopf;"], [56653, "&Vopf;"], [56654, "&Wopf;"], [56655, "&Xopf;"], [56656, "&Yopf;"], [56658, "&aopf;"], [56659, "&bopf;"], [56660, "&copf;"], [56661, "&dopf;"], [56662, "&eopf;"], [56663, "&fopf;"], [56664, "&gopf;"], [56665, "&hopf;"], [56666, "&iopf;"], [56667, "&jopf;"], [56668, "&kopf;"], [56669, "&lopf;"], [56670, "&mopf;"], [56671, "&nopf;"], [56672, "&oopf;"], [56673, "&popf;"], [56674, "&qopf;"], [56675, "&ropf;"], [56676, "&sopf;"], [56677, "&topf;"], [56678, "&uopf;"], [56679, "&vopf;"], [56680, "&wopf;"], [56681, "&xopf;"], [56682, "&yopf;"], [56683, "&zopf;"]]) }], [64256, "&fflig;"], [64257, "&filig;"], [64258, "&fllig;"], [64259, "&ffilig;"], [64260, "&ffllig;"]]);

},{}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeXMLStrict = exports.decodeHTML5Strict = exports.decodeHTML4Strict = exports.decodeHTML5 = exports.decodeHTML4 = exports.decodeHTMLStrict = exports.decodeHTML = exports.decodeXML = exports.encodeHTML5 = exports.encodeHTML4 = exports.encodeNonAsciiHTML = exports.encodeHTML = exports.escapeText = exports.escapeAttribute = exports.escapeUTF8 = exports.escape = exports.encodeXML = exports.encode = exports.decodeStrict = exports.decode = exports.EncodingMode = exports.DecodingMode = exports.EntityLevel = void 0;
var decode_js_1 = require("./decode.js");
var encode_js_1 = require("./encode.js");
var escape_js_1 = require("./escape.js");
/** The level of entities to support. */
var EntityLevel;
(function (EntityLevel) {
    /** Support only XML entities. */
    EntityLevel[EntityLevel["XML"] = 0] = "XML";
    /** Support HTML entities, which are a superset of XML entities. */
    EntityLevel[EntityLevel["HTML"] = 1] = "HTML";
})(EntityLevel = exports.EntityLevel || (exports.EntityLevel = {}));
/** Determines whether some entities are allowed to be written without a trailing `;`. */
var DecodingMode;
(function (DecodingMode) {
    /** Support legacy HTML entities. */
    DecodingMode[DecodingMode["Legacy"] = 0] = "Legacy";
    /** Do not support legacy HTML entities. */
    DecodingMode[DecodingMode["Strict"] = 1] = "Strict";
})(DecodingMode = exports.DecodingMode || (exports.DecodingMode = {}));
var EncodingMode;
(function (EncodingMode) {
    /**
     * The output is UTF-8 encoded. Only characters that need escaping within
     * HTML will be escaped.
     */
    EncodingMode[EncodingMode["UTF8"] = 0] = "UTF8";
    /**
     * The output consists only of ASCII characters. Characters that need
     * escaping within HTML, and characters that aren't ASCII characters will
     * be escaped.
     */
    EncodingMode[EncodingMode["ASCII"] = 1] = "ASCII";
    /**
     * Encode all characters that have an equivalent entity, as well as all
     * characters that are not ASCII characters.
     */
    EncodingMode[EncodingMode["Extensive"] = 2] = "Extensive";
    /**
     * Encode all characters that have to be escaped in HTML attributes,
     * following {@link https://html.spec.whatwg.org/multipage/parsing.html#escapingString}.
     */
    EncodingMode[EncodingMode["Attribute"] = 3] = "Attribute";
    /**
     * Encode all characters that have to be escaped in HTML text,
     * following {@link https://html.spec.whatwg.org/multipage/parsing.html#escapingString}.
     */
    EncodingMode[EncodingMode["Text"] = 4] = "Text";
})(EncodingMode = exports.EncodingMode || (exports.EncodingMode = {}));
/**
 * Decodes a string with entities.
 *
 * @param data String to decode.
 * @param options Decoding options.
 */
function decode(data, options) {
    if (options === void 0) { options = EntityLevel.XML; }
    var opts = typeof options === "number" ? { level: options } : options;
    if (opts.level === EntityLevel.HTML) {
        if (opts.mode === DecodingMode.Strict) {
            return (0, decode_js_1.decodeHTMLStrict)(data);
        }
        return (0, decode_js_1.decodeHTML)(data);
    }
    return (0, decode_js_1.decodeXML)(data);
}
exports.decode = decode;
/**
 * Decodes a string with entities. Does not allow missing trailing semicolons for entities.
 *
 * @param data String to decode.
 * @param options Decoding options.
 * @deprecated Use `decode` with the `mode` set to `Strict`.
 */
function decodeStrict(data, options) {
    if (options === void 0) { options = EntityLevel.XML; }
    var opts = typeof options === "number" ? { level: options } : options;
    if (opts.level === EntityLevel.HTML) {
        if (opts.mode === DecodingMode.Legacy) {
            return (0, decode_js_1.decodeHTML)(data);
        }
        return (0, decode_js_1.decodeHTMLStrict)(data);
    }
    return (0, decode_js_1.decodeXML)(data);
}
exports.decodeStrict = decodeStrict;
/**
 * Encodes a string with entities.
 *
 * @param data String to encode.
 * @param options Encoding options.
 */
function encode(data, options) {
    if (options === void 0) { options = EntityLevel.XML; }
    var opts = typeof options === "number" ? { level: options } : options;
    // Mode `UTF8` just escapes XML entities
    if (opts.mode === EncodingMode.UTF8)
        return (0, escape_js_1.escapeUTF8)(data);
    if (opts.mode === EncodingMode.Attribute)
        return (0, escape_js_1.escapeAttribute)(data);
    if (opts.mode === EncodingMode.Text)
        return (0, escape_js_1.escapeText)(data);
    if (opts.level === EntityLevel.HTML) {
        if (opts.mode === EncodingMode.ASCII) {
            return (0, encode_js_1.encodeNonAsciiHTML)(data);
        }
        return (0, encode_js_1.encodeHTML)(data);
    }
    // ASCII and Extensive are equivalent
    return (0, escape_js_1.encodeXML)(data);
}
exports.encode = encode;
var escape_js_2 = require("./escape.js");
Object.defineProperty(exports, "encodeXML", { enumerable: true, get: function () { return escape_js_2.encodeXML; } });
Object.defineProperty(exports, "escape", { enumerable: true, get: function () { return escape_js_2.escape; } });
Object.defineProperty(exports, "escapeUTF8", { enumerable: true, get: function () { return escape_js_2.escapeUTF8; } });
Object.defineProperty(exports, "escapeAttribute", { enumerable: true, get: function () { return escape_js_2.escapeAttribute; } });
Object.defineProperty(exports, "escapeText", { enumerable: true, get: function () { return escape_js_2.escapeText; } });
var encode_js_2 = require("./encode.js");
Object.defineProperty(exports, "encodeHTML", { enumerable: true, get: function () { return encode_js_2.encodeHTML; } });
Object.defineProperty(exports, "encodeNonAsciiHTML", { enumerable: true, get: function () { return encode_js_2.encodeNonAsciiHTML; } });
// Legacy aliases (deprecated)
Object.defineProperty(exports, "encodeHTML4", { enumerable: true, get: function () { return encode_js_2.encodeHTML; } });
Object.defineProperty(exports, "encodeHTML5", { enumerable: true, get: function () { return encode_js_2.encodeHTML; } });
var decode_js_2 = require("./decode.js");
Object.defineProperty(exports, "decodeXML", { enumerable: true, get: function () { return decode_js_2.decodeXML; } });
Object.defineProperty(exports, "decodeHTML", { enumerable: true, get: function () { return decode_js_2.decodeHTML; } });
Object.defineProperty(exports, "decodeHTMLStrict", { enumerable: true, get: function () { return decode_js_2.decodeHTMLStrict; } });
// Legacy aliases (deprecated)
Object.defineProperty(exports, "decodeHTML4", { enumerable: true, get: function () { return decode_js_2.decodeHTML; } });
Object.defineProperty(exports, "decodeHTML5", { enumerable: true, get: function () { return decode_js_2.decodeHTML; } });
Object.defineProperty(exports, "decodeHTML4Strict", { enumerable: true, get: function () { return decode_js_2.decodeHTMLStrict; } });
Object.defineProperty(exports, "decodeHTML5Strict", { enumerable: true, get: function () { return decode_js_2.decodeHTMLStrict; } });
Object.defineProperty(exports, "decodeXMLStrict", { enumerable: true, get: function () { return decode_js_2.decodeXML; } });

},{"./decode.js":2,"./encode.js":4,"./escape.js":5}],10:[function(require,module,exports){
//! moment.js
//! version : 2.29.4
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com

;(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    global.moment = factory()
}(this, (function () { 'use strict';

    var hookCallback;

    function hooks() {
        return hookCallback.apply(null, arguments);
    }

    // This is done to register the method called with moment()
    // without creating circular dependencies.
    function setHookCallback(callback) {
        hookCallback = callback;
    }

    function isArray(input) {
        return (
            input instanceof Array ||
            Object.prototype.toString.call(input) === '[object Array]'
        );
    }

    function isObject(input) {
        // IE8 will treat undefined and null as object if it wasn't for
        // input != null
        return (
            input != null &&
            Object.prototype.toString.call(input) === '[object Object]'
        );
    }

    function hasOwnProp(a, b) {
        return Object.prototype.hasOwnProperty.call(a, b);
    }

    function isObjectEmpty(obj) {
        if (Object.getOwnPropertyNames) {
            return Object.getOwnPropertyNames(obj).length === 0;
        } else {
            var k;
            for (k in obj) {
                if (hasOwnProp(obj, k)) {
                    return false;
                }
            }
            return true;
        }
    }

    function isUndefined(input) {
        return input === void 0;
    }

    function isNumber(input) {
        return (
            typeof input === 'number' ||
            Object.prototype.toString.call(input) === '[object Number]'
        );
    }

    function isDate(input) {
        return (
            input instanceof Date ||
            Object.prototype.toString.call(input) === '[object Date]'
        );
    }

    function map(arr, fn) {
        var res = [],
            i,
            arrLen = arr.length;
        for (i = 0; i < arrLen; ++i) {
            res.push(fn(arr[i], i));
        }
        return res;
    }

    function extend(a, b) {
        for (var i in b) {
            if (hasOwnProp(b, i)) {
                a[i] = b[i];
            }
        }

        if (hasOwnProp(b, 'toString')) {
            a.toString = b.toString;
        }

        if (hasOwnProp(b, 'valueOf')) {
            a.valueOf = b.valueOf;
        }

        return a;
    }

    function createUTC(input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, true).utc();
    }

    function defaultParsingFlags() {
        // We need to deep clone this object.
        return {
            empty: false,
            unusedTokens: [],
            unusedInput: [],
            overflow: -2,
            charsLeftOver: 0,
            nullInput: false,
            invalidEra: null,
            invalidMonth: null,
            invalidFormat: false,
            userInvalidated: false,
            iso: false,
            parsedDateParts: [],
            era: null,
            meridiem: null,
            rfc2822: false,
            weekdayMismatch: false,
        };
    }

    function getParsingFlags(m) {
        if (m._pf == null) {
            m._pf = defaultParsingFlags();
        }
        return m._pf;
    }

    var some;
    if (Array.prototype.some) {
        some = Array.prototype.some;
    } else {
        some = function (fun) {
            var t = Object(this),
                len = t.length >>> 0,
                i;

            for (i = 0; i < len; i++) {
                if (i in t && fun.call(this, t[i], i, t)) {
                    return true;
                }
            }

            return false;
        };
    }

    function isValid(m) {
        if (m._isValid == null) {
            var flags = getParsingFlags(m),
                parsedParts = some.call(flags.parsedDateParts, function (i) {
                    return i != null;
                }),
                isNowValid =
                    !isNaN(m._d.getTime()) &&
                    flags.overflow < 0 &&
                    !flags.empty &&
                    !flags.invalidEra &&
                    !flags.invalidMonth &&
                    !flags.invalidWeekday &&
                    !flags.weekdayMismatch &&
                    !flags.nullInput &&
                    !flags.invalidFormat &&
                    !flags.userInvalidated &&
                    (!flags.meridiem || (flags.meridiem && parsedParts));

            if (m._strict) {
                isNowValid =
                    isNowValid &&
                    flags.charsLeftOver === 0 &&
                    flags.unusedTokens.length === 0 &&
                    flags.bigHour === undefined;
            }

            if (Object.isFrozen == null || !Object.isFrozen(m)) {
                m._isValid = isNowValid;
            } else {
                return isNowValid;
            }
        }
        return m._isValid;
    }

    function createInvalid(flags) {
        var m = createUTC(NaN);
        if (flags != null) {
            extend(getParsingFlags(m), flags);
        } else {
            getParsingFlags(m).userInvalidated = true;
        }

        return m;
    }

    // Plugins that add properties should also add the key here (null value),
    // so we can properly clone ourselves.
    var momentProperties = (hooks.momentProperties = []),
        updateInProgress = false;

    function copyConfig(to, from) {
        var i,
            prop,
            val,
            momentPropertiesLen = momentProperties.length;

        if (!isUndefined(from._isAMomentObject)) {
            to._isAMomentObject = from._isAMomentObject;
        }
        if (!isUndefined(from._i)) {
            to._i = from._i;
        }
        if (!isUndefined(from._f)) {
            to._f = from._f;
        }
        if (!isUndefined(from._l)) {
            to._l = from._l;
        }
        if (!isUndefined(from._strict)) {
            to._strict = from._strict;
        }
        if (!isUndefined(from._tzm)) {
            to._tzm = from._tzm;
        }
        if (!isUndefined(from._isUTC)) {
            to._isUTC = from._isUTC;
        }
        if (!isUndefined(from._offset)) {
            to._offset = from._offset;
        }
        if (!isUndefined(from._pf)) {
            to._pf = getParsingFlags(from);
        }
        if (!isUndefined(from._locale)) {
            to._locale = from._locale;
        }

        if (momentPropertiesLen > 0) {
            for (i = 0; i < momentPropertiesLen; i++) {
                prop = momentProperties[i];
                val = from[prop];
                if (!isUndefined(val)) {
                    to[prop] = val;
                }
            }
        }

        return to;
    }

    // Moment prototype object
    function Moment(config) {
        copyConfig(this, config);
        this._d = new Date(config._d != null ? config._d.getTime() : NaN);
        if (!this.isValid()) {
            this._d = new Date(NaN);
        }
        // Prevent infinite loop in case updateOffset creates new moment
        // objects.
        if (updateInProgress === false) {
            updateInProgress = true;
            hooks.updateOffset(this);
            updateInProgress = false;
        }
    }

    function isMoment(obj) {
        return (
            obj instanceof Moment || (obj != null && obj._isAMomentObject != null)
        );
    }

    function warn(msg) {
        if (
            hooks.suppressDeprecationWarnings === false &&
            typeof console !== 'undefined' &&
            console.warn
        ) {
            console.warn('Deprecation warning: ' + msg);
        }
    }

    function deprecate(msg, fn) {
        var firstTime = true;

        return extend(function () {
            if (hooks.deprecationHandler != null) {
                hooks.deprecationHandler(null, msg);
            }
            if (firstTime) {
                var args = [],
                    arg,
                    i,
                    key,
                    argLen = arguments.length;
                for (i = 0; i < argLen; i++) {
                    arg = '';
                    if (typeof arguments[i] === 'object') {
                        arg += '\n[' + i + '] ';
                        for (key in arguments[0]) {
                            if (hasOwnProp(arguments[0], key)) {
                                arg += key + ': ' + arguments[0][key] + ', ';
                            }
                        }
                        arg = arg.slice(0, -2); // Remove trailing comma and space
                    } else {
                        arg = arguments[i];
                    }
                    args.push(arg);
                }
                warn(
                    msg +
                        '\nArguments: ' +
                        Array.prototype.slice.call(args).join('') +
                        '\n' +
                        new Error().stack
                );
                firstTime = false;
            }
            return fn.apply(this, arguments);
        }, fn);
    }

    var deprecations = {};

    function deprecateSimple(name, msg) {
        if (hooks.deprecationHandler != null) {
            hooks.deprecationHandler(name, msg);
        }
        if (!deprecations[name]) {
            warn(msg);
            deprecations[name] = true;
        }
    }

    hooks.suppressDeprecationWarnings = false;
    hooks.deprecationHandler = null;

    function isFunction(input) {
        return (
            (typeof Function !== 'undefined' && input instanceof Function) ||
            Object.prototype.toString.call(input) === '[object Function]'
        );
    }

    function set(config) {
        var prop, i;
        for (i in config) {
            if (hasOwnProp(config, i)) {
                prop = config[i];
                if (isFunction(prop)) {
                    this[i] = prop;
                } else {
                    this['_' + i] = prop;
                }
            }
        }
        this._config = config;
        // Lenient ordinal parsing accepts just a number in addition to
        // number + (possibly) stuff coming from _dayOfMonthOrdinalParse.
        // TODO: Remove "ordinalParse" fallback in next major release.
        this._dayOfMonthOrdinalParseLenient = new RegExp(
            (this._dayOfMonthOrdinalParse.source || this._ordinalParse.source) +
                '|' +
                /\d{1,2}/.source
        );
    }

    function mergeConfigs(parentConfig, childConfig) {
        var res = extend({}, parentConfig),
            prop;
        for (prop in childConfig) {
            if (hasOwnProp(childConfig, prop)) {
                if (isObject(parentConfig[prop]) && isObject(childConfig[prop])) {
                    res[prop] = {};
                    extend(res[prop], parentConfig[prop]);
                    extend(res[prop], childConfig[prop]);
                } else if (childConfig[prop] != null) {
                    res[prop] = childConfig[prop];
                } else {
                    delete res[prop];
                }
            }
        }
        for (prop in parentConfig) {
            if (
                hasOwnProp(parentConfig, prop) &&
                !hasOwnProp(childConfig, prop) &&
                isObject(parentConfig[prop])
            ) {
                // make sure changes to properties don't modify parent config
                res[prop] = extend({}, res[prop]);
            }
        }
        return res;
    }

    function Locale(config) {
        if (config != null) {
            this.set(config);
        }
    }

    var keys;

    if (Object.keys) {
        keys = Object.keys;
    } else {
        keys = function (obj) {
            var i,
                res = [];
            for (i in obj) {
                if (hasOwnProp(obj, i)) {
                    res.push(i);
                }
            }
            return res;
        };
    }

    var defaultCalendar = {
        sameDay: '[Today at] LT',
        nextDay: '[Tomorrow at] LT',
        nextWeek: 'dddd [at] LT',
        lastDay: '[Yesterday at] LT',
        lastWeek: '[Last] dddd [at] LT',
        sameElse: 'L',
    };

    function calendar(key, mom, now) {
        var output = this._calendar[key] || this._calendar['sameElse'];
        return isFunction(output) ? output.call(mom, now) : output;
    }

    function zeroFill(number, targetLength, forceSign) {
        var absNumber = '' + Math.abs(number),
            zerosToFill = targetLength - absNumber.length,
            sign = number >= 0;
        return (
            (sign ? (forceSign ? '+' : '') : '-') +
            Math.pow(10, Math.max(0, zerosToFill)).toString().substr(1) +
            absNumber
        );
    }

    var formattingTokens =
            /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|N{1,5}|YYYYYY|YYYYY|YYYY|YY|y{2,4}|yo?|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g,
        localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g,
        formatFunctions = {},
        formatTokenFunctions = {};

    // token:    'M'
    // padded:   ['MM', 2]
    // ordinal:  'Mo'
    // callback: function () { this.month() + 1 }
    function addFormatToken(token, padded, ordinal, callback) {
        var func = callback;
        if (typeof callback === 'string') {
            func = function () {
                return this[callback]();
            };
        }
        if (token) {
            formatTokenFunctions[token] = func;
        }
        if (padded) {
            formatTokenFunctions[padded[0]] = function () {
                return zeroFill(func.apply(this, arguments), padded[1], padded[2]);
            };
        }
        if (ordinal) {
            formatTokenFunctions[ordinal] = function () {
                return this.localeData().ordinal(
                    func.apply(this, arguments),
                    token
                );
            };
        }
    }

    function removeFormattingTokens(input) {
        if (input.match(/\[[\s\S]/)) {
            return input.replace(/^\[|\]$/g, '');
        }
        return input.replace(/\\/g, '');
    }

    function makeFormatFunction(format) {
        var array = format.match(formattingTokens),
            i,
            length;

        for (i = 0, length = array.length; i < length; i++) {
            if (formatTokenFunctions[array[i]]) {
                array[i] = formatTokenFunctions[array[i]];
            } else {
                array[i] = removeFormattingTokens(array[i]);
            }
        }

        return function (mom) {
            var output = '',
                i;
            for (i = 0; i < length; i++) {
                output += isFunction(array[i])
                    ? array[i].call(mom, format)
                    : array[i];
            }
            return output;
        };
    }

    // format date using native date object
    function formatMoment(m, format) {
        if (!m.isValid()) {
            return m.localeData().invalidDate();
        }

        format = expandFormat(format, m.localeData());
        formatFunctions[format] =
            formatFunctions[format] || makeFormatFunction(format);

        return formatFunctions[format](m);
    }

    function expandFormat(format, locale) {
        var i = 5;

        function replaceLongDateFormatTokens(input) {
            return locale.longDateFormat(input) || input;
        }

        localFormattingTokens.lastIndex = 0;
        while (i >= 0 && localFormattingTokens.test(format)) {
            format = format.replace(
                localFormattingTokens,
                replaceLongDateFormatTokens
            );
            localFormattingTokens.lastIndex = 0;
            i -= 1;
        }

        return format;
    }

    var defaultLongDateFormat = {
        LTS: 'h:mm:ss A',
        LT: 'h:mm A',
        L: 'MM/DD/YYYY',
        LL: 'MMMM D, YYYY',
        LLL: 'MMMM D, YYYY h:mm A',
        LLLL: 'dddd, MMMM D, YYYY h:mm A',
    };

    function longDateFormat(key) {
        var format = this._longDateFormat[key],
            formatUpper = this._longDateFormat[key.toUpperCase()];

        if (format || !formatUpper) {
            return format;
        }

        this._longDateFormat[key] = formatUpper
            .match(formattingTokens)
            .map(function (tok) {
                if (
                    tok === 'MMMM' ||
                    tok === 'MM' ||
                    tok === 'DD' ||
                    tok === 'dddd'
                ) {
                    return tok.slice(1);
                }
                return tok;
            })
            .join('');

        return this._longDateFormat[key];
    }

    var defaultInvalidDate = 'Invalid date';

    function invalidDate() {
        return this._invalidDate;
    }

    var defaultOrdinal = '%d',
        defaultDayOfMonthOrdinalParse = /\d{1,2}/;

    function ordinal(number) {
        return this._ordinal.replace('%d', number);
    }

    var defaultRelativeTime = {
        future: 'in %s',
        past: '%s ago',
        s: 'a few seconds',
        ss: '%d seconds',
        m: 'a minute',
        mm: '%d minutes',
        h: 'an hour',
        hh: '%d hours',
        d: 'a day',
        dd: '%d days',
        w: 'a week',
        ww: '%d weeks',
        M: 'a month',
        MM: '%d months',
        y: 'a year',
        yy: '%d years',
    };

    function relativeTime(number, withoutSuffix, string, isFuture) {
        var output = this._relativeTime[string];
        return isFunction(output)
            ? output(number, withoutSuffix, string, isFuture)
            : output.replace(/%d/i, number);
    }

    function pastFuture(diff, output) {
        var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
        return isFunction(format) ? format(output) : format.replace(/%s/i, output);
    }

    var aliases = {};

    function addUnitAlias(unit, shorthand) {
        var lowerCase = unit.toLowerCase();
        aliases[lowerCase] = aliases[lowerCase + 's'] = aliases[shorthand] = unit;
    }

    function normalizeUnits(units) {
        return typeof units === 'string'
            ? aliases[units] || aliases[units.toLowerCase()]
            : undefined;
    }

    function normalizeObjectUnits(inputObject) {
        var normalizedInput = {},
            normalizedProp,
            prop;

        for (prop in inputObject) {
            if (hasOwnProp(inputObject, prop)) {
                normalizedProp = normalizeUnits(prop);
                if (normalizedProp) {
                    normalizedInput[normalizedProp] = inputObject[prop];
                }
            }
        }

        return normalizedInput;
    }

    var priorities = {};

    function addUnitPriority(unit, priority) {
        priorities[unit] = priority;
    }

    function getPrioritizedUnits(unitsObj) {
        var units = [],
            u;
        for (u in unitsObj) {
            if (hasOwnProp(unitsObj, u)) {
                units.push({ unit: u, priority: priorities[u] });
            }
        }
        units.sort(function (a, b) {
            return a.priority - b.priority;
        });
        return units;
    }

    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }

    function absFloor(number) {
        if (number < 0) {
            // -0 -> 0
            return Math.ceil(number) || 0;
        } else {
            return Math.floor(number);
        }
    }

    function toInt(argumentForCoercion) {
        var coercedNumber = +argumentForCoercion,
            value = 0;

        if (coercedNumber !== 0 && isFinite(coercedNumber)) {
            value = absFloor(coercedNumber);
        }

        return value;
    }

    function makeGetSet(unit, keepTime) {
        return function (value) {
            if (value != null) {
                set$1(this, unit, value);
                hooks.updateOffset(this, keepTime);
                return this;
            } else {
                return get(this, unit);
            }
        };
    }

    function get(mom, unit) {
        return mom.isValid()
            ? mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]()
            : NaN;
    }

    function set$1(mom, unit, value) {
        if (mom.isValid() && !isNaN(value)) {
            if (
                unit === 'FullYear' &&
                isLeapYear(mom.year()) &&
                mom.month() === 1 &&
                mom.date() === 29
            ) {
                value = toInt(value);
                mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](
                    value,
                    mom.month(),
                    daysInMonth(value, mom.month())
                );
            } else {
                mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
            }
        }
    }

    // MOMENTS

    function stringGet(units) {
        units = normalizeUnits(units);
        if (isFunction(this[units])) {
            return this[units]();
        }
        return this;
    }

    function stringSet(units, value) {
        if (typeof units === 'object') {
            units = normalizeObjectUnits(units);
            var prioritized = getPrioritizedUnits(units),
                i,
                prioritizedLen = prioritized.length;
            for (i = 0; i < prioritizedLen; i++) {
                this[prioritized[i].unit](units[prioritized[i].unit]);
            }
        } else {
            units = normalizeUnits(units);
            if (isFunction(this[units])) {
                return this[units](value);
            }
        }
        return this;
    }

    var match1 = /\d/, //       0 - 9
        match2 = /\d\d/, //      00 - 99
        match3 = /\d{3}/, //     000 - 999
        match4 = /\d{4}/, //    0000 - 9999
        match6 = /[+-]?\d{6}/, // -999999 - 999999
        match1to2 = /\d\d?/, //       0 - 99
        match3to4 = /\d\d\d\d?/, //     999 - 9999
        match5to6 = /\d\d\d\d\d\d?/, //   99999 - 999999
        match1to3 = /\d{1,3}/, //       0 - 999
        match1to4 = /\d{1,4}/, //       0 - 9999
        match1to6 = /[+-]?\d{1,6}/, // -999999 - 999999
        matchUnsigned = /\d+/, //       0 - inf
        matchSigned = /[+-]?\d+/, //    -inf - inf
        matchOffset = /Z|[+-]\d\d:?\d\d/gi, // +00:00 -00:00 +0000 -0000 or Z
        matchShortOffset = /Z|[+-]\d\d(?::?\d\d)?/gi, // +00 -00 +00:00 -00:00 +0000 -0000 or Z
        matchTimestamp = /[+-]?\d+(\.\d{1,3})?/, // 123456789 123456789.123
        // any word (or two) characters or numbers including two/three word month in arabic.
        // includes scottish gaelic two word and hyphenated months
        matchWord =
            /[0-9]{0,256}['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFF07\uFF10-\uFFEF]{1,256}|[\u0600-\u06FF\/]{1,256}(\s*?[\u0600-\u06FF]{1,256}){1,2}/i,
        regexes;

    regexes = {};

    function addRegexToken(token, regex, strictRegex) {
        regexes[token] = isFunction(regex)
            ? regex
            : function (isStrict, localeData) {
                  return isStrict && strictRegex ? strictRegex : regex;
              };
    }

    function getParseRegexForToken(token, config) {
        if (!hasOwnProp(regexes, token)) {
            return new RegExp(unescapeFormat(token));
        }

        return regexes[token](config._strict, config._locale);
    }

    // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
    function unescapeFormat(s) {
        return regexEscape(
            s
                .replace('\\', '')
                .replace(
                    /\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g,
                    function (matched, p1, p2, p3, p4) {
                        return p1 || p2 || p3 || p4;
                    }
                )
        );
    }

    function regexEscape(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    var tokens = {};

    function addParseToken(token, callback) {
        var i,
            func = callback,
            tokenLen;
        if (typeof token === 'string') {
            token = [token];
        }
        if (isNumber(callback)) {
            func = function (input, array) {
                array[callback] = toInt(input);
            };
        }
        tokenLen = token.length;
        for (i = 0; i < tokenLen; i++) {
            tokens[token[i]] = func;
        }
    }

    function addWeekParseToken(token, callback) {
        addParseToken(token, function (input, array, config, token) {
            config._w = config._w || {};
            callback(input, config._w, config, token);
        });
    }

    function addTimeToArrayFromToken(token, input, config) {
        if (input != null && hasOwnProp(tokens, token)) {
            tokens[token](input, config._a, config, token);
        }
    }

    var YEAR = 0,
        MONTH = 1,
        DATE = 2,
        HOUR = 3,
        MINUTE = 4,
        SECOND = 5,
        MILLISECOND = 6,
        WEEK = 7,
        WEEKDAY = 8;

    function mod(n, x) {
        return ((n % x) + x) % x;
    }

    var indexOf;

    if (Array.prototype.indexOf) {
        indexOf = Array.prototype.indexOf;
    } else {
        indexOf = function (o) {
            // I know
            var i;
            for (i = 0; i < this.length; ++i) {
                if (this[i] === o) {
                    return i;
                }
            }
            return -1;
        };
    }

    function daysInMonth(year, month) {
        if (isNaN(year) || isNaN(month)) {
            return NaN;
        }
        var modMonth = mod(month, 12);
        year += (month - modMonth) / 12;
        return modMonth === 1
            ? isLeapYear(year)
                ? 29
                : 28
            : 31 - ((modMonth % 7) % 2);
    }

    // FORMATTING

    addFormatToken('M', ['MM', 2], 'Mo', function () {
        return this.month() + 1;
    });

    addFormatToken('MMM', 0, 0, function (format) {
        return this.localeData().monthsShort(this, format);
    });

    addFormatToken('MMMM', 0, 0, function (format) {
        return this.localeData().months(this, format);
    });

    // ALIASES

    addUnitAlias('month', 'M');

    // PRIORITY

    addUnitPriority('month', 8);

    // PARSING

    addRegexToken('M', match1to2);
    addRegexToken('MM', match1to2, match2);
    addRegexToken('MMM', function (isStrict, locale) {
        return locale.monthsShortRegex(isStrict);
    });
    addRegexToken('MMMM', function (isStrict, locale) {
        return locale.monthsRegex(isStrict);
    });

    addParseToken(['M', 'MM'], function (input, array) {
        array[MONTH] = toInt(input) - 1;
    });

    addParseToken(['MMM', 'MMMM'], function (input, array, config, token) {
        var month = config._locale.monthsParse(input, token, config._strict);
        // if we didn't find a month name, mark the date as invalid.
        if (month != null) {
            array[MONTH] = month;
        } else {
            getParsingFlags(config).invalidMonth = input;
        }
    });

    // LOCALES

    var defaultLocaleMonths =
            'January_February_March_April_May_June_July_August_September_October_November_December'.split(
                '_'
            ),
        defaultLocaleMonthsShort =
            'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
        MONTHS_IN_FORMAT = /D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/,
        defaultMonthsShortRegex = matchWord,
        defaultMonthsRegex = matchWord;

    function localeMonths(m, format) {
        if (!m) {
            return isArray(this._months)
                ? this._months
                : this._months['standalone'];
        }
        return isArray(this._months)
            ? this._months[m.month()]
            : this._months[
                  (this._months.isFormat || MONTHS_IN_FORMAT).test(format)
                      ? 'format'
                      : 'standalone'
              ][m.month()];
    }

    function localeMonthsShort(m, format) {
        if (!m) {
            return isArray(this._monthsShort)
                ? this._monthsShort
                : this._monthsShort['standalone'];
        }
        return isArray(this._monthsShort)
            ? this._monthsShort[m.month()]
            : this._monthsShort[
                  MONTHS_IN_FORMAT.test(format) ? 'format' : 'standalone'
              ][m.month()];
    }

    function handleStrictParse(monthName, format, strict) {
        var i,
            ii,
            mom,
            llc = monthName.toLocaleLowerCase();
        if (!this._monthsParse) {
            // this is not used
            this._monthsParse = [];
            this._longMonthsParse = [];
            this._shortMonthsParse = [];
            for (i = 0; i < 12; ++i) {
                mom = createUTC([2000, i]);
                this._shortMonthsParse[i] = this.monthsShort(
                    mom,
                    ''
                ).toLocaleLowerCase();
                this._longMonthsParse[i] = this.months(mom, '').toLocaleLowerCase();
            }
        }

        if (strict) {
            if (format === 'MMM') {
                ii = indexOf.call(this._shortMonthsParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._longMonthsParse, llc);
                return ii !== -1 ? ii : null;
            }
        } else {
            if (format === 'MMM') {
                ii = indexOf.call(this._shortMonthsParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._longMonthsParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._longMonthsParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._shortMonthsParse, llc);
                return ii !== -1 ? ii : null;
            }
        }
    }

    function localeMonthsParse(monthName, format, strict) {
        var i, mom, regex;

        if (this._monthsParseExact) {
            return handleStrictParse.call(this, monthName, format, strict);
        }

        if (!this._monthsParse) {
            this._monthsParse = [];
            this._longMonthsParse = [];
            this._shortMonthsParse = [];
        }

        // TODO: add sorting
        // Sorting makes sure if one month (or abbr) is a prefix of another
        // see sorting in computeMonthsParse
        for (i = 0; i < 12; i++) {
            // make the regex if we don't have it already
            mom = createUTC([2000, i]);
            if (strict && !this._longMonthsParse[i]) {
                this._longMonthsParse[i] = new RegExp(
                    '^' + this.months(mom, '').replace('.', '') + '$',
                    'i'
                );
                this._shortMonthsParse[i] = new RegExp(
                    '^' + this.monthsShort(mom, '').replace('.', '') + '$',
                    'i'
                );
            }
            if (!strict && !this._monthsParse[i]) {
                regex =
                    '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
                this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            // test the regex
            if (
                strict &&
                format === 'MMMM' &&
                this._longMonthsParse[i].test(monthName)
            ) {
                return i;
            } else if (
                strict &&
                format === 'MMM' &&
                this._shortMonthsParse[i].test(monthName)
            ) {
                return i;
            } else if (!strict && this._monthsParse[i].test(monthName)) {
                return i;
            }
        }
    }

    // MOMENTS

    function setMonth(mom, value) {
        var dayOfMonth;

        if (!mom.isValid()) {
            // No op
            return mom;
        }

        if (typeof value === 'string') {
            if (/^\d+$/.test(value)) {
                value = toInt(value);
            } else {
                value = mom.localeData().monthsParse(value);
                // TODO: Another silent failure?
                if (!isNumber(value)) {
                    return mom;
                }
            }
        }

        dayOfMonth = Math.min(mom.date(), daysInMonth(mom.year(), value));
        mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
        return mom;
    }

    function getSetMonth(value) {
        if (value != null) {
            setMonth(this, value);
            hooks.updateOffset(this, true);
            return this;
        } else {
            return get(this, 'Month');
        }
    }

    function getDaysInMonth() {
        return daysInMonth(this.year(), this.month());
    }

    function monthsShortRegex(isStrict) {
        if (this._monthsParseExact) {
            if (!hasOwnProp(this, '_monthsRegex')) {
                computeMonthsParse.call(this);
            }
            if (isStrict) {
                return this._monthsShortStrictRegex;
            } else {
                return this._monthsShortRegex;
            }
        } else {
            if (!hasOwnProp(this, '_monthsShortRegex')) {
                this._monthsShortRegex = defaultMonthsShortRegex;
            }
            return this._monthsShortStrictRegex && isStrict
                ? this._monthsShortStrictRegex
                : this._monthsShortRegex;
        }
    }

    function monthsRegex(isStrict) {
        if (this._monthsParseExact) {
            if (!hasOwnProp(this, '_monthsRegex')) {
                computeMonthsParse.call(this);
            }
            if (isStrict) {
                return this._monthsStrictRegex;
            } else {
                return this._monthsRegex;
            }
        } else {
            if (!hasOwnProp(this, '_monthsRegex')) {
                this._monthsRegex = defaultMonthsRegex;
            }
            return this._monthsStrictRegex && isStrict
                ? this._monthsStrictRegex
                : this._monthsRegex;
        }
    }

    function computeMonthsParse() {
        function cmpLenRev(a, b) {
            return b.length - a.length;
        }

        var shortPieces = [],
            longPieces = [],
            mixedPieces = [],
            i,
            mom;
        for (i = 0; i < 12; i++) {
            // make the regex if we don't have it already
            mom = createUTC([2000, i]);
            shortPieces.push(this.monthsShort(mom, ''));
            longPieces.push(this.months(mom, ''));
            mixedPieces.push(this.months(mom, ''));
            mixedPieces.push(this.monthsShort(mom, ''));
        }
        // Sorting makes sure if one month (or abbr) is a prefix of another it
        // will match the longer piece.
        shortPieces.sort(cmpLenRev);
        longPieces.sort(cmpLenRev);
        mixedPieces.sort(cmpLenRev);
        for (i = 0; i < 12; i++) {
            shortPieces[i] = regexEscape(shortPieces[i]);
            longPieces[i] = regexEscape(longPieces[i]);
        }
        for (i = 0; i < 24; i++) {
            mixedPieces[i] = regexEscape(mixedPieces[i]);
        }

        this._monthsRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
        this._monthsShortRegex = this._monthsRegex;
        this._monthsStrictRegex = new RegExp(
            '^(' + longPieces.join('|') + ')',
            'i'
        );
        this._monthsShortStrictRegex = new RegExp(
            '^(' + shortPieces.join('|') + ')',
            'i'
        );
    }

    // FORMATTING

    addFormatToken('Y', 0, 0, function () {
        var y = this.year();
        return y <= 9999 ? zeroFill(y, 4) : '+' + y;
    });

    addFormatToken(0, ['YY', 2], 0, function () {
        return this.year() % 100;
    });

    addFormatToken(0, ['YYYY', 4], 0, 'year');
    addFormatToken(0, ['YYYYY', 5], 0, 'year');
    addFormatToken(0, ['YYYYYY', 6, true], 0, 'year');

    // ALIASES

    addUnitAlias('year', 'y');

    // PRIORITIES

    addUnitPriority('year', 1);

    // PARSING

    addRegexToken('Y', matchSigned);
    addRegexToken('YY', match1to2, match2);
    addRegexToken('YYYY', match1to4, match4);
    addRegexToken('YYYYY', match1to6, match6);
    addRegexToken('YYYYYY', match1to6, match6);

    addParseToken(['YYYYY', 'YYYYYY'], YEAR);
    addParseToken('YYYY', function (input, array) {
        array[YEAR] =
            input.length === 2 ? hooks.parseTwoDigitYear(input) : toInt(input);
    });
    addParseToken('YY', function (input, array) {
        array[YEAR] = hooks.parseTwoDigitYear(input);
    });
    addParseToken('Y', function (input, array) {
        array[YEAR] = parseInt(input, 10);
    });

    // HELPERS

    function daysInYear(year) {
        return isLeapYear(year) ? 366 : 365;
    }

    // HOOKS

    hooks.parseTwoDigitYear = function (input) {
        return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
    };

    // MOMENTS

    var getSetYear = makeGetSet('FullYear', true);

    function getIsLeapYear() {
        return isLeapYear(this.year());
    }

    function createDate(y, m, d, h, M, s, ms) {
        // can't just apply() to create a date:
        // https://stackoverflow.com/q/181348
        var date;
        // the date constructor remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0) {
            // preserve leap years using a full 400 year cycle, then reset
            date = new Date(y + 400, m, d, h, M, s, ms);
            if (isFinite(date.getFullYear())) {
                date.setFullYear(y);
            }
        } else {
            date = new Date(y, m, d, h, M, s, ms);
        }

        return date;
    }

    function createUTCDate(y) {
        var date, args;
        // the Date.UTC function remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0) {
            args = Array.prototype.slice.call(arguments);
            // preserve leap years using a full 400 year cycle, then reset
            args[0] = y + 400;
            date = new Date(Date.UTC.apply(null, args));
            if (isFinite(date.getUTCFullYear())) {
                date.setUTCFullYear(y);
            }
        } else {
            date = new Date(Date.UTC.apply(null, arguments));
        }

        return date;
    }

    // start-of-first-week - start-of-year
    function firstWeekOffset(year, dow, doy) {
        var // first-week day -- which january is always in the first week (4 for iso, 1 for other)
            fwd = 7 + dow - doy,
            // first-week day local weekday -- which local weekday is fwd
            fwdlw = (7 + createUTCDate(year, 0, fwd).getUTCDay() - dow) % 7;

        return -fwdlw + fwd - 1;
    }

    // https://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
    function dayOfYearFromWeeks(year, week, weekday, dow, doy) {
        var localWeekday = (7 + weekday - dow) % 7,
            weekOffset = firstWeekOffset(year, dow, doy),
            dayOfYear = 1 + 7 * (week - 1) + localWeekday + weekOffset,
            resYear,
            resDayOfYear;

        if (dayOfYear <= 0) {
            resYear = year - 1;
            resDayOfYear = daysInYear(resYear) + dayOfYear;
        } else if (dayOfYear > daysInYear(year)) {
            resYear = year + 1;
            resDayOfYear = dayOfYear - daysInYear(year);
        } else {
            resYear = year;
            resDayOfYear = dayOfYear;
        }

        return {
            year: resYear,
            dayOfYear: resDayOfYear,
        };
    }

    function weekOfYear(mom, dow, doy) {
        var weekOffset = firstWeekOffset(mom.year(), dow, doy),
            week = Math.floor((mom.dayOfYear() - weekOffset - 1) / 7) + 1,
            resWeek,
            resYear;

        if (week < 1) {
            resYear = mom.year() - 1;
            resWeek = week + weeksInYear(resYear, dow, doy);
        } else if (week > weeksInYear(mom.year(), dow, doy)) {
            resWeek = week - weeksInYear(mom.year(), dow, doy);
            resYear = mom.year() + 1;
        } else {
            resYear = mom.year();
            resWeek = week;
        }

        return {
            week: resWeek,
            year: resYear,
        };
    }

    function weeksInYear(year, dow, doy) {
        var weekOffset = firstWeekOffset(year, dow, doy),
            weekOffsetNext = firstWeekOffset(year + 1, dow, doy);
        return (daysInYear(year) - weekOffset + weekOffsetNext) / 7;
    }

    // FORMATTING

    addFormatToken('w', ['ww', 2], 'wo', 'week');
    addFormatToken('W', ['WW', 2], 'Wo', 'isoWeek');

    // ALIASES

    addUnitAlias('week', 'w');
    addUnitAlias('isoWeek', 'W');

    // PRIORITIES

    addUnitPriority('week', 5);
    addUnitPriority('isoWeek', 5);

    // PARSING

    addRegexToken('w', match1to2);
    addRegexToken('ww', match1to2, match2);
    addRegexToken('W', match1to2);
    addRegexToken('WW', match1to2, match2);

    addWeekParseToken(
        ['w', 'ww', 'W', 'WW'],
        function (input, week, config, token) {
            week[token.substr(0, 1)] = toInt(input);
        }
    );

    // HELPERS

    // LOCALES

    function localeWeek(mom) {
        return weekOfYear(mom, this._week.dow, this._week.doy).week;
    }

    var defaultLocaleWeek = {
        dow: 0, // Sunday is the first day of the week.
        doy: 6, // The week that contains Jan 6th is the first week of the year.
    };

    function localeFirstDayOfWeek() {
        return this._week.dow;
    }

    function localeFirstDayOfYear() {
        return this._week.doy;
    }

    // MOMENTS

    function getSetWeek(input) {
        var week = this.localeData().week(this);
        return input == null ? week : this.add((input - week) * 7, 'd');
    }

    function getSetISOWeek(input) {
        var week = weekOfYear(this, 1, 4).week;
        return input == null ? week : this.add((input - week) * 7, 'd');
    }

    // FORMATTING

    addFormatToken('d', 0, 'do', 'day');

    addFormatToken('dd', 0, 0, function (format) {
        return this.localeData().weekdaysMin(this, format);
    });

    addFormatToken('ddd', 0, 0, function (format) {
        return this.localeData().weekdaysShort(this, format);
    });

    addFormatToken('dddd', 0, 0, function (format) {
        return this.localeData().weekdays(this, format);
    });

    addFormatToken('e', 0, 0, 'weekday');
    addFormatToken('E', 0, 0, 'isoWeekday');

    // ALIASES

    addUnitAlias('day', 'd');
    addUnitAlias('weekday', 'e');
    addUnitAlias('isoWeekday', 'E');

    // PRIORITY
    addUnitPriority('day', 11);
    addUnitPriority('weekday', 11);
    addUnitPriority('isoWeekday', 11);

    // PARSING

    addRegexToken('d', match1to2);
    addRegexToken('e', match1to2);
    addRegexToken('E', match1to2);
    addRegexToken('dd', function (isStrict, locale) {
        return locale.weekdaysMinRegex(isStrict);
    });
    addRegexToken('ddd', function (isStrict, locale) {
        return locale.weekdaysShortRegex(isStrict);
    });
    addRegexToken('dddd', function (isStrict, locale) {
        return locale.weekdaysRegex(isStrict);
    });

    addWeekParseToken(['dd', 'ddd', 'dddd'], function (input, week, config, token) {
        var weekday = config._locale.weekdaysParse(input, token, config._strict);
        // if we didn't get a weekday name, mark the date as invalid
        if (weekday != null) {
            week.d = weekday;
        } else {
            getParsingFlags(config).invalidWeekday = input;
        }
    });

    addWeekParseToken(['d', 'e', 'E'], function (input, week, config, token) {
        week[token] = toInt(input);
    });

    // HELPERS

    function parseWeekday(input, locale) {
        if (typeof input !== 'string') {
            return input;
        }

        if (!isNaN(input)) {
            return parseInt(input, 10);
        }

        input = locale.weekdaysParse(input);
        if (typeof input === 'number') {
            return input;
        }

        return null;
    }

    function parseIsoWeekday(input, locale) {
        if (typeof input === 'string') {
            return locale.weekdaysParse(input) % 7 || 7;
        }
        return isNaN(input) ? null : input;
    }

    // LOCALES
    function shiftWeekdays(ws, n) {
        return ws.slice(n, 7).concat(ws.slice(0, n));
    }

    var defaultLocaleWeekdays =
            'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
        defaultLocaleWeekdaysShort = 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
        defaultLocaleWeekdaysMin = 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
        defaultWeekdaysRegex = matchWord,
        defaultWeekdaysShortRegex = matchWord,
        defaultWeekdaysMinRegex = matchWord;

    function localeWeekdays(m, format) {
        var weekdays = isArray(this._weekdays)
            ? this._weekdays
            : this._weekdays[
                  m && m !== true && this._weekdays.isFormat.test(format)
                      ? 'format'
                      : 'standalone'
              ];
        return m === true
            ? shiftWeekdays(weekdays, this._week.dow)
            : m
            ? weekdays[m.day()]
            : weekdays;
    }

    function localeWeekdaysShort(m) {
        return m === true
            ? shiftWeekdays(this._weekdaysShort, this._week.dow)
            : m
            ? this._weekdaysShort[m.day()]
            : this._weekdaysShort;
    }

    function localeWeekdaysMin(m) {
        return m === true
            ? shiftWeekdays(this._weekdaysMin, this._week.dow)
            : m
            ? this._weekdaysMin[m.day()]
            : this._weekdaysMin;
    }

    function handleStrictParse$1(weekdayName, format, strict) {
        var i,
            ii,
            mom,
            llc = weekdayName.toLocaleLowerCase();
        if (!this._weekdaysParse) {
            this._weekdaysParse = [];
            this._shortWeekdaysParse = [];
            this._minWeekdaysParse = [];

            for (i = 0; i < 7; ++i) {
                mom = createUTC([2000, 1]).day(i);
                this._minWeekdaysParse[i] = this.weekdaysMin(
                    mom,
                    ''
                ).toLocaleLowerCase();
                this._shortWeekdaysParse[i] = this.weekdaysShort(
                    mom,
                    ''
                ).toLocaleLowerCase();
                this._weekdaysParse[i] = this.weekdays(mom, '').toLocaleLowerCase();
            }
        }

        if (strict) {
            if (format === 'dddd') {
                ii = indexOf.call(this._weekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else if (format === 'ddd') {
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            }
        } else {
            if (format === 'dddd') {
                ii = indexOf.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else if (format === 'ddd') {
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._minWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            } else {
                ii = indexOf.call(this._minWeekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._weekdaysParse, llc);
                if (ii !== -1) {
                    return ii;
                }
                ii = indexOf.call(this._shortWeekdaysParse, llc);
                return ii !== -1 ? ii : null;
            }
        }
    }

    function localeWeekdaysParse(weekdayName, format, strict) {
        var i, mom, regex;

        if (this._weekdaysParseExact) {
            return handleStrictParse$1.call(this, weekdayName, format, strict);
        }

        if (!this._weekdaysParse) {
            this._weekdaysParse = [];
            this._minWeekdaysParse = [];
            this._shortWeekdaysParse = [];
            this._fullWeekdaysParse = [];
        }

        for (i = 0; i < 7; i++) {
            // make the regex if we don't have it already

            mom = createUTC([2000, 1]).day(i);
            if (strict && !this._fullWeekdaysParse[i]) {
                this._fullWeekdaysParse[i] = new RegExp(
                    '^' + this.weekdays(mom, '').replace('.', '\\.?') + '$',
                    'i'
                );
                this._shortWeekdaysParse[i] = new RegExp(
                    '^' + this.weekdaysShort(mom, '').replace('.', '\\.?') + '$',
                    'i'
                );
                this._minWeekdaysParse[i] = new RegExp(
                    '^' + this.weekdaysMin(mom, '').replace('.', '\\.?') + '$',
                    'i'
                );
            }
            if (!this._weekdaysParse[i]) {
                regex =
                    '^' +
                    this.weekdays(mom, '') +
                    '|^' +
                    this.weekdaysShort(mom, '') +
                    '|^' +
                    this.weekdaysMin(mom, '');
                this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
            }
            // test the regex
            if (
                strict &&
                format === 'dddd' &&
                this._fullWeekdaysParse[i].test(weekdayName)
            ) {
                return i;
            } else if (
                strict &&
                format === 'ddd' &&
                this._shortWeekdaysParse[i].test(weekdayName)
            ) {
                return i;
            } else if (
                strict &&
                format === 'dd' &&
                this._minWeekdaysParse[i].test(weekdayName)
            ) {
                return i;
            } else if (!strict && this._weekdaysParse[i].test(weekdayName)) {
                return i;
            }
        }
    }

    // MOMENTS

    function getSetDayOfWeek(input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
        if (input != null) {
            input = parseWeekday(input, this.localeData());
            return this.add(input - day, 'd');
        } else {
            return day;
        }
    }

    function getSetLocaleDayOfWeek(input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
        return input == null ? weekday : this.add(input - weekday, 'd');
    }

    function getSetISODayOfWeek(input) {
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }

        // behaves the same as moment#day except
        // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
        // as a setter, sunday should belong to the previous week.

        if (input != null) {
            var weekday = parseIsoWeekday(input, this.localeData());
            return this.day(this.day() % 7 ? weekday : weekday - 7);
        } else {
            return this.day() || 7;
        }
    }

    function weekdaysRegex(isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysStrictRegex;
            } else {
                return this._weekdaysRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                this._weekdaysRegex = defaultWeekdaysRegex;
            }
            return this._weekdaysStrictRegex && isStrict
                ? this._weekdaysStrictRegex
                : this._weekdaysRegex;
        }
    }

    function weekdaysShortRegex(isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysShortStrictRegex;
            } else {
                return this._weekdaysShortRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysShortRegex')) {
                this._weekdaysShortRegex = defaultWeekdaysShortRegex;
            }
            return this._weekdaysShortStrictRegex && isStrict
                ? this._weekdaysShortStrictRegex
                : this._weekdaysShortRegex;
        }
    }

    function weekdaysMinRegex(isStrict) {
        if (this._weekdaysParseExact) {
            if (!hasOwnProp(this, '_weekdaysRegex')) {
                computeWeekdaysParse.call(this);
            }
            if (isStrict) {
                return this._weekdaysMinStrictRegex;
            } else {
                return this._weekdaysMinRegex;
            }
        } else {
            if (!hasOwnProp(this, '_weekdaysMinRegex')) {
                this._weekdaysMinRegex = defaultWeekdaysMinRegex;
            }
            return this._weekdaysMinStrictRegex && isStrict
                ? this._weekdaysMinStrictRegex
                : this._weekdaysMinRegex;
        }
    }

    function computeWeekdaysParse() {
        function cmpLenRev(a, b) {
            return b.length - a.length;
        }

        var minPieces = [],
            shortPieces = [],
            longPieces = [],
            mixedPieces = [],
            i,
            mom,
            minp,
            shortp,
            longp;
        for (i = 0; i < 7; i++) {
            // make the regex if we don't have it already
            mom = createUTC([2000, 1]).day(i);
            minp = regexEscape(this.weekdaysMin(mom, ''));
            shortp = regexEscape(this.weekdaysShort(mom, ''));
            longp = regexEscape(this.weekdays(mom, ''));
            minPieces.push(minp);
            shortPieces.push(shortp);
            longPieces.push(longp);
            mixedPieces.push(minp);
            mixedPieces.push(shortp);
            mixedPieces.push(longp);
        }
        // Sorting makes sure if one weekday (or abbr) is a prefix of another it
        // will match the longer piece.
        minPieces.sort(cmpLenRev);
        shortPieces.sort(cmpLenRev);
        longPieces.sort(cmpLenRev);
        mixedPieces.sort(cmpLenRev);

        this._weekdaysRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
        this._weekdaysShortRegex = this._weekdaysRegex;
        this._weekdaysMinRegex = this._weekdaysRegex;

        this._weekdaysStrictRegex = new RegExp(
            '^(' + longPieces.join('|') + ')',
            'i'
        );
        this._weekdaysShortStrictRegex = new RegExp(
            '^(' + shortPieces.join('|') + ')',
            'i'
        );
        this._weekdaysMinStrictRegex = new RegExp(
            '^(' + minPieces.join('|') + ')',
            'i'
        );
    }

    // FORMATTING

    function hFormat() {
        return this.hours() % 12 || 12;
    }

    function kFormat() {
        return this.hours() || 24;
    }

    addFormatToken('H', ['HH', 2], 0, 'hour');
    addFormatToken('h', ['hh', 2], 0, hFormat);
    addFormatToken('k', ['kk', 2], 0, kFormat);

    addFormatToken('hmm', 0, 0, function () {
        return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2);
    });

    addFormatToken('hmmss', 0, 0, function () {
        return (
            '' +
            hFormat.apply(this) +
            zeroFill(this.minutes(), 2) +
            zeroFill(this.seconds(), 2)
        );
    });

    addFormatToken('Hmm', 0, 0, function () {
        return '' + this.hours() + zeroFill(this.minutes(), 2);
    });

    addFormatToken('Hmmss', 0, 0, function () {
        return (
            '' +
            this.hours() +
            zeroFill(this.minutes(), 2) +
            zeroFill(this.seconds(), 2)
        );
    });

    function meridiem(token, lowercase) {
        addFormatToken(token, 0, 0, function () {
            return this.localeData().meridiem(
                this.hours(),
                this.minutes(),
                lowercase
            );
        });
    }

    meridiem('a', true);
    meridiem('A', false);

    // ALIASES

    addUnitAlias('hour', 'h');

    // PRIORITY
    addUnitPriority('hour', 13);

    // PARSING

    function matchMeridiem(isStrict, locale) {
        return locale._meridiemParse;
    }

    addRegexToken('a', matchMeridiem);
    addRegexToken('A', matchMeridiem);
    addRegexToken('H', match1to2);
    addRegexToken('h', match1to2);
    addRegexToken('k', match1to2);
    addRegexToken('HH', match1to2, match2);
    addRegexToken('hh', match1to2, match2);
    addRegexToken('kk', match1to2, match2);

    addRegexToken('hmm', match3to4);
    addRegexToken('hmmss', match5to6);
    addRegexToken('Hmm', match3to4);
    addRegexToken('Hmmss', match5to6);

    addParseToken(['H', 'HH'], HOUR);
    addParseToken(['k', 'kk'], function (input, array, config) {
        var kInput = toInt(input);
        array[HOUR] = kInput === 24 ? 0 : kInput;
    });
    addParseToken(['a', 'A'], function (input, array, config) {
        config._isPm = config._locale.isPM(input);
        config._meridiem = input;
    });
    addParseToken(['h', 'hh'], function (input, array, config) {
        array[HOUR] = toInt(input);
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('hmm', function (input, array, config) {
        var pos = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos));
        array[MINUTE] = toInt(input.substr(pos));
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('hmmss', function (input, array, config) {
        var pos1 = input.length - 4,
            pos2 = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos1));
        array[MINUTE] = toInt(input.substr(pos1, 2));
        array[SECOND] = toInt(input.substr(pos2));
        getParsingFlags(config).bigHour = true;
    });
    addParseToken('Hmm', function (input, array, config) {
        var pos = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos));
        array[MINUTE] = toInt(input.substr(pos));
    });
    addParseToken('Hmmss', function (input, array, config) {
        var pos1 = input.length - 4,
            pos2 = input.length - 2;
        array[HOUR] = toInt(input.substr(0, pos1));
        array[MINUTE] = toInt(input.substr(pos1, 2));
        array[SECOND] = toInt(input.substr(pos2));
    });

    // LOCALES

    function localeIsPM(input) {
        // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
        // Using charAt should be more compatible.
        return (input + '').toLowerCase().charAt(0) === 'p';
    }

    var defaultLocaleMeridiemParse = /[ap]\.?m?\.?/i,
        // Setting the hour should keep the time, because the user explicitly
        // specified which hour they want. So trying to maintain the same hour (in
        // a new timezone) makes sense. Adding/subtracting hours does not follow
        // this rule.
        getSetHour = makeGetSet('Hours', true);

    function localeMeridiem(hours, minutes, isLower) {
        if (hours > 11) {
            return isLower ? 'pm' : 'PM';
        } else {
            return isLower ? 'am' : 'AM';
        }
    }

    var baseConfig = {
        calendar: defaultCalendar,
        longDateFormat: defaultLongDateFormat,
        invalidDate: defaultInvalidDate,
        ordinal: defaultOrdinal,
        dayOfMonthOrdinalParse: defaultDayOfMonthOrdinalParse,
        relativeTime: defaultRelativeTime,

        months: defaultLocaleMonths,
        monthsShort: defaultLocaleMonthsShort,

        week: defaultLocaleWeek,

        weekdays: defaultLocaleWeekdays,
        weekdaysMin: defaultLocaleWeekdaysMin,
        weekdaysShort: defaultLocaleWeekdaysShort,

        meridiemParse: defaultLocaleMeridiemParse,
    };

    // internal storage for locale config files
    var locales = {},
        localeFamilies = {},
        globalLocale;

    function commonPrefix(arr1, arr2) {
        var i,
            minl = Math.min(arr1.length, arr2.length);
        for (i = 0; i < minl; i += 1) {
            if (arr1[i] !== arr2[i]) {
                return i;
            }
        }
        return minl;
    }

    function normalizeLocale(key) {
        return key ? key.toLowerCase().replace('_', '-') : key;
    }

    // pick the locale from the array
    // try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
    // substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
    function chooseLocale(names) {
        var i = 0,
            j,
            next,
            locale,
            split;

        while (i < names.length) {
            split = normalizeLocale(names[i]).split('-');
            j = split.length;
            next = normalizeLocale(names[i + 1]);
            next = next ? next.split('-') : null;
            while (j > 0) {
                locale = loadLocale(split.slice(0, j).join('-'));
                if (locale) {
                    return locale;
                }
                if (
                    next &&
                    next.length >= j &&
                    commonPrefix(split, next) >= j - 1
                ) {
                    //the next array item is better than a shallower substring of this one
                    break;
                }
                j--;
            }
            i++;
        }
        return globalLocale;
    }

    function isLocaleNameSane(name) {
        // Prevent names that look like filesystem paths, i.e contain '/' or '\'
        return name.match('^[^/\\\\]*$') != null;
    }

    function loadLocale(name) {
        var oldLocale = null,
            aliasedRequire;
        // TODO: Find a better way to register and load all the locales in Node
        if (
            locales[name] === undefined &&
            typeof module !== 'undefined' &&
            module &&
            module.exports &&
            isLocaleNameSane(name)
        ) {
            try {
                oldLocale = globalLocale._abbr;
                aliasedRequire = require;
                aliasedRequire('./locale/' + name);
                getSetGlobalLocale(oldLocale);
            } catch (e) {
                // mark as not found to avoid repeating expensive file require call causing high CPU
                // when trying to find en-US, en_US, en-us for every format call
                locales[name] = null; // null means not found
            }
        }
        return locales[name];
    }

    // This function will load locale and then set the global locale.  If
    // no arguments are passed in, it will simply return the current global
    // locale key.
    function getSetGlobalLocale(key, values) {
        var data;
        if (key) {
            if (isUndefined(values)) {
                data = getLocale(key);
            } else {
                data = defineLocale(key, values);
            }

            if (data) {
                // moment.duration._locale = moment._locale = data;
                globalLocale = data;
            } else {
                if (typeof console !== 'undefined' && console.warn) {
                    //warn user if arguments are passed but the locale could not be set
                    console.warn(
                        'Locale ' + key + ' not found. Did you forget to load it?'
                    );
                }
            }
        }

        return globalLocale._abbr;
    }

    function defineLocale(name, config) {
        if (config !== null) {
            var locale,
                parentConfig = baseConfig;
            config.abbr = name;
            if (locales[name] != null) {
                deprecateSimple(
                    'defineLocaleOverride',
                    'use moment.updateLocale(localeName, config) to change ' +
                        'an existing locale. moment.defineLocale(localeName, ' +
                        'config) should only be used for creating a new locale ' +
                        'See http://momentjs.com/guides/#/warnings/define-locale/ for more info.'
                );
                parentConfig = locales[name]._config;
            } else if (config.parentLocale != null) {
                if (locales[config.parentLocale] != null) {
                    parentConfig = locales[config.parentLocale]._config;
                } else {
                    locale = loadLocale(config.parentLocale);
                    if (locale != null) {
                        parentConfig = locale._config;
                    } else {
                        if (!localeFamilies[config.parentLocale]) {
                            localeFamilies[config.parentLocale] = [];
                        }
                        localeFamilies[config.parentLocale].push({
                            name: name,
                            config: config,
                        });
                        return null;
                    }
                }
            }
            locales[name] = new Locale(mergeConfigs(parentConfig, config));

            if (localeFamilies[name]) {
                localeFamilies[name].forEach(function (x) {
                    defineLocale(x.name, x.config);
                });
            }

            // backwards compat for now: also set the locale
            // make sure we set the locale AFTER all child locales have been
            // created, so we won't end up with the child locale set.
            getSetGlobalLocale(name);

            return locales[name];
        } else {
            // useful for testing
            delete locales[name];
            return null;
        }
    }

    function updateLocale(name, config) {
        if (config != null) {
            var locale,
                tmpLocale,
                parentConfig = baseConfig;

            if (locales[name] != null && locales[name].parentLocale != null) {
                // Update existing child locale in-place to avoid memory-leaks
                locales[name].set(mergeConfigs(locales[name]._config, config));
            } else {
                // MERGE
                tmpLocale = loadLocale(name);
                if (tmpLocale != null) {
                    parentConfig = tmpLocale._config;
                }
                config = mergeConfigs(parentConfig, config);
                if (tmpLocale == null) {
                    // updateLocale is called for creating a new locale
                    // Set abbr so it will have a name (getters return
                    // undefined otherwise).
                    config.abbr = name;
                }
                locale = new Locale(config);
                locale.parentLocale = locales[name];
                locales[name] = locale;
            }

            // backwards compat for now: also set the locale
            getSetGlobalLocale(name);
        } else {
            // pass null for config to unupdate, useful for tests
            if (locales[name] != null) {
                if (locales[name].parentLocale != null) {
                    locales[name] = locales[name].parentLocale;
                    if (name === getSetGlobalLocale()) {
                        getSetGlobalLocale(name);
                    }
                } else if (locales[name] != null) {
                    delete locales[name];
                }
            }
        }
        return locales[name];
    }

    // returns locale data
    function getLocale(key) {
        var locale;

        if (key && key._locale && key._locale._abbr) {
            key = key._locale._abbr;
        }

        if (!key) {
            return globalLocale;
        }

        if (!isArray(key)) {
            //short-circuit everything else
            locale = loadLocale(key);
            if (locale) {
                return locale;
            }
            key = [key];
        }

        return chooseLocale(key);
    }

    function listLocales() {
        return keys(locales);
    }

    function checkOverflow(m) {
        var overflow,
            a = m._a;

        if (a && getParsingFlags(m).overflow === -2) {
            overflow =
                a[MONTH] < 0 || a[MONTH] > 11
                    ? MONTH
                    : a[DATE] < 1 || a[DATE] > daysInMonth(a[YEAR], a[MONTH])
                    ? DATE
                    : a[HOUR] < 0 ||
                      a[HOUR] > 24 ||
                      (a[HOUR] === 24 &&
                          (a[MINUTE] !== 0 ||
                              a[SECOND] !== 0 ||
                              a[MILLISECOND] !== 0))
                    ? HOUR
                    : a[MINUTE] < 0 || a[MINUTE] > 59
                    ? MINUTE
                    : a[SECOND] < 0 || a[SECOND] > 59
                    ? SECOND
                    : a[MILLISECOND] < 0 || a[MILLISECOND] > 999
                    ? MILLISECOND
                    : -1;

            if (
                getParsingFlags(m)._overflowDayOfYear &&
                (overflow < YEAR || overflow > DATE)
            ) {
                overflow = DATE;
            }
            if (getParsingFlags(m)._overflowWeeks && overflow === -1) {
                overflow = WEEK;
            }
            if (getParsingFlags(m)._overflowWeekday && overflow === -1) {
                overflow = WEEKDAY;
            }

            getParsingFlags(m).overflow = overflow;
        }

        return m;
    }

    // iso 8601 regex
    // 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
    var extendedIsoRegex =
            /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([+-]\d\d(?::?\d\d)?|\s*Z)?)?$/,
        basicIsoRegex =
            /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d|))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([+-]\d\d(?::?\d\d)?|\s*Z)?)?$/,
        tzRegex = /Z|[+-]\d\d(?::?\d\d)?/,
        isoDates = [
            ['YYYYYY-MM-DD', /[+-]\d{6}-\d\d-\d\d/],
            ['YYYY-MM-DD', /\d{4}-\d\d-\d\d/],
            ['GGGG-[W]WW-E', /\d{4}-W\d\d-\d/],
            ['GGGG-[W]WW', /\d{4}-W\d\d/, false],
            ['YYYY-DDD', /\d{4}-\d{3}/],
            ['YYYY-MM', /\d{4}-\d\d/, false],
            ['YYYYYYMMDD', /[+-]\d{10}/],
            ['YYYYMMDD', /\d{8}/],
            ['GGGG[W]WWE', /\d{4}W\d{3}/],
            ['GGGG[W]WW', /\d{4}W\d{2}/, false],
            ['YYYYDDD', /\d{7}/],
            ['YYYYMM', /\d{6}/, false],
            ['YYYY', /\d{4}/, false],
        ],
        // iso time formats and regexes
        isoTimes = [
            ['HH:mm:ss.SSSS', /\d\d:\d\d:\d\d\.\d+/],
            ['HH:mm:ss,SSSS', /\d\d:\d\d:\d\d,\d+/],
            ['HH:mm:ss', /\d\d:\d\d:\d\d/],
            ['HH:mm', /\d\d:\d\d/],
            ['HHmmss.SSSS', /\d\d\d\d\d\d\.\d+/],
            ['HHmmss,SSSS', /\d\d\d\d\d\d,\d+/],
            ['HHmmss', /\d\d\d\d\d\d/],
            ['HHmm', /\d\d\d\d/],
            ['HH', /\d\d/],
        ],
        aspNetJsonRegex = /^\/?Date\((-?\d+)/i,
        // RFC 2822 regex: For details see https://tools.ietf.org/html/rfc2822#section-3.3
        rfc2822 =
            /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|([+-]\d{4}))$/,
        obsOffsets = {
            UT: 0,
            GMT: 0,
            EDT: -4 * 60,
            EST: -5 * 60,
            CDT: -5 * 60,
            CST: -6 * 60,
            MDT: -6 * 60,
            MST: -7 * 60,
            PDT: -7 * 60,
            PST: -8 * 60,
        };

    // date from iso format
    function configFromISO(config) {
        var i,
            l,
            string = config._i,
            match = extendedIsoRegex.exec(string) || basicIsoRegex.exec(string),
            allowTime,
            dateFormat,
            timeFormat,
            tzFormat,
            isoDatesLen = isoDates.length,
            isoTimesLen = isoTimes.length;

        if (match) {
            getParsingFlags(config).iso = true;
            for (i = 0, l = isoDatesLen; i < l; i++) {
                if (isoDates[i][1].exec(match[1])) {
                    dateFormat = isoDates[i][0];
                    allowTime = isoDates[i][2] !== false;
                    break;
                }
            }
            if (dateFormat == null) {
                config._isValid = false;
                return;
            }
            if (match[3]) {
                for (i = 0, l = isoTimesLen; i < l; i++) {
                    if (isoTimes[i][1].exec(match[3])) {
                        // match[2] should be 'T' or space
                        timeFormat = (match[2] || ' ') + isoTimes[i][0];
                        break;
                    }
                }
                if (timeFormat == null) {
                    config._isValid = false;
                    return;
                }
            }
            if (!allowTime && timeFormat != null) {
                config._isValid = false;
                return;
            }
            if (match[4]) {
                if (tzRegex.exec(match[4])) {
                    tzFormat = 'Z';
                } else {
                    config._isValid = false;
                    return;
                }
            }
            config._f = dateFormat + (timeFormat || '') + (tzFormat || '');
            configFromStringAndFormat(config);
        } else {
            config._isValid = false;
        }
    }

    function extractFromRFC2822Strings(
        yearStr,
        monthStr,
        dayStr,
        hourStr,
        minuteStr,
        secondStr
    ) {
        var result = [
            untruncateYear(yearStr),
            defaultLocaleMonthsShort.indexOf(monthStr),
            parseInt(dayStr, 10),
            parseInt(hourStr, 10),
            parseInt(minuteStr, 10),
        ];

        if (secondStr) {
            result.push(parseInt(secondStr, 10));
        }

        return result;
    }

    function untruncateYear(yearStr) {
        var year = parseInt(yearStr, 10);
        if (year <= 49) {
            return 2000 + year;
        } else if (year <= 999) {
            return 1900 + year;
        }
        return year;
    }

    function preprocessRFC2822(s) {
        // Remove comments and folding whitespace and replace multiple-spaces with a single space
        return s
            .replace(/\([^()]*\)|[\n\t]/g, ' ')
            .replace(/(\s\s+)/g, ' ')
            .replace(/^\s\s*/, '')
            .replace(/\s\s*$/, '');
    }

    function checkWeekday(weekdayStr, parsedInput, config) {
        if (weekdayStr) {
            // TODO: Replace the vanilla JS Date object with an independent day-of-week check.
            var weekdayProvided = defaultLocaleWeekdaysShort.indexOf(weekdayStr),
                weekdayActual = new Date(
                    parsedInput[0],
                    parsedInput[1],
                    parsedInput[2]
                ).getDay();
            if (weekdayProvided !== weekdayActual) {
                getParsingFlags(config).weekdayMismatch = true;
                config._isValid = false;
                return false;
            }
        }
        return true;
    }

    function calculateOffset(obsOffset, militaryOffset, numOffset) {
        if (obsOffset) {
            return obsOffsets[obsOffset];
        } else if (militaryOffset) {
            // the only allowed military tz is Z
            return 0;
        } else {
            var hm = parseInt(numOffset, 10),
                m = hm % 100,
                h = (hm - m) / 100;
            return h * 60 + m;
        }
    }

    // date and time from ref 2822 format
    function configFromRFC2822(config) {
        var match = rfc2822.exec(preprocessRFC2822(config._i)),
            parsedArray;
        if (match) {
            parsedArray = extractFromRFC2822Strings(
                match[4],
                match[3],
                match[2],
                match[5],
                match[6],
                match[7]
            );
            if (!checkWeekday(match[1], parsedArray, config)) {
                return;
            }

            config._a = parsedArray;
            config._tzm = calculateOffset(match[8], match[9], match[10]);

            config._d = createUTCDate.apply(null, config._a);
            config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);

            getParsingFlags(config).rfc2822 = true;
        } else {
            config._isValid = false;
        }
    }

    // date from 1) ASP.NET, 2) ISO, 3) RFC 2822 formats, or 4) optional fallback if parsing isn't strict
    function configFromString(config) {
        var matched = aspNetJsonRegex.exec(config._i);
        if (matched !== null) {
            config._d = new Date(+matched[1]);
            return;
        }

        configFromISO(config);
        if (config._isValid === false) {
            delete config._isValid;
        } else {
            return;
        }

        configFromRFC2822(config);
        if (config._isValid === false) {
            delete config._isValid;
        } else {
            return;
        }

        if (config._strict) {
            config._isValid = false;
        } else {
            // Final attempt, use Input Fallback
            hooks.createFromInputFallback(config);
        }
    }

    hooks.createFromInputFallback = deprecate(
        'value provided is not in a recognized RFC2822 or ISO format. moment construction falls back to js Date(), ' +
            'which is not reliable across all browsers and versions. Non RFC2822/ISO date formats are ' +
            'discouraged. Please refer to http://momentjs.com/guides/#/warnings/js-date/ for more info.',
        function (config) {
            config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
        }
    );

    // Pick the first defined of two or three arguments.
    function defaults(a, b, c) {
        if (a != null) {
            return a;
        }
        if (b != null) {
            return b;
        }
        return c;
    }

    function currentDateArray(config) {
        // hooks is actually the exported moment object
        var nowValue = new Date(hooks.now());
        if (config._useUTC) {
            return [
                nowValue.getUTCFullYear(),
                nowValue.getUTCMonth(),
                nowValue.getUTCDate(),
            ];
        }
        return [nowValue.getFullYear(), nowValue.getMonth(), nowValue.getDate()];
    }

    // convert an array to a date.
    // the array should mirror the parameters below
    // note: all values past the year are optional and will default to the lowest possible value.
    // [year, month, day , hour, minute, second, millisecond]
    function configFromArray(config) {
        var i,
            date,
            input = [],
            currentDate,
            expectedWeekday,
            yearToUse;

        if (config._d) {
            return;
        }

        currentDate = currentDateArray(config);

        //compute day of the year from weeks and weekdays
        if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
            dayOfYearFromWeekInfo(config);
        }

        //if the day of the year is set, figure out what it is
        if (config._dayOfYear != null) {
            yearToUse = defaults(config._a[YEAR], currentDate[YEAR]);

            if (
                config._dayOfYear > daysInYear(yearToUse) ||
                config._dayOfYear === 0
            ) {
                getParsingFlags(config)._overflowDayOfYear = true;
            }

            date = createUTCDate(yearToUse, 0, config._dayOfYear);
            config._a[MONTH] = date.getUTCMonth();
            config._a[DATE] = date.getUTCDate();
        }

        // Default to current date.
        // * if no year, month, day of month are given, default to today
        // * if day of month is given, default month and year
        // * if month is given, default only year
        // * if year is given, don't default anything
        for (i = 0; i < 3 && config._a[i] == null; ++i) {
            config._a[i] = input[i] = currentDate[i];
        }

        // Zero out whatever was not defaulted, including time
        for (; i < 7; i++) {
            config._a[i] = input[i] =
                config._a[i] == null ? (i === 2 ? 1 : 0) : config._a[i];
        }

        // Check for 24:00:00.000
        if (
            config._a[HOUR] === 24 &&
            config._a[MINUTE] === 0 &&
            config._a[SECOND] === 0 &&
            config._a[MILLISECOND] === 0
        ) {
            config._nextDay = true;
            config._a[HOUR] = 0;
        }

        config._d = (config._useUTC ? createUTCDate : createDate).apply(
            null,
            input
        );
        expectedWeekday = config._useUTC
            ? config._d.getUTCDay()
            : config._d.getDay();

        // Apply timezone offset from input. The actual utcOffset can be changed
        // with parseZone.
        if (config._tzm != null) {
            config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
        }

        if (config._nextDay) {
            config._a[HOUR] = 24;
        }

        // check for mismatching day of week
        if (
            config._w &&
            typeof config._w.d !== 'undefined' &&
            config._w.d !== expectedWeekday
        ) {
            getParsingFlags(config).weekdayMismatch = true;
        }
    }

    function dayOfYearFromWeekInfo(config) {
        var w, weekYear, week, weekday, dow, doy, temp, weekdayOverflow, curWeek;

        w = config._w;
        if (w.GG != null || w.W != null || w.E != null) {
            dow = 1;
            doy = 4;

            // TODO: We need to take the current isoWeekYear, but that depends on
            // how we interpret now (local, utc, fixed offset). So create
            // a now version of current config (take local/utc/offset flags, and
            // create now).
            weekYear = defaults(
                w.GG,
                config._a[YEAR],
                weekOfYear(createLocal(), 1, 4).year
            );
            week = defaults(w.W, 1);
            weekday = defaults(w.E, 1);
            if (weekday < 1 || weekday > 7) {
                weekdayOverflow = true;
            }
        } else {
            dow = config._locale._week.dow;
            doy = config._locale._week.doy;

            curWeek = weekOfYear(createLocal(), dow, doy);

            weekYear = defaults(w.gg, config._a[YEAR], curWeek.year);

            // Default to current week.
            week = defaults(w.w, curWeek.week);

            if (w.d != null) {
                // weekday -- low day numbers are considered next week
                weekday = w.d;
                if (weekday < 0 || weekday > 6) {
                    weekdayOverflow = true;
                }
            } else if (w.e != null) {
                // local weekday -- counting starts from beginning of week
                weekday = w.e + dow;
                if (w.e < 0 || w.e > 6) {
                    weekdayOverflow = true;
                }
            } else {
                // default to beginning of week
                weekday = dow;
            }
        }
        if (week < 1 || week > weeksInYear(weekYear, dow, doy)) {
            getParsingFlags(config)._overflowWeeks = true;
        } else if (weekdayOverflow != null) {
            getParsingFlags(config)._overflowWeekday = true;
        } else {
            temp = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy);
            config._a[YEAR] = temp.year;
            config._dayOfYear = temp.dayOfYear;
        }
    }

    // constant that refers to the ISO standard
    hooks.ISO_8601 = function () {};

    // constant that refers to the RFC 2822 form
    hooks.RFC_2822 = function () {};

    // date from string and format string
    function configFromStringAndFormat(config) {
        // TODO: Move this to another part of the creation flow to prevent circular deps
        if (config._f === hooks.ISO_8601) {
            configFromISO(config);
            return;
        }
        if (config._f === hooks.RFC_2822) {
            configFromRFC2822(config);
            return;
        }
        config._a = [];
        getParsingFlags(config).empty = true;

        // This array is used to make a Date, either with `new Date` or `Date.UTC`
        var string = '' + config._i,
            i,
            parsedInput,
            tokens,
            token,
            skipped,
            stringLength = string.length,
            totalParsedInputLength = 0,
            era,
            tokenLen;

        tokens =
            expandFormat(config._f, config._locale).match(formattingTokens) || [];
        tokenLen = tokens.length;
        for (i = 0; i < tokenLen; i++) {
            token = tokens[i];
            parsedInput = (string.match(getParseRegexForToken(token, config)) ||
                [])[0];
            if (parsedInput) {
                skipped = string.substr(0, string.indexOf(parsedInput));
                if (skipped.length > 0) {
                    getParsingFlags(config).unusedInput.push(skipped);
                }
                string = string.slice(
                    string.indexOf(parsedInput) + parsedInput.length
                );
                totalParsedInputLength += parsedInput.length;
            }
            // don't parse if it's not a known token
            if (formatTokenFunctions[token]) {
                if (parsedInput) {
                    getParsingFlags(config).empty = false;
                } else {
                    getParsingFlags(config).unusedTokens.push(token);
                }
                addTimeToArrayFromToken(token, parsedInput, config);
            } else if (config._strict && !parsedInput) {
                getParsingFlags(config).unusedTokens.push(token);
            }
        }

        // add remaining unparsed input length to the string
        getParsingFlags(config).charsLeftOver =
            stringLength - totalParsedInputLength;
        if (string.length > 0) {
            getParsingFlags(config).unusedInput.push(string);
        }

        // clear _12h flag if hour is <= 12
        if (
            config._a[HOUR] <= 12 &&
            getParsingFlags(config).bigHour === true &&
            config._a[HOUR] > 0
        ) {
            getParsingFlags(config).bigHour = undefined;
        }

        getParsingFlags(config).parsedDateParts = config._a.slice(0);
        getParsingFlags(config).meridiem = config._meridiem;
        // handle meridiem
        config._a[HOUR] = meridiemFixWrap(
            config._locale,
            config._a[HOUR],
            config._meridiem
        );

        // handle era
        era = getParsingFlags(config).era;
        if (era !== null) {
            config._a[YEAR] = config._locale.erasConvertYear(era, config._a[YEAR]);
        }

        configFromArray(config);
        checkOverflow(config);
    }

    function meridiemFixWrap(locale, hour, meridiem) {
        var isPm;

        if (meridiem == null) {
            // nothing to do
            return hour;
        }
        if (locale.meridiemHour != null) {
            return locale.meridiemHour(hour, meridiem);
        } else if (locale.isPM != null) {
            // Fallback
            isPm = locale.isPM(meridiem);
            if (isPm && hour < 12) {
                hour += 12;
            }
            if (!isPm && hour === 12) {
                hour = 0;
            }
            return hour;
        } else {
            // this is not supposed to happen
            return hour;
        }
    }

    // date from string and array of format strings
    function configFromStringAndArray(config) {
        var tempConfig,
            bestMoment,
            scoreToBeat,
            i,
            currentScore,
            validFormatFound,
            bestFormatIsValid = false,
            configfLen = config._f.length;

        if (configfLen === 0) {
            getParsingFlags(config).invalidFormat = true;
            config._d = new Date(NaN);
            return;
        }

        for (i = 0; i < configfLen; i++) {
            currentScore = 0;
            validFormatFound = false;
            tempConfig = copyConfig({}, config);
            if (config._useUTC != null) {
                tempConfig._useUTC = config._useUTC;
            }
            tempConfig._f = config._f[i];
            configFromStringAndFormat(tempConfig);

            if (isValid(tempConfig)) {
                validFormatFound = true;
            }

            // if there is any input that was not parsed add a penalty for that format
            currentScore += getParsingFlags(tempConfig).charsLeftOver;

            //or tokens
            currentScore += getParsingFlags(tempConfig).unusedTokens.length * 10;

            getParsingFlags(tempConfig).score = currentScore;

            if (!bestFormatIsValid) {
                if (
                    scoreToBeat == null ||
                    currentScore < scoreToBeat ||
                    validFormatFound
                ) {
                    scoreToBeat = currentScore;
                    bestMoment = tempConfig;
                    if (validFormatFound) {
                        bestFormatIsValid = true;
                    }
                }
            } else {
                if (currentScore < scoreToBeat) {
                    scoreToBeat = currentScore;
                    bestMoment = tempConfig;
                }
            }
        }

        extend(config, bestMoment || tempConfig);
    }

    function configFromObject(config) {
        if (config._d) {
            return;
        }

        var i = normalizeObjectUnits(config._i),
            dayOrDate = i.day === undefined ? i.date : i.day;
        config._a = map(
            [i.year, i.month, dayOrDate, i.hour, i.minute, i.second, i.millisecond],
            function (obj) {
                return obj && parseInt(obj, 10);
            }
        );

        configFromArray(config);
    }

    function createFromConfig(config) {
        var res = new Moment(checkOverflow(prepareConfig(config)));
        if (res._nextDay) {
            // Adding is smart enough around DST
            res.add(1, 'd');
            res._nextDay = undefined;
        }

        return res;
    }

    function prepareConfig(config) {
        var input = config._i,
            format = config._f;

        config._locale = config._locale || getLocale(config._l);

        if (input === null || (format === undefined && input === '')) {
            return createInvalid({ nullInput: true });
        }

        if (typeof input === 'string') {
            config._i = input = config._locale.preparse(input);
        }

        if (isMoment(input)) {
            return new Moment(checkOverflow(input));
        } else if (isDate(input)) {
            config._d = input;
        } else if (isArray(format)) {
            configFromStringAndArray(config);
        } else if (format) {
            configFromStringAndFormat(config);
        } else {
            configFromInput(config);
        }

        if (!isValid(config)) {
            config._d = null;
        }

        return config;
    }

    function configFromInput(config) {
        var input = config._i;
        if (isUndefined(input)) {
            config._d = new Date(hooks.now());
        } else if (isDate(input)) {
            config._d = new Date(input.valueOf());
        } else if (typeof input === 'string') {
            configFromString(config);
        } else if (isArray(input)) {
            config._a = map(input.slice(0), function (obj) {
                return parseInt(obj, 10);
            });
            configFromArray(config);
        } else if (isObject(input)) {
            configFromObject(config);
        } else if (isNumber(input)) {
            // from milliseconds
            config._d = new Date(input);
        } else {
            hooks.createFromInputFallback(config);
        }
    }

    function createLocalOrUTC(input, format, locale, strict, isUTC) {
        var c = {};

        if (format === true || format === false) {
            strict = format;
            format = undefined;
        }

        if (locale === true || locale === false) {
            strict = locale;
            locale = undefined;
        }

        if (
            (isObject(input) && isObjectEmpty(input)) ||
            (isArray(input) && input.length === 0)
        ) {
            input = undefined;
        }
        // object construction must be done this way.
        // https://github.com/moment/moment/issues/1423
        c._isAMomentObject = true;
        c._useUTC = c._isUTC = isUTC;
        c._l = locale;
        c._i = input;
        c._f = format;
        c._strict = strict;

        return createFromConfig(c);
    }

    function createLocal(input, format, locale, strict) {
        return createLocalOrUTC(input, format, locale, strict, false);
    }

    var prototypeMin = deprecate(
            'moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/',
            function () {
                var other = createLocal.apply(null, arguments);
                if (this.isValid() && other.isValid()) {
                    return other < this ? this : other;
                } else {
                    return createInvalid();
                }
            }
        ),
        prototypeMax = deprecate(
            'moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/',
            function () {
                var other = createLocal.apply(null, arguments);
                if (this.isValid() && other.isValid()) {
                    return other > this ? this : other;
                } else {
                    return createInvalid();
                }
            }
        );

    // Pick a moment m from moments so that m[fn](other) is true for all
    // other. This relies on the function fn to be transitive.
    //
    // moments should either be an array of moment objects or an array, whose
    // first element is an array of moment objects.
    function pickBy(fn, moments) {
        var res, i;
        if (moments.length === 1 && isArray(moments[0])) {
            moments = moments[0];
        }
        if (!moments.length) {
            return createLocal();
        }
        res = moments[0];
        for (i = 1; i < moments.length; ++i) {
            if (!moments[i].isValid() || moments[i][fn](res)) {
                res = moments[i];
            }
        }
        return res;
    }

    // TODO: Use [].sort instead?
    function min() {
        var args = [].slice.call(arguments, 0);

        return pickBy('isBefore', args);
    }

    function max() {
        var args = [].slice.call(arguments, 0);

        return pickBy('isAfter', args);
    }

    var now = function () {
        return Date.now ? Date.now() : +new Date();
    };

    var ordering = [
        'year',
        'quarter',
        'month',
        'week',
        'day',
        'hour',
        'minute',
        'second',
        'millisecond',
    ];

    function isDurationValid(m) {
        var key,
            unitHasDecimal = false,
            i,
            orderLen = ordering.length;
        for (key in m) {
            if (
                hasOwnProp(m, key) &&
                !(
                    indexOf.call(ordering, key) !== -1 &&
                    (m[key] == null || !isNaN(m[key]))
                )
            ) {
                return false;
            }
        }

        for (i = 0; i < orderLen; ++i) {
            if (m[ordering[i]]) {
                if (unitHasDecimal) {
                    return false; // only allow non-integers for smallest unit
                }
                if (parseFloat(m[ordering[i]]) !== toInt(m[ordering[i]])) {
                    unitHasDecimal = true;
                }
            }
        }

        return true;
    }

    function isValid$1() {
        return this._isValid;
    }

    function createInvalid$1() {
        return createDuration(NaN);
    }

    function Duration(duration) {
        var normalizedInput = normalizeObjectUnits(duration),
            years = normalizedInput.year || 0,
            quarters = normalizedInput.quarter || 0,
            months = normalizedInput.month || 0,
            weeks = normalizedInput.week || normalizedInput.isoWeek || 0,
            days = normalizedInput.day || 0,
            hours = normalizedInput.hour || 0,
            minutes = normalizedInput.minute || 0,
            seconds = normalizedInput.second || 0,
            milliseconds = normalizedInput.millisecond || 0;

        this._isValid = isDurationValid(normalizedInput);

        // representation for dateAddRemove
        this._milliseconds =
            +milliseconds +
            seconds * 1e3 + // 1000
            minutes * 6e4 + // 1000 * 60
            hours * 1000 * 60 * 60; //using 1000 * 60 * 60 instead of 36e5 to avoid floating point rounding errors https://github.com/moment/moment/issues/2978
        // Because of dateAddRemove treats 24 hours as different from a
        // day when working around DST, we need to store them separately
        this._days = +days + weeks * 7;
        // It is impossible to translate months into days without knowing
        // which months you are are talking about, so we have to store
        // it separately.
        this._months = +months + quarters * 3 + years * 12;

        this._data = {};

        this._locale = getLocale();

        this._bubble();
    }

    function isDuration(obj) {
        return obj instanceof Duration;
    }

    function absRound(number) {
        if (number < 0) {
            return Math.round(-1 * number) * -1;
        } else {
            return Math.round(number);
        }
    }

    // compare two arrays, return the number of differences
    function compareArrays(array1, array2, dontConvert) {
        var len = Math.min(array1.length, array2.length),
            lengthDiff = Math.abs(array1.length - array2.length),
            diffs = 0,
            i;
        for (i = 0; i < len; i++) {
            if (
                (dontConvert && array1[i] !== array2[i]) ||
                (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))
            ) {
                diffs++;
            }
        }
        return diffs + lengthDiff;
    }

    // FORMATTING

    function offset(token, separator) {
        addFormatToken(token, 0, 0, function () {
            var offset = this.utcOffset(),
                sign = '+';
            if (offset < 0) {
                offset = -offset;
                sign = '-';
            }
            return (
                sign +
                zeroFill(~~(offset / 60), 2) +
                separator +
                zeroFill(~~offset % 60, 2)
            );
        });
    }

    offset('Z', ':');
    offset('ZZ', '');

    // PARSING

    addRegexToken('Z', matchShortOffset);
    addRegexToken('ZZ', matchShortOffset);
    addParseToken(['Z', 'ZZ'], function (input, array, config) {
        config._useUTC = true;
        config._tzm = offsetFromString(matchShortOffset, input);
    });

    // HELPERS

    // timezone chunker
    // '+10:00' > ['10',  '00']
    // '-1530'  > ['-15', '30']
    var chunkOffset = /([\+\-]|\d\d)/gi;

    function offsetFromString(matcher, string) {
        var matches = (string || '').match(matcher),
            chunk,
            parts,
            minutes;

        if (matches === null) {
            return null;
        }

        chunk = matches[matches.length - 1] || [];
        parts = (chunk + '').match(chunkOffset) || ['-', 0, 0];
        minutes = +(parts[1] * 60) + toInt(parts[2]);

        return minutes === 0 ? 0 : parts[0] === '+' ? minutes : -minutes;
    }

    // Return a moment from input, that is local/utc/zone equivalent to model.
    function cloneWithOffset(input, model) {
        var res, diff;
        if (model._isUTC) {
            res = model.clone();
            diff =
                (isMoment(input) || isDate(input)
                    ? input.valueOf()
                    : createLocal(input).valueOf()) - res.valueOf();
            // Use low-level api, because this fn is low-level api.
            res._d.setTime(res._d.valueOf() + diff);
            hooks.updateOffset(res, false);
            return res;
        } else {
            return createLocal(input).local();
        }
    }

    function getDateOffset(m) {
        // On Firefox.24 Date#getTimezoneOffset returns a floating point.
        // https://github.com/moment/moment/pull/1871
        return -Math.round(m._d.getTimezoneOffset());
    }

    // HOOKS

    // This function will be called whenever a moment is mutated.
    // It is intended to keep the offset in sync with the timezone.
    hooks.updateOffset = function () {};

    // MOMENTS

    // keepLocalTime = true means only change the timezone, without
    // affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->
    // 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
    // +0200, so we adjust the time as needed, to be valid.
    //
    // Keeping the time actually adds/subtracts (one hour)
    // from the actual represented time. That is why we call updateOffset
    // a second time. In case it wants us to change the offset again
    // _changeInProgress == true case, then we have to adjust, because
    // there is no such time in the given timezone.
    function getSetOffset(input, keepLocalTime, keepMinutes) {
        var offset = this._offset || 0,
            localAdjust;
        if (!this.isValid()) {
            return input != null ? this : NaN;
        }
        if (input != null) {
            if (typeof input === 'string') {
                input = offsetFromString(matchShortOffset, input);
                if (input === null) {
                    return this;
                }
            } else if (Math.abs(input) < 16 && !keepMinutes) {
                input = input * 60;
            }
            if (!this._isUTC && keepLocalTime) {
                localAdjust = getDateOffset(this);
            }
            this._offset = input;
            this._isUTC = true;
            if (localAdjust != null) {
                this.add(localAdjust, 'm');
            }
            if (offset !== input) {
                if (!keepLocalTime || this._changeInProgress) {
                    addSubtract(
                        this,
                        createDuration(input - offset, 'm'),
                        1,
                        false
                    );
                } else if (!this._changeInProgress) {
                    this._changeInProgress = true;
                    hooks.updateOffset(this, true);
                    this._changeInProgress = null;
                }
            }
            return this;
        } else {
            return this._isUTC ? offset : getDateOffset(this);
        }
    }

    function getSetZone(input, keepLocalTime) {
        if (input != null) {
            if (typeof input !== 'string') {
                input = -input;
            }

            this.utcOffset(input, keepLocalTime);

            return this;
        } else {
            return -this.utcOffset();
        }
    }

    function setOffsetToUTC(keepLocalTime) {
        return this.utcOffset(0, keepLocalTime);
    }

    function setOffsetToLocal(keepLocalTime) {
        if (this._isUTC) {
            this.utcOffset(0, keepLocalTime);
            this._isUTC = false;

            if (keepLocalTime) {
                this.subtract(getDateOffset(this), 'm');
            }
        }
        return this;
    }

    function setOffsetToParsedOffset() {
        if (this._tzm != null) {
            this.utcOffset(this._tzm, false, true);
        } else if (typeof this._i === 'string') {
            var tZone = offsetFromString(matchOffset, this._i);
            if (tZone != null) {
                this.utcOffset(tZone);
            } else {
                this.utcOffset(0, true);
            }
        }
        return this;
    }

    function hasAlignedHourOffset(input) {
        if (!this.isValid()) {
            return false;
        }
        input = input ? createLocal(input).utcOffset() : 0;

        return (this.utcOffset() - input) % 60 === 0;
    }

    function isDaylightSavingTime() {
        return (
            this.utcOffset() > this.clone().month(0).utcOffset() ||
            this.utcOffset() > this.clone().month(5).utcOffset()
        );
    }

    function isDaylightSavingTimeShifted() {
        if (!isUndefined(this._isDSTShifted)) {
            return this._isDSTShifted;
        }

        var c = {},
            other;

        copyConfig(c, this);
        c = prepareConfig(c);

        if (c._a) {
            other = c._isUTC ? createUTC(c._a) : createLocal(c._a);
            this._isDSTShifted =
                this.isValid() && compareArrays(c._a, other.toArray()) > 0;
        } else {
            this._isDSTShifted = false;
        }

        return this._isDSTShifted;
    }

    function isLocal() {
        return this.isValid() ? !this._isUTC : false;
    }

    function isUtcOffset() {
        return this.isValid() ? this._isUTC : false;
    }

    function isUtc() {
        return this.isValid() ? this._isUTC && this._offset === 0 : false;
    }

    // ASP.NET json date format regex
    var aspNetRegex = /^(-|\+)?(?:(\d*)[. ])?(\d+):(\d+)(?::(\d+)(\.\d*)?)?$/,
        // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
        // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
        // and further modified to allow for strings containing both week and day
        isoRegex =
            /^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/;

    function createDuration(input, key) {
        var duration = input,
            // matching against regexp is expensive, do it on demand
            match = null,
            sign,
            ret,
            diffRes;

        if (isDuration(input)) {
            duration = {
                ms: input._milliseconds,
                d: input._days,
                M: input._months,
            };
        } else if (isNumber(input) || !isNaN(+input)) {
            duration = {};
            if (key) {
                duration[key] = +input;
            } else {
                duration.milliseconds = +input;
            }
        } else if ((match = aspNetRegex.exec(input))) {
            sign = match[1] === '-' ? -1 : 1;
            duration = {
                y: 0,
                d: toInt(match[DATE]) * sign,
                h: toInt(match[HOUR]) * sign,
                m: toInt(match[MINUTE]) * sign,
                s: toInt(match[SECOND]) * sign,
                ms: toInt(absRound(match[MILLISECOND] * 1000)) * sign, // the millisecond decimal point is included in the match
            };
        } else if ((match = isoRegex.exec(input))) {
            sign = match[1] === '-' ? -1 : 1;
            duration = {
                y: parseIso(match[2], sign),
                M: parseIso(match[3], sign),
                w: parseIso(match[4], sign),
                d: parseIso(match[5], sign),
                h: parseIso(match[6], sign),
                m: parseIso(match[7], sign),
                s: parseIso(match[8], sign),
            };
        } else if (duration == null) {
            // checks for null or undefined
            duration = {};
        } else if (
            typeof duration === 'object' &&
            ('from' in duration || 'to' in duration)
        ) {
            diffRes = momentsDifference(
                createLocal(duration.from),
                createLocal(duration.to)
            );

            duration = {};
            duration.ms = diffRes.milliseconds;
            duration.M = diffRes.months;
        }

        ret = new Duration(duration);

        if (isDuration(input) && hasOwnProp(input, '_locale')) {
            ret._locale = input._locale;
        }

        if (isDuration(input) && hasOwnProp(input, '_isValid')) {
            ret._isValid = input._isValid;
        }

        return ret;
    }

    createDuration.fn = Duration.prototype;
    createDuration.invalid = createInvalid$1;

    function parseIso(inp, sign) {
        // We'd normally use ~~inp for this, but unfortunately it also
        // converts floats to ints.
        // inp may be undefined, so careful calling replace on it.
        var res = inp && parseFloat(inp.replace(',', '.'));
        // apply sign while we're at it
        return (isNaN(res) ? 0 : res) * sign;
    }

    function positiveMomentsDifference(base, other) {
        var res = {};

        res.months =
            other.month() - base.month() + (other.year() - base.year()) * 12;
        if (base.clone().add(res.months, 'M').isAfter(other)) {
            --res.months;
        }

        res.milliseconds = +other - +base.clone().add(res.months, 'M');

        return res;
    }

    function momentsDifference(base, other) {
        var res;
        if (!(base.isValid() && other.isValid())) {
            return { milliseconds: 0, months: 0 };
        }

        other = cloneWithOffset(other, base);
        if (base.isBefore(other)) {
            res = positiveMomentsDifference(base, other);
        } else {
            res = positiveMomentsDifference(other, base);
            res.milliseconds = -res.milliseconds;
            res.months = -res.months;
        }

        return res;
    }

    // TODO: remove 'name' arg after deprecation is removed
    function createAdder(direction, name) {
        return function (val, period) {
            var dur, tmp;
            //invert the arguments, but complain about it
            if (period !== null && !isNaN(+period)) {
                deprecateSimple(
                    name,
                    'moment().' +
                        name +
                        '(period, number) is deprecated. Please use moment().' +
                        name +
                        '(number, period). ' +
                        'See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info.'
                );
                tmp = val;
                val = period;
                period = tmp;
            }

            dur = createDuration(val, period);
            addSubtract(this, dur, direction);
            return this;
        };
    }

    function addSubtract(mom, duration, isAdding, updateOffset) {
        var milliseconds = duration._milliseconds,
            days = absRound(duration._days),
            months = absRound(duration._months);

        if (!mom.isValid()) {
            // No op
            return;
        }

        updateOffset = updateOffset == null ? true : updateOffset;

        if (months) {
            setMonth(mom, get(mom, 'Month') + months * isAdding);
        }
        if (days) {
            set$1(mom, 'Date', get(mom, 'Date') + days * isAdding);
        }
        if (milliseconds) {
            mom._d.setTime(mom._d.valueOf() + milliseconds * isAdding);
        }
        if (updateOffset) {
            hooks.updateOffset(mom, days || months);
        }
    }

    var add = createAdder(1, 'add'),
        subtract = createAdder(-1, 'subtract');

    function isString(input) {
        return typeof input === 'string' || input instanceof String;
    }

    // type MomentInput = Moment | Date | string | number | (number | string)[] | MomentInputObject | void; // null | undefined
    function isMomentInput(input) {
        return (
            isMoment(input) ||
            isDate(input) ||
            isString(input) ||
            isNumber(input) ||
            isNumberOrStringArray(input) ||
            isMomentInputObject(input) ||
            input === null ||
            input === undefined
        );
    }

    function isMomentInputObject(input) {
        var objectTest = isObject(input) && !isObjectEmpty(input),
            propertyTest = false,
            properties = [
                'years',
                'year',
                'y',
                'months',
                'month',
                'M',
                'days',
                'day',
                'd',
                'dates',
                'date',
                'D',
                'hours',
                'hour',
                'h',
                'minutes',
                'minute',
                'm',
                'seconds',
                'second',
                's',
                'milliseconds',
                'millisecond',
                'ms',
            ],
            i,
            property,
            propertyLen = properties.length;

        for (i = 0; i < propertyLen; i += 1) {
            property = properties[i];
            propertyTest = propertyTest || hasOwnProp(input, property);
        }

        return objectTest && propertyTest;
    }

    function isNumberOrStringArray(input) {
        var arrayTest = isArray(input),
            dataTypeTest = false;
        if (arrayTest) {
            dataTypeTest =
                input.filter(function (item) {
                    return !isNumber(item) && isString(input);
                }).length === 0;
        }
        return arrayTest && dataTypeTest;
    }

    function isCalendarSpec(input) {
        var objectTest = isObject(input) && !isObjectEmpty(input),
            propertyTest = false,
            properties = [
                'sameDay',
                'nextDay',
                'lastDay',
                'nextWeek',
                'lastWeek',
                'sameElse',
            ],
            i,
            property;

        for (i = 0; i < properties.length; i += 1) {
            property = properties[i];
            propertyTest = propertyTest || hasOwnProp(input, property);
        }

        return objectTest && propertyTest;
    }

    function getCalendarFormat(myMoment, now) {
        var diff = myMoment.diff(now, 'days', true);
        return diff < -6
            ? 'sameElse'
            : diff < -1
            ? 'lastWeek'
            : diff < 0
            ? 'lastDay'
            : diff < 1
            ? 'sameDay'
            : diff < 2
            ? 'nextDay'
            : diff < 7
            ? 'nextWeek'
            : 'sameElse';
    }

    function calendar$1(time, formats) {
        // Support for single parameter, formats only overload to the calendar function
        if (arguments.length === 1) {
            if (!arguments[0]) {
                time = undefined;
                formats = undefined;
            } else if (isMomentInput(arguments[0])) {
                time = arguments[0];
                formats = undefined;
            } else if (isCalendarSpec(arguments[0])) {
                formats = arguments[0];
                time = undefined;
            }
        }
        // We want to compare the start of today, vs this.
        // Getting start-of-today depends on whether we're local/utc/offset or not.
        var now = time || createLocal(),
            sod = cloneWithOffset(now, this).startOf('day'),
            format = hooks.calendarFormat(this, sod) || 'sameElse',
            output =
                formats &&
                (isFunction(formats[format])
                    ? formats[format].call(this, now)
                    : formats[format]);

        return this.format(
            output || this.localeData().calendar(format, this, createLocal(now))
        );
    }

    function clone() {
        return new Moment(this);
    }

    function isAfter(input, units) {
        var localInput = isMoment(input) ? input : createLocal(input);
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(units) || 'millisecond';
        if (units === 'millisecond') {
            return this.valueOf() > localInput.valueOf();
        } else {
            return localInput.valueOf() < this.clone().startOf(units).valueOf();
        }
    }

    function isBefore(input, units) {
        var localInput = isMoment(input) ? input : createLocal(input);
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(units) || 'millisecond';
        if (units === 'millisecond') {
            return this.valueOf() < localInput.valueOf();
        } else {
            return this.clone().endOf(units).valueOf() < localInput.valueOf();
        }
    }

    function isBetween(from, to, units, inclusivity) {
        var localFrom = isMoment(from) ? from : createLocal(from),
            localTo = isMoment(to) ? to : createLocal(to);
        if (!(this.isValid() && localFrom.isValid() && localTo.isValid())) {
            return false;
        }
        inclusivity = inclusivity || '()';
        return (
            (inclusivity[0] === '('
                ? this.isAfter(localFrom, units)
                : !this.isBefore(localFrom, units)) &&
            (inclusivity[1] === ')'
                ? this.isBefore(localTo, units)
                : !this.isAfter(localTo, units))
        );
    }

    function isSame(input, units) {
        var localInput = isMoment(input) ? input : createLocal(input),
            inputMs;
        if (!(this.isValid() && localInput.isValid())) {
            return false;
        }
        units = normalizeUnits(units) || 'millisecond';
        if (units === 'millisecond') {
            return this.valueOf() === localInput.valueOf();
        } else {
            inputMs = localInput.valueOf();
            return (
                this.clone().startOf(units).valueOf() <= inputMs &&
                inputMs <= this.clone().endOf(units).valueOf()
            );
        }
    }

    function isSameOrAfter(input, units) {
        return this.isSame(input, units) || this.isAfter(input, units);
    }

    function isSameOrBefore(input, units) {
        return this.isSame(input, units) || this.isBefore(input, units);
    }

    function diff(input, units, asFloat) {
        var that, zoneDelta, output;

        if (!this.isValid()) {
            return NaN;
        }

        that = cloneWithOffset(input, this);

        if (!that.isValid()) {
            return NaN;
        }

        zoneDelta = (that.utcOffset() - this.utcOffset()) * 6e4;

        units = normalizeUnits(units);

        switch (units) {
            case 'year':
                output = monthDiff(this, that) / 12;
                break;
            case 'month':
                output = monthDiff(this, that);
                break;
            case 'quarter':
                output = monthDiff(this, that) / 3;
                break;
            case 'second':
                output = (this - that) / 1e3;
                break; // 1000
            case 'minute':
                output = (this - that) / 6e4;
                break; // 1000 * 60
            case 'hour':
                output = (this - that) / 36e5;
                break; // 1000 * 60 * 60
            case 'day':
                output = (this - that - zoneDelta) / 864e5;
                break; // 1000 * 60 * 60 * 24, negate dst
            case 'week':
                output = (this - that - zoneDelta) / 6048e5;
                break; // 1000 * 60 * 60 * 24 * 7, negate dst
            default:
                output = this - that;
        }

        return asFloat ? output : absFloor(output);
    }

    function monthDiff(a, b) {
        if (a.date() < b.date()) {
            // end-of-month calculations work correct when the start month has more
            // days than the end month.
            return -monthDiff(b, a);
        }
        // difference in months
        var wholeMonthDiff = (b.year() - a.year()) * 12 + (b.month() - a.month()),
            // b is in (anchor - 1 month, anchor + 1 month)
            anchor = a.clone().add(wholeMonthDiff, 'months'),
            anchor2,
            adjust;

        if (b - anchor < 0) {
            anchor2 = a.clone().add(wholeMonthDiff - 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor - anchor2);
        } else {
            anchor2 = a.clone().add(wholeMonthDiff + 1, 'months');
            // linear across the month
            adjust = (b - anchor) / (anchor2 - anchor);
        }

        //check for negative zero, return zero if negative zero
        return -(wholeMonthDiff + adjust) || 0;
    }

    hooks.defaultFormat = 'YYYY-MM-DDTHH:mm:ssZ';
    hooks.defaultFormatUtc = 'YYYY-MM-DDTHH:mm:ss[Z]';

    function toString() {
        return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
    }

    function toISOString(keepOffset) {
        if (!this.isValid()) {
            return null;
        }
        var utc = keepOffset !== true,
            m = utc ? this.clone().utc() : this;
        if (m.year() < 0 || m.year() > 9999) {
            return formatMoment(
                m,
                utc
                    ? 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]'
                    : 'YYYYYY-MM-DD[T]HH:mm:ss.SSSZ'
            );
        }
        if (isFunction(Date.prototype.toISOString)) {
            // native implementation is ~50x faster, use it when we can
            if (utc) {
                return this.toDate().toISOString();
            } else {
                return new Date(this.valueOf() + this.utcOffset() * 60 * 1000)
                    .toISOString()
                    .replace('Z', formatMoment(m, 'Z'));
            }
        }
        return formatMoment(
            m,
            utc ? 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]' : 'YYYY-MM-DD[T]HH:mm:ss.SSSZ'
        );
    }

    /**
     * Return a human readable representation of a moment that can
     * also be evaluated to get a new moment which is the same
     *
     * @link https://nodejs.org/dist/latest/docs/api/util.html#util_custom_inspect_function_on_objects
     */
    function inspect() {
        if (!this.isValid()) {
            return 'moment.invalid(/* ' + this._i + ' */)';
        }
        var func = 'moment',
            zone = '',
            prefix,
            year,
            datetime,
            suffix;
        if (!this.isLocal()) {
            func = this.utcOffset() === 0 ? 'moment.utc' : 'moment.parseZone';
            zone = 'Z';
        }
        prefix = '[' + func + '("]';
        year = 0 <= this.year() && this.year() <= 9999 ? 'YYYY' : 'YYYYYY';
        datetime = '-MM-DD[T]HH:mm:ss.SSS';
        suffix = zone + '[")]';

        return this.format(prefix + year + datetime + suffix);
    }

    function format(inputString) {
        if (!inputString) {
            inputString = this.isUtc()
                ? hooks.defaultFormatUtc
                : hooks.defaultFormat;
        }
        var output = formatMoment(this, inputString);
        return this.localeData().postformat(output);
    }

    function from(time, withoutSuffix) {
        if (
            this.isValid() &&
            ((isMoment(time) && time.isValid()) || createLocal(time).isValid())
        ) {
            return createDuration({ to: this, from: time })
                .locale(this.locale())
                .humanize(!withoutSuffix);
        } else {
            return this.localeData().invalidDate();
        }
    }

    function fromNow(withoutSuffix) {
        return this.from(createLocal(), withoutSuffix);
    }

    function to(time, withoutSuffix) {
        if (
            this.isValid() &&
            ((isMoment(time) && time.isValid()) || createLocal(time).isValid())
        ) {
            return createDuration({ from: this, to: time })
                .locale(this.locale())
                .humanize(!withoutSuffix);
        } else {
            return this.localeData().invalidDate();
        }
    }

    function toNow(withoutSuffix) {
        return this.to(createLocal(), withoutSuffix);
    }

    // If passed a locale key, it will set the locale for this
    // instance.  Otherwise, it will return the locale configuration
    // variables for this instance.
    function locale(key) {
        var newLocaleData;

        if (key === undefined) {
            return this._locale._abbr;
        } else {
            newLocaleData = getLocale(key);
            if (newLocaleData != null) {
                this._locale = newLocaleData;
            }
            return this;
        }
    }

    var lang = deprecate(
        'moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.',
        function (key) {
            if (key === undefined) {
                return this.localeData();
            } else {
                return this.locale(key);
            }
        }
    );

    function localeData() {
        return this._locale;
    }

    var MS_PER_SECOND = 1000,
        MS_PER_MINUTE = 60 * MS_PER_SECOND,
        MS_PER_HOUR = 60 * MS_PER_MINUTE,
        MS_PER_400_YEARS = (365 * 400 + 97) * 24 * MS_PER_HOUR;

    // actual modulo - handles negative numbers (for dates before 1970):
    function mod$1(dividend, divisor) {
        return ((dividend % divisor) + divisor) % divisor;
    }

    function localStartOfDate(y, m, d) {
        // the date constructor remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0) {
            // preserve leap years using a full 400 year cycle, then reset
            return new Date(y + 400, m, d) - MS_PER_400_YEARS;
        } else {
            return new Date(y, m, d).valueOf();
        }
    }

    function utcStartOfDate(y, m, d) {
        // Date.UTC remaps years 0-99 to 1900-1999
        if (y < 100 && y >= 0) {
            // preserve leap years using a full 400 year cycle, then reset
            return Date.UTC(y + 400, m, d) - MS_PER_400_YEARS;
        } else {
            return Date.UTC(y, m, d);
        }
    }

    function startOf(units) {
        var time, startOfDate;
        units = normalizeUnits(units);
        if (units === undefined || units === 'millisecond' || !this.isValid()) {
            return this;
        }

        startOfDate = this._isUTC ? utcStartOfDate : localStartOfDate;

        switch (units) {
            case 'year':
                time = startOfDate(this.year(), 0, 1);
                break;
            case 'quarter':
                time = startOfDate(
                    this.year(),
                    this.month() - (this.month() % 3),
                    1
                );
                break;
            case 'month':
                time = startOfDate(this.year(), this.month(), 1);
                break;
            case 'week':
                time = startOfDate(
                    this.year(),
                    this.month(),
                    this.date() - this.weekday()
                );
                break;
            case 'isoWeek':
                time = startOfDate(
                    this.year(),
                    this.month(),
                    this.date() - (this.isoWeekday() - 1)
                );
                break;
            case 'day':
            case 'date':
                time = startOfDate(this.year(), this.month(), this.date());
                break;
            case 'hour':
                time = this._d.valueOf();
                time -= mod$1(
                    time + (this._isUTC ? 0 : this.utcOffset() * MS_PER_MINUTE),
                    MS_PER_HOUR
                );
                break;
            case 'minute':
                time = this._d.valueOf();
                time -= mod$1(time, MS_PER_MINUTE);
                break;
            case 'second':
                time = this._d.valueOf();
                time -= mod$1(time, MS_PER_SECOND);
                break;
        }

        this._d.setTime(time);
        hooks.updateOffset(this, true);
        return this;
    }

    function endOf(units) {
        var time, startOfDate;
        units = normalizeUnits(units);
        if (units === undefined || units === 'millisecond' || !this.isValid()) {
            return this;
        }

        startOfDate = this._isUTC ? utcStartOfDate : localStartOfDate;

        switch (units) {
            case 'year':
                time = startOfDate(this.year() + 1, 0, 1) - 1;
                break;
            case 'quarter':
                time =
                    startOfDate(
                        this.year(),
                        this.month() - (this.month() % 3) + 3,
                        1
                    ) - 1;
                break;
            case 'month':
                time = startOfDate(this.year(), this.month() + 1, 1) - 1;
                break;
            case 'week':
                time =
                    startOfDate(
                        this.year(),
                        this.month(),
                        this.date() - this.weekday() + 7
                    ) - 1;
                break;
            case 'isoWeek':
                time =
                    startOfDate(
                        this.year(),
                        this.month(),
                        this.date() - (this.isoWeekday() - 1) + 7
                    ) - 1;
                break;
            case 'day':
            case 'date':
                time = startOfDate(this.year(), this.month(), this.date() + 1) - 1;
                break;
            case 'hour':
                time = this._d.valueOf();
                time +=
                    MS_PER_HOUR -
                    mod$1(
                        time + (this._isUTC ? 0 : this.utcOffset() * MS_PER_MINUTE),
                        MS_PER_HOUR
                    ) -
                    1;
                break;
            case 'minute':
                time = this._d.valueOf();
                time += MS_PER_MINUTE - mod$1(time, MS_PER_MINUTE) - 1;
                break;
            case 'second':
                time = this._d.valueOf();
                time += MS_PER_SECOND - mod$1(time, MS_PER_SECOND) - 1;
                break;
        }

        this._d.setTime(time);
        hooks.updateOffset(this, true);
        return this;
    }

    function valueOf() {
        return this._d.valueOf() - (this._offset || 0) * 60000;
    }

    function unix() {
        return Math.floor(this.valueOf() / 1000);
    }

    function toDate() {
        return new Date(this.valueOf());
    }

    function toArray() {
        var m = this;
        return [
            m.year(),
            m.month(),
            m.date(),
            m.hour(),
            m.minute(),
            m.second(),
            m.millisecond(),
        ];
    }

    function toObject() {
        var m = this;
        return {
            years: m.year(),
            months: m.month(),
            date: m.date(),
            hours: m.hours(),
            minutes: m.minutes(),
            seconds: m.seconds(),
            milliseconds: m.milliseconds(),
        };
    }

    function toJSON() {
        // new Date(NaN).toJSON() === null
        return this.isValid() ? this.toISOString() : null;
    }

    function isValid$2() {
        return isValid(this);
    }

    function parsingFlags() {
        return extend({}, getParsingFlags(this));
    }

    function invalidAt() {
        return getParsingFlags(this).overflow;
    }

    function creationData() {
        return {
            input: this._i,
            format: this._f,
            locale: this._locale,
            isUTC: this._isUTC,
            strict: this._strict,
        };
    }

    addFormatToken('N', 0, 0, 'eraAbbr');
    addFormatToken('NN', 0, 0, 'eraAbbr');
    addFormatToken('NNN', 0, 0, 'eraAbbr');
    addFormatToken('NNNN', 0, 0, 'eraName');
    addFormatToken('NNNNN', 0, 0, 'eraNarrow');

    addFormatToken('y', ['y', 1], 'yo', 'eraYear');
    addFormatToken('y', ['yy', 2], 0, 'eraYear');
    addFormatToken('y', ['yyy', 3], 0, 'eraYear');
    addFormatToken('y', ['yyyy', 4], 0, 'eraYear');

    addRegexToken('N', matchEraAbbr);
    addRegexToken('NN', matchEraAbbr);
    addRegexToken('NNN', matchEraAbbr);
    addRegexToken('NNNN', matchEraName);
    addRegexToken('NNNNN', matchEraNarrow);

    addParseToken(
        ['N', 'NN', 'NNN', 'NNNN', 'NNNNN'],
        function (input, array, config, token) {
            var era = config._locale.erasParse(input, token, config._strict);
            if (era) {
                getParsingFlags(config).era = era;
            } else {
                getParsingFlags(config).invalidEra = input;
            }
        }
    );

    addRegexToken('y', matchUnsigned);
    addRegexToken('yy', matchUnsigned);
    addRegexToken('yyy', matchUnsigned);
    addRegexToken('yyyy', matchUnsigned);
    addRegexToken('yo', matchEraYearOrdinal);

    addParseToken(['y', 'yy', 'yyy', 'yyyy'], YEAR);
    addParseToken(['yo'], function (input, array, config, token) {
        var match;
        if (config._locale._eraYearOrdinalRegex) {
            match = input.match(config._locale._eraYearOrdinalRegex);
        }

        if (config._locale.eraYearOrdinalParse) {
            array[YEAR] = config._locale.eraYearOrdinalParse(input, match);
        } else {
            array[YEAR] = parseInt(input, 10);
        }
    });

    function localeEras(m, format) {
        var i,
            l,
            date,
            eras = this._eras || getLocale('en')._eras;
        for (i = 0, l = eras.length; i < l; ++i) {
            switch (typeof eras[i].since) {
                case 'string':
                    // truncate time
                    date = hooks(eras[i].since).startOf('day');
                    eras[i].since = date.valueOf();
                    break;
            }

            switch (typeof eras[i].until) {
                case 'undefined':
                    eras[i].until = +Infinity;
                    break;
                case 'string':
                    // truncate time
                    date = hooks(eras[i].until).startOf('day').valueOf();
                    eras[i].until = date.valueOf();
                    break;
            }
        }
        return eras;
    }

    function localeErasParse(eraName, format, strict) {
        var i,
            l,
            eras = this.eras(),
            name,
            abbr,
            narrow;
        eraName = eraName.toUpperCase();

        for (i = 0, l = eras.length; i < l; ++i) {
            name = eras[i].name.toUpperCase();
            abbr = eras[i].abbr.toUpperCase();
            narrow = eras[i].narrow.toUpperCase();

            if (strict) {
                switch (format) {
                    case 'N':
                    case 'NN':
                    case 'NNN':
                        if (abbr === eraName) {
                            return eras[i];
                        }
                        break;

                    case 'NNNN':
                        if (name === eraName) {
                            return eras[i];
                        }
                        break;

                    case 'NNNNN':
                        if (narrow === eraName) {
                            return eras[i];
                        }
                        break;
                }
            } else if ([name, abbr, narrow].indexOf(eraName) >= 0) {
                return eras[i];
            }
        }
    }

    function localeErasConvertYear(era, year) {
        var dir = era.since <= era.until ? +1 : -1;
        if (year === undefined) {
            return hooks(era.since).year();
        } else {
            return hooks(era.since).year() + (year - era.offset) * dir;
        }
    }

    function getEraName() {
        var i,
            l,
            val,
            eras = this.localeData().eras();
        for (i = 0, l = eras.length; i < l; ++i) {
            // truncate time
            val = this.clone().startOf('day').valueOf();

            if (eras[i].since <= val && val <= eras[i].until) {
                return eras[i].name;
            }
            if (eras[i].until <= val && val <= eras[i].since) {
                return eras[i].name;
            }
        }

        return '';
    }

    function getEraNarrow() {
        var i,
            l,
            val,
            eras = this.localeData().eras();
        for (i = 0, l = eras.length; i < l; ++i) {
            // truncate time
            val = this.clone().startOf('day').valueOf();

            if (eras[i].since <= val && val <= eras[i].until) {
                return eras[i].narrow;
            }
            if (eras[i].until <= val && val <= eras[i].since) {
                return eras[i].narrow;
            }
        }

        return '';
    }

    function getEraAbbr() {
        var i,
            l,
            val,
            eras = this.localeData().eras();
        for (i = 0, l = eras.length; i < l; ++i) {
            // truncate time
            val = this.clone().startOf('day').valueOf();

            if (eras[i].since <= val && val <= eras[i].until) {
                return eras[i].abbr;
            }
            if (eras[i].until <= val && val <= eras[i].since) {
                return eras[i].abbr;
            }
        }

        return '';
    }

    function getEraYear() {
        var i,
            l,
            dir,
            val,
            eras = this.localeData().eras();
        for (i = 0, l = eras.length; i < l; ++i) {
            dir = eras[i].since <= eras[i].until ? +1 : -1;

            // truncate time
            val = this.clone().startOf('day').valueOf();

            if (
                (eras[i].since <= val && val <= eras[i].until) ||
                (eras[i].until <= val && val <= eras[i].since)
            ) {
                return (
                    (this.year() - hooks(eras[i].since).year()) * dir +
                    eras[i].offset
                );
            }
        }

        return this.year();
    }

    function erasNameRegex(isStrict) {
        if (!hasOwnProp(this, '_erasNameRegex')) {
            computeErasParse.call(this);
        }
        return isStrict ? this._erasNameRegex : this._erasRegex;
    }

    function erasAbbrRegex(isStrict) {
        if (!hasOwnProp(this, '_erasAbbrRegex')) {
            computeErasParse.call(this);
        }
        return isStrict ? this._erasAbbrRegex : this._erasRegex;
    }

    function erasNarrowRegex(isStrict) {
        if (!hasOwnProp(this, '_erasNarrowRegex')) {
            computeErasParse.call(this);
        }
        return isStrict ? this._erasNarrowRegex : this._erasRegex;
    }

    function matchEraAbbr(isStrict, locale) {
        return locale.erasAbbrRegex(isStrict);
    }

    function matchEraName(isStrict, locale) {
        return locale.erasNameRegex(isStrict);
    }

    function matchEraNarrow(isStrict, locale) {
        return locale.erasNarrowRegex(isStrict);
    }

    function matchEraYearOrdinal(isStrict, locale) {
        return locale._eraYearOrdinalRegex || matchUnsigned;
    }

    function computeErasParse() {
        var abbrPieces = [],
            namePieces = [],
            narrowPieces = [],
            mixedPieces = [],
            i,
            l,
            eras = this.eras();

        for (i = 0, l = eras.length; i < l; ++i) {
            namePieces.push(regexEscape(eras[i].name));
            abbrPieces.push(regexEscape(eras[i].abbr));
            narrowPieces.push(regexEscape(eras[i].narrow));

            mixedPieces.push(regexEscape(eras[i].name));
            mixedPieces.push(regexEscape(eras[i].abbr));
            mixedPieces.push(regexEscape(eras[i].narrow));
        }

        this._erasRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
        this._erasNameRegex = new RegExp('^(' + namePieces.join('|') + ')', 'i');
        this._erasAbbrRegex = new RegExp('^(' + abbrPieces.join('|') + ')', 'i');
        this._erasNarrowRegex = new RegExp(
            '^(' + narrowPieces.join('|') + ')',
            'i'
        );
    }

    // FORMATTING

    addFormatToken(0, ['gg', 2], 0, function () {
        return this.weekYear() % 100;
    });

    addFormatToken(0, ['GG', 2], 0, function () {
        return this.isoWeekYear() % 100;
    });

    function addWeekYearFormatToken(token, getter) {
        addFormatToken(0, [token, token.length], 0, getter);
    }

    addWeekYearFormatToken('gggg', 'weekYear');
    addWeekYearFormatToken('ggggg', 'weekYear');
    addWeekYearFormatToken('GGGG', 'isoWeekYear');
    addWeekYearFormatToken('GGGGG', 'isoWeekYear');

    // ALIASES

    addUnitAlias('weekYear', 'gg');
    addUnitAlias('isoWeekYear', 'GG');

    // PRIORITY

    addUnitPriority('weekYear', 1);
    addUnitPriority('isoWeekYear', 1);

    // PARSING

    addRegexToken('G', matchSigned);
    addRegexToken('g', matchSigned);
    addRegexToken('GG', match1to2, match2);
    addRegexToken('gg', match1to2, match2);
    addRegexToken('GGGG', match1to4, match4);
    addRegexToken('gggg', match1to4, match4);
    addRegexToken('GGGGG', match1to6, match6);
    addRegexToken('ggggg', match1to6, match6);

    addWeekParseToken(
        ['gggg', 'ggggg', 'GGGG', 'GGGGG'],
        function (input, week, config, token) {
            week[token.substr(0, 2)] = toInt(input);
        }
    );

    addWeekParseToken(['gg', 'GG'], function (input, week, config, token) {
        week[token] = hooks.parseTwoDigitYear(input);
    });

    // MOMENTS

    function getSetWeekYear(input) {
        return getSetWeekYearHelper.call(
            this,
            input,
            this.week(),
            this.weekday(),
            this.localeData()._week.dow,
            this.localeData()._week.doy
        );
    }

    function getSetISOWeekYear(input) {
        return getSetWeekYearHelper.call(
            this,
            input,
            this.isoWeek(),
            this.isoWeekday(),
            1,
            4
        );
    }

    function getISOWeeksInYear() {
        return weeksInYear(this.year(), 1, 4);
    }

    function getISOWeeksInISOWeekYear() {
        return weeksInYear(this.isoWeekYear(), 1, 4);
    }

    function getWeeksInYear() {
        var weekInfo = this.localeData()._week;
        return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
    }

    function getWeeksInWeekYear() {
        var weekInfo = this.localeData()._week;
        return weeksInYear(this.weekYear(), weekInfo.dow, weekInfo.doy);
    }

    function getSetWeekYearHelper(input, week, weekday, dow, doy) {
        var weeksTarget;
        if (input == null) {
            return weekOfYear(this, dow, doy).year;
        } else {
            weeksTarget = weeksInYear(input, dow, doy);
            if (week > weeksTarget) {
                week = weeksTarget;
            }
            return setWeekAll.call(this, input, week, weekday, dow, doy);
        }
    }

    function setWeekAll(weekYear, week, weekday, dow, doy) {
        var dayOfYearData = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy),
            date = createUTCDate(dayOfYearData.year, 0, dayOfYearData.dayOfYear);

        this.year(date.getUTCFullYear());
        this.month(date.getUTCMonth());
        this.date(date.getUTCDate());
        return this;
    }

    // FORMATTING

    addFormatToken('Q', 0, 'Qo', 'quarter');

    // ALIASES

    addUnitAlias('quarter', 'Q');

    // PRIORITY

    addUnitPriority('quarter', 7);

    // PARSING

    addRegexToken('Q', match1);
    addParseToken('Q', function (input, array) {
        array[MONTH] = (toInt(input) - 1) * 3;
    });

    // MOMENTS

    function getSetQuarter(input) {
        return input == null
            ? Math.ceil((this.month() + 1) / 3)
            : this.month((input - 1) * 3 + (this.month() % 3));
    }

    // FORMATTING

    addFormatToken('D', ['DD', 2], 'Do', 'date');

    // ALIASES

    addUnitAlias('date', 'D');

    // PRIORITY
    addUnitPriority('date', 9);

    // PARSING

    addRegexToken('D', match1to2);
    addRegexToken('DD', match1to2, match2);
    addRegexToken('Do', function (isStrict, locale) {
        // TODO: Remove "ordinalParse" fallback in next major release.
        return isStrict
            ? locale._dayOfMonthOrdinalParse || locale._ordinalParse
            : locale._dayOfMonthOrdinalParseLenient;
    });

    addParseToken(['D', 'DD'], DATE);
    addParseToken('Do', function (input, array) {
        array[DATE] = toInt(input.match(match1to2)[0]);
    });

    // MOMENTS

    var getSetDayOfMonth = makeGetSet('Date', true);

    // FORMATTING

    addFormatToken('DDD', ['DDDD', 3], 'DDDo', 'dayOfYear');

    // ALIASES

    addUnitAlias('dayOfYear', 'DDD');

    // PRIORITY
    addUnitPriority('dayOfYear', 4);

    // PARSING

    addRegexToken('DDD', match1to3);
    addRegexToken('DDDD', match3);
    addParseToken(['DDD', 'DDDD'], function (input, array, config) {
        config._dayOfYear = toInt(input);
    });

    // HELPERS

    // MOMENTS

    function getSetDayOfYear(input) {
        var dayOfYear =
            Math.round(
                (this.clone().startOf('day') - this.clone().startOf('year')) / 864e5
            ) + 1;
        return input == null ? dayOfYear : this.add(input - dayOfYear, 'd');
    }

    // FORMATTING

    addFormatToken('m', ['mm', 2], 0, 'minute');

    // ALIASES

    addUnitAlias('minute', 'm');

    // PRIORITY

    addUnitPriority('minute', 14);

    // PARSING

    addRegexToken('m', match1to2);
    addRegexToken('mm', match1to2, match2);
    addParseToken(['m', 'mm'], MINUTE);

    // MOMENTS

    var getSetMinute = makeGetSet('Minutes', false);

    // FORMATTING

    addFormatToken('s', ['ss', 2], 0, 'second');

    // ALIASES

    addUnitAlias('second', 's');

    // PRIORITY

    addUnitPriority('second', 15);

    // PARSING

    addRegexToken('s', match1to2);
    addRegexToken('ss', match1to2, match2);
    addParseToken(['s', 'ss'], SECOND);

    // MOMENTS

    var getSetSecond = makeGetSet('Seconds', false);

    // FORMATTING

    addFormatToken('S', 0, 0, function () {
        return ~~(this.millisecond() / 100);
    });

    addFormatToken(0, ['SS', 2], 0, function () {
        return ~~(this.millisecond() / 10);
    });

    addFormatToken(0, ['SSS', 3], 0, 'millisecond');
    addFormatToken(0, ['SSSS', 4], 0, function () {
        return this.millisecond() * 10;
    });
    addFormatToken(0, ['SSSSS', 5], 0, function () {
        return this.millisecond() * 100;
    });
    addFormatToken(0, ['SSSSSS', 6], 0, function () {
        return this.millisecond() * 1000;
    });
    addFormatToken(0, ['SSSSSSS', 7], 0, function () {
        return this.millisecond() * 10000;
    });
    addFormatToken(0, ['SSSSSSSS', 8], 0, function () {
        return this.millisecond() * 100000;
    });
    addFormatToken(0, ['SSSSSSSSS', 9], 0, function () {
        return this.millisecond() * 1000000;
    });

    // ALIASES

    addUnitAlias('millisecond', 'ms');

    // PRIORITY

    addUnitPriority('millisecond', 16);

    // PARSING

    addRegexToken('S', match1to3, match1);
    addRegexToken('SS', match1to3, match2);
    addRegexToken('SSS', match1to3, match3);

    var token, getSetMillisecond;
    for (token = 'SSSS'; token.length <= 9; token += 'S') {
        addRegexToken(token, matchUnsigned);
    }

    function parseMs(input, array) {
        array[MILLISECOND] = toInt(('0.' + input) * 1000);
    }

    for (token = 'S'; token.length <= 9; token += 'S') {
        addParseToken(token, parseMs);
    }

    getSetMillisecond = makeGetSet('Milliseconds', false);

    // FORMATTING

    addFormatToken('z', 0, 0, 'zoneAbbr');
    addFormatToken('zz', 0, 0, 'zoneName');

    // MOMENTS

    function getZoneAbbr() {
        return this._isUTC ? 'UTC' : '';
    }

    function getZoneName() {
        return this._isUTC ? 'Coordinated Universal Time' : '';
    }

    var proto = Moment.prototype;

    proto.add = add;
    proto.calendar = calendar$1;
    proto.clone = clone;
    proto.diff = diff;
    proto.endOf = endOf;
    proto.format = format;
    proto.from = from;
    proto.fromNow = fromNow;
    proto.to = to;
    proto.toNow = toNow;
    proto.get = stringGet;
    proto.invalidAt = invalidAt;
    proto.isAfter = isAfter;
    proto.isBefore = isBefore;
    proto.isBetween = isBetween;
    proto.isSame = isSame;
    proto.isSameOrAfter = isSameOrAfter;
    proto.isSameOrBefore = isSameOrBefore;
    proto.isValid = isValid$2;
    proto.lang = lang;
    proto.locale = locale;
    proto.localeData = localeData;
    proto.max = prototypeMax;
    proto.min = prototypeMin;
    proto.parsingFlags = parsingFlags;
    proto.set = stringSet;
    proto.startOf = startOf;
    proto.subtract = subtract;
    proto.toArray = toArray;
    proto.toObject = toObject;
    proto.toDate = toDate;
    proto.toISOString = toISOString;
    proto.inspect = inspect;
    if (typeof Symbol !== 'undefined' && Symbol.for != null) {
        proto[Symbol.for('nodejs.util.inspect.custom')] = function () {
            return 'Moment<' + this.format() + '>';
        };
    }
    proto.toJSON = toJSON;
    proto.toString = toString;
    proto.unix = unix;
    proto.valueOf = valueOf;
    proto.creationData = creationData;
    proto.eraName = getEraName;
    proto.eraNarrow = getEraNarrow;
    proto.eraAbbr = getEraAbbr;
    proto.eraYear = getEraYear;
    proto.year = getSetYear;
    proto.isLeapYear = getIsLeapYear;
    proto.weekYear = getSetWeekYear;
    proto.isoWeekYear = getSetISOWeekYear;
    proto.quarter = proto.quarters = getSetQuarter;
    proto.month = getSetMonth;
    proto.daysInMonth = getDaysInMonth;
    proto.week = proto.weeks = getSetWeek;
    proto.isoWeek = proto.isoWeeks = getSetISOWeek;
    proto.weeksInYear = getWeeksInYear;
    proto.weeksInWeekYear = getWeeksInWeekYear;
    proto.isoWeeksInYear = getISOWeeksInYear;
    proto.isoWeeksInISOWeekYear = getISOWeeksInISOWeekYear;
    proto.date = getSetDayOfMonth;
    proto.day = proto.days = getSetDayOfWeek;
    proto.weekday = getSetLocaleDayOfWeek;
    proto.isoWeekday = getSetISODayOfWeek;
    proto.dayOfYear = getSetDayOfYear;
    proto.hour = proto.hours = getSetHour;
    proto.minute = proto.minutes = getSetMinute;
    proto.second = proto.seconds = getSetSecond;
    proto.millisecond = proto.milliseconds = getSetMillisecond;
    proto.utcOffset = getSetOffset;
    proto.utc = setOffsetToUTC;
    proto.local = setOffsetToLocal;
    proto.parseZone = setOffsetToParsedOffset;
    proto.hasAlignedHourOffset = hasAlignedHourOffset;
    proto.isDST = isDaylightSavingTime;
    proto.isLocal = isLocal;
    proto.isUtcOffset = isUtcOffset;
    proto.isUtc = isUtc;
    proto.isUTC = isUtc;
    proto.zoneAbbr = getZoneAbbr;
    proto.zoneName = getZoneName;
    proto.dates = deprecate(
        'dates accessor is deprecated. Use date instead.',
        getSetDayOfMonth
    );
    proto.months = deprecate(
        'months accessor is deprecated. Use month instead',
        getSetMonth
    );
    proto.years = deprecate(
        'years accessor is deprecated. Use year instead',
        getSetYear
    );
    proto.zone = deprecate(
        'moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/',
        getSetZone
    );
    proto.isDSTShifted = deprecate(
        'isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information',
        isDaylightSavingTimeShifted
    );

    function createUnix(input) {
        return createLocal(input * 1000);
    }

    function createInZone() {
        return createLocal.apply(null, arguments).parseZone();
    }

    function preParsePostFormat(string) {
        return string;
    }

    var proto$1 = Locale.prototype;

    proto$1.calendar = calendar;
    proto$1.longDateFormat = longDateFormat;
    proto$1.invalidDate = invalidDate;
    proto$1.ordinal = ordinal;
    proto$1.preparse = preParsePostFormat;
    proto$1.postformat = preParsePostFormat;
    proto$1.relativeTime = relativeTime;
    proto$1.pastFuture = pastFuture;
    proto$1.set = set;
    proto$1.eras = localeEras;
    proto$1.erasParse = localeErasParse;
    proto$1.erasConvertYear = localeErasConvertYear;
    proto$1.erasAbbrRegex = erasAbbrRegex;
    proto$1.erasNameRegex = erasNameRegex;
    proto$1.erasNarrowRegex = erasNarrowRegex;

    proto$1.months = localeMonths;
    proto$1.monthsShort = localeMonthsShort;
    proto$1.monthsParse = localeMonthsParse;
    proto$1.monthsRegex = monthsRegex;
    proto$1.monthsShortRegex = monthsShortRegex;
    proto$1.week = localeWeek;
    proto$1.firstDayOfYear = localeFirstDayOfYear;
    proto$1.firstDayOfWeek = localeFirstDayOfWeek;

    proto$1.weekdays = localeWeekdays;
    proto$1.weekdaysMin = localeWeekdaysMin;
    proto$1.weekdaysShort = localeWeekdaysShort;
    proto$1.weekdaysParse = localeWeekdaysParse;

    proto$1.weekdaysRegex = weekdaysRegex;
    proto$1.weekdaysShortRegex = weekdaysShortRegex;
    proto$1.weekdaysMinRegex = weekdaysMinRegex;

    proto$1.isPM = localeIsPM;
    proto$1.meridiem = localeMeridiem;

    function get$1(format, index, field, setter) {
        var locale = getLocale(),
            utc = createUTC().set(setter, index);
        return locale[field](utc, format);
    }

    function listMonthsImpl(format, index, field) {
        if (isNumber(format)) {
            index = format;
            format = undefined;
        }

        format = format || '';

        if (index != null) {
            return get$1(format, index, field, 'month');
        }

        var i,
            out = [];
        for (i = 0; i < 12; i++) {
            out[i] = get$1(format, i, field, 'month');
        }
        return out;
    }

    // ()
    // (5)
    // (fmt, 5)
    // (fmt)
    // (true)
    // (true, 5)
    // (true, fmt, 5)
    // (true, fmt)
    function listWeekdaysImpl(localeSorted, format, index, field) {
        if (typeof localeSorted === 'boolean') {
            if (isNumber(format)) {
                index = format;
                format = undefined;
            }

            format = format || '';
        } else {
            format = localeSorted;
            index = format;
            localeSorted = false;

            if (isNumber(format)) {
                index = format;
                format = undefined;
            }

            format = format || '';
        }

        var locale = getLocale(),
            shift = localeSorted ? locale._week.dow : 0,
            i,
            out = [];

        if (index != null) {
            return get$1(format, (index + shift) % 7, field, 'day');
        }

        for (i = 0; i < 7; i++) {
            out[i] = get$1(format, (i + shift) % 7, field, 'day');
        }
        return out;
    }

    function listMonths(format, index) {
        return listMonthsImpl(format, index, 'months');
    }

    function listMonthsShort(format, index) {
        return listMonthsImpl(format, index, 'monthsShort');
    }

    function listWeekdays(localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdays');
    }

    function listWeekdaysShort(localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdaysShort');
    }

    function listWeekdaysMin(localeSorted, format, index) {
        return listWeekdaysImpl(localeSorted, format, index, 'weekdaysMin');
    }

    getSetGlobalLocale('en', {
        eras: [
            {
                since: '0001-01-01',
                until: +Infinity,
                offset: 1,
                name: 'Anno Domini',
                narrow: 'AD',
                abbr: 'AD',
            },
            {
                since: '0000-12-31',
                until: -Infinity,
                offset: 1,
                name: 'Before Christ',
                narrow: 'BC',
                abbr: 'BC',
            },
        ],
        dayOfMonthOrdinalParse: /\d{1,2}(th|st|nd|rd)/,
        ordinal: function (number) {
            var b = number % 10,
                output =
                    toInt((number % 100) / 10) === 1
                        ? 'th'
                        : b === 1
                        ? 'st'
                        : b === 2
                        ? 'nd'
                        : b === 3
                        ? 'rd'
                        : 'th';
            return number + output;
        },
    });

    // Side effect imports

    hooks.lang = deprecate(
        'moment.lang is deprecated. Use moment.locale instead.',
        getSetGlobalLocale
    );
    hooks.langData = deprecate(
        'moment.langData is deprecated. Use moment.localeData instead.',
        getLocale
    );

    var mathAbs = Math.abs;

    function abs() {
        var data = this._data;

        this._milliseconds = mathAbs(this._milliseconds);
        this._days = mathAbs(this._days);
        this._months = mathAbs(this._months);

        data.milliseconds = mathAbs(data.milliseconds);
        data.seconds = mathAbs(data.seconds);
        data.minutes = mathAbs(data.minutes);
        data.hours = mathAbs(data.hours);
        data.months = mathAbs(data.months);
        data.years = mathAbs(data.years);

        return this;
    }

    function addSubtract$1(duration, input, value, direction) {
        var other = createDuration(input, value);

        duration._milliseconds += direction * other._milliseconds;
        duration._days += direction * other._days;
        duration._months += direction * other._months;

        return duration._bubble();
    }

    // supports only 2.0-style add(1, 's') or add(duration)
    function add$1(input, value) {
        return addSubtract$1(this, input, value, 1);
    }

    // supports only 2.0-style subtract(1, 's') or subtract(duration)
    function subtract$1(input, value) {
        return addSubtract$1(this, input, value, -1);
    }

    function absCeil(number) {
        if (number < 0) {
            return Math.floor(number);
        } else {
            return Math.ceil(number);
        }
    }

    function bubble() {
        var milliseconds = this._milliseconds,
            days = this._days,
            months = this._months,
            data = this._data,
            seconds,
            minutes,
            hours,
            years,
            monthsFromDays;

        // if we have a mix of positive and negative values, bubble down first
        // check: https://github.com/moment/moment/issues/2166
        if (
            !(
                (milliseconds >= 0 && days >= 0 && months >= 0) ||
                (milliseconds <= 0 && days <= 0 && months <= 0)
            )
        ) {
            milliseconds += absCeil(monthsToDays(months) + days) * 864e5;
            days = 0;
            months = 0;
        }

        // The following code bubbles up values, see the tests for
        // examples of what that means.
        data.milliseconds = milliseconds % 1000;

        seconds = absFloor(milliseconds / 1000);
        data.seconds = seconds % 60;

        minutes = absFloor(seconds / 60);
        data.minutes = minutes % 60;

        hours = absFloor(minutes / 60);
        data.hours = hours % 24;

        days += absFloor(hours / 24);

        // convert days to months
        monthsFromDays = absFloor(daysToMonths(days));
        months += monthsFromDays;
        days -= absCeil(monthsToDays(monthsFromDays));

        // 12 months -> 1 year
        years = absFloor(months / 12);
        months %= 12;

        data.days = days;
        data.months = months;
        data.years = years;

        return this;
    }

    function daysToMonths(days) {
        // 400 years have 146097 days (taking into account leap year rules)
        // 400 years have 12 months === 4800
        return (days * 4800) / 146097;
    }

    function monthsToDays(months) {
        // the reverse of daysToMonths
        return (months * 146097) / 4800;
    }

    function as(units) {
        if (!this.isValid()) {
            return NaN;
        }
        var days,
            months,
            milliseconds = this._milliseconds;

        units = normalizeUnits(units);

        if (units === 'month' || units === 'quarter' || units === 'year') {
            days = this._days + milliseconds / 864e5;
            months = this._months + daysToMonths(days);
            switch (units) {
                case 'month':
                    return months;
                case 'quarter':
                    return months / 3;
                case 'year':
                    return months / 12;
            }
        } else {
            // handle milliseconds separately because of floating point math errors (issue #1867)
            days = this._days + Math.round(monthsToDays(this._months));
            switch (units) {
                case 'week':
                    return days / 7 + milliseconds / 6048e5;
                case 'day':
                    return days + milliseconds / 864e5;
                case 'hour':
                    return days * 24 + milliseconds / 36e5;
                case 'minute':
                    return days * 1440 + milliseconds / 6e4;
                case 'second':
                    return days * 86400 + milliseconds / 1000;
                // Math.floor prevents floating point math errors here
                case 'millisecond':
                    return Math.floor(days * 864e5) + milliseconds;
                default:
                    throw new Error('Unknown unit ' + units);
            }
        }
    }

    // TODO: Use this.as('ms')?
    function valueOf$1() {
        if (!this.isValid()) {
            return NaN;
        }
        return (
            this._milliseconds +
            this._days * 864e5 +
            (this._months % 12) * 2592e6 +
            toInt(this._months / 12) * 31536e6
        );
    }

    function makeAs(alias) {
        return function () {
            return this.as(alias);
        };
    }

    var asMilliseconds = makeAs('ms'),
        asSeconds = makeAs('s'),
        asMinutes = makeAs('m'),
        asHours = makeAs('h'),
        asDays = makeAs('d'),
        asWeeks = makeAs('w'),
        asMonths = makeAs('M'),
        asQuarters = makeAs('Q'),
        asYears = makeAs('y');

    function clone$1() {
        return createDuration(this);
    }

    function get$2(units) {
        units = normalizeUnits(units);
        return this.isValid() ? this[units + 's']() : NaN;
    }

    function makeGetter(name) {
        return function () {
            return this.isValid() ? this._data[name] : NaN;
        };
    }

    var milliseconds = makeGetter('milliseconds'),
        seconds = makeGetter('seconds'),
        minutes = makeGetter('minutes'),
        hours = makeGetter('hours'),
        days = makeGetter('days'),
        months = makeGetter('months'),
        years = makeGetter('years');

    function weeks() {
        return absFloor(this.days() / 7);
    }

    var round = Math.round,
        thresholds = {
            ss: 44, // a few seconds to seconds
            s: 45, // seconds to minute
            m: 45, // minutes to hour
            h: 22, // hours to day
            d: 26, // days to month/week
            w: null, // weeks to month
            M: 11, // months to year
        };

    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
        return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
    }

    function relativeTime$1(posNegDuration, withoutSuffix, thresholds, locale) {
        var duration = createDuration(posNegDuration).abs(),
            seconds = round(duration.as('s')),
            minutes = round(duration.as('m')),
            hours = round(duration.as('h')),
            days = round(duration.as('d')),
            months = round(duration.as('M')),
            weeks = round(duration.as('w')),
            years = round(duration.as('y')),
            a =
                (seconds <= thresholds.ss && ['s', seconds]) ||
                (seconds < thresholds.s && ['ss', seconds]) ||
                (minutes <= 1 && ['m']) ||
                (minutes < thresholds.m && ['mm', minutes]) ||
                (hours <= 1 && ['h']) ||
                (hours < thresholds.h && ['hh', hours]) ||
                (days <= 1 && ['d']) ||
                (days < thresholds.d && ['dd', days]);

        if (thresholds.w != null) {
            a =
                a ||
                (weeks <= 1 && ['w']) ||
                (weeks < thresholds.w && ['ww', weeks]);
        }
        a = a ||
            (months <= 1 && ['M']) ||
            (months < thresholds.M && ['MM', months]) ||
            (years <= 1 && ['y']) || ['yy', years];

        a[2] = withoutSuffix;
        a[3] = +posNegDuration > 0;
        a[4] = locale;
        return substituteTimeAgo.apply(null, a);
    }

    // This function allows you to set the rounding function for relative time strings
    function getSetRelativeTimeRounding(roundingFunction) {
        if (roundingFunction === undefined) {
            return round;
        }
        if (typeof roundingFunction === 'function') {
            round = roundingFunction;
            return true;
        }
        return false;
    }

    // This function allows you to set a threshold for relative time strings
    function getSetRelativeTimeThreshold(threshold, limit) {
        if (thresholds[threshold] === undefined) {
            return false;
        }
        if (limit === undefined) {
            return thresholds[threshold];
        }
        thresholds[threshold] = limit;
        if (threshold === 's') {
            thresholds.ss = limit - 1;
        }
        return true;
    }

    function humanize(argWithSuffix, argThresholds) {
        if (!this.isValid()) {
            return this.localeData().invalidDate();
        }

        var withSuffix = false,
            th = thresholds,
            locale,
            output;

        if (typeof argWithSuffix === 'object') {
            argThresholds = argWithSuffix;
            argWithSuffix = false;
        }
        if (typeof argWithSuffix === 'boolean') {
            withSuffix = argWithSuffix;
        }
        if (typeof argThresholds === 'object') {
            th = Object.assign({}, thresholds, argThresholds);
            if (argThresholds.s != null && argThresholds.ss == null) {
                th.ss = argThresholds.s - 1;
            }
        }

        locale = this.localeData();
        output = relativeTime$1(this, !withSuffix, th, locale);

        if (withSuffix) {
            output = locale.pastFuture(+this, output);
        }

        return locale.postformat(output);
    }

    var abs$1 = Math.abs;

    function sign(x) {
        return (x > 0) - (x < 0) || +x;
    }

    function toISOString$1() {
        // for ISO strings we do not use the normal bubbling rules:
        //  * milliseconds bubble up until they become hours
        //  * days do not bubble at all
        //  * months bubble up until they become years
        // This is because there is no context-free conversion between hours and days
        // (think of clock changes)
        // and also not between days and months (28-31 days per month)
        if (!this.isValid()) {
            return this.localeData().invalidDate();
        }

        var seconds = abs$1(this._milliseconds) / 1000,
            days = abs$1(this._days),
            months = abs$1(this._months),
            minutes,
            hours,
            years,
            s,
            total = this.asSeconds(),
            totalSign,
            ymSign,
            daysSign,
            hmsSign;

        if (!total) {
            // this is the same as C#'s (Noda) and python (isodate)...
            // but not other JS (goog.date)
            return 'P0D';
        }

        // 3600 seconds -> 60 minutes -> 1 hour
        minutes = absFloor(seconds / 60);
        hours = absFloor(minutes / 60);
        seconds %= 60;
        minutes %= 60;

        // 12 months -> 1 year
        years = absFloor(months / 12);
        months %= 12;

        // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
        s = seconds ? seconds.toFixed(3).replace(/\.?0+$/, '') : '';

        totalSign = total < 0 ? '-' : '';
        ymSign = sign(this._months) !== sign(total) ? '-' : '';
        daysSign = sign(this._days) !== sign(total) ? '-' : '';
        hmsSign = sign(this._milliseconds) !== sign(total) ? '-' : '';

        return (
            totalSign +
            'P' +
            (years ? ymSign + years + 'Y' : '') +
            (months ? ymSign + months + 'M' : '') +
            (days ? daysSign + days + 'D' : '') +
            (hours || minutes || seconds ? 'T' : '') +
            (hours ? hmsSign + hours + 'H' : '') +
            (minutes ? hmsSign + minutes + 'M' : '') +
            (seconds ? hmsSign + s + 'S' : '')
        );
    }

    var proto$2 = Duration.prototype;

    proto$2.isValid = isValid$1;
    proto$2.abs = abs;
    proto$2.add = add$1;
    proto$2.subtract = subtract$1;
    proto$2.as = as;
    proto$2.asMilliseconds = asMilliseconds;
    proto$2.asSeconds = asSeconds;
    proto$2.asMinutes = asMinutes;
    proto$2.asHours = asHours;
    proto$2.asDays = asDays;
    proto$2.asWeeks = asWeeks;
    proto$2.asMonths = asMonths;
    proto$2.asQuarters = asQuarters;
    proto$2.asYears = asYears;
    proto$2.valueOf = valueOf$1;
    proto$2._bubble = bubble;
    proto$2.clone = clone$1;
    proto$2.get = get$2;
    proto$2.milliseconds = milliseconds;
    proto$2.seconds = seconds;
    proto$2.minutes = minutes;
    proto$2.hours = hours;
    proto$2.days = days;
    proto$2.weeks = weeks;
    proto$2.months = months;
    proto$2.years = years;
    proto$2.humanize = humanize;
    proto$2.toISOString = toISOString$1;
    proto$2.toString = toISOString$1;
    proto$2.toJSON = toISOString$1;
    proto$2.locale = locale;
    proto$2.localeData = localeData;

    proto$2.toIsoString = deprecate(
        'toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)',
        toISOString$1
    );
    proto$2.lang = lang;

    // FORMATTING

    addFormatToken('X', 0, 0, 'unix');
    addFormatToken('x', 0, 0, 'valueOf');

    // PARSING

    addRegexToken('x', matchSigned);
    addRegexToken('X', matchTimestamp);
    addParseToken('X', function (input, array, config) {
        config._d = new Date(parseFloat(input) * 1000);
    });
    addParseToken('x', function (input, array, config) {
        config._d = new Date(toInt(input));
    });

    //! moment.js

    hooks.version = '2.29.4';

    setHookCallback(createLocal);

    hooks.fn = proto;
    hooks.min = min;
    hooks.max = max;
    hooks.now = now;
    hooks.utc = createUTC;
    hooks.unix = createUnix;
    hooks.months = listMonths;
    hooks.isDate = isDate;
    hooks.locale = getSetGlobalLocale;
    hooks.invalid = createInvalid;
    hooks.duration = createDuration;
    hooks.isMoment = isMoment;
    hooks.weekdays = listWeekdays;
    hooks.parseZone = createInZone;
    hooks.localeData = getLocale;
    hooks.isDuration = isDuration;
    hooks.monthsShort = listMonthsShort;
    hooks.weekdaysMin = listWeekdaysMin;
    hooks.defineLocale = defineLocale;
    hooks.updateLocale = updateLocale;
    hooks.locales = listLocales;
    hooks.weekdaysShort = listWeekdaysShort;
    hooks.normalizeUnits = normalizeUnits;
    hooks.relativeTimeRounding = getSetRelativeTimeRounding;
    hooks.relativeTimeThreshold = getSetRelativeTimeThreshold;
    hooks.calendarFormat = getCalendarFormat;
    hooks.prototype = proto;

    // currently HTML5 input type only supports 24-hour formats
    hooks.HTML5_FMT = {
        DATETIME_LOCAL: 'YYYY-MM-DDTHH:mm', // <input type="datetime-local" />
        DATETIME_LOCAL_SECONDS: 'YYYY-MM-DDTHH:mm:ss', // <input type="datetime-local" step="1" />
        DATETIME_LOCAL_MS: 'YYYY-MM-DDTHH:mm:ss.SSS', // <input type="datetime-local" step="0.001" />
        DATE: 'YYYY-MM-DD', // <input type="date" />
        TIME: 'HH:mm', // <input type="time" />
        TIME_SECONDS: 'HH:mm:ss', // <input type="time" step="1" />
        TIME_MS: 'HH:mm:ss.SSS', // <input type="time" step="0.001" />
        WEEK: 'GGGG-[W]WW', // <input type="week" />
        MONTH: 'YYYY-MM', // <input type="month" />
    };

    return hooks;

})));

},{}],11:[function(require,module,exports){
"use strict";
/**
 * Request objects hold information for a particular source (see sources for example)
 * This allows us to to use a generic api to make the calls against any source
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.urlEncodeObject = exports.convertTime = exports.Source = void 0;
class Source {
    constructor(cheerio) {
        this.cheerio = cheerio;
    }
    /**
     * @deprecated use {@link Source.getSearchResults getSearchResults} instead
     */
    searchRequest(query, metadata) {
        return this.getSearchResults(query, metadata);
    }
    /**
     * @deprecated use {@link Source.getSearchTags} instead
     */
    getTags() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // @ts-ignore
            return (_a = this.getSearchTags) === null || _a === void 0 ? void 0 : _a.call(this);
        });
    }
}
exports.Source = Source;
// Many sites use '[x] time ago' - Figured it would be good to handle these cases in general
function convertTime(timeAgo) {
    var _a;
    let time;
    let trimmed = Number(((_a = /\d*/.exec(timeAgo)) !== null && _a !== void 0 ? _a : [])[0]);
    trimmed = (trimmed == 0 && timeAgo.includes('a')) ? 1 : trimmed;
    if (timeAgo.includes('minutes')) {
        time = new Date(Date.now() - trimmed * 60000);
    }
    else if (timeAgo.includes('hours')) {
        time = new Date(Date.now() - trimmed * 3600000);
    }
    else if (timeAgo.includes('days')) {
        time = new Date(Date.now() - trimmed * 86400000);
    }
    else if (timeAgo.includes('year') || timeAgo.includes('years')) {
        time = new Date(Date.now() - trimmed * 31556952000);
    }
    else {
        time = new Date(Date.now());
    }
    return time;
}
exports.convertTime = convertTime;
/**
 * When a function requires a POST body, it always should be defined as a JsonObject
 * and then passed through this function to ensure that it's encoded properly.
 * @param obj
 */
function urlEncodeObject(obj) {
    let ret = {};
    for (const entry of Object.entries(obj)) {
        ret[encodeURIComponent(entry[0])] = encodeURIComponent(entry[1]);
    }
    return ret;
}
exports.urlEncodeObject = urlEncodeObject;

},{}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tracker = void 0;
class Tracker {
    constructor(cheerio) {
        this.cheerio = cheerio;
    }
}
exports.Tracker = Tracker;

},{}],13:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./Source"), exports);
__exportStar(require("./Tracker"), exports);

},{"./Source":11,"./Tracker":12}],14:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./base"), exports);
__exportStar(require("./models"), exports);
__exportStar(require("./APIWrapper"), exports);

},{"./APIWrapper":1,"./base":13,"./models":56}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],16:[function(require,module,exports){
arguments[4][15][0].apply(exports,arguments)
},{"dup":15}],17:[function(require,module,exports){
arguments[4][15][0].apply(exports,arguments)
},{"dup":15}],18:[function(require,module,exports){
arguments[4][15][0].apply(exports,arguments)
},{"dup":15}],19:[function(require,module,exports){
arguments[4][15][0].apply(exports,arguments)
},{"dup":15}],20:[function(require,module,exports){
arguments[4][15][0].apply(exports,arguments)
},{"dup":15}],21:[function(require,module,exports){
arguments[4][15][0].apply(exports,arguments)
},{"dup":15}],22:[function(require,module,exports){
arguments[4][15][0].apply(exports,arguments)
},{"dup":15}],23:[function(require,module,exports){
arguments[4][15][0].apply(exports,arguments)
},{"dup":15}],24:[function(require,module,exports){
arguments[4][15][0].apply(exports,arguments)
},{"dup":15}],25:[function(require,module,exports){
arguments[4][15][0].apply(exports,arguments)
},{"dup":15}],26:[function(require,module,exports){
arguments[4][15][0].apply(exports,arguments)
},{"dup":15}],27:[function(require,module,exports){
arguments[4][15][0].apply(exports,arguments)
},{"dup":15}],28:[function(require,module,exports){
arguments[4][15][0].apply(exports,arguments)
},{"dup":15}],29:[function(require,module,exports){
arguments[4][15][0].apply(exports,arguments)
},{"dup":15}],30:[function(require,module,exports){
arguments[4][15][0].apply(exports,arguments)
},{"dup":15}],31:[function(require,module,exports){
arguments[4][15][0].apply(exports,arguments)
},{"dup":15}],32:[function(require,module,exports){
arguments[4][15][0].apply(exports,arguments)
},{"dup":15}],33:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./Button"), exports);
__exportStar(require("./Form"), exports);
__exportStar(require("./Header"), exports);
__exportStar(require("./InputField"), exports);
__exportStar(require("./Label"), exports);
__exportStar(require("./Link"), exports);
__exportStar(require("./MultilineLabel"), exports);
__exportStar(require("./NavigationButton"), exports);
__exportStar(require("./OAuthButton"), exports);
__exportStar(require("./Section"), exports);
__exportStar(require("./Select"), exports);
__exportStar(require("./Switch"), exports);
__exportStar(require("./WebViewButton"), exports);
__exportStar(require("./FormRow"), exports);
__exportStar(require("./Stepper"), exports);

},{"./Button":18,"./Form":19,"./FormRow":20,"./Header":21,"./InputField":22,"./Label":23,"./Link":24,"./MultilineLabel":25,"./NavigationButton":26,"./OAuthButton":27,"./Section":28,"./Select":29,"./Stepper":30,"./Switch":31,"./WebViewButton":32}],34:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeSectionType = void 0;
var HomeSectionType;
(function (HomeSectionType) {
    HomeSectionType["singleRowNormal"] = "singleRowNormal";
    HomeSectionType["singleRowLarge"] = "singleRowLarge";
    HomeSectionType["doubleRow"] = "doubleRow";
    HomeSectionType["featured"] = "featured";
})(HomeSectionType = exports.HomeSectionType || (exports.HomeSectionType = {}));

},{}],35:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LanguageCode = void 0;
var LanguageCode;
(function (LanguageCode) {
    LanguageCode["UNKNOWN"] = "_unknown";
    LanguageCode["BENGALI"] = "bd";
    LanguageCode["BULGARIAN"] = "bg";
    LanguageCode["BRAZILIAN"] = "br";
    LanguageCode["CHINEESE"] = "cn";
    LanguageCode["CZECH"] = "cz";
    LanguageCode["GERMAN"] = "de";
    LanguageCode["DANISH"] = "dk";
    LanguageCode["ENGLISH"] = "gb";
    LanguageCode["SPANISH"] = "es";
    LanguageCode["FINNISH"] = "fi";
    LanguageCode["FRENCH"] = "fr";
    LanguageCode["WELSH"] = "gb";
    LanguageCode["GREEK"] = "gr";
    LanguageCode["CHINEESE_HONGKONG"] = "hk";
    LanguageCode["HUNGARIAN"] = "hu";
    LanguageCode["INDONESIAN"] = "id";
    LanguageCode["ISRELI"] = "il";
    LanguageCode["INDIAN"] = "in";
    LanguageCode["IRAN"] = "ir";
    LanguageCode["ITALIAN"] = "it";
    LanguageCode["JAPANESE"] = "jp";
    LanguageCode["KOREAN"] = "kr";
    LanguageCode["LITHUANIAN"] = "lt";
    LanguageCode["MONGOLIAN"] = "mn";
    LanguageCode["MEXIAN"] = "mx";
    LanguageCode["MALAY"] = "my";
    LanguageCode["DUTCH"] = "nl";
    LanguageCode["NORWEGIAN"] = "no";
    LanguageCode["PHILIPPINE"] = "ph";
    LanguageCode["POLISH"] = "pl";
    LanguageCode["PORTUGUESE"] = "pt";
    LanguageCode["ROMANIAN"] = "ro";
    LanguageCode["RUSSIAN"] = "ru";
    LanguageCode["SANSKRIT"] = "sa";
    LanguageCode["SAMI"] = "si";
    LanguageCode["THAI"] = "th";
    LanguageCode["TURKISH"] = "tr";
    LanguageCode["UKRAINIAN"] = "ua";
    LanguageCode["VIETNAMESE"] = "vn";
})(LanguageCode = exports.LanguageCode || (exports.LanguageCode = {}));

},{}],36:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MangaStatus = void 0;
var MangaStatus;
(function (MangaStatus) {
    MangaStatus[MangaStatus["ONGOING"] = 1] = "ONGOING";
    MangaStatus[MangaStatus["COMPLETED"] = 0] = "COMPLETED";
    MangaStatus[MangaStatus["UNKNOWN"] = 2] = "UNKNOWN";
    MangaStatus[MangaStatus["ABANDONED"] = 3] = "ABANDONED";
    MangaStatus[MangaStatus["HIATUS"] = 4] = "HIATUS";
})(MangaStatus = exports.MangaStatus || (exports.MangaStatus = {}));

},{}],37:[function(require,module,exports){
arguments[4][15][0].apply(exports,arguments)
},{"dup":15}],38:[function(require,module,exports){
arguments[4][15][0].apply(exports,arguments)
},{"dup":15}],39:[function(require,module,exports){
arguments[4][15][0].apply(exports,arguments)
},{"dup":15}],40:[function(require,module,exports){
arguments[4][15][0].apply(exports,arguments)
},{"dup":15}],41:[function(require,module,exports){
arguments[4][15][0].apply(exports,arguments)
},{"dup":15}],42:[function(require,module,exports){
arguments[4][15][0].apply(exports,arguments)
},{"dup":15}],43:[function(require,module,exports){
arguments[4][15][0].apply(exports,arguments)
},{"dup":15}],44:[function(require,module,exports){
arguments[4][15][0].apply(exports,arguments)
},{"dup":15}],45:[function(require,module,exports){
arguments[4][15][0].apply(exports,arguments)
},{"dup":15}],46:[function(require,module,exports){
arguments[4][15][0].apply(exports,arguments)
},{"dup":15}],47:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchOperator = void 0;
var SearchOperator;
(function (SearchOperator) {
    SearchOperator["AND"] = "AND";
    SearchOperator["OR"] = "OR";
})(SearchOperator = exports.SearchOperator || (exports.SearchOperator = {}));

},{}],48:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentRating = void 0;
/**
 * A content rating to be attributed to each source.
 */
var ContentRating;
(function (ContentRating) {
    ContentRating["EVERYONE"] = "EVERYONE";
    ContentRating["MATURE"] = "MATURE";
    ContentRating["ADULT"] = "ADULT";
})(ContentRating = exports.ContentRating || (exports.ContentRating = {}));

},{}],49:[function(require,module,exports){
arguments[4][15][0].apply(exports,arguments)
},{"dup":15}],50:[function(require,module,exports){
arguments[4][15][0].apply(exports,arguments)
},{"dup":15}],51:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagType = void 0;
/**
 * An enumerator which {@link SourceTags} uses to define the color of the tag rendered on the website.
 * Five types are available: blue, green, grey, yellow and red, the default one is blue.
 * Common colors are red for (Broken), yellow for (+18), grey for (Country-Proof)
 */
var TagType;
(function (TagType) {
    TagType["BLUE"] = "default";
    TagType["GREEN"] = "success";
    TagType["GREY"] = "info";
    TagType["YELLOW"] = "warning";
    TagType["RED"] = "danger";
})(TagType = exports.TagType || (exports.TagType = {}));

},{}],52:[function(require,module,exports){
arguments[4][15][0].apply(exports,arguments)
},{"dup":15}],53:[function(require,module,exports){
arguments[4][15][0].apply(exports,arguments)
},{"dup":15}],54:[function(require,module,exports){
arguments[4][15][0].apply(exports,arguments)
},{"dup":15}],55:[function(require,module,exports){
arguments[4][15][0].apply(exports,arguments)
},{"dup":15}],56:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./Chapter"), exports);
__exportStar(require("./ChapterDetails"), exports);
__exportStar(require("./HomeSection"), exports);
__exportStar(require("./Manga"), exports);
__exportStar(require("./MangaTile"), exports);
__exportStar(require("./RequestObject"), exports);
__exportStar(require("./SearchRequest"), exports);
__exportStar(require("./TagSection"), exports);
__exportStar(require("./SourceTag"), exports);
__exportStar(require("./Languages"), exports);
__exportStar(require("./Constants"), exports);
__exportStar(require("./MangaUpdate"), exports);
__exportStar(require("./PagedResults"), exports);
__exportStar(require("./ResponseObject"), exports);
__exportStar(require("./RequestManager"), exports);
__exportStar(require("./RequestHeaders"), exports);
__exportStar(require("./SourceInfo"), exports);
__exportStar(require("./SourceStateManager"), exports);
__exportStar(require("./RequestInterceptor"), exports);
__exportStar(require("./DynamicUI"), exports);
__exportStar(require("./TrackedManga"), exports);
__exportStar(require("./SourceManga"), exports);
__exportStar(require("./TrackedMangaChapterReadAction"), exports);
__exportStar(require("./TrackerActionQueue"), exports);
__exportStar(require("./SearchField"), exports);
__exportStar(require("./RawData"), exports);

},{"./Chapter":15,"./ChapterDetails":16,"./Constants":17,"./DynamicUI":33,"./HomeSection":34,"./Languages":35,"./Manga":36,"./MangaTile":37,"./MangaUpdate":38,"./PagedResults":39,"./RawData":40,"./RequestHeaders":41,"./RequestInterceptor":42,"./RequestManager":43,"./RequestObject":44,"./ResponseObject":45,"./SearchField":46,"./SearchRequest":47,"./SourceInfo":48,"./SourceManga":49,"./SourceStateManager":50,"./SourceTag":51,"./TagSection":52,"./TrackedManga":53,"./TrackedMangaChapterReadAction":54,"./TrackerActionQueue":55}],57:[function(require,module,exports){
"use strict";
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DesuME = exports.DesuMEInfo = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const DesuMEParser_1 = require("./DesuMEParser");
const moment_1 = __importDefault(require("moment"));
require("../scopes");
const DOMAIN = 'https://desu.me';
const API = `${DOMAIN}/manga/api`;
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36';
exports.DesuMEInfo = {
    version: '1.0.1',
    name: 'Desu',
    icon: 'icon.png',
    author: 'xOnlyFadi',
    authorWebsite: 'https://github.com/xOnlyFadi',
    description: 'Extension that pulls from desu.me.',
    contentRating: paperback_extensions_common_1.ContentRating.EVERYONE,
    websiteBaseURL: DOMAIN,
    language: paperback_extensions_common_1.LanguageCode.RUSSIAN,
    sourceTags: [
        {
            text: 'Notifications',
            type: paperback_extensions_common_1.TagType.GREEN
        },
        {
            text: 'Russian',
            type: paperback_extensions_common_1.TagType.GREY
        }
    ]
};
class DesuME extends paperback_extensions_common_1.Source {
    constructor() {
        super(...arguments);
        this.requestManager = createRequestManager({
            requestsPerSecond: 2,
            requestTimeout: 15000,
            interceptor: {
                interceptRequest: async (request) => {
                    request.headers = {
                        ...(request.headers ?? {}),
                        ...{
                            'user-agent': userAgent,
                            'referer': `${DOMAIN}/`
                        }
                    };
                    return request;
                },
                interceptResponse: async (response) => {
                    return response;
                }
            }
        });
        this.limit = 50;
    }
    getMangaShareUrl(mangaId) { return `${DOMAIN}/manga/${mangaId}`; }
    async getHomePageSections(sectionCallback) {
        const sections = [
            {
                request: createRequestObject({
                    url: `${API}/?limit=${this.limit}&order=popular&page=1`,
                    method: 'GET',
                }),
                section: createHomeSection({
                    id: 'popular',
                    title: 'популярный',
                    view_more: true,
                }),
            },
            {
                request: createRequestObject({
                    url: `${API}/?limit=${this.limit}&order=updated&page=1`,
                    method: 'GET',
                }),
                section: createHomeSection({
                    id: 'updated',
                    title: 'обновленный',
                    view_more: true,
                }),
            },
            {
                request: createRequestObject({
                    url: `${API}/?limit=${this.limit}&order=name&page=1`,
                    method: 'GET',
                }),
                section: createHomeSection({
                    id: 'name',
                    title: 'по алфавиту',
                    view_more: true,
                }),
            }
        ];
        const promises = [];
        for (const section of sections) {
            sectionCallback(section.section);
            promises.push(this.requestManager.schedule(section.request, 1).then(response => {
                this.CloudFlareError(response.status);
                let data;
                try {
                    data = JSON.parse(response.data);
                }
                catch (e) {
                    throw new Error(`${e}`);
                }
                section.section.items = (0, DesuMEParser_1.parseSearch)(data);
                sectionCallback(section.section);
            }));
        }
        await Promise.all(promises);
    }
    async getViewMoreItems(homepageSectionId, metadata) {
        const page = metadata?.page ?? 1;
        const request = createRequestObject({
            url: `${API}/?limit=${this.limit}&order=${homepageSectionId}&page=${page}`,
            method: 'GET',
        });
        const response = await this.requestManager.schedule(request, 1);
        this.CloudFlareError(response.status);
        let data;
        try {
            data = JSON.parse(response.data);
        }
        catch (e) {
            throw new Error(`${e}`);
        }
        const manga = (0, DesuMEParser_1.parseSearch)(data);
        metadata = data.pageNavParams.count > data.pageNavParams.page * data.pageNavParams.limit ? { page: page + 1 } : undefined;
        return createPagedResults({
            results: manga,
            metadata
        });
    }
    async getSearchResults(query, metadata) {
        const page = metadata?.page ?? 1;
        let url = `${API}/?limit=${this.limit}&page=${page}`;
        const Genres = [];
        const Types = [];
        const Order = [];
        query.includedTags?.map(x => {
            const id = x?.id;
            const SplittedID = id?.split('.')?.pop() ?? '';
            if (id.includes('genres.')) {
                Genres.push(SplittedID);
            }
            if (id.includes('types.')) {
                Types.push(SplittedID);
            }
            if (id.includes('order.')) {
                Order.push(SplittedID);
            }
        });
        if (query?.title) {
            url += `&search=${query?.title.replace(/ /g, '+').replace(/%20/g, '+')}`;
        }
        if (Genres.isNotEmpty()) {
            url += `&genres=${Genres.join(',')}`;
        }
        if (Types.isNotEmpty()) {
            url += `&kinds=${Types.join(',')}`;
        }
        if (Order.isNotEmpty()) {
            url += `&order=${Order[0]}`;
        }
        const request = createRequestObject({
            url: url,
            method: 'GET',
        });
        const response = await this.requestManager.schedule(request, 1);
        this.CloudFlareError(response.status);
        let data;
        try {
            data = JSON.parse(response.data);
        }
        catch (e) {
            throw new Error(`${e}`);
        }
        const manga = (0, DesuMEParser_1.parseSearch)(data);
        metadata = data.pageNavParams.count > data.pageNavParams.page * data.pageNavParams.limit ? { page: page + 1 } : undefined;
        return createPagedResults({
            results: manga,
            metadata
        });
    }
    async getMangaDetails(mangaId) {
        const request = createRequestObject({
            url: `${API}/${mangaId}`,
            method: 'GET',
        });
        const response = await this.requestManager.schedule(request, 1);
        this.CloudFlareError(response.status);
        let data;
        try {
            data = JSON.parse(response.data);
        }
        catch (e) {
            throw new Error(`${e}`);
        }
        return (0, DesuMEParser_1.parseMangaDetails)(data, mangaId);
    }
    async getChapters(mangaId) {
        const request = createRequestObject({
            url: `${API}/${mangaId}`,
            method: 'GET',
        });
        const response = await this.requestManager.schedule(request, 1);
        this.CloudFlareError(response.status);
        let data;
        try {
            data = JSON.parse(response.data);
        }
        catch (e) {
            throw new Error(`${e}`);
        }
        return (0, DesuMEParser_1.parseChapters)(data, mangaId);
    }
    async getChapterDetails(mangaId, chapterId) {
        const request = createRequestObject({
            url: `${API}/${mangaId}/chapter/${chapterId}`,
            method: 'GET',
        });
        const response = await this.requestManager.schedule(request, 1);
        this.CloudFlareError(response.status);
        let data;
        try {
            data = JSON.parse(response.data);
        }
        catch (e) {
            throw new Error(`${e}`);
        }
        return (0, DesuMEParser_1.parseChapterDetails)(data, mangaId, chapterId);
    }
    async filterUpdatedManga(mangaUpdatesFoundCallback, time, ids) {
        const updatedManga = [];
        let page = 0;
        while (page < 5) {
            const mangaToUpdate = [];
            const request = createRequestObject({
                url: `${API}/?limit=${this.limit}&order=updated&page=${page}`,
                method: 'GET',
            });
            const response = await this.requestManager.schedule(request, 1);
            this.CloudFlareError(response.status);
            let data;
            try {
                data = JSON.parse(response.data);
            }
            catch (e) {
                throw new Error(`${e}`);
            }
            for (const chapter of data.response) {
                const id = chapter.id ?? '';
                const chaptime = new Date(Number(chapter.chapters.updated.date) * 1000);
                const FormatedCurrentDate = (0, moment_1.default)(time).format('YYYY-MM-DD');
                const FormatedChapterDate = (0, moment_1.default)(chaptime).format('YYYY-MM-DD');
                if (!id)
                    continue;
                if (ids.includes(`${id}`) && !updatedManga.includes(`${id}`)) {
                    if (FormatedChapterDate === FormatedCurrentDate) {
                        mangaToUpdate.push(`${id}`);
                        updatedManga.push(`${id}`);
                    }
                }
            }
            page++;
            if (mangaToUpdate.length > 0) {
                mangaUpdatesFoundCallback(createMangaUpdates({
                    ids: mangaToUpdate
                }));
            }
        }
    }
    async getTags() {
        return (0, DesuMEParser_1.parseTags)();
    }
    CloudFlareError(status) {
        if (status == 503) {
            throw new Error('CLOUDFLARE BYPASS ERROR:\nPlease go to Settings > Sources > Desu and press Cloudflare Bypass or press the Cloud image on the right');
        }
    }
}
exports.DesuME = DesuME;

},{"../scopes":59,"./DesuMEParser":58,"moment":10,"paperback-extensions-common":14}],58:[function(require,module,exports){
"use strict";
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTags = exports.parseChapterDetails = exports.parseChapters = exports.parseMangaDetails = exports.parseSearch = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const entities_1 = require("entities");
require("../scopes");
const parseSearch = (data) => {
    const results = [];
    for (const obj of data.response) {
        const id = obj?.id ?? '';
        const title = obj?.name ?? '';
        const image = obj.image.original ? obj.image.original : '';
        const subtitle = obj?.chapters?.updated?.ch ?? '';
        if (!id)
            continue;
        results.push(createMangaTile({
            id: `${id}`,
            title: createIconText({ text: (0, entities_1.decodeHTML)(title) }),
            subtitleText: createIconText({ text: subtitle ? `Глава ${subtitle}` : '' }),
            image
        }));
    }
    return results;
};
exports.parseSearch = parseSearch;
const parseMangaDetails = (data, mangaId) => {
    const details = data.response;
    const titles = [];
    if (details?.name)
        titles.push(details?.name.trim());
    if (details?.russian)
        titles.push(details?.russian.trim());
    const image = details.image.original ? details.image.original : '';
    const author = details.authors ?? '';
    const arrayTags = [];
    if (details?.genres) {
        for (const category of details?.genres) {
            const id = category.text.replace(/ /g, '+').replace(/%20/g, '+') ?? '';
            const label = category?.russian ?? '';
            if (!id || !label)
                continue;
            arrayTags.push({
                id: `genres.${id}`,
                label
            });
        }
    }
    const tagSections = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })];
    let status = paperback_extensions_common_1.MangaStatus.ONGOING;
    if (details?.trans_status) {
        switch (details?.trans_status) {
            case 'continued':
                status = paperback_extensions_common_1.MangaStatus.ONGOING;
                break;
            case 'completed':
                status = paperback_extensions_common_1.MangaStatus.COMPLETED;
                break;
        }
    }
    else if (details?.status) {
        switch (details?.status) {
            case 'ongoing':
                status = paperback_extensions_common_1.MangaStatus.ONGOING;
                break;
            case 'released':
                status = paperback_extensions_common_1.MangaStatus.COMPLETED;
                break;
        }
    }
    return createManga({
        id: mangaId,
        titles,
        image: image,
        status: status,
        author: author,
        tags: tagSections,
        desc: details?.description ? details?.description : '',
        hentai: details.adult === 1
    });
};
exports.parseMangaDetails = parseMangaDetails;
const parseChapters = (data, mangaId) => {
    const chapters = [];
    let sortingIndex = 0;
    for (const chapter of data?.response?.chapters?.list) {
        const id = chapter?.id ?? '';
        const chapNum = chapter?.ch ? Number(chapter.ch) : 0;
        const chapVol = chapter?.ch ? Number(chapter.vol) : 0;
        const time = chapter?.date ? new Date(chapter?.date * 1000) ?? 0 : undefined;
        const name = chapter?.title ? chapter?.title : '';
        if (!id)
            continue;
        chapters.push(createChapter({
            id: `${id}`,
            mangaId,
            name,
            chapNum: chapNum ? chapNum : 0,
            volume: chapVol ? chapVol : 0,
            time: time,
            langCode: paperback_extensions_common_1.LanguageCode.RUSSIAN,
            // @ts-ignore
            sortingIndex
        }));
        sortingIndex--;
    }
    return chapters;
};
exports.parseChapters = parseChapters;
const parseChapterDetails = (data, mangaId, chapterId) => {
    const pages = [];
    for (const page of data.response.pages.list) {
        const url = page.img ?? '';
        if (!url)
            continue;
        pages.push(url);
    }
    return createChapterDetails({
        id: chapterId,
        mangaId: mangaId,
        pages: pages,
        longStrip: true
    });
};
exports.parseChapterDetails = parseChapterDetails;
const parseTags = () => {
    const Genres = [
        {
            label: 'Безумие',
            id: 'genres.Dementia'
        },
        {
            label: 'Боевые искусства',
            id: 'genres.Martial+Arts'
        },
        {
            label: 'В цвете',
            id: 'genres.Color'
        },
        {
            label: 'Вампиры',
            id: 'genres.Vampire'
        },
        {
            label: 'Веб',
            id: 'genres.Web'
        },
        {
            label: 'Гарем',
            id: 'genres.Harem'
        },
        {
            label: 'Героическое фэнтези',
            id: 'genres.Heroic+Fantasy'
        },
        {
            label: 'Демоны',
            id: 'genres.Demons'
        },
        {
            label: 'Детектив',
            id: 'genres.Mystery'
        },
        {
            label: 'Дзёсей',
            id: 'genres.Josei'
        },
        {
            label: 'Драма',
            id: 'genres.Drama'
        },
        {
            label: 'Ёнкома',
            id: 'genres.Yonkoma'
        },
        {
            label: 'Игры',
            id: 'genres.Game'
        },
        {
            label: 'Исекай',
            id: 'genres.Isekai'
        },
        {
            label: 'Исторический',
            id: 'genres.Historical'
        },
        {
            label: 'Комедия',
            id: 'genres.Comedy'
        },
        {
            label: 'Космос',
            id: 'genres.Space'
        },
        {
            label: 'ЛитRPG',
            id: 'genres.LitRPG'
        },
        {
            label: 'Магия',
            id: 'genres.Magic'
        },
        {
            label: 'Меха',
            id: 'genres.Mecha'
        },
        {
            label: 'Мистика',
            id: 'genres.Mystic'
        },
        {
            label: 'Музыка',
            id: 'genres.Music'
        },
        {
            label: 'Научная фантастика',
            id: 'genres.Sci-Fi'
        },
        {
            label: 'Пародия',
            id: 'genres.Parody'
        },
        {
            label: 'Повседневность',
            id: 'genres.Slice+of+Life'
        },
        {
            label: 'Постапокалиптика',
            id: 'genres.Post+Apocalyptic'
        },
        {
            label: 'Приключения',
            id: 'genres.Adventure'
        },
        {
            label: 'Психологическое',
            id: 'genres.Psychological'
        },
        {
            label: 'Романтика',
            id: 'genres.Romance'
        },
        {
            label: 'Самураи',
            id: 'genres.Samurai'
        },
        {
            label: 'Сверхъестественное',
            id: 'genres.Supernatural'
        },
        {
            label: 'Сёдзе',
            id: 'genres.Shoujo'
        },
        {
            label: 'Сёдзе Ай',
            id: 'genres.Shoujo+Ai'
        },
        {
            label: 'Сейнен',
            id: 'genres.Seinen'
        },
        {
            label: 'Сёнен',
            id: 'genres.Shounen'
        },
        {
            label: 'Сёнен Ай',
            id: 'genres.Shounen+Ai'
        },
        {
            label: 'Смена пола',
            id: 'genres.Gender+Bender'
        },
        {
            label: 'Спорт',
            id: 'genres.Sports'
        },
        {
            label: 'Супер сила',
            id: 'genres.Super+Power'
        },
        {
            label: 'Трагедия',
            id: 'genres.Tragedy'
        },
        {
            label: 'Триллер',
            id: 'genres.Thriller'
        },
        {
            label: 'Ужасы',
            id: 'genres.Horror'
        },
        {
            label: 'Фантастика',
            id: 'genres.Fiction'
        },
        {
            label: 'Фэнтези',
            id: 'genres.Fantasy'
        },
        {
            label: 'Хентай',
            id: 'genres.Hentai'
        },
        {
            label: 'Школа',
            id: 'genres.School'
        },
        {
            label: 'Экшен',
            id: 'genres.Action'
        },
        {
            label: 'Этти',
            id: 'genres.Ecchi'
        },
        {
            label: 'Юри',
            id: 'genres.Yuri'
        },
        {
            label: 'Яой',
            id: 'genres.Yaoi'
        }
    ];
    const Types = [
        {
            label: 'Манга',
            id: 'types.manga'
        },
        {
            label: 'Манхва',
            id: 'types.manhwa'
        },
        {
            label: 'Маньхуа',
            id: 'types.manhua'
        },
        {
            label: 'Ваншот',
            id: 'types.one_shot'
        },
        {
            label: 'Комикс',
            id: 'types.comics'
        }
    ];
    const Order = [
        {
            label: 'Популярность',
            id: 'order.popular'
        },
        {
            label: 'Дата',
            id: 'order.updated'
        },
        {
            label: 'Имя',
            id: 'order.name'
        }
    ];
    return [
        createTagSection({ id: 'genres', label: 'Жанр', tags: Genres.map(x => createTag(x)) }),
        createTagSection({ id: 'types', label: 'Тип', tags: Types.map(x => createTag(x)) }),
        createTagSection({ id: 'order', label: 'Сортировка', tags: Order.map(x => createTag(x)) }),
    ];
};
exports.parseTags = parseTags;

},{"../scopes":59,"entities":9,"paperback-extensions-common":14}],59:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
String.prototype.substringAfterLast = function (substring) {
    const lastIndexOfCharacter = this?.lastIndexOf(substring);
    return this?.substring(lastIndexOfCharacter + 1, this?.length + 1);
};
String.prototype.substringBeforeLast = function (substring) {
    const lastIndexOfCharacter = this?.lastIndexOf(substring);
    return this?.substring(0, lastIndexOfCharacter);
};
String.prototype.substringAfterFirst = function (substring) {
    const startingIndexOfSubstring = this?.indexOf(substring);
    const endIndexOfSubstring = startingIndexOfSubstring + substring?.length - 1;
    return this?.substring(endIndexOfSubstring + 1, this?.length);
};
String.prototype.substringBeforeFirst = function (substring) {
    const startingIndexOfSubstring = this?.indexOf(substring);
    return this?.substring(0, startingIndexOfSubstring);
};
String.prototype.removePrefix = function (prefix) {
    if (this?.startsWith(prefix)) {
        return this?.substring(prefix?.length, this?.length);
    }
    return this?.substring(0, this?.length);
};
String.prototype.removeSuffix = function (suffix) {
    if (this?.endsWith(suffix)) {
        return this?.substring(0, this?.length - suffix?.length);
    }
    return this?.substring(0, this?.length);
};
String.prototype.removeSurrounding = function (prefix, suffix) {
    if ((this?.length >= prefix?.length + suffix?.length) && this?.startsWith(prefix) && this?.endsWith(suffix)) {
        return this?.substring(prefix?.length, this?.length - suffix?.length);
    }
    return this?.substring(0, this?.length);
};
String.prototype.isEmpty = function () {
    return this?.length == 0;
};
String.prototype.isNotEmpty = function () {
    return this?.length > 0;
};
Array.prototype.isEmpty = function () {
    return this?.length == 0;
};
Array.prototype.isNotEmpty = function () {
    return this?.length > 0;
};
Array.prototype.first = function () {
    if (this?.isEmpty())
        throw new Error('List is empty');
    return this?.[0];
};

},{}]},{},[57])(57)
});
