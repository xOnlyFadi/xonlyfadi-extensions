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

},{"./Button":9,"./Form":11,"./FormRow":10,"./Header":12,"./InputField":13,"./Label":14,"./Link":15,"./MultilineLabel":16,"./NavigationButton":17,"./OAuthButton":18,"./Section":19,"./Select":20,"./Stepper":21,"./Switch":22,"./WebViewButton":23}],25:[function(require,module,exports){
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
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],28:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],29:[function(require,module,exports){
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

},{}],30:[function(require,module,exports){
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

},{"./Chapter":7,"./ChapterDetails":6,"./Constants":8,"./DynamicUI":24,"./HomeSection":25,"./Languages":26,"./Manga":29,"./MangaTile":27,"./MangaUpdate":28,"./PagedResults":30,"./RawData":31,"./RequestHeaders":32,"./RequestInterceptor":33,"./RequestManager":34,"./RequestObject":35,"./ResponseObject":36,"./SearchField":37,"./SearchRequest":38,"./SourceInfo":39,"./SourceManga":40,"./SourceStateManager":41,"./SourceTag":42,"./TagSection":43,"./TrackedManga":45,"./TrackedMangaChapterReadAction":44,"./TrackerActionQueue":46}],48:[function(require,module,exports){
"use strict";
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
exports.MangaFreak = exports.MangaFreakInfo = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const MangaFreakParser_1 = require("./MangaFreakParser");
const MangaFreak_Base = "https://w13.mangafreak.net";
exports.MangaFreakInfo = {
    author: 'xOnlyFadi',
    description: 'Extension that pulls manga from mangafreak.net',
    icon: 'icon.png',
    name: 'MangaFreak',
    version: '1.0.0',
    authorWebsite: 'https://github.com/xOnlyFadi',
    websiteBaseURL: MangaFreak_Base,
    contentRating: paperback_extensions_common_1.ContentRating.EVERYONE,
    language: paperback_extensions_common_1.LanguageCode.ENGLISH,
    sourceTags: [
        {
            text: "Notifications",
            type: paperback_extensions_common_1.TagType.GREEN
        },
    ]
};
class MangaFreak extends paperback_extensions_common_1.Source {
    constructor() {
        super(...arguments);
        this.parser = new MangaFreakParser_1.Parser();
        this.chapterDetailsSelector = "div.item img.owl-lazy";
        this.requestManager = createRequestManager({
            requestsPerSecond: 3,
            requestTimeout: 30000,
            interceptor: {
                interceptRequest: (request) => __awaiter(this, void 0, void 0, function* () {
                    var _a;
                    request.headers = Object.assign(Object.assign({}, ((_a = request.headers) !== null && _a !== void 0 ? _a : {})), {
                        'user-agent': `Mozilla/5.0 (iPhone; CPU iPhone OS 15_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile/15E148 Safari/604.1`,
                        'referer': MangaFreak_Base
                    });
                    return request;
                }),
                interceptResponse: (response) => __awaiter(this, void 0, void 0, function* () {
                    return response;
                })
            }
        });
    }
    getMangaShareUrl(mangaId) {
        return `${MangaFreak_Base}/Manga/${mangaId}`;
    }
    getCloudflareBypassRequest() {
        return createRequestObject({
            url: `${MangaFreak_Base}/Genre/All/1`,
            method: 'GET',
            headers: {
                'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Mobile/15E148 Safari/604.1',
            }
        });
    }
    getHomePageSections(sectionCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            let options = createRequestObject({
                url: `${MangaFreak_Base}/Latest_Releases/1`,
                method: 'GET'
            });
            let response = yield this.requestManager.schedule(options, 1);
            const $ = this.cheerio.load(response.data);
            options = createRequestObject({
                url: `${MangaFreak_Base}/Genre/All/1`,
                method: 'GET'
            });
            response = yield this.requestManager.schedule(options, 1);
            const $$ = this.cheerio.load(response.data);
            this.CloudFlareError(response.status);
            return this.parser.parseHomeSections($, $$, sectionCallback, this);
        });
    }
    getViewMoreItems(homepageSectionId, metadata) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let page = (_a = metadata === null || metadata === void 0 ? void 0 : metadata.page) !== null && _a !== void 0 ? _a : 1;
            if (page == -1)
                return createPagedResults({ results: [], metadata: { page: -1 } });
            let param = '';
            let isPop = false;
            switch (homepageSectionId) {
                case '1':
                    param = `/Latest_Releases/${page}`;
                    isPop = false;
                    break;
                case '2':
                    param = `/Genre/All/${page}`;
                    isPop = true;
                    break;
                default:
                    throw new Error(`Invalid homeSectionId | ${homepageSectionId}`);
            }
            const request = createRequestObject({
                url: `${MangaFreak_Base}${param}`,
                method: 'GET',
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            const manga = this.parser.ViewMoreParse($, this, isPop);
            page++;
            if (!this.parser.NextPage($))
                page = -1;
            return createPagedResults({
                results: manga,
                metadata: { page: page }
            });
        });
    }
    getSearchTags() {
        return __awaiter(this, void 0, void 0, function* () {
            const options = createRequestObject({
                url: `${MangaFreak_Base}/Search`,
                method: 'GET'
            });
            let response = yield this.requestManager.schedule(options, 1);
            this.CloudFlareError(response.status);
            let $ = this.cheerio.load(response.data);
            return [createTagSection({
                    id: "1",
                    label: "Genres",
                    tags: this.parser.parseTags($)
                })];
        });
    }
    getMangaDetails(mangaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = createRequestObject({
                url: `${MangaFreak_Base}/Manga/${mangaId}`,
                method: 'GET',
            });
            let response = yield this.requestManager.schedule(options, 1);
            this.CloudFlareError(response.status);
            let $ = this.cheerio.load(response.data);
            return this.parser.parseMangaDetails($, mangaId, this);
        });
    }
    getChapters(mangaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = createRequestObject({
                url: `${MangaFreak_Base}/Manga/${mangaId}`,
                method: 'GET'
            });
            let response = yield this.requestManager.schedule(options, 1);
            this.CloudFlareError(response.status);
            let $ = this.cheerio.load(response.data);
            return this.parser.parseChapters($, mangaId, this);
        });
    }
    getChapterDetails(mangaId, chapterId) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = createRequestObject({
                url: `${MangaFreak_Base}${chapterId}`,
                method: 'GET'
            });
            let response = yield this.requestManager.schedule(options, 1);
            this.CloudFlareError(response.status);
            let $ = this.cheerio.load(response.data);
            return this.parser.parseChapterDetails($, mangaId, chapterId);
        });
    }
    getSearchResults(query, metadata) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let page = (_a = metadata === null || metadata === void 0 ? void 0 : metadata.page) !== null && _a !== void 0 ? _a : 1;
            if (page == -1)
                return createPagedResults({ results: [], metadata: { page: -1 } });
            const request = this.constructSearchRequest(page, query);
            const data = yield this.requestManager.schedule(request, 2);
            this.CloudFlareError(data.status);
            const $ = this.cheerio.load(data.data);
            const manga = this.parser.parseSearchResults($, this);
            page++;
            if (!this.parser.NextPage($))
                page = -1;
            return createPagedResults({
                results: manga,
                metadata: { page: page },
            });
        });
    }
    constructSearchRequest(_page, query) {
        var _a, _b, _c;
        if (!this.isEmpty(query === null || query === void 0 ? void 0 : query.title)) {
            if (((_a = query.includedTags) === null || _a === void 0 ? void 0 : _a.length) === 0) {
                return createRequestObject({
                    url: `${MangaFreak_Base}/Search/${this.normalizeSearchQuery(query === null || query === void 0 ? void 0 : query.title)}`,
                    method: 'GET',
                });
            }
            else {
                var url = MangaFreak_Base;
                if (!this.isEmpty(query === null || query === void 0 ? void 0 : query.title)) {
                    url += `/Search/${this.normalizeSearchQuery(query === null || query === void 0 ? void 0 : query.title)}`;
                }
                url += '/Genre/';
                var getGenresOrderedKeyList = this.getGenresKeyList();
                var selectedGenreKey = (_b = query === null || query === void 0 ? void 0 : query.includedTags) === null || _b === void 0 ? void 0 : _b.map((x) => x.id).toString();
                var selectedGenreKeys = selectedGenreKey === null || selectedGenreKey === void 0 ? void 0 : selectedGenreKey.split(',');
                for (var genreKeyIndex = 0; genreKeyIndex < getGenresOrderedKeyList.length; genreKeyIndex++) {
                    if (selectedGenreKeys === null || selectedGenreKeys === void 0 ? void 0 : selectedGenreKeys.includes((_c = getGenresOrderedKeyList[genreKeyIndex]) !== null && _c !== void 0 ? _c : '')) {
                        url += '1';
                    }
                    else {
                        url += '0';
                    }
                }
                url += "/Status/0/Type/0";
                return createRequestObject({
                    url: url,
                    method: 'GET',
                });
            }
        }
        else {
            throw Error('please search with a title otherwise the search with genres will not work');
        }
    }
    normalizeSearchQuery(query) {
        var query = query.toLowerCase();
        query = query.replace(/[àáạảãâầấậẩẫăằắặẳẵ]+/g, "a");
        query = query.replace(/[èéẹẻẽêềếệểễ]+/g, "e");
        query = query.replace(/[ìíịỉĩ]+/g, "i");
        query = query.replace(/[òóọỏõôồốộổỗơờớợởỡ]+/g, "o");
        query = query.replace(/[ùúụủũưừứựửữ]+/g, "u");
        query = query.replace(/[ỳýỵỷỹ]+/g, "y");
        query = query.replace(/[đ]+/g, "d");
        query = query.replace(/ /g, "+");
        query = query.replace(/%20/g, "+");
        return query;
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
    getGenresKeyList() {
        return [
            "Act",
            "Adult",
            "Adventure",
            "Animated",
            "Comedy",
            "Demons",
            "Drama",
            "Ecchi",
            "Fantasy",
            "Gender%20Bender",
            "Harem",
            "Ancients",
            "Horror",
            "Josei",
            "Magic",
            "Manhwa",
            "Martial%20Arts",
            "Mature",
            "Mecha",
            "Military",
            "Mystery",
            "One%20Shot",
            "Psychological",
            "Romance",
            "School%20Life",
            "Sci%20Fi",
            "Sci%20Fi%20Shounen",
            "Sci%20Fim",
            "Seinen",
            "Shotacon",
            "Shoujo",
            "Shoujo%20Ai",
            "Shoujoai",
            "Shounen",
            "Shounen%20Ai",
            "Shounenai",
            "Slice%20Of%20Life",
            "Smut",
            "Sports",
            "Super%20Power",
            "Superhero",
            "Supernatural",
            "Tragedy",
            "Vampire",
            "Yaoi",
            "Yuri"
        ];
    }
    CloudFlareError(status) {
        if (status == 503) {
            throw new Error('CLOUDFLARE BYPASS ERROR:\nPlease go to Settings > Sources > MangaFreak and press Cloudflare Bypass or press the Cloud image on the right');
        }
    }
    isEmpty(str) {
        return (!str || 0 === str.length);
    }
}
exports.MangaFreak = MangaFreak;

},{"./MangaFreakParser":49,"paperback-extensions-common":5}],49:[function(require,module,exports){
"use strict";
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
exports.Parser = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
class Parser {
    constructor() {
        this.chapterTitleRegex = /Chapter ([\d.]+)/i;
    }
    decodeHTMLEntity(str) {
        return str.replace(/&#(\d+);/g, function (_match, dec) {
            return String.fromCharCode(dec);
        });
    }
    parseHomeSections($, $$, sectionCallback, _source) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        return __awaiter(this, void 0, void 0, function* () {
            const section1 = createHomeSection({ id: '1', title: 'Latest', view_more: true });
            const section2 = createHomeSection({ id: '2', title: 'Popular', view_more: true });
            const popular = [];
            const latest = [];
            const arrLatest = $('div.latest_releases_item').toArray();
            const arrPopular = $$('div.ranking_item').toArray();
            for (const obj of arrLatest) {
                const info = $("a", obj);
                const id = (_b = (_a = info.attr('href')) === null || _a === void 0 ? void 0 : _a.replace(/\/manga\//gi, "")) !== null && _b !== void 0 ? _b : '';
                const title = (_c = info.text()) !== null && _c !== void 0 ? _c : '';
                const image = (_d = this.getImageSrc($('img', obj)).replace('mini', 'manga').substringBeforeLast('/') + ".jpg") !== null && _d !== void 0 ? _d : '';
                latest.push(createMangaTile({
                    id,
                    image,
                    title: createIconText({ text: this.decodeHTMLEntity(title) }),
                }));
            }
            section1.items = latest;
            sectionCallback(section1);
            for (const obj of arrPopular) {
                const info = $$('a', obj);
                const id = (_f = (_e = info.attr("href")) === null || _e === void 0 ? void 0 : _e.replace(/\/manga\//gi, "")) !== null && _f !== void 0 ? _f : '';
                const title = (_g = info.text()) !== null && _g !== void 0 ? _g : '';
                const image = (_h = this.getImageSrc($$('img', obj))) !== null && _h !== void 0 ? _h : '';
                popular.push(createMangaTile({
                    id,
                    image,
                    title: createIconText({ text: this.decodeHTMLEntity(title) }),
                }));
            }
            section2.items = popular;
            sectionCallback(section2);
        });
    }
    parseChapterDetails($, mangaId, chapterId) {
        var _a;
        let pages = [];
        for (let obj of $("img#gohere").toArray()) {
            let page = (_a = this.getImageSrc($(obj))) !== null && _a !== void 0 ? _a : '';
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
    findTextAndReturnRemainder(target, variable) {
        var chopFront = target.substring(target.search(variable) + variable.length, target.length);
        var result = chopFront.substring(0, chopFront.search(";"));
        return result;
    }
    parseChapters($, mangaId, _source) {
        var _a, _b;
        const chapters = [];
        let lastNumber = null;
        const arrChapters = $('div.manga_series_list tr:has(a)').toArray();
        for (const obj of arrChapters) {
            var url = (_a = $("a", obj).attr('href')) !== null && _a !== void 0 ? _a : '';
            var name = (_b = $('td', obj).eq(0).text().trim()) !== null && _b !== void 0 ? _b : 'No Chpater Name';
            var release_date = $("td", obj).eq(1).text();
            const match = name.match(this.chapterTitleRegex);
            let chapNum;
            if (match && !isNaN(Number(match[1]))) {
                chapNum = Number(match[1]);
            }
            else {
                if (lastNumber === null) {
                    chapNum = 0;
                }
                else {
                    chapNum = Number((lastNumber + 0.001).toFixed(3));
                }
            }
            lastNumber = chapNum;
            chapters.push(createChapter({
                id: encodeURI(url),
                mangaId: mangaId,
                name: this.encodeText(name),
                chapNum: chapNum !== null && chapNum !== void 0 ? chapNum : 0,
                time: new Date(release_date),
                langCode: paperback_extensions_common_1.LanguageCode.ENGLISH
            }));
        }
        return chapters;
    }
    parseMangaDetails($, mangaId, source) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        const title = (_a = $('div.manga_series_data h5').first().text().trim()) !== null && _a !== void 0 ? _a : '';
        const image = (_b = this.getImageSrc($('div.manga_series_image img'))) !== null && _b !== void 0 ? _b : 'https://paperback.moe/icons/logo-alt.svg';
        let desc = (_c = $("div.manga_series_description p").text().trim()) !== null && _c !== void 0 ? _c : '';
        if (desc == '')
            desc = `No Decscription provided by the source (MangaFreak)`;
        let author = (_d = $("div.manga_series_data > div").eq(2).text().trim()) !== null && _d !== void 0 ? _d : '';
        let artist = (_e = $("div.manga_series_data > div").eq(3).text().trim()) !== null && _e !== void 0 ? _e : '';
        let status = (_f = $("div.manga_series_data > div").eq(1).text().trim()) !== null && _f !== void 0 ? _f : '';
        const arrayTags = [];
        const genres = $('div.series_sub_genre_list a').toArray();
        for (const obj of genres) {
            arrayTags.push({
                id: (_h = (_g = $(obj)) === null || _g === void 0 ? void 0 : _g.attr('href')) !== null && _h !== void 0 ? _h : '',
                label: (_j = $(obj).text()) !== null && _j !== void 0 ? _j : ''
            });
        }
        const tagSections = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map((x) => createTag(x)) })];
        return createManga({
            id: mangaId,
            titles: [this.decodeHTMLEntity(title)],
            image,
            status: source.parseStatus(status),
            author: this.decodeHTMLEntity(author),
            artist: this.decodeHTMLEntity(artist),
            tags: tagSections,
            desc,
        });
    }
    parseTags($) {
        const genres = [];
        for (const obj of $(".main .select_genre div[id='genrebox'] div").toArray()) {
            genres.push(createTag({
                id: encodeURI($(obj).text().trim()),
                label: $(obj).text().trim()
            }));
        }
        return genres;
    }
    parseSearchResults($, _source) {
        var _a, _b, _c, _d;
        const results = [];
        for (const obj of $('div.manga_search_item , div.mangaka_search_item').toArray()) {
            const info = $('h3 a, h5 a', obj);
            const id = (_b = (_a = info.attr("href")) === null || _a === void 0 ? void 0 : _a.replace(/\/manga\//gi, "")) !== null && _b !== void 0 ? _b : '';
            const title = (_c = info.text()) !== null && _c !== void 0 ? _c : '';
            const image = (_d = this.getImageSrc($('img', obj))) !== null && _d !== void 0 ? _d : '';
            results.push(createMangaTile({
                id,
                image,
                title: createIconText({ text: this.decodeHTMLEntity(title) }),
            }));
        }
        return results;
    }
    ViewMoreParse($, _source, isPopular) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const results = [];
        if (isPopular) {
            for (const obj of $('div.ranking_item').toArray()) {
                const info = $('a', obj);
                const id = (_a = info.attr("href")) !== null && _a !== void 0 ? _a : '';
                const title = (_b = info.text()) !== null && _b !== void 0 ? _b : '';
                const image = (_c = this.getImageSrc($('img', obj))) !== null && _c !== void 0 ? _c : '';
                if (id) {
                    results.push(createMangaTile({
                        id,
                        image,
                        title: createIconText({ text: this.decodeHTMLEntity(title) }),
                    }));
                }
            }
        }
        else {
            for (const obj of $('div.latest_releases_item').toArray()) {
                const info = $("a", obj);
                const id = (_e = (_d = info.attr('href')) === null || _d === void 0 ? void 0 : _d.replace(/\/manga\//gi, "")) !== null && _e !== void 0 ? _e : '';
                const title = (_f = info.text()) !== null && _f !== void 0 ? _f : '';
                const image = (_h = ((_g = this.getImageSrc($('img', obj))) === null || _g === void 0 ? void 0 : _g.replace('mini', 'manga').substringBeforeLast('/')) + ".jpg") !== null && _h !== void 0 ? _h : '';
                results.push(createMangaTile({
                    id,
                    image,
                    title: createIconText({ text: this.decodeHTMLEntity(title) }),
                }));
            }
        }
        return results;
    }
    NextPage($) {
        var nextPage = $('a.next_p');
        if (nextPage.contents().length !== 0) {
            return true;
        }
        else {
            return false;
        }
    }
    encodeText(str) {
        return str.replace(/&#([0-9]{1,4});/gi, (_, numStr) => {
            const num = parseInt(numStr, 10);
            return String.fromCharCode(num);
        });
    }
    getImageSrc(imageObj) {
        var _a, _b, _c, _d, _e;
        let image;
        if (typeof (imageObj === null || imageObj === void 0 ? void 0 : imageObj.attr('data-src')) != 'undefined') {
            image = imageObj === null || imageObj === void 0 ? void 0 : imageObj.attr('data-src');
        }
        else if (typeof (imageObj === null || imageObj === void 0 ? void 0 : imageObj.attr('data-lazy-src')) != 'undefined') {
            image = imageObj === null || imageObj === void 0 ? void 0 : imageObj.attr('data-lazy-src');
        }
        else if (typeof (imageObj === null || imageObj === void 0 ? void 0 : imageObj.attr('srcset')) != 'undefined') {
            image = (_b = (_a = imageObj === null || imageObj === void 0 ? void 0 : imageObj.attr('srcset')) === null || _a === void 0 ? void 0 : _a.split(' ')[0]) !== null && _b !== void 0 ? _b : '';
        }
        else if (typeof (imageObj === null || imageObj === void 0 ? void 0 : imageObj.attr('data-cfsrc')) != 'undefined') {
            image = (_d = (_c = imageObj === null || imageObj === void 0 ? void 0 : imageObj.attr('data-cfsrc')) === null || _c === void 0 ? void 0 : _c.split(' ')[0]) !== null && _d !== void 0 ? _d : '';
        }
        else {
            image = imageObj === null || imageObj === void 0 ? void 0 : imageObj.attr('src');
        }
        return encodeURI(decodeURI(this.decodeHTMLEntity((_e = image === null || image === void 0 ? void 0 : image.trim()) !== null && _e !== void 0 ? _e : '')));
    }
}
exports.Parser = Parser;
String.prototype.substringBeforeLast = function (character) {
    var lastIndexOfCharacter = this.lastIndexOf(character);
    return this.substring(0, lastIndexOfCharacter);
};
String.prototype.substringAfterFirst = function (substring) {
    var startingIndexOfSubstring = this.indexOf(substring);
    var endIndexOfSubstring = startingIndexOfSubstring + substring.length - 1;
    return this.substring(endIndexOfSubstring + 1, this.length);
};

},{"paperback-extensions-common":5}]},{},[48])(48)
});
