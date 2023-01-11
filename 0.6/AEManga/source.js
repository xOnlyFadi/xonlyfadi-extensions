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
exports.AEManga = exports.AEMangaInfo = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const AEMangaParser_1 = require("./AEMangaParser");
const AEManga_DOMAIN = 'https://manga.ae';
exports.AEMangaInfo = {
    version: '1.0.1',
    name: 'MangaAE',
    icon: 'icon.png',
    author: 'xOnlyFadi',
    authorWebsite: 'https://github.com/xOnlyFadi',
    description: 'Extension that pulls comics from manga.ae.',
    contentRating: paperback_extensions_common_1.ContentRating.EVERYONE,
    websiteBaseURL: AEManga_DOMAIN,
    language: 'Arabic',
    sourceTags: [
        {
            text: 'Cloudflare',
            type: paperback_extensions_common_1.TagType.RED
        },
        {
            text: 'العربية',
            type: paperback_extensions_common_1.TagType.GREY
        }
    ]
};
const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 12_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Safari/605.1.15';
class AEManga extends paperback_extensions_common_1.Source {
    constructor() {
        super(...arguments);
        this.baseUrl = AEManga_DOMAIN;
        this.requestManager = createRequestManager({
            requestsPerSecond: 2,
            requestTimeout: 15000,
            interceptor: {
                interceptRequest: async (request) => {
                    request.headers = {
                        ...(request.headers ?? {}),
                        ...{
                            'user-agent': userAgent,
                            'referer': AEManga_DOMAIN
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
    getMangaShareUrl(mangaId) { return `${AEManga_DOMAIN}/${mangaId}`; }
    async getHomePageSections(sectionCallback) {
        const sections = [
            {
                request: createRequestObject({
                    url: encodeURI(`${AEManga_DOMAIN}/manga/page:1|order:views`),
                    method: 'GET',
                }),
                section: createHomeSection({
                    id: 'views',
                    title: 'المانجا المشهورة',
                    view_more: true,
                }),
            },
            {
                request: createRequestObject({
                    url: encodeURI(`${AEManga_DOMAIN}/manga/page:1|order:updated_at`),
                    method: 'GET',
                }),
                section: createHomeSection({
                    id: 'updated_at',
                    title: 'المانجا المحدثه',
                    view_more: true,
                }),
            },
            {
                request: createRequestObject({
                    url: encodeURI(`${AEManga_DOMAIN}/manga/page:1|order:release_date`),
                    method: 'GET',
                }),
                section: createHomeSection({
                    id: 'release_date',
                    title: 'تاريخ النشر',
                    view_more: true,
                }),
            },
            {
                request: createRequestObject({
                    url: encodeURI(`${AEManga_DOMAIN}/manga/page:1|order:chapter_count`),
                    method: 'GET',
                }),
                section: createHomeSection({
                    id: 'chapter_count',
                    title: 'عدد الفصول',
                    view_more: true,
                }),
            },
            {
                request: createRequestObject({
                    url: encodeURI(`${AEManga_DOMAIN}/manga/page:1|order:status`),
                    method: 'GET',
                }),
                section: createHomeSection({
                    id: 'status',
                    title: 'الحالة',
                    view_more: true,
                }),
            },
        ];
        const promises = [];
        for (const section of sections) {
            sectionCallback(section.section);
            promises.push(this.requestManager.schedule(section.request, 1).then(response => {
                this.CloudFlareError(response.status);
                const $ = this.cheerio.load(response.data);
                section.section.items = (0, AEMangaParser_1.parseSearch)($, this);
                sectionCallback(section.section);
            }));
        }
        await Promise.all(promises);
    }
    async getViewMoreItems(homepageSectionId, metadata) {
        const page = metadata?.page ?? 1;
        const request = createRequestObject({
            url: encodeURI(`${AEManga_DOMAIN}/manga/page:${page}|order:${homepageSectionId}`),
            method: 'GET',
        });
        const response = await this.requestManager.schedule(request, 1);
        this.CloudFlareError(response.status);
        const $ = this.cheerio.load(response.data);
        const manga = (0, AEMangaParser_1.parseSearch)($, this);
        metadata = (0, AEMangaParser_1.NextPage)($) ? { page: page + 1 } : undefined;
        return createPagedResults({
            results: manga,
            metadata
        });
    }
    async getSearchResults(query, metadata) {
        const page = metadata?.page ?? 1;
        const Genres = [];
        const Order = [];
        const Sort = [];
        query.includedTags?.map((x) => {
            if (x.id.includes('genres.')) {
                Genres.push(`|tag:${x.id?.split('.')?.pop()}`);
            }
            if (x.id.includes('order.')) {
                Order.push(`|order:${x.id?.split('.')?.pop()}`);
            }
            if (x.id.includes('sort.')) {
                Sort.push(`|arrange:${x.id?.split('.')?.pop()}`);
            }
        });
        let request;
        if (query.title) {
            request = createRequestObject({
                url: encodeURI(`${AEManga_DOMAIN}/manga/page:${page}|search:${query.title.replace(/ /g, '%20')}${Order.length !== 0 ? Order[0] : ''}${Sort.length !== 0 ? Sort[0] : ''}`),
                method: 'GET',
            });
        }
        else {
            request = createRequestObject({
                url: encodeURI(`${AEManga_DOMAIN}/manga/page:${page}${Genres.length !== 0 ? Genres[0] : ''}${Order.length !== 0 ? Order[0] : ''}${Sort.length !== 0 ? Sort[0] : ''}`),
                method: 'GET',
            });
        }
        const response = await this.requestManager.schedule(request, 1);
        this.CloudFlareError(response.status);
        const $ = this.cheerio.load(response.data);
        const manga = (0, AEMangaParser_1.parseSearch)($, this);
        metadata = (0, AEMangaParser_1.NextPage)($) ? { page: page + 1 } : undefined;
        return createPagedResults({
            results: manga,
            metadata
        });
    }
    async getTags() {
        const request = createRequestObject({
            url: `${AEManga_DOMAIN}/manga/`,
            method: 'GET',
        });
        const response = await this.requestManager.schedule(request, 1);
        this.CloudFlareError(response.status);
        const $ = this.cheerio.load(response.data);
        return (0, AEMangaParser_1.parseTags)($);
    }
    async getMangaDetails(mangaId) {
        const request = createRequestObject({
            url: `${AEManga_DOMAIN}/${mangaId}`,
            method: 'GET',
        });
        const response = await this.requestManager.schedule(request, 1);
        this.CloudFlareError(response.status);
        const $ = this.cheerio.load(response.data);
        return (0, AEMangaParser_1.parseMangaDetails)($, mangaId);
    }
    async getChapters(mangaId) {
        const request = createRequestObject({
            url: `${AEManga_DOMAIN}/${mangaId}`,
            method: 'GET',
        });
        const response = await this.requestManager.schedule(request, 1);
        this.CloudFlareError(response.status);
        const $ = this.cheerio.load(response.data);
        return (0, AEMangaParser_1.parseChapters)($, mangaId);
    }
    async getChapterDetails(mangaId, chapterId) {
        const request = createRequestObject({
            url: `${AEManga_DOMAIN}/${mangaId}/${chapterId}`,
            method: 'GET',
        });
        const response = await this.requestManager.schedule(request, 1);
        this.CloudFlareError(response.status);
        const $ = this.cheerio.load(response.data);
        return (0, AEMangaParser_1.parseChapterDetails)($, mangaId, chapterId);
    }
    async filterUpdatedManga(mangaUpdatesFoundCallback, time, ids) {
        let page = 1;
        while (page < 5) {
            const request = createRequestObject({
                url: `${AEManga_DOMAIN}/manga/page:${page}%7Corder:updated_at`,
                method: 'GET',
            });
            const mangaToUpdate = [];
            const response = await this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            mangaToUpdate.push(...(0, AEMangaParser_1.getUpdatedManga)($, time, ids, this));
            page++;
            if (mangaToUpdate.length > 0) {
                mangaUpdatesFoundCallback(createMangaUpdates({
                    ids: mangaToUpdate
                }));
            }
        }
    }
    getCloudflareBypassRequest() {
        return createRequestObject({
            url: AEManga_DOMAIN,
            method: 'GET',
            headers: {
                'user-agent': userAgent,
            }
        });
    }
    CloudFlareError(status) {
        if (status == 503) {
            throw new Error('CLOUDFLARE BYPASS ERROR:\nPlease go to Settings > Sources > MangaAE and press Cloudflare Bypass or press the Cloud image on the right');
        }
    }
}
exports.AEManga = AEManga;

},{"./AEMangaParser":49,"paperback-extensions-common":5}],49:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NextPage = exports.getUpdatedManga = exports.parseSearch = exports.parseTags = exports.parseChapterDetails = exports.parseChapters = exports.parseMangaDetails = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const parseMangaDetails = ($, mangaId) => {
    const contentSection = $('.indexcontainer').first();
    const titles = [];
    titles.push(decodeHTMLEntity($('h1.EnglishName', contentSection).text().trim().replace('(', '').replace(')', '')));
    const image = $('img.manga-cover', contentSection).attr('src') ?? '';
    const authors = [];
    for (const obj of $('div.manga-details-author h4', contentSection).toArray()) {
        const author = $(obj).text().trim();
        if (!author)
            continue;
        authors.push(author);
    }
    const description = decodeHTMLEntity($('div.manga-details-extended h4', contentSection).eq(4).text().trim() ?? '');
    const arrayTags = [];
    for (const tag of $('div.manga-details-extended a[href*=tag]', contentSection).toArray()) {
        const label = $(tag).text().trim();
        const link = $(tag).attr('href') ?? '';
        const idRegex = link.match(/tag:(.*)\|/);
        let id;
        if (idRegex && idRegex[1])
            id = idRegex[1];
        if (!id || !label)
            continue;
        arrayTags.push({
            id: `genres.${id}`,
            label
        });
    }
    const tagSections = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })];
    const rawStatus = $('div.manga-details-extended h4', contentSection).first().text().trim().toLowerCase();
    let status = paperback_extensions_common_1.MangaStatus.ONGOING;
    if (rawStatus.includes('مكتملة'))
        status = paperback_extensions_common_1.MangaStatus.COMPLETED;
    return createManga({
        id: mangaId,
        titles: titles,
        image: image,
        status: status,
        author: authors.length !== 0 ? authors.join(', ') : '',
        tags: tagSections,
        desc: description,
    });
};
exports.parseMangaDetails = parseMangaDetails;
const parseChapters = ($, mangaId) => {
    const chapters = [];
    const contentSection = $('.indexcontainer').first();
    const LastUpdated = $('div.manga-details-extended h4', contentSection).eq(3).text().trim();
    for (const chapter of $('li', $('ul.new-manga-chapters')).toArray()) {
        const AElement = $('a', chapter);
        const title = AElement.text() ?? '';
        const chapterId = $('a', chapter).attr('href')?.split('?').shift()?.slice(0, -3)?.split('/').pop() ?? '';
        if (!chapterId)
            continue;
        const chapNum = Number(chapterId);
        if (!chapterId || !title)
            continue;
        chapters.push(createChapter({
            id: `${chapterId}/0/allpages`,
            mangaId,
            name: decodeHTMLEntity(title),
            chapNum: isNaN(chapNum) ? 0 : chapNum,
            time: new Date(LastUpdated),
            //@ts-ignore
            langCode: 'العربية'
        }));
    }
    return chapters;
};
exports.parseChapters = parseChapters;
const parseChapterDetails = ($, mangaId, chapterId) => {
    const pages = [];
    for (const page of $('div#showchaptercontainer img').toArray()) {
        const url = $(page).attr('src');
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
const parseTags = ($) => {
    const arrayTags = [];
    for (const tag of $('#filter .order:contains(أظهار المانجا التي تحتوي على:) a').toArray()) {
        const label = $(tag).text().trim();
        const link = $(tag).attr('href') ?? '';
        const idRegex = link.match(/tag:(.*)\|/);
        let id;
        if (idRegex && idRegex[1])
            id = idRegex[1];
        if (!id || !label)
            continue;
        arrayTags.push({
            id: `genres.${id}`,
            label
        });
    }
    const OrderBy = [];
    for (const tag of $('#mangadirectory .order:contains(ترتيب المانجا على حسب :) a').toArray()) {
        const label = $(tag).text().trim();
        const link = $(tag).attr('href') ?? '';
        const idRegex = link.match(/order:(.*)\|/);
        let id;
        if (idRegex && idRegex[1])
            id = idRegex[1];
        if (!id || !label)
            continue;
        OrderBy.push({
            id: `order.${id}`,
            label
        });
    }
    OrderBy.push({
        id: 'order.english_name',
        label: 'اسم المانجا'
    });
    const sortByTags = [
        {
            id: 'sort.plus',
            label: 'تصاعدي'
        },
        {
            id: 'sort.minus',
            label: 'تنازلي'
        }
    ];
    return [
        createTagSection({ id: 'empty', label: 'العناوين لن تعمل مع الأنواع', tags: [] }),
        createTagSection({ id: '0', label: 'أظهار المانجا التي تحتوي على', tags: arrayTags.map(x => createTag(x)) }),
        createTagSection({ id: '1', label: 'ترتيب المانجا على حسب', tags: OrderBy.map(x => createTag(x)) }),
        createTagSection({ id: '2', label: 'ترتيب حسب', tags: sortByTags.map(x => createTag(x)) })
    ];
};
exports.parseTags = parseTags;
const parseSearch = ($, source) => {
    const results = [];
    for (const obj of $('div.mangacontainer').toArray()) {
        const title = $('a.manga', obj).first().text().trim() ?? '';
        const id = $('a.manga', obj).first().attr('href')?.replace(`${source.baseUrl}/`, '')?.split('?').shift()?.replace(/\/+$/, '') ?? '';
        const lazysrc = $('img', obj)?.attr('data-pagespeed-lazy-src') ?? '';
        const image = !lazysrc ? $('img', obj).attr('src') : lazysrc;
        const subtitle = $('.details a', obj).last().text().trim();
        if (!id || !title)
            continue;
        results.push(createMangaTile({
            id,
            image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
            title: createIconText({ text: decodeHTMLEntity(title) }),
            subtitleText: createIconText({ text: subtitle ? `أخر فصل : ${subtitle}` : '' }),
        }));
    }
    return results;
};
exports.parseSearch = parseSearch;
const getUpdatedManga = ($, time, ids, source) => {
    const mangaToUpdate = [];
    for (const obj of $('div.mangacontainer').toArray()) {
        const id = $('a.manga', obj).first().attr('href')?.replace(`${source.baseUrl}/`, '')?.split('?').shift()?.replace(/\/+$/, '') ?? '';
        const ChapDate = new Date($('.details small', obj).text().trim() ?? '');
        if (!id)
            continue;
        if (ChapDate <= time) {
            if (ids.includes(id)) {
                mangaToUpdate.push(id);
            }
        }
    }
    return mangaToUpdate;
};
exports.getUpdatedManga = getUpdatedManga;
const decodeHTMLEntity = (str) => {
    return str.replace(/&#(\d+)/g, (_match, dec) => {
        return String.fromCharCode(dec);
    });
};
const NextPage = ($) => {
    const nextPage = $('div.pagination a:last-child:not(.active)');
    if (nextPage.contents().length !== 0) {
        return true;
    }
    else {
        return false;
    }
};
exports.NextPage = NextPage;

},{"paperback-extensions-common":5}]},{},[48])(48)
});
