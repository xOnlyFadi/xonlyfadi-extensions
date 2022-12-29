(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Sources = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tracker = void 0;
class Tracker {
    constructor(cheerio) {
        this.cheerio = cheerio;
    }
}
exports.Tracker = Tracker;

},{}],4:[function(require,module,exports){
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

},{"./Source":2,"./Tracker":3}],5:[function(require,module,exports){
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

},{"./APIWrapper":1,"./base":4,"./models":47}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],7:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],8:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],9:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],10:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],11:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],12:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],13:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],14:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],15:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],16:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],17:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],18:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],19:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],20:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],21:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],22:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],23:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],24:[function(require,module,exports){
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

},{"./Button":9,"./Form":10,"./FormRow":11,"./Header":12,"./InputField":13,"./Label":14,"./Link":15,"./MultilineLabel":16,"./NavigationButton":17,"./OAuthButton":18,"./Section":19,"./Select":20,"./Stepper":21,"./Switch":22,"./WebViewButton":23}],25:[function(require,module,exports){
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

},{}],26:[function(require,module,exports){
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

},{}],27:[function(require,module,exports){
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

},{}],28:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],29:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],30:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],31:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],32:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],33:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],34:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],35:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],36:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],37:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],38:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchOperator = void 0;
var SearchOperator;
(function (SearchOperator) {
    SearchOperator["AND"] = "AND";
    SearchOperator["OR"] = "OR";
})(SearchOperator = exports.SearchOperator || (exports.SearchOperator = {}));

},{}],39:[function(require,module,exports){
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

},{}],40:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],41:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],42:[function(require,module,exports){
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

},{}],43:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],44:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],45:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],46:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],47:[function(require,module,exports){
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

},{"./Chapter":6,"./ChapterDetails":7,"./Constants":8,"./DynamicUI":24,"./HomeSection":25,"./Languages":26,"./Manga":27,"./MangaTile":28,"./MangaUpdate":29,"./PagedResults":30,"./RawData":31,"./RequestHeaders":32,"./RequestInterceptor":33,"./RequestManager":34,"./RequestObject":35,"./ResponseObject":36,"./SearchField":37,"./SearchRequest":38,"./SourceInfo":39,"./SourceManga":40,"./SourceStateManager":41,"./SourceTag":42,"./TagSection":43,"./TrackedManga":44,"./TrackedMangaChapterReadAction":45,"./TrackerActionQueue":46}],48:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VyvyManga = exports.VyvyMangaInfo = void 0;
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
const paperback_extensions_common_1 = require("paperback-extensions-common");
const VyvyMangaParser_1 = require("./VyvyMangaParser");
const VyvyManga_Base = 'https://vyvymanga.net';
exports.VyvyMangaInfo = {
    author: 'xOnlyFadi',
    description: 'Extension that pulls manga from vyvymanga.net',
    icon: 'icon.png',
    name: 'VyvyManga',
    version: '1.0.7',
    authorWebsite: 'https://github.com/xOnlyFadi',
    websiteBaseURL: VyvyManga_Base,
    contentRating: paperback_extensions_common_1.ContentRating.ADULT,
    language: paperback_extensions_common_1.LanguageCode.ENGLISH,
    sourceTags: [
        {
            text: '18+',
            type: paperback_extensions_common_1.TagType.RED
        }
    ]
};
class VyvyManga extends paperback_extensions_common_1.Source {
    constructor() {
        super(...arguments);
        this.parser = new VyvyMangaParser_1.Parser();
        this.baseUrl = VyvyManga_Base;
        this.requestManager = createRequestManager({
            requestsPerSecond: 3,
            requestTimeout: 30000,
            interceptor: {
                interceptRequest: async (request) => {
                    request.headers = {
                        ...(request.headers ?? {}),
                        ...{
                            'referer': `${VyvyManga_Base}/`,
                            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.134 Safari/537.36'
                        }
                    };
                    return request;
                },
                interceptResponse: async (response) => {
                    return response;
                }
            }
        });
    }
    getMangaShareUrl(mangaId) {
        return `${VyvyManga_Base}/manga/${mangaId}`;
    }
    async getHomePageSections(sectionCallback) {
        const options = createRequestObject({
            url: `${VyvyManga_Base}`,
            method: 'GET'
        });
        const response = await this.requestManager.schedule(options, 1);
        this.CloudFlareError(response.status);
        const $ = this.cheerio.load(response.data);
        return this.parser.parseHomeSections($, sectionCallback, this);
    }
    async getViewMoreItems(homepageSectionId, metadata) {
        const page = metadata?.page ?? 1;
        let param = '';
        switch (homepageSectionId) {
            case '1':
                param = `/search?page=${page}`;
                break;
            case '2':
                param = `/search?sort=updated_at&page=${page}`;
                break;
            case '3':
                param = `/search?sort=created_at&page=${page}`;
                break;
            default:
                throw new Error(`Invalid homeSectionId | ${homepageSectionId}`);
        }
        const request = createRequestObject({
            url: VyvyManga_Base,
            method: 'GET',
            param
        });
        const response = await this.requestManager.schedule(request, 1);
        const $ = this.cheerio.load(response.data);
        const manga = this.parser.parseSearchResults($);
        metadata = manga.length < 36 ? undefined : { page: page + 1 };
        return createPagedResults({
            results: manga,
            metadata
        });
    }
    async getTags() {
        const options = createRequestObject({
            url: `${VyvyManga_Base}/search`,
            method: 'GET'
        });
        const response = await this.requestManager.schedule(options, 1);
        this.CloudFlareError(response.status);
        const $ = this.cheerio.load(response.data);
        return [createTagSection({
                id: '1',
                label: 'Genres',
                tags: this.parser.parseTags($)
            })];
    }
    async getMangaDetails(mangaId) {
        const options = createRequestObject({
            url: `${VyvyManga_Base}/manga/${mangaId}`,
            method: 'GET',
        });
        const response = await this.requestManager.schedule(options, 1);
        this.CloudFlareError(response.status);
        const $ = this.cheerio.load(response.data);
        return this.parser.parseMangaDetails($, mangaId, this);
    }
    async getChapters(mangaId) {
        const options = createRequestObject({
            url: `${VyvyManga_Base}/manga/${mangaId}`,
            method: 'GET'
        });
        const response = await this.requestManager.schedule(options, 1);
        this.CloudFlareError(response.status);
        const $ = this.cheerio.load(response.data);
        return this.parser.parseChapters($, mangaId, this);
    }
    async getChapterDetails(mangaId, chapterId) {
        const options = createRequestObject({
            url: `${chapterId}`,
            method: 'GET'
        });
        const response = await this.requestManager.schedule(options, 1);
        this.CloudFlareError(response.status);
        const $ = this.cheerio.load(response.data);
        return this.parser.parseChapterDetails($, mangaId, chapterId);
    }
    async getSearchResults(query, metadata) {
        const page = metadata?.page ?? 1;
        let request;
        const firstTag = query?.includedTags?.map((x) => x.id)[0] ?? [];
        if (firstTag.includes('details.')) {
            request = createRequestObject({
                url: encodeURI(`${VyvyManga_Base}/genre/${firstTag.split('.')[1]}`),
                method: 'GET'
            });
        }
        else {
            request = createRequestObject({
                url: encodeURI(`${VyvyManga_Base}/search?q=${query?.title?.replace(/%20/g, '+').replace(/ /g, '+') ?? ''}&completed=&sort=viewed${query?.includedTags?.map((x) => '&genre[]=' + x.id)}`),
                method: 'GET'
            });
        }
        const data = await this.requestManager.schedule(request, 2);
        this.CloudFlareError(data.status);
        const $ = this.cheerio.load(data.data);
        const manga = this.parser.parseSearchResults($);
        metadata = manga.length < 36 ? undefined : { page: page + 1 };
        return createPagedResults({
            results: manga,
            metadata
        });
    }
    CloudFlareError(status) {
        if (status == 503) {
            throw new Error('CLOUDFLARE BYPASS ERROR:\nPlease go to Settings > Sources > VyvyManga and press Cloudflare Bypass or press the Cloud image on the right');
        }
    }
}
exports.VyvyManga = VyvyManga;

},{"./VyvyMangaParser":49,"paperback-extensions-common":5}],49:[function(require,module,exports){
"use strict";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
class Parser {
    constructor() {
        this.chapterTitleRegex = /Chapter ([\d.]+)/i;
        // taken from TheNetSky/extension-generic/Madara on Github
        this.parseDate = (date) => {
            date = date.toUpperCase();
            let time;
            const number = Number((/\d*/.exec(date) ?? [])[0]);
            if (date.includes('LESS THAN AN HOUR') || date.includes('JUST NOW')) {
                time = new Date(Date.now());
            }
            else if (date.includes('YEAR') || date.includes('YEARS')) {
                time = new Date(Date.now() - (number * 31556952000));
            }
            else if (date.includes('MONTH') || date.includes('MONTHS')) {
                time = new Date(Date.now() - (number * 2592000000));
            }
            else if (date.includes('WEEK') || date.includes('WEEKS')) {
                time = new Date(Date.now() - (number * 604800000));
            }
            else if (date.includes('YESTERDAY')) {
                time = new Date(Date.now() - 86400000);
            }
            else if (date.includes('DAY') || date.includes('DAYS')) {
                time = new Date(Date.now() - (number * 86400000));
            }
            else if (date.includes('HOUR') || date.includes('HOURS')) {
                time = new Date(Date.now() - (number * 3600000));
            }
            else if (date.includes('MINUTE') || date.includes('MINUTES')) {
                time = new Date(Date.now() - (number * 60000));
            }
            else if (date.includes('SECOND') || date.includes('SECONDS')) {
                time = new Date(Date.now() - (number * 1000));
            }
            else {
                time = new Date(date);
            }
            return time;
        };
    }
    decodeHTMLEntity(str) {
        return str.replace(/&#(\d+)/g, (_match, dec) => {
            return String.fromCharCode(dec);
        });
    }
    async parseHomeSections($, sectionCallback, _source) {
        const section1 = createHomeSection({ id: '1', title: 'Most Popular Manga', view_more: true });
        const section2 = createHomeSection({ id: '2', title: 'Latest', view_more: true });
        const section3 = createHomeSection({ id: '3', title: 'New Releases', view_more: true });
        const popular = [];
        const latest = [];
        const newManga = [];
        const arrPopular = $('.slick-manga .comic-item').toArray();
        const arrLatest = $('.comic-item', $('.col-lg-8 h4.home-title:contains(\'Lastest Update\')').next()).toArray();
        const arrNewRel = $('.comic-item', $('.col-lg-8 h4.home-title:contains(\'New Release\')').next()).toArray();
        for (const obj of arrPopular) {
            const id = $('a', obj).attr('href')?.split('/')?.pop() ?? '';
            const title = this.decodeHTMLEntity($('.comic-title', obj).text().trim()) ?? '';
            const image = $('.comic-image', obj).attr('data-background-image') ?? '';
            const subTitle = $('.tray-item', obj).text().trim() ?? '';
            popular.push(createMangaTile({
                id,
                image,
                title: createIconText({ text: this.decodeHTMLEntity(title) }),
                subtitleText: createIconText({ text: subTitle }),
            }));
        }
        section1.items = popular;
        sectionCallback(section1);
        for (const obj of arrLatest) {
            const id = $('a', obj).attr('href')?.split('/')?.pop() ?? '';
            const title = this.decodeHTMLEntity($('.comic-title', obj).text().trim()) ?? '';
            const image = $('.comic-image', obj).attr('data-background-image') ?? '';
            const subTitle = $('.tray-item', obj).text().trim() ?? '';
            latest.push(createMangaTile({
                id,
                image,
                title: createIconText({ text: this.decodeHTMLEntity(title) }),
                subtitleText: createIconText({ text: subTitle }),
            }));
        }
        section2.items = latest;
        sectionCallback(section2);
        for (const obj of arrNewRel) {
            const id = $('a', obj).attr('href')?.split('/')?.pop() ?? '';
            const title = this.decodeHTMLEntity($('.comic-title', obj).text().trim()) ?? '';
            const image = $('.comic-image', obj).attr('data-background-image') ?? '';
            const subTitle = $('.tray-item', obj).text().trim() ?? '';
            newManga.push(createMangaTile({
                id,
                image,
                title: createIconText({ text: this.decodeHTMLEntity(title) }),
                subtitleText: createIconText({ text: subTitle }),
            }));
        }
        section3.items = newManga;
        sectionCallback(section3);
    }
    parseChapterDetails($, mangaId, chapterId) {
        const pages = [];
        for (const obj of $('.col-lg-8 .carousel-item img').toArray()) {
            const page = this.getImageSrc($(obj));
            if (!page) {
                throw new Error(`Could not parse page for ${chapterId}`);
            }
            pages.push(page);
        }
        return createChapterDetails({
            id: chapterId,
            mangaId: mangaId,
            pages: pages,
            longStrip: true
        });
    }
    parseChapters($, mangaId, _source) {
        const chapters = [];
        const arrChapters = $('.div-chapter .list-group a').toArray();
        for (const obj of arrChapters) {
            let url = $(obj).attr('href') ?? '';
            if (url.startsWith('/'))
                url = 'https:' + url;
            const time = this.parseDate($('.text-right', obj).text().trim() ?? '');
            const name = this.decodeHTMLEntity($('span', obj).first().text().trim() ?? '');
            const chapNumRegex = name.match(this.chapterTitleRegex);
            let chapNum = 0;
            if (chapNumRegex && chapNumRegex[1])
                chapNum = Number(chapNumRegex[1]);
            chapters.push(createChapter({
                id: url,
                mangaId: mangaId,
                name: name,
                chapNum: !isNaN(chapNum) ? chapNum : NaN,
                time: time,
                langCode: paperback_extensions_common_1.LanguageCode.ENGLISH
            }));
        }
        return chapters;
    }
    parseMangaDetails($, mangaId, _source) {
        const details = $('.col-lg-8');
        const title = this.decodeHTMLEntity($('.col-md-7 .title', details).first().text().trim() ?? '');
        const image = this.getImageSrc($('.col-md-5 img', details));
        let desc = $('.summary .content').first().children().remove().end().text().replaceAll(/\s{2,}/g, ' ').trim() ?? '';
        if (desc == '')
            desc = 'No Decscription provided by the source (VyvyManga)';
        let author = '';
        let artist = '';
        let status = '';
        let views = '';
        const arrayTags = [];
        const info = $('.col-md-7 p', details).toArray();
        for (const obj of info) {
            const label = $('.pre-title', obj).first().children().remove().end().text().replace(/\s{2,}/, ' ').trim().toLowerCase();
            switch (label) {
                case 'author':
                case 'authors':
                case 'author(s)':
                    $('span', obj).remove().end().text().replace(/\s{2,}/, ' ').trim();
                    author = $(obj).text().trim();
                    break;
                case 'artist':
                case 'artists':
                case 'artist(s)':
                    $('span', obj).remove().end().text().replace(/\s{2,}/, ' ').trim();
                    artist = $(obj).text().trim();
                    break;
                case 'views':
                    $('span', obj).remove().end().text().replace(/\s{2,}/, ' ').trim();
                    views = $(obj).text().trim();
                    break;
                case 'status':
                    $('span', obj).remove().end().text().replace(/\s{2,}/, ' ').trim();
                    status = $(obj).text().trim();
                    break;
                case 'genres':
                    $('span', obj).remove().end().text().replace(/\s{2,}/, ' ').trim();
                    for (const genreobj of $('a', obj).toArray()) {
                        const id = $(genreobj)?.attr('href')?.split('/')?.pop() ?? '';
                        const label = $(genreobj).text() ?? '';
                        if (!id || !label)
                            continue;
                        arrayTags.push({
                            id: `details.${id}`,
                            label: label
                        });
                    }
                    break;
            }
        }
        const tagSections = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map((x) => createTag(x)) })];
        return createManga({
            id: mangaId,
            titles: [title],
            image,
            status: this.parseStatus(status),
            views: Number(views),
            author,
            artist,
            tags: tagSections,
            desc: this.decodeHTMLEntity(desc),
        });
    }
    parseTags($) {
        const genres = [];
        for (const obj of $('#advance-search .check-genre .form-check').toArray()) {
            const label = $('label', obj).text().trim();
            const id = encodeURI($('input', obj).attr('value') ?? '');
            if (!label || !id)
                continue;
            genres.push(createTag({
                id,
                label
            }));
        }
        return genres;
    }
    parseSearchResults($) {
        const results = [];
        for (const obj of $('.row .col-lg-2').toArray()) {
            const id = $('a', obj).attr('href')?.split('/')?.pop() ?? '';
            const title = this.decodeHTMLEntity($('.comic-title', obj).text().trim()) ?? '';
            const image = $('.comic-image', obj).attr('data-background-image') ?? '';
            const subTitle = $('.tray-item', obj).text().trim() ?? '';
            if (!id)
                continue;
            results.push(createMangaTile({
                id,
                image,
                title: createIconText({ text: this.decodeHTMLEntity(title) }),
                subtitleText: createIconText({ text: subTitle }),
            }));
        }
        return results;
    }
    idCleaner(str, source) {
        const base = source.baseUrl.split('://').pop();
        str = str.replace(/(https:\/\/|http:\/\/)/, '');
        str = str.replace(/\/$/, '');
        str = str.replace(`${base}/`, '');
        str = str.replace('/single/', '');
        return str;
    }
    parseStatus(str) {
        let status = paperback_extensions_common_1.MangaStatus.UNKNOWN;
        switch (str.toLowerCase()) {
            case 'ongoing':
                status = paperback_extensions_common_1.MangaStatus.ONGOING;
                break;
            case 'completed':
                status = paperback_extensions_common_1.MangaStatus.COMPLETED;
                break;
        }
        return status;
    }
    getImageSrc(imageObj) {
        let image;
        if (typeof imageObj?.attr('data-src') != 'undefined') {
            image = imageObj?.attr('data-src');
        }
        else if (typeof imageObj?.attr('data-lazy-src') != 'undefined') {
            image = imageObj?.attr('data-lazy-src');
        }
        else if (typeof imageObj?.attr('srcset') != 'undefined') {
            image = imageObj?.attr('srcset')?.split(' ')[0] ?? '';
        }
        else if (typeof imageObj?.attr('src') != 'undefined') {
            image = imageObj?.attr('src');
        }
        else {
            image = 'https://paperback.moe/icons/logo-alt.svg';
        }
        return encodeURI(decodeURI(this.decodeHTMLEntity(image?.trim() ?? '')));
    }
}
exports.Parser = Parser;

},{"paperback-extensions-common":5}]},{},[48])(48)
});
