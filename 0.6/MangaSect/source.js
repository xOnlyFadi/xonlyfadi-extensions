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
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MangaSect = exports.MangaSectInfo = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const MangaSectParser_1 = require("./MangaSectParser");
const DOMAIN = 'https://mangasect.com';
exports.MangaSectInfo = {
    version: '1.0.0',
    name: 'MangaSect',
    icon: 'icon.png',
    author: 'xOnlyFadi',
    authorWebsite: 'https://github.com/xOnlyFadi',
    description: 'Extension that pulls comics from mangasect.com',
    contentRating: paperback_extensions_common_1.ContentRating.EVERYONE,
    websiteBaseURL: DOMAIN,
    language: paperback_extensions_common_1.LanguageCode.ENGLISH,
};
const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 12_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Safari/605.1.15';
class MangaSect extends paperback_extensions_common_1.Source {
    constructor() {
        super(...arguments);
        this.baseUrl = DOMAIN;
        this.requestManager = createRequestManager({
            requestsPerSecond: 2,
            requestTimeout: 15000,
            interceptor: {
                interceptRequest: async (request) => {
                    request.headers = {
                        ...(request.headers ?? {}),
                        ...{
                            'user-agent': userAgent,
                            'referer': DOMAIN
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
    getMangaShareUrl(mangaId) { return `${DOMAIN}/manga/${mangaId}`; }
    async getHomePageSections(sectionCallback) {
        const home_request = createRequestObject({
            url: DOMAIN,
            method: 'GET',
        });
        const home_response = await this.requestManager.schedule(home_request, 2);
        const $ = this.cheerio.load(home_response.data);
        await (0, MangaSectParser_1.parseHomeSections)($, sectionCallback);
    }
    async getViewMoreItems(homepageSectionId, metadata) {
        const page = metadata?.page ?? 1;
        const request = createRequestObject({
            url: encodeURI(`${DOMAIN}/filter/${page}/?sort=${homepageSectionId}`),
            method: 'GET',
        });
        const response = await this.requestManager.schedule(request, 1);
        this.CloudFlareError(response.status);
        const $ = this.cheerio.load(response.data);
        const manga = (0, MangaSectParser_1.parseSearch)($);
        metadata = manga.length >= 19 ? { page: page + 1 } : undefined;
        return createPagedResults({
            results: manga,
            metadata
        });
    }
    async getSearchResults(query, metadata) {
        const page = metadata?.page ?? 1;
        const Status = [];
        const Sort = [];
        const Genres = [];
        query.includedTags?.map((x) => {
            if (x.id.startsWith('genres.')) {
                Genres.push(x.id?.split('.')?.pop());
            }
            if (x.id.startsWith('status.')) {
                Status.push(`&status=${x.id?.split('.')?.pop()}`);
            }
            if (x.id.startsWith('sort.')) {
                Sort.push(x.id?.split('.')?.pop());
            }
        });
        let request;
        if (query.title) {
            request = createRequestObject({
                url: encodeURI(`${DOMAIN}/search/${page}/?keyword=${query.title}`),
                method: 'GET',
            });
        }
        else {
            request = createRequestObject({
                url: encodeURI(`${DOMAIN}/filter/${page}/?sort=${Sort.length > 0 ? Sort[0] : 'default'}${Status.length > 0 ? Status[0] : ''}${Genres.length > 0 ? `&genres=${Genres.join('%2C')}` : ''}`),
                method: 'GET',
            });
        }
        const response = await this.requestManager.schedule(request, 1);
        this.CloudFlareError(response.status);
        const $ = this.cheerio.load(response.data);
        const manga = (0, MangaSectParser_1.parseSearch)($);
        metadata = manga.length >= 19 ? { page: page + 1 } : undefined;
        return createPagedResults({
            results: manga,
            metadata
        });
    }
    async getTags() {
        const request = createRequestObject({
            url: `${DOMAIN}/filter/`,
            method: 'GET',
        });
        const response = await this.requestManager.schedule(request, 1);
        this.CloudFlareError(response.status);
        const $ = this.cheerio.load(response.data);
        return (0, MangaSectParser_1.parseTags)($);
    }
    async getMangaDetails(mangaId) {
        const request = createRequestObject({
            url: `${DOMAIN}/manga/${mangaId}`,
            method: 'GET',
        });
        const response = await this.requestManager.schedule(request, 1);
        this.CloudFlareError(response.status);
        const $ = this.cheerio.load(response.data);
        return (0, MangaSectParser_1.parseMangaDetails)($, mangaId);
    }
    async getChapters(mangaId) {
        const request = createRequestObject({
            url: `${DOMAIN}/manga/${mangaId}`,
            method: 'GET',
        });
        const response = await this.requestManager.schedule(request, 1);
        this.CloudFlareError(response.status);
        const $ = this.cheerio.load(response.data);
        return (0, MangaSectParser_1.parseChapters)($, mangaId);
    }
    async getChapterDetails(mangaId, chapterId) {
        const request = createRequestObject({
            url: `${DOMAIN}/ajax/image/list/chap/${chapterId}`,
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
        const $ = this.cheerio.load(data.html);
        return (0, MangaSectParser_1.parseChapterDetails)($, mangaId, chapterId);
    }
    getCloudflareBypassRequest() {
        return createRequestObject({
            url: DOMAIN,
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
exports.MangaSect = MangaSect;

},{"./MangaSectParser":49,"paperback-extensions-common":5}],49:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseHomeSections = exports.parseSearch = exports.parseTags = exports.parseChapterDetails = exports.parseChapters = exports.parseMangaDetails = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const DOMAIN = 'https://mangasect.com';
const parseMangaDetails = ($, mangaId) => {
    const title = decodeHTMLEntity($('header h1').text().trim());
    let image = $('.a1 figure img')?.attr('src') ?? '';
    image = image.startsWith('/') ? DOMAIN + image : image;
    let author;
    let rawStatus;
    for (const obj of $('.y6x11p').toArray()) {
        const type = $(obj).text().trim().replace(/\s+/g, ' ');
        const text = $('span', obj).text().trim();
        if (type.toLowerCase().includes('authors')) {
            if (text.toLowerCase() === 'updating')
                continue;
            author = text.trim();
        }
        if (type.toLowerCase().includes('status')) {
            rawStatus = text.trim().toLocaleLowerCase();
        }
    }
    const arrayTags = [];
    for (const tag of $('article .mt-15 a').toArray()) {
        const label = $(tag).text().trim();
        const id = $(tag).attr('href')?.split('/').pop() ?? '';
        if (!id)
            continue;
        arrayTags.push({
            id: `mgenres.${id}`,
            label
        });
    }
    const tagSections = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => createTag(x)) })];
    const description = decodeHTMLEntity($('article #syn-target').text().trim() ?? '');
    let status = paperback_extensions_common_1.MangaStatus.ONGOING;
    if (rawStatus && rawStatus.includes('completed'))
        status = paperback_extensions_common_1.MangaStatus.COMPLETED;
    return createManga({
        id: mangaId,
        titles: [title],
        image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
        status: status,
        author: author ? author : '',
        tags: tagSections,
        desc: description,
    });
};
exports.parseMangaDetails = parseMangaDetails;
const parseChapters = ($, mangaId) => {
    const chapters = [];
    for (const chapter of $('article #myUL li')?.toArray()) {
        const AElement = $('a', chapter);
        const title = AElement.text().trim() ?? '';
        const chapterId = AElement.attr('href')?.replace(`${DOMAIN}/manga/`, '')?.split('/').pop() ?? '';
        const time = $('.timeago', chapter)?.attr('datetime') ?? '';
        if (!chapterId)
            continue;
        const chapNR = AElement.attr('href')?.replace(`${DOMAIN}/manga/`, '') ?? '';
        const numRegex = chapNR.match(/chapter-([\d.]+)?/);
        let chapNum;
        if (numRegex && numRegex[1])
            chapNum = numRegex[1]?.replace(/-/g, '.');
        chapters.push(createChapter({
            id: chapterId,
            mangaId,
            name: decodeHTMLEntity(title),
            chapNum: chapNum ? !isNaN(Number(chapNum)) ? Number(chapNum) : 0 : 0,
            time: time ? new Date(Number(time) * 1000) : undefined,
            langCode: paperback_extensions_common_1.LanguageCode.ENGLISH
        }));
    }
    return chapters;
};
exports.parseChapters = parseChapters;
const parseChapterDetails = ($, mangaId, chapterId) => {
    const pages = [];
    for (const page of $('.separator a').toArray()) {
        const url = $(page).attr('href');
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
    const Status = [];
    const Sort = [];
    const Genres = [];
    for (const obj of $('#select-status option')?.toArray()) {
        const id = $(obj).attr('value');
        const label = $(obj).text().trim();
        if (!id)
            continue;
        if (label.toLocaleLowerCase() === 'all')
            continue;
        Status.push({
            label,
            id: `status.${id}`
        });
    }
    for (const obj of $('#select-sort option')?.toArray()) {
        const id = $(obj).attr('value');
        const label = $(obj).text().trim();
        if (!id)
            continue;
        if (label.toLocaleLowerCase() === 'default')
            continue;
        Sort.push({
            label,
            id: `sort.${id}`
        });
    }
    for (const obj of $('.advanced-genres .advance-item')?.toArray()) {
        const id = $('input', obj).attr('data-genre');
        const label = $('label', obj).text().trim();
        if (!id)
            continue;
        Genres.push({
            label,
            id: `genres.${id}`
        });
    }
    return [
        createTagSection({ id: 'status', label: 'Status', tags: Status.map(x => createTag(x)) }),
        createTagSection({ id: 'sort', label: 'Sort', tags: Sort.map(x => createTag(x)) }),
        createTagSection({ id: 'genres', label: 'Genres', tags: Genres.map(x => createTag(x)) }),
    ];
};
exports.parseTags = parseTags;
const parseSearch = ($) => {
    const results = [];
    for (const obj of $('section .r2 .grid >')?.toArray()) {
        const id = $('.text-center a', obj)?.attr('href')?.replace(`${DOMAIN}/manga/`, '') ?? '';
        const title = $('.text-center a', obj)?.text()?.trim() ?? '';
        let image = $('.b-img img', obj)?.attr('data-src') ?? '';
        image = image.startsWith('/') ? DOMAIN + image : image;
        if (!id)
            continue;
        results.push(createMangaTile({
            id,
            image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
            title: createIconText({ text: decodeHTMLEntity(title) }),
        }));
    }
    return results;
};
exports.parseSearch = parseSearch;
const parseHomeSections = async ($, sectionCallback) => {
    const featured_section = createHomeSection({ id: 'featured', title: 'Featured', type: paperback_extensions_common_1.HomeSectionType.featured });
    const recommend_section = createHomeSection({ id: 'recommend', title: 'Recommend', type: paperback_extensions_common_1.HomeSectionType.singleRowNormal });
    const latest_section = createHomeSection({ id: 'latest-updated', title: 'Latest', type: paperback_extensions_common_1.HomeSectionType.singleRowNormal, view_more: true });
    const new_section = createHomeSection({ id: 'new', title: 'New', type: paperback_extensions_common_1.HomeSectionType.singleRowNormal });
    const monthly_section = createHomeSection({ id: 'monthly', title: 'Top Monthly', type: paperback_extensions_common_1.HomeSectionType.singleRowNormal });
    const weekly_section = createHomeSection({ id: 'weekly', title: 'Top Weekly', type: paperback_extensions_common_1.HomeSectionType.singleRowNormal });
    const daily_section = createHomeSection({ id: 'daily', title: 'Top  Daily', type: paperback_extensions_common_1.HomeSectionType.singleRowNormal });
    const featured = [];
    const recommend = [];
    const latest = [];
    const newm = [];
    const monthly = [];
    const weekly = [];
    const daily = [];
    for (const obj of $('.slides .deslide-item')?.toArray()) {
        const id = $('.desi-head-title a', obj)?.attr('href')?.replace(`${DOMAIN}/manga/`, '') ?? '';
        const title = $('.desi-head-title a', obj)?.text()?.trim() ?? $('.desi-head-title a', obj)?.attr('title') ?? '';
        const subTitle = $('.desi-sub-text', obj)?.text()?.trim() ?? '';
        let image = $('.deslide-poster img', obj)?.attr('src') ?? '';
        image = image.startsWith('/') ? DOMAIN + image : image;
        if (!id)
            continue;
        featured.push(createMangaTile({
            id,
            image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
            title: createIconText({ text: title }),
            subtitleText: createIconText({ text: subTitle }),
        }));
    }
    featured_section.items = featured;
    sectionCallback(featured_section);
    for (const obj of $('#recommend figure')?.toArray()) {
        const id = $('a.block', obj).first()?.attr('href')?.replace(`${DOMAIN}/manga/`, '') ?? '';
        const title = $('figcaption a', obj)?.text()?.trim() ?? '';
        let image = $('a.block img', obj)?.attr('src') ?? '';
        image = image.startsWith('/') ? DOMAIN + image : image;
        if (!id)
            continue;
        recommend.push(createMangaTile({
            id,
            image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
            title: createIconText({ text: title }),
        }));
    }
    recommend_section.items = recommend;
    sectionCallback(recommend_section);
    for (const obj of $('#homeLast .grid >')?.toArray()) {
        const id = $('.text-center a', obj)?.attr('href')?.replace(`${DOMAIN}/manga/`, '') ?? '';
        const title = $('.text-center a', obj)?.text()?.trim() ?? '';
        let image = $('.b-img img', obj)?.attr('data-src') ?? '';
        image = image.startsWith('/') ? DOMAIN + image : image;
        if (!id)
            continue;
        latest.push(createMangaTile({
            id,
            image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
            title: createIconText({ text: title }),
        }));
    }
    latest_section.items = latest;
    sectionCallback(latest_section);
    for (const obj of $('#schedule .update-time >')?.toArray()) {
        const id = $('.cover a', obj)?.attr('href')?.replace(`${DOMAIN}/manga/`, '') ?? '';
        const title = $('.data .name a', obj)?.text()?.trim() ?? '';
        let image = $('.cover img', obj)?.attr('src') ?? '';
        image = image.startsWith('/') ? DOMAIN + image : image;
        if (!id)
            continue;
        newm.push(createMangaTile({
            id,
            image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
            title: createIconText({ text: title }),
        }));
    }
    new_section.items = newm;
    sectionCallback(new_section);
    for (const obj of $('#series-month article')?.toArray()) {
        const id = $('.item-thumbnail a', obj)?.attr('href')?.replace(`${DOMAIN}/manga/`, '') ?? '';
        const title = $('.post-title a', obj)?.text()?.trim() ?? '';
        let image = $('.item-thumbnail img', obj)?.attr('src') ?? '';
        image = image.startsWith('/') ? DOMAIN + image : image;
        if (!id)
            continue;
        monthly.push(createMangaTile({
            id,
            image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
            title: createIconText({ text: title }),
        }));
    }
    monthly_section.items = monthly;
    sectionCallback(monthly_section);
    for (const obj of $('#series-week article')?.toArray()) {
        const id = $('.item-thumbnail a', obj)?.attr('href')?.replace(`${DOMAIN}/manga/`, '') ?? '';
        const title = $('.post-title a', obj)?.text()?.trim() ?? '';
        let image = $('.item-thumbnail img', obj)?.attr('src') ?? '';
        image = image.startsWith('/') ? DOMAIN + image : image;
        if (!id)
            continue;
        weekly.push(createMangaTile({
            id,
            image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
            title: createIconText({ text: title }),
        }));
    }
    weekly_section.items = weekly;
    sectionCallback(weekly_section);
    for (const obj of $('#series-day article')?.toArray()) {
        const id = $('.item-thumbnail a', obj)?.attr('href')?.replace(`${DOMAIN}/manga/`, '') ?? '';
        const title = $('.post-title a', obj)?.text()?.trim() ?? '';
        let image = $('.item-thumbnail img', obj)?.attr('src') ?? '';
        image = image.startsWith('/') ? DOMAIN + image : image;
        if (!id)
            continue;
        daily.push(createMangaTile({
            id,
            image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
            title: createIconText({ text: title }),
        }));
    }
    daily_section.items = daily;
    sectionCallback(daily_section);
};
exports.parseHomeSections = parseHomeSections;
const decodeHTMLEntity = (str) => {
    return str.replace(/&#(\d+)/g, (_match, dec) => {
        return String.fromCharCode(dec);
    });
};

},{"paperback-extensions-common":5}]},{},[48])(48)
});
