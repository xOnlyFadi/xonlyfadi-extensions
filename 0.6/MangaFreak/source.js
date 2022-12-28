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
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MangaFreak = exports.MangaFreakInfo = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const MangaFreakParser_1 = require("./MangaFreakParser");
const MangaFreak_BASE = 'https://w14.mangafreak.net';
const MangaFreak_CDN = 'https://images.mangafreak.net';
const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 12_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Safari/605.1.15';
exports.MangaFreakInfo = {
    author: 'xOnlyFadi',
    description: 'Extension that pulls manga from mangafreak.net',
    icon: 'icon.png',
    name: 'MangaFreak',
    version: '1.0.4',
    authorWebsite: 'https://github.com/xOnlyFadi',
    websiteBaseURL: MangaFreak_BASE,
    contentRating: paperback_extensions_common_1.ContentRating.EVERYONE,
    language: paperback_extensions_common_1.LanguageCode.ENGLISH,
    sourceTags: [
        {
            text: 'Cloudflare',
            type: paperback_extensions_common_1.TagType.RED
        }
    ]
};
class MangaFreak extends paperback_extensions_common_1.Source {
    constructor() {
        super(...arguments);
        this.parser = new MangaFreakParser_1.Parser();
        this.baseUrl = MangaFreak_BASE;
        this.baseCdn = MangaFreak_CDN;
        this.requestManager = createRequestManager({
            requestsPerSecond: 3,
            requestTimeout: 45000,
            interceptor: {
                interceptRequest: async (request) => {
                    request.headers = {
                        ...(request.headers ?? {}),
                        ...{
                            'user-agent': userAgent,
                            'referer': `${MangaFreak_BASE}/`
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
        return `${MangaFreak_BASE}/Manga/${mangaId}`;
    }
    getCloudflareBypassRequest() {
        return createRequestObject({
            url: `${MangaFreak_BASE}/Genre`,
            method: 'GET',
            headers: {
                'user-agent': userAgent
            }
        });
    }
    async getHomePageSections(sectionCallback) {
        const request = createRequestObject({
            url: `${MangaFreak_BASE}/`,
            method: 'GET'
        });
        const response = await this.requestManager.schedule(request, 1);
        const $ = this.cheerio.load(response.data);
        this.CloudFlareError(response.status);
        return this.parser.parseHomeSections($, sectionCallback, this);
    }
    async getViewMoreItems(homepageSectionId, metadata) {
        const page = metadata?.page ?? 1;
        let param = '';
        let isPopular = false;
        switch (homepageSectionId) {
            case 'popular':
                param = `Genre/All/${page}`;
                isPopular = true;
                break;
            case 'today_manga':
                param = `Latest_Releases/${page}`;
                break;
            default:
                throw new Error(`Invalid homeSectionId | ${homepageSectionId}`);
        }
        const request = createRequestObject({
            url: `${MangaFreak_BASE}/${param}`,
            method: 'GET',
        });
        const response = await this.requestManager.schedule(request, 1);
        const $ = this.cheerio.load(response.data);
        this.CloudFlareError(response.status);
        const manga = this.parser.ViewMoreParse($, this, isPopular);
        metadata = this.parser.NextPage($) ? { page: page + 1 } : undefined;
        return createPagedResults({
            results: manga,
            metadata
        });
    }
    async getSearchTags() {
        const request = createRequestObject({
            url: `${MangaFreak_BASE}/Search`,
            method: 'GET'
        });
        const response = await this.requestManager.schedule(request, 1);
        this.CloudFlareError(response.status);
        const $ = this.cheerio.load(response.data);
        return this.parser.parseTags($);
    }
    async getMangaDetails(mangaId) {
        const request = createRequestObject({
            url: `${MangaFreak_BASE}/Manga/${mangaId}`,
            method: 'GET',
        });
        const response = await this.requestManager.schedule(request, 1);
        this.CloudFlareError(response.status);
        const $ = this.cheerio.load(response.data);
        return this.parser.parseMangaDetails($, mangaId, this);
    }
    async getChapters(mangaId) {
        const request = createRequestObject({
            url: `${MangaFreak_BASE}/Manga/${mangaId}`,
            method: 'GET'
        });
        const response = await this.requestManager.schedule(request, 1);
        this.CloudFlareError(response.status);
        const $ = this.cheerio.load(response.data);
        return this.parser.parseChapters($, mangaId);
    }
    async getChapterDetails(mangaId, chapterId) {
        const request = createRequestObject({
            url: `${MangaFreak_BASE}/${chapterId}`,
            method: 'GET'
        });
        const response = await this.requestManager.schedule(request, 1);
        this.CloudFlareError(response.status);
        const $ = this.cheerio.load(response.data);
        return this.parser.parseChapterDetails($, mangaId, chapterId);
    }
    async getSearchResults(query, metadata) {
        const page = metadata?.page ?? 1;
        let UsesDeatils = false;
        let request;
        if (query.includedTags?.length === 0) {
            request = createRequestObject({
                url: `${MangaFreak_BASE}/Search/${query?.title?.replace(/%20/g, '+').replace(/ /g, '+') ?? ''}`,
                method: 'GET',
            });
        }
        else {
            const GenreDeatils = [];
            const SelectedTags = [];
            const UnSelectedTags = [];
            const Status = [];
            const Types = [];
            query.includedTags?.map(x => {
                const id = x.id;
                const SplittedID = id?.split('.')?.pop() ?? '';
                if (id.includes('details.')) {
                    GenreDeatils.push(SplittedID);
                }
                if (query.includedTags?.length === 1 && id.includes('genre.')) {
                    GenreDeatils.push(SplittedID);
                }
                if (id.includes('genre.')) {
                    SelectedTags.push(SplittedID);
                }
                if (id.includes('status.')) {
                    Status.push(SplittedID);
                }
                if (id.includes('types.')) {
                    Types.push(SplittedID);
                }
            });
            query.excludedTags?.map(x => {
                const id = x.id;
                const SplittedID = id?.split('.')?.pop() ?? '';
                if (id.includes('genre.')) {
                    UnSelectedTags.push(SplittedID);
                }
            });
            if (GenreDeatils.length === 1) {
                request = createRequestObject({
                    url: `${MangaFreak_BASE}/Genre/${GenreDeatils[0]}/${page}`,
                    method: 'GET'
                });
                UsesDeatils = true;
            }
            else {
                if (!query.title) {
                    throw new Error('Do not use genre with multipule tags search without putting a title or the search will infinitely loop');
                }
                const genres = ['/Genre/'];
                for (const tag of (await this.getSearchTags())[0]?.tags ?? []) {
                    const SplittedID = tag.id?.split('.')?.pop() ?? '';
                    if (SelectedTags?.includes(SplittedID)) {
                        genres.push('1');
                    }
                    else if (UnSelectedTags?.includes(SplittedID)) {
                        genres.push('2');
                    }
                    else {
                        genres.push('0');
                    }
                }
                request = createRequestObject({
                    url: `${MangaFreak_BASE}/Search/${query?.title?.replace(/%20/g, '+').replace(/ /g, '+') ?? ''}${genres.join('')}/Status/${Status.length !== 0 ? Status[0] : '0'}/Type/${Types.length !== 0 ? Types[0] : '0'}`,
                    method: 'GET',
                });
            }
        }
        const data = await this.requestManager.schedule(request, 1);
        this.CloudFlareError(data.status);
        const $ = this.cheerio.load(data.data);
        const manga = this.parser.parseSearchResults($, this, UsesDeatils);
        metadata = this.parser.NextPage($) ? { page: page + 1 } : undefined;
        return createPagedResults({
            results: manga,
            metadata
        });
    }
    async supportsTagExclusion() {
        return true;
    }
    CloudFlareError(status) {
        if (status == 503) {
            throw new Error('CLOUDFLARE BYPASS ERROR:\nPlease go to Settings > Sources > MangaFreak and press Cloudflare Bypass or press the Cloud image on the right');
        }
    }
}
exports.MangaFreak = MangaFreak;

},{"./MangaFreakParser":49,"paperback-extensions-common":5}],49:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
const paperback_extensions_common_1 = require("paperback-extensions-common");
class Parser {
    constructor() {
        this.chapterTitleRegex = /Chapter ([\d.]+)/i;
    }
    async parseHomeSections($, sectionCallback, source) {
        const top5Section = createHomeSection({ id: 'top5', title: 'Top 5', view_more: false, type: paperback_extensions_common_1.HomeSectionType.featured });
        const popularSection = createHomeSection({ id: 'popular', title: 'Popular', view_more: true, type: paperback_extensions_common_1.HomeSectionType.singleRowNormal });
        const TodayMangaSection = createHomeSection({ id: 'today_manga', title: 'Today\'s Manga', view_more: true, type: paperback_extensions_common_1.HomeSectionType.singleRowNormal });
        const YesterdayMangaSection = createHomeSection({ id: 'yesterday_manga', title: 'Yesterday\'s Manga', view_more: false, type: paperback_extensions_common_1.HomeSectionType.singleRowNormal });
        const OlderMangaSection = createHomeSection({ id: 'older_manga', title: 'Older Manga', view_more: false, type: paperback_extensions_common_1.HomeSectionType.singleRowNormal });
        const Top5 = [];
        const Popular = [];
        const TodayManga = [];
        const YesterdayManga = [];
        const OlderManga = [];
        for (const obj of $('li', $('.slide_box .rslides')).toArray()) {
            const id = $('a', obj).attr('href')?.split('/').pop() ?? '';
            const title = $('div', obj).text().trim() ?? '';
            const image = `${source.baseCdn}/manga_images/${id.toLowerCase()}.jpg`;
            if (!id)
                continue;
            Top5.push(createMangaTile({
                id,
                image,
                title: createIconText({ text: this.decodeHTMLEntity(title) }),
            }));
        }
        top5Section.items = Top5;
        sectionCallback(top5Section);
        for (const obj of $('.featured_item_info', $('.box .featured_list div')).toArray()) {
            const id = $('a', obj).first().attr('href')?.split('/').pop() ?? '';
            const title = $('a', obj).first().text().trim() ?? '';
            const image = `${source.baseCdn}/manga_images/${id.toLowerCase()}.jpg`;
            const subtitle = $('a#chapter', obj).text().trim();
            if (!id)
                continue;
            Popular.push(createMangaTile({
                id,
                image,
                title: createIconText({ text: this.decodeHTMLEntity(title) }),
                subtitleText: createIconText({ text: this.decodeHTMLEntity(subtitle) }),
            }));
        }
        popularSection.items = Popular;
        sectionCallback(popularSection);
        for (const obj of $('.latest_list div', $('.right div:contains(TODAY\'S MANGA)').next()).toArray()) {
            const id = $('a.image', obj).attr('href')?.split('/').pop() ?? '';
            const title = $('a.name', obj).text().trim() ?? '';
            const image = `${source.baseCdn}/manga_images/${id.toLowerCase()}.jpg`;
            const subtitle = $('.chapter_box a', obj).text().trim();
            if (!id)
                continue;
            TodayManga.push(createMangaTile({
                id,
                image,
                title: createIconText({ text: this.decodeHTMLEntity(title) }),
                subtitleText: createIconText({ text: this.decodeHTMLEntity(subtitle) }),
            }));
        }
        TodayMangaSection.items = TodayManga;
        sectionCallback(TodayMangaSection);
        for (const obj of $('.latest_list div', $('.right div:contains(YESTERDAY\'S MANGA)').next()).toArray()) {
            const id = $('a.image', obj).attr('href')?.split('/').pop() ?? '';
            const title = $('a.name', obj).text().trim() ?? '';
            const image = `${source.baseCdn}/manga_images/${id.toLowerCase()}.jpg`;
            const subtitle = $('.chapter_box a', obj).text().trim();
            if (!id)
                continue;
            YesterdayManga.push(createMangaTile({
                id,
                image,
                title: createIconText({ text: this.decodeHTMLEntity(title) }),
                subtitleText: createIconText({ text: this.decodeHTMLEntity(subtitle) }),
            }));
        }
        YesterdayMangaSection.items = YesterdayManga;
        sectionCallback(YesterdayMangaSection);
        for (const obj of $('.latest_list div', $('.right div:contains(OLDER MANGA)').next()).toArray()) {
            const id = $('a.image', obj).attr('href')?.split('/').pop() ?? '';
            const title = $('a.name', obj).text().trim() ?? '';
            const image = `${source.baseCdn}/manga_images/${id.toLowerCase()}.jpg`;
            const subtitle = $('.chapter_box a', obj).text().trim();
            if (!id)
                continue;
            OlderManga.push(createMangaTile({
                id,
                image,
                title: createIconText({ text: this.decodeHTMLEntity(title) }),
                subtitleText: createIconText({ text: this.decodeHTMLEntity(subtitle) }),
            }));
        }
        OlderMangaSection.items = OlderManga;
        sectionCallback(OlderMangaSection);
    }
    ViewMoreParse($, source, isPopular) {
        const results = [];
        for (const obj of $(isPopular ? '.ranking_list .ranking_item' : '.latest_releases_list .latest_releases_item').toArray()) {
            const id = $('a', obj).attr('href')?.split('/').pop() ?? '';
            const title = $('a h3, a strong', obj).text().trim() ?? '';
            const image = `${source.baseCdn}/manga_images/${id.toLowerCase()}.jpg`;
            const subtitle = isPopular ? $('.ranking_item_info div:contains(Published)', obj).text().trim().split(' ').shift() ?? '' : $('.latest_releases_info div a', obj).first().text().trim().split(' ').pop() ?? '';
            if (!id)
                continue;
            results.push(createMangaTile({
                id,
                image,
                title: createIconText({ text: this.decodeHTMLEntity(title) }),
                subtitleText: createIconText({ text: this.decodeHTMLEntity(subtitle ? `Chapter ${subtitle}` : '') }),
            }));
        }
        return results;
    }
    parseSearchResults($, source, UsesDeatils) {
        const results = [];
        for (const obj of $(UsesDeatils ? '.ranking_list .ranking_item' : 'div.manga_search_item, div.mangaka_search_item').toArray()) {
            const id = $('h3 a, h5 a, a', obj).attr('href')?.split('/').pop() ?? '';
            const title = $('h3 a, h5 a, a h3', obj).text() ?? '';
            const image = `${source.baseCdn}/manga_images/${id.toLowerCase()}.jpg`;
            const subtitle = $('div:contains(Published), .ranking_item_info div:contains(Published)', obj).text().trim().split(' ').shift();
            if (!id)
                continue;
            results.push(createMangaTile({
                id,
                image,
                title: createIconText({ text: this.decodeHTMLEntity(title) }),
                subtitleText: createIconText({ text: this.decodeHTMLEntity(subtitle ? `Chapter ${subtitle}` : '') }),
            }));
        }
        return results;
    }
    parseChapterDetails($, mangaId, chapterId) {
        const pages = [];
        for (const obj of $('img#gohere').toArray()) {
            const page = this.getImageSrc($(obj)) ?? '';
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
    parseChapters($, mangaId) {
        const chapters = [];
        const arrChapters = $('div.manga_series_list tr:has(a)').toArray();
        for (const obj of arrChapters) {
            const id = $('a', obj).attr('href')?.split('/').pop() ?? '';
            const name = $('td', obj).eq(0).text().trim() ?? '';
            const release_date = $('td', obj).eq(1).text();
            if (!id)
                continue;
            const match = name.match(this.chapterTitleRegex);
            let chapNum;
            if (match && !isNaN(Number(match[1])))
                chapNum = Number(match[1]);
            chapters.push(createChapter({
                id: id,
                mangaId: mangaId,
                name: this.encodeText(name),
                chapNum: chapNum ?? 0,
                time: new Date(release_date),
                langCode: paperback_extensions_common_1.LanguageCode.ENGLISH
            }));
        }
        return chapters;
    }
    parseMangaDetails($, mangaId, source) {
        const title = $('div.manga_series_data h5').first().text().trim() ?? '';
        const image = `${source.baseCdn}/manga_images/${mangaId.toLowerCase()}.jpg`;
        const author = $('div.manga_series_data > div').eq(2).text().trim() ?? '';
        const artist = $('div.manga_series_data > div').eq(3).text().trim() ?? '';
        const status = $('div.manga_series_data > div').eq(1).text().trim() ?? '';
        const arrayTags = [];
        for (const obj of $('div.series_sub_genre_list a').toArray()) {
            const id = $(obj)?.attr('href')?.split('/').pop() ?? '';
            const label = $(obj).text() ?? '';
            if (!id || !label)
                continue;
            arrayTags.push({
                id: `details.${id}`,
                label
            });
        }
        const tagSections = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map((x) => createTag(x)) })];
        let desc = $('div.manga_series_description p').text().trim() ?? '';
        if (desc == '')
            desc = 'No Decscription provided by the source (MangaFreak)';
        return createManga({
            id: mangaId,
            titles: [this.decodeHTMLEntity(title)],
            image,
            status: this.parseStatus(status),
            author: this.decodeHTMLEntity(author),
            artist: this.decodeHTMLEntity(artist),
            tags: tagSections,
            desc,
        });
    }
    parseTags($) {
        const genres = [];
        for (const obj of $('.main .select_genre div[id="genrebox"] div').toArray()) {
            const id = $(obj).text().trim();
            const label = $(obj).text().trim();
            if (!id || !label)
                continue;
            genres.push({
                id: `genre.${id}`,
                label
            });
        }
        const Types = [
            {
                id: 'types.0',
                label: 'Both'
            },
            {
                id: 'types.2',
                label: 'Manga'
            },
            {
                id: 'types.1',
                label: 'Manhwa'
            }
        ];
        const Status = [
            {
                id: 'status.0',
                label: 'Both'
            },
            {
                id: 'status.1',
                label: 'Completed'
            },
            {
                id: 'status.2',
                label: 'Ongoing'
            }
        ];
        return [
            createTagSection({ id: 'none', label: 'Using multipule genres tags without', tags: [] }),
            createTagSection({ id: 'none2', label: 'title the search will infinitely loop', tags: [] }),
            createTagSection({ id: 'none3', label: 'but if it\'s one tag it will work', tags: [] }),
            createTagSection({ id: '1', label: 'Genres', tags: genres.map(x => createTag(x)) }),
            createTagSection({ id: '2', label: 'Manga Type', tags: Types.map(x => createTag(x)) }),
            createTagSection({ id: '3', label: 'Manga Status', tags: Status.map(x => createTag(x)) })
        ];
    }
    NextPage($) {
        const nextPage = $('a.next_p');
        if (nextPage.contents().length !== 0) {
            return true;
        }
        else {
            return false;
        }
    }
    encodeText(str) {
        return str.replace(/&#([0-9]{1,4})/gi, (_, numStr) => {
            const num = parseInt(numStr, 10);
            return String.fromCharCode(num);
        });
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
        else if (typeof imageObj?.attr('data-cfsrc') != 'undefined') {
            image = imageObj?.attr('data-cfsrc')?.split(' ')[0] ?? '';
        }
        else {
            image = imageObj?.attr('src');
        }
        return encodeURI(decodeURI(this.decodeHTMLEntity(image?.trim() ?? '')));
    }
    decodeHTMLEntity(str) {
        return str.replace(/&#(\d+)/g, (_match, dec) => {
            return String.fromCharCode(dec);
        });
    }
    parseStatus(str) {
        let status = paperback_extensions_common_1.MangaStatus.UNKNOWN;
        switch (str.toLowerCase()) {
            case 'ongoing':
            case 'on-going':
                status = paperback_extensions_common_1.MangaStatus.ONGOING;
                break;
            case 'completed':
                status = paperback_extensions_common_1.MangaStatus.COMPLETED;
                break;
        }
        return status;
    }
}
exports.Parser = Parser;

},{"paperback-extensions-common":5}]},{},[48])(48)
});
