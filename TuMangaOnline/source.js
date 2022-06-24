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
exports.TuMangaOnline = exports.TuMangaOnlineInfo = void 0;
/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
const paperback_extensions_common_1 = require("paperback-extensions-common");
const TuMangaOnlineParser_1 = require("./TuMangaOnlineParser");
const TuMangaOnlineSettings_1 = require("./TuMangaOnlineSettings");
const TuMangaOnline_Base = 'https://lectortmo.com';
exports.TuMangaOnlineInfo = {
    author: 'xOnlyFadi',
    description: 'Extensión que extrae el manga de lectortmo.com',
    icon: 'icon.png',
    name: 'TuMangaOnline',
    version: '1.0.1',
    authorWebsite: 'https://github.com/xOnlyFadi',
    websiteBaseURL: TuMangaOnline_Base,
    contentRating: paperback_extensions_common_1.ContentRating.EVERYONE,
    language: paperback_extensions_common_1.LanguageCode.SPANISH,
    sourceTags: [
        {
            text: 'Spanish',
            type: paperback_extensions_common_1.TagType.GREY
        }
    ]
};
class TuMangaOnline extends paperback_extensions_common_1.Source {
    constructor() {
        super(...arguments);
        this.parser = new TuMangaOnlineParser_1.Parser();
        this.baseUrl = TuMangaOnline_Base;
        this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36';
        this.requestManager = createRequestManager({
            requestsPerSecond: 3,
            requestTimeout: 15000,
            interceptor: {
                interceptRequest: (request) => __awaiter(this, void 0, void 0, function* () {
                    var _a;
                    request.headers = Object.assign(Object.assign({}, ((_a = request.headers) !== null && _a !== void 0 ? _a : {})), {
                        'user-agent': this.userAgent,
                        'referer': `${TuMangaOnline_Base}/`
                    });
                    return request;
                }),
                interceptResponse: (response) => __awaiter(this, void 0, void 0, function* () {
                    return response;
                })
            }
        });
        this.stateManager = createSourceStateManager({});
    }
    getMangaShareUrl(mangaId) {
        return `${TuMangaOnline_Base}/library/${mangaId}`;
    }
    getSourceMenu() {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.resolve(createSection({
                id: 'main',
                header: 'Source Settings',
                rows: () => __awaiter(this, void 0, void 0, function* () {
                    return [
                        (0, TuMangaOnlineSettings_1.contentSettings)(this.stateManager),
                    ];
                })
            }));
        });
    }
    getCloudflareBypassRequest() {
        return createRequestObject({
            url: `${TuMangaOnline_Base}`,
            method: 'GET',
            headers: {
                'user-agent': this.userAgent,
            }
        });
    }
    getHomePageSections(sectionCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            const getNSFWOption = yield (0, TuMangaOnlineSettings_1.getNSFW)(this.stateManager);
            const sections = [
                {
                    request: createRequestObject({
                        url: `${TuMangaOnline_Base}/library?order_item=creation&order_dir=desc&filter_by=title${getNSFWOption ? '' : '&exclude_genders%5B%5D=6&exclude_genders%5B%5D=17&exclude_genders%5B%5D=18&exclude_genders%5B%5D=19&erotic=false'}&_pg=1&page=1`,
                        method: 'GET',
                    }),
                    section: createHomeSection({
                        id: '1',
                        title: 'Últimas actualizaciones',
                        view_more: true,
                    }),
                },
                {
                    request: createRequestObject({
                        url: `${TuMangaOnline_Base}/library?order_item=likes_count&order_dir=desc&filter_by=title${getNSFWOption ? '' : '&exclude_genders%5B%5D=6&exclude_genders%5B%5D=17&exclude_genders%5B%5D=18&exclude_genders%5B%5D=19&erotic=false'}&_pg=1&page=1`,
                        method: 'GET'
                    }),
                    section: createHomeSection({
                        id: '2',
                        title: 'Series populares',
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
                    section.section.items = this.parser.parseHomeSection($, this);
                    sectionCallback(section.section);
                }));
            }
            yield Promise.all(promises);
        });
    }
    getViewMoreItems(homepageSectionId, metadata) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const getNSFWOption = yield (0, TuMangaOnlineSettings_1.getNSFW)(this.stateManager);
            const page = (_a = metadata === null || metadata === void 0 ? void 0 : metadata.page) !== null && _a !== void 0 ? _a : 1;
            let param = '';
            switch (homepageSectionId) {
                case '1':
                    param = `/library?order_item=creation&order_dir=desc&filter_by=title${getNSFWOption ? '' : '&exclude_genders%5B%5D=6&exclude_genders%5B%5D=17&exclude_genders%5B%5D=18&exclude_genders%5B%5D=19&erotic=false'}&_pg=1&page=${page}`;
                    break;
                case '2':
                    param = `/library?order_item=likes_count&order_dir=desc&filter_by=title${getNSFWOption ? '' : '&exclude_genders%5B%5D=6&exclude_genders%5B%5D=17&exclude_genders%5B%5D=18&exclude_genders%5B%5D=19&erotic=false'}&_pg=1&page=${page}`;
                    break;
                default:
                    throw new Error(`Invalid homeSectionId | ${homepageSectionId}`);
            }
            const request = createRequestObject({
                url: `${TuMangaOnline_Base}${param}`,
                method: 'GET',
            });
            const response = yield this.requestManager.schedule(request, 1);
            const $ = this.cheerio.load(response.data);
            const manga = this.parser.parseHomeSection($, this);
            metadata = this.parser.NextPage($) ? { page: page + 1 } : undefined;
            return createPagedResults({
                results: manga,
                metadata
            });
        });
    }
    getSearchTags() {
        return __awaiter(this, void 0, void 0, function* () {
            const getNSFWOption = yield (0, TuMangaOnlineSettings_1.getNSFW)(this.stateManager);
            const options = createRequestObject({
                url: `${TuMangaOnline_Base}/library`,
                method: 'GET'
            });
            const response = yield this.requestManager.schedule(options, 1);
            this.CloudFlareError(response.status);
            const $ = this.cheerio.load(response.data);
            return this.parser.parseTags($, getNSFWOption);
        });
    }
    getMangaDetails(mangaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = createRequestObject({
                url: `${TuMangaOnline_Base}/library/${mangaId}`,
                method: 'GET',
            });
            const response = yield this.requestManager.schedule(options, 1);
            this.CloudFlareError(response.status);
            const $ = this.cheerio.load(response.data);
            return this.parser.parseMangaDetails($, mangaId, this);
        });
    }
    getChapters(mangaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = createRequestObject({
                url: `${TuMangaOnline_Base}/library/${mangaId}`,
                method: 'GET'
            });
            const response = yield this.requestManager.schedule(options, 1);
            this.CloudFlareError(response.status);
            const $ = this.cheerio.load(response.data);
            return this.parser.parseChapters($, mangaId, this);
        });
    }
    getChapterDetails(mangaId, chapterId) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = createRequestObject({
                url: yield this.getChapterURL(chapterId),
                method: 'GET'
            });
            const response = yield this.requestManager.schedule(options, 1);
            this.CloudFlareError(response.status);
            const $ = this.cheerio.load(response.data);
            return this.parser.parseChapterDetails($, mangaId, chapterId);
        });
    }
    getChapterURL(chapterId) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const request = createRequestObject({
                url: `${this.baseUrl}/view_uploads/${chapterId}/`,
                method: 'GET'
            });
            const data = yield this.requestManager.schedule(request, 1);
            this.CloudFlareError(data.status);
            const $ = this.cheerio.load(data.data);
            const button = (_a = $('.flex-row button.btn-social').attr('onclick')) === null || _a === void 0 ? void 0 : _a.match(/copyToClipboard\(['"`](.*)['"`]\)/i);
            let url;
            if (button && button[1]) {
                const chapurl = button[1];
                if (chapurl.includes('paginated')) {
                    url = chapurl.replace('paginated', '') + 'cascade';
                }
                else {
                    url = chapurl;
                }
            }
            else {
                throw new Error(`Failed to parse the chapter url for ${chapterId}`);
            }
            return url;
        });
    }
    getSearchResults(query, metadata) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        return __awaiter(this, void 0, void 0, function* () {
            const getNSFWOption = yield (0, TuMangaOnlineSettings_1.getNSFW)(this.stateManager);
            const page = (_a = metadata === null || metadata === void 0 ? void 0 : metadata.page) !== null && _a !== void 0 ? _a : 1;
            const search = {
                types: '',
                status: '',
                translationstatus: '',
                demography: '',
                filter: 'title',
                sorting: 'likes_count',
                sortby: 'asc',
                webcomic: '',
                yonkoma: '',
                amateur: '',
                erotic: getNSFWOption ? '' : 'false',
                genres: ''
            };
            const tags = (_c = (_b = query.includedTags) === null || _b === void 0 ? void 0 : _b.map(tag => tag.id)) !== null && _c !== void 0 ? _c : [];
            const genres = [];
            tags.map((value) => {
                var _a, _b, _c, _d, _e, _f, _g, _h;
                if (value.indexOf('.') === -1) {
                    genres.push(`&genders[]=${value}`);
                }
                else {
                    switch (value.split('.')[0]) {
                        case 'types':
                            search.types = (_a = value.split('.')[1]) !== null && _a !== void 0 ? _a : '';
                            break;
                        case 'status':
                            search.status = (_b = value.split('.')[1]) !== null && _b !== void 0 ? _b : '';
                            break;
                        case 'trstatus':
                            search.translationstatus = (_c = value.split('.')[1]) !== null && _c !== void 0 ? _c : '';
                            break;
                        case 'demog':
                            search.demography = (_d = value.split('.')[1]) !== null && _d !== void 0 ? _d : '';
                            break;
                        case 'filby':
                            search.filter = (_e = value.split('.')[1]) !== null && _e !== void 0 ? _e : 'title';
                            break;
                        case 'sorting':
                            search.sorting = (_f = value.split('.')[1]) !== null && _f !== void 0 ? _f : 'likes_count';
                            break;
                        case 'byaplha':
                            search.sortby = (_g = value.split('.')[1]) !== null && _g !== void 0 ? _g : 'asc';
                            break;
                        case 'contenttype':
                            // eslint-disable-next-line no-case-declarations
                            const contype = (_h = value.split('.')[1]) !== null && _h !== void 0 ? _h : '';
                            if (contype == 'webcomic') {
                                search.webcomic = 'true';
                            }
                            else if (contype == 'yonkoma') {
                                search.yonkoma = 'true';
                            }
                            else if (contype == 'amateur') {
                                search.amateur = 'true';
                            }
                            else if (contype == 'erotic') {
                                if (getNSFWOption) {
                                    search.erotic = 'true';
                                }
                            }
                            break;
                    }
                }
            });
            search.genres = (genres !== null && genres !== void 0 ? genres : []).join('');
            let request;
            if (((_d = query.includedTags) === null || _d === void 0 ? void 0 : _d.length) == 0) {
                request = createRequestObject({
                    url: encodeURI(`${TuMangaOnline_Base}/library?title=${(_f = (_e = query === null || query === void 0 ? void 0 : query.title) === null || _e === void 0 ? void 0 : _e.replace(/%20/g, '+').replace(/ /g, '+')) !== null && _f !== void 0 ? _f : ''}${getNSFWOption ? '' : '&exclude_genders%5B%5D=6&exclude_genders%5B%5D=17&exclude_genders%5B%5D=18&exclude_genders%5B%5D=19&erotic=false'}&page=${page}&_pg=1`),
                    method: 'GET',
                });
            }
            else {
                request = createRequestObject({
                    url: encodeURI(`${TuMangaOnline_Base}/library?title=${(_h = (_g = query === null || query === void 0 ? void 0 : query.title) === null || _g === void 0 ? void 0 : _g.replace(/%20/g, '+').replace(/ /g, '+')) !== null && _h !== void 0 ? _h : ''}${getNSFWOption ? '' : '&exclude_genders%5B%5D=6&exclude_genders%5B%5D=17&exclude_genders%5B%5D=18&exclude_genders%5B%5D=19&erotic=false'}&page=${page}&_pg=1&type=${search.types}&demography=${search.demography}&status=${search.status}&translation_status=${search.translationstatus}&${search.filter}&order_item=${search.sorting}&order_dir=${search.sortby}&webcomic=${search.webcomic}&yonkoma=${search.yonkoma}&amateur=${search.amateur}&erotic=${search.erotic}${search.genres}`),
                    method: 'GET',
                });
            }
            const data = yield this.requestManager.schedule(request, 2);
            this.CloudFlareError(data.status);
            const $ = this.cheerio.load(data.data);
            const manga = this.parser.parseHomeSection($, this);
            metadata = this.parser.NextPage($) ? { page: page + 1 } : undefined;
            return createPagedResults({
                results: manga,
                metadata,
            });
        });
    }
    parseStatus(str) {
        let status = paperback_extensions_common_1.MangaStatus.UNKNOWN;
        switch (str.toLowerCase()) {
            case 'publicándose':
            case 'publicandose':
                status = paperback_extensions_common_1.MangaStatus.ONGOING;
                break;
            case 'finalizado':
                status = paperback_extensions_common_1.MangaStatus.COMPLETED;
                break;
        }
        return status;
    }
    CloudFlareError(status) {
        if (status == 503) {
            throw new Error('CLOUDFLARE BYPASS ERROR:\nPlease go to Settings > Sources > TuMangaOnline and press Cloudflare Bypass or press the Cloud image on the right');
        }
    }
}
exports.TuMangaOnline = TuMangaOnline;

},{"./TuMangaOnlineParser":49,"./TuMangaOnlineSettings":50,"paperback-extensions-common":5}],49:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
const paperback_extensions_common_1 = require("paperback-extensions-common");
class Parser {
    constructor() {
        this.idCleaner = (str, source) => {
            const base = source.baseUrl.split('://').pop();
            str = str.replace(/(https:\/\/|http:\/\/)/, '');
            str = str.replace(/\/$/, '');
            str = str.replace(`${base}/`, '');
            str = str.replace('library/', '');
            str = str.replace('view_uploads/', '');
            return str;
        };
    }
    decodeHTMLEntity(str) {
        return str.replace(/&#(\d+)/g, (_match, dec) => {
            return String.fromCharCode(dec);
        });
    }
    parseHomeSection($, source) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        const items = [];
        for (const obj of $('div.element').toArray()) {
            const info = $('div.element > a', obj);
            const id = (_c = this.idCleaner((_b = (_a = info.attr('href')) === null || _a === void 0 ? void 0 : _a.trim()) !== null && _b !== void 0 ? _b : '', source)) !== null && _c !== void 0 ? _c : '';
            const title = (_h = (_d = this.decodeHTMLEntity($('h4.text-truncate', info).text().trim())) !== null && _d !== void 0 ? _d : this.decodeHTMLEntity((_g = (_f = (_e = $('h4.text-truncate', info)) === null || _e === void 0 ? void 0 : _e.attr('title')) === null || _f === void 0 ? void 0 : _f.trim()) !== null && _g !== void 0 ? _g : '')) !== null && _h !== void 0 ? _h : '';
            const image = (_j = $(obj).find('style').toString().substringAfterFirst('(\'').substringBeforeFirst('\')')) !== null && _j !== void 0 ? _j : '';
            if (!id || !title)
                continue;
            items.push(createMangaTile({
                id,
                image,
                title: createIconText({ text: this.decodeHTMLEntity(title) }),
            }));
        }
        return items;
    }
    parseChapterDetails($, mangaId, chapterId) {
        var _a, _b;
        const pages = [];
        for (const obj of $('div.viewer-container img').toArray()) {
            const page = (_b = (_a = $(obj).attr('data-src')) !== null && _a !== void 0 ? _a : $(obj).attr('src')) !== null && _b !== void 0 ? _b : '';
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
    parseChapters($, mangaId, source) {
        var _a, _b, _c, _d, _e, _f;
        const chapters = [];
        const ChapterNumRegex = /capítulo ([\d.]+)?|capitulo ([\d.]+)?/i;
        if ($('div.chapters').contents().length == 0) {
            for (const obj of $('div.chapter-list-element > ul.list-group li.list-group-item').toArray()) {
                const id = this.idCleaner((_a = $('div.row > .text-right > a', obj).attr('href')) !== null && _a !== void 0 ? _a : '', source);
                const name = 'One Shot';
                const scanlator = (_b = $('div.col-md-6.text-truncate', obj).text().trim()) !== null && _b !== void 0 ? _b : '';
                const date_upload = (_c = $('span.badge.badge-primary.p-2', obj).first().text()) !== null && _c !== void 0 ? _c : '';
                if (typeof id === 'undefined') {
                    throw new Error(`Could not parse out ID when getting chapters for ${mangaId}`);
                }
                chapters.push(createChapter({
                    id: id,
                    mangaId: mangaId,
                    name: `${name} \nBy ${scanlator}`,
                    chapNum: 1,
                    time: new Date(date_upload),
                    langCode: paperback_extensions_common_1.LanguageCode.SPANISH,
                }));
            }
        }
        else {
            for (const obj of $('div.chapters > ul.list-group li.p-0.list-group-item').toArray()) {
                const chapStyle = $('a.btn-collapse', obj).text().trim();
                const chapStyleRegex = chapStyle.match(ChapterNumRegex);
                let chapNum;
                if (chapStyleRegex && !isNaN(Number(chapStyleRegex[1])))
                    chapNum = Number(chapStyleRegex[1]);
                const name = $('div.col-10.text-truncate', obj).text().trim();
                const scanelement = $('ul.chapter-list > li', obj).toArray();
                for (const allchaps of scanelement) {
                    const id = this.idCleaner((_d = $('div.row > .text-right > a', allchaps).attr('href')) !== null && _d !== void 0 ? _d : '', source);
                    const scanlator = (_e = $('div.col-md-6.text-truncate', allchaps).text().trim()) !== null && _e !== void 0 ? _e : '';
                    const date_upload = (_f = $('span.badge.badge-primary.p-2', allchaps).first().text()) !== null && _f !== void 0 ? _f : '';
                    if (typeof id === 'undefined') {
                        throw new Error(`Could not parse out ID when getting chapters for ${mangaId}`);
                    }
                    chapters.push(createChapter({
                        id: id,
                        mangaId: mangaId,
                        name: `${name} \nBy ${scanlator}`,
                        chapNum: chapNum !== null && chapNum !== void 0 ? chapNum : 0,
                        time: new Date(date_upload),
                        langCode: paperback_extensions_common_1.LanguageCode.SPANISH,
                    }));
                }
            }
        }
        return chapters;
    }
    parseMangaDetails($, mangaId, source) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        const infotitle = $('h1.element-title').first();
        infotitle.find('small').remove();
        const title = (_a = infotitle.text().trim()) !== null && _a !== void 0 ? _a : '';
        const title2 = (_b = this.decodeHTMLEntity($('h2.element-subtitle').first().text().trim())) !== null && _b !== void 0 ? _b : '';
        const image = (_c = $('.book-thumbnail').attr('src')) !== null && _c !== void 0 ? _c : 'https://paperback.moe/icons/logo-alt.svg';
        const desc = (_d = this.decodeHTMLEntity($('p.element-description').text().trim())) !== null && _d !== void 0 ? _d : '';
        const infoAuth = $('h5.card-title');
        const author = (_e = this.decodeHTMLEntity(infoAuth.first().text().trim().substringAfterFirst(', '))) !== null && _e !== void 0 ? _e : '';
        const artist = (_f = this.decodeHTMLEntity(infoAuth.last().text().trim().substringAfterFirst(', '))) !== null && _f !== void 0 ? _f : '';
        const status = (_g = this.decodeHTMLEntity($('span.book-status').text().trim())) !== null && _g !== void 0 ? _g : '';
        const arrayTags = [];
        const genreregex = /genders.*?=(\d+)?/i;
        for (const obj of $('a.py-2').toArray()) {
            const link = (_j = (_h = $(obj)) === null || _h === void 0 ? void 0 : _h.attr('href')) !== null && _j !== void 0 ? _j : '';
            const idRegex = link.match(genreregex);
            let id;
            if (idRegex && idRegex[1])
                id = idRegex[1];
            const label = (_k = $(obj).text()) !== null && _k !== void 0 ? _k : '';
            if (!id || !label)
                continue;
            arrayTags.push({
                id,
                label
            });
        }
        const tagSections = [createTagSection({ id: '0', label: 'genres', tags: arrayTags.map((x) => createTag(x)) })];
        return createManga({
            id: mangaId,
            titles: [title, title2],
            image,
            status: source.parseStatus(status),
            author: author,
            artist: artist,
            tags: tagSections,
            desc: desc !== '' ? desc : 'La fuente no proporciona ninguna decscripción (TuMangaOnline)',
        });
    }
    parseTags($, isNSFW) {
        var _a;
        const arrayTags = [];
        const arrayTags2 = [
            {
                id: 'types.manga',
                label: 'Manga',
            },
            {
                id: 'types.manhua',
                label: 'Manhua',
            },
            {
                id: 'types.manhwa',
                label: 'Manhwa',
            },
            {
                id: 'types.novel',
                label: 'Novela',
            },
            {
                id: 'types.one_shot',
                label: 'One shot',
            },
            {
                id: 'types.doujinshi',
                label: 'Doujinshi',
            },
            {
                id: 'types.oel',
                label: 'Oel',
            }
        ];
        const arrayTags3 = [
            {
                id: 'status.publishing',
                label: 'Publicándose'
            },
            {
                id: 'status.ended',
                label: 'Finalizado'
            },
            {
                id: 'status.cancelled',
                label: 'Cancelado'
            },
            {
                id: 'status.on_hold',
                label: 'Pausado'
            }
        ];
        const arrayTags4 = [
            {
                id: 'trstatus.publishing',
                label: 'Activo'
            },
            {
                id: 'trstatus.ended',
                label: 'Finalizado'
            },
            {
                id: 'trstatus.cancelled',
                label: 'Abandonado'
            }
        ];
        const arrayTags5 = [
            {
                id: 'demog.seinen',
                label: 'Seinen'
            },
            {
                id: 'demog.shoujo',
                label: 'Shoujo'
            },
            {
                id: 'demog.shounen',
                label: 'Shounen'
            },
            {
                id: 'demog.josei',
                label: 'Josei'
            },
            {
                id: 'demog.kodomo',
                label: 'Kodomo'
            }
        ];
        const arrayTags6 = [
            {
                id: 'filby.title',
                label: 'Título'
            },
            {
                id: 'filby.author',
                label: 'Autor'
            },
            {
                id: 'filby.company',
                label: 'Compañia'
            }
        ];
        const arrayTags7 = [
            {
                id: 'sorting.likes_count',
                label: 'Me gusta'
            },
            {
                id: 'sorting.alphabetically',
                label: 'Alfabético'
            },
            {
                id: 'sorting.score',
                label: 'Puntuación'
            },
            {
                id: 'sorting.creation',
                label: 'Creación'
            },
            {
                id: 'sorting.release_date',
                label: 'Fecha estreno'
            },
            {
                id: 'sorting.num_chapters',
                label: 'Núm. Capítulos'
            }
        ];
        const arrayTags8 = [
            {
                id: 'byaplha.asc',
                label: 'Ascendente'
            },
            {
                id: 'byaplha.desc',
                label: 'Descendente'
            }
        ];
        const arrayTags9 = [
            {
                id: 'contenttype.webcomic',
                label: 'Webcomic'
            },
            {
                id: 'contenttype.yonkoma',
                label: 'Yonkoma'
            },
            {
                id: 'contenttype.amateur',
                label: 'Amateur'
            },
            {
                id: 'contenttype.erotic',
                label: 'Erótico'
            }
        ];
        const NSFWids = [];
        isNSFW ? NSFWids.push() : NSFWids.push('6', '17', '18', '19');
        for (const tag of $('#books-genders .col-auto .custom-control').toArray()) {
            const label = $('label', tag).text().trim();
            const id = (_a = $('input', tag).attr('value')) !== null && _a !== void 0 ? _a : '0';
            if (!NSFWids.includes(id)) {
                if (!id || !label)
                    continue;
                arrayTags.push({ id: id, label: label });
            }
        }
        const tagSections = [
            createTagSection({ id: '0', label: 'Géneros', tags: arrayTags.map(x => createTag(x)) }),
            createTagSection({ id: '1', label: 'Filtrar por tipo', tags: arrayTags2.map(x => createTag(x)) }),
            createTagSection({ id: '2', label: 'Ignorado sino se filtra por tipo', tags: [] }),
            createTagSection({ id: '3', label: 'Filtrar por estado de serie', tags: arrayTags3.map(x => createTag(x)) }),
            createTagSection({ id: '4', label: 'Ignorado sino se filtra por tipo', tags: [] }),
            createTagSection({ id: '5', label: 'Filtrar por estado de traducción', tags: arrayTags4.map(x => createTag(x)) }),
            createTagSection({ id: '6', label: 'Filtrar por demografía', tags: arrayTags5.map(x => createTag(x)) }),
            createTagSection({ id: '7', label: 'Filtrar por', tags: arrayTags6.map(x => createTag(x)) }),
            createTagSection({ id: '8', label: 'Ordenar por', tags: arrayTags7.map(x => createTag(x)) }),
            createTagSection({ id: '9', label: 'Ordenar por by', tags: arrayTags8.map(x => createTag(x)) }),
            createTagSection({ id: '10', label: 'Filtrar por tipo de contenido', tags: arrayTags9.map(x => createTag(x)) })
        ];
        return tagSections;
    }
    NextPage($) {
        const nextPage = $('a.page-link');
        if (nextPage.contents().length !== 0) {
            return true;
        }
        else {
            return false;
        }
    }
}
exports.Parser = Parser;
String.prototype.substringBeforeLast = function (character) {
    const lastIndexOfCharacter = this.lastIndexOf(character);
    return this.substring(0, lastIndexOfCharacter);
};
String.prototype.substringAfterFirst = function (substring) {
    const startingIndexOfSubstring = this.indexOf(substring);
    const endIndexOfSubstring = startingIndexOfSubstring + substring.length - 1;
    return this.substring(endIndexOfSubstring + 1, this.length);
};
String.prototype.substringBeforeFirst = function (substring) {
    const startingIndexOfSubstring = this.indexOf(substring);
    return this.substring(0, startingIndexOfSubstring);
};

},{"paperback-extensions-common":5}],50:[function(require,module,exports){
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
exports.contentSettings = exports.getNSFW = void 0;
const getNSFW = (stateManager) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    return (_a = (yield stateManager.retrieve('nsfw'))) !== null && _a !== void 0 ? _a : false;
});
exports.getNSFW = getNSFW;
const contentSettings = (stateManager) => {
    return createNavigationButton({
        id: 'content_settings',
        value: '',
        label: 'Configuración del contenido',
        form: createForm({
            onSubmit: (values) => {
                return Promise.all([
                    stateManager.store('nsfw', values.nsfw),
                ]).then();
            },
            validate: () => {
                return Promise.resolve(true);
            },
            sections: () => {
                return Promise.resolve([
                    createSection({
                        id: 'content',
                        footer: 'Activa el NSFW en la aplicación',
                        rows: () => {
                            return Promise.all([
                                (0, exports.getNSFW)(stateManager),
                            ]).then((values) => __awaiter(void 0, void 0, void 0, function* () {
                                return [
                                    createSwitch({
                                        id: 'nsfw',
                                        label: 'NSFW',
                                        value: values[0]
                                    })
                                ];
                            }));
                        }
                    })
                ]);
            }
        })
    });
};
exports.contentSettings = contentSettings;

},{}]},{},[48])(48)
});
