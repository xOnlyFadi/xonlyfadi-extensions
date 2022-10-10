(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Sources = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadgeColor = void 0;
var BadgeColor;
(function (BadgeColor) {
    BadgeColor["BLUE"] = "default";
    BadgeColor["GREEN"] = "success";
    BadgeColor["GREY"] = "info";
    BadgeColor["YELLOW"] = "warning";
    BadgeColor["RED"] = "danger";
})(BadgeColor = exports.BadgeColor || (exports.BadgeColor = {}));

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
"use strict";
/**
 * Request objects hold information for a particular source (see sources for example)
 * This allows us to to use a generic api to make the calls against any source
 */
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
    async getTags() {
        // @ts-ignore
        return this.getSearchTags?.();
    }
}
exports.Source = Source;
// Many sites use '[x] time ago' - Figured it would be good to handle these cases in general
function convertTime(timeAgo) {
    let time;
    let trimmed = Number((/\d*/.exec(timeAgo) ?? [])[0]);
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

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tracker = void 0;
class Tracker {
    constructor(cheerio) {
        this.cheerio = cheerio;
    }
}
exports.Tracker = Tracker;

},{}],7:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./Source"), exports);
__exportStar(require("./Tracker"), exports);
__exportStar(require("./ByteArray"), exports);
__exportStar(require("./Badge"), exports);
__exportStar(require("./interfaces"), exports);
__exportStar(require("./SourceInfo"), exports);
__exportStar(require("./HomeSectionType"), exports);

},{"./Badge":1,"./ByteArray":2,"./HomeSectionType":3,"./Source":4,"./SourceInfo":5,"./Tracker":6,"./interfaces":12}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],12:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./ChapterProviding"), exports);
__exportStar(require("./Searchable"), exports);
__exportStar(require("./Requestable"), exports);
__exportStar(require("./MangaProviding"), exports);

},{"./ChapterProviding":8,"./MangaProviding":9,"./Requestable":10,"./Searchable":11}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],23:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],24:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],27:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],28:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],29:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],30:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],31:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],32:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],33:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],34:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],35:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],36:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],37:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],38:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],39:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],40:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],41:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],42:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],43:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],44:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],45:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],46:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],47:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],48:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],49:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],50:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],51:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],52:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],53:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],54:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],55:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],56:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],57:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./DynamicUI/Exports/DUIBinding"), exports);
__exportStar(require("./DynamicUI/Exports/DUIForm"), exports);
__exportStar(require("./DynamicUI/Exports/DUIFormRow"), exports);
__exportStar(require("./DynamicUI/Exports/DUISection"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUIButton"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUIHeader"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUIInputField"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUILabel"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUILink"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUIMultilineLabel"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUINavigationButton"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUIOAuthButton"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUISecureInputField"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUISelect"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUIStepper"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUISwitch"), exports);
__exportStar(require("./Exports/ChapterDetails"), exports);
__exportStar(require("./Exports/Chapter"), exports);
__exportStar(require("./Exports/Cookie"), exports);
__exportStar(require("./Exports/HomeSection"), exports);
__exportStar(require("./Exports/IconText"), exports);
__exportStar(require("./Exports/MangaInfo"), exports);
__exportStar(require("./Exports/PartialSourceManga"), exports);
__exportStar(require("./Exports/MangaUpdates"), exports);
__exportStar(require("./Exports/PBCanvas"), exports);
__exportStar(require("./Exports/PBImage"), exports);
__exportStar(require("./Exports/PagedResults"), exports);
__exportStar(require("./Exports/RawData"), exports);
__exportStar(require("./Exports/Request"), exports);
__exportStar(require("./Exports/SourceInterceptor"), exports);
__exportStar(require("./Exports/RequestManager"), exports);
__exportStar(require("./Exports/Response"), exports);
__exportStar(require("./Exports/SearchField"), exports);
__exportStar(require("./Exports/SearchRequest"), exports);
__exportStar(require("./Exports/SourceCookieStore"), exports);
__exportStar(require("./Exports/SourceManga"), exports);
__exportStar(require("./Exports/SecureStateManager"), exports);
__exportStar(require("./Exports/SourceStateManager"), exports);
__exportStar(require("./Exports/Tag"), exports);
__exportStar(require("./Exports/TagSection"), exports);
__exportStar(require("./Exports/TrackedMangaChapterReadAction"), exports);
__exportStar(require("./Exports/TrackedManga"), exports);
__exportStar(require("./Exports/TrackerActionQueue"), exports);

},{"./DynamicUI/Exports/DUIBinding":14,"./DynamicUI/Exports/DUIForm":15,"./DynamicUI/Exports/DUIFormRow":16,"./DynamicUI/Exports/DUISection":17,"./DynamicUI/Rows/Exports/DUIButton":18,"./DynamicUI/Rows/Exports/DUIHeader":19,"./DynamicUI/Rows/Exports/DUIInputField":20,"./DynamicUI/Rows/Exports/DUILabel":21,"./DynamicUI/Rows/Exports/DUILink":22,"./DynamicUI/Rows/Exports/DUIMultilineLabel":23,"./DynamicUI/Rows/Exports/DUINavigationButton":24,"./DynamicUI/Rows/Exports/DUIOAuthButton":25,"./DynamicUI/Rows/Exports/DUISecureInputField":26,"./DynamicUI/Rows/Exports/DUISelect":27,"./DynamicUI/Rows/Exports/DUIStepper":28,"./DynamicUI/Rows/Exports/DUISwitch":29,"./Exports/Chapter":30,"./Exports/ChapterDetails":31,"./Exports/Cookie":32,"./Exports/HomeSection":33,"./Exports/IconText":34,"./Exports/MangaInfo":35,"./Exports/MangaUpdates":36,"./Exports/PBCanvas":37,"./Exports/PBImage":38,"./Exports/PagedResults":39,"./Exports/PartialSourceManga":40,"./Exports/RawData":41,"./Exports/Request":42,"./Exports/RequestManager":43,"./Exports/Response":44,"./Exports/SearchField":45,"./Exports/SearchRequest":46,"./Exports/SecureStateManager":47,"./Exports/SourceCookieStore":48,"./Exports/SourceInterceptor":49,"./Exports/SourceManga":50,"./Exports/SourceStateManager":51,"./Exports/Tag":52,"./Exports/TagSection":53,"./Exports/TrackedManga":54,"./Exports/TrackedMangaChapterReadAction":55,"./Exports/TrackerActionQueue":56}],58:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./generated/_exports"), exports);
__exportStar(require("./base/index"), exports);
__exportStar(require("./compat/DyamicUI"), exports);

},{"./base/index":7,"./compat/DyamicUI":13,"./generated/_exports":57}],59:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AEManga = exports.AEMangaInfo = void 0;
const types_1 = require("@paperback/types");
const AEMangaParser_1 = require("./AEMangaParser");
const AEManga_DOMAIN = 'https://manga.ae';
exports.AEMangaInfo = {
    version: '1.0.0',
    name: 'MangaAE',
    icon: 'icon.png',
    author: 'xOnlyFadi',
    authorWebsite: 'https://github.com/xOnlyFadi',
    description: 'Extension that pulls comics from manga.ae.',
    contentRating: types_1.ContentRating.EVERYONE,
    websiteBaseURL: AEManga_DOMAIN,
    language: 'العربية',
    sourceTags: [
        {
            text: 'Cloudflare',
            type: types_1.BadgeColor.RED
        },
        {
            text: 'العربية',
            type: types_1.BadgeColor.GREY
        }
    ]
};
class AEManga extends types_1.Source {
    constructor() {
        super(...arguments);
        this.baseUrl = AEManga_DOMAIN;
        this.requestManager = App.createRequestManager({
            requestsPerSecond: 2,
            requestTimeout: 15000,
            interceptor: {
                interceptRequest: async (request) => {
                    request.headers = {
                        ...(request.headers ?? {}),
                        ...{
                            'user-agent': await this.requestManager.getDefaultUserAgent(),
                            'referer': `${AEManga_DOMAIN}/`
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
                request: App.createRequest({
                    url: encodeURI(`${AEManga_DOMAIN}/manga/page:1|order:views`),
                    method: 'GET',
                }),
                section: App.createHomeSection({
                    id: 'views',
                    title: 'المانجا المشهورة',
                    containsMoreItems: true,
                    type: 'singleRowNormal'
                }),
            },
            {
                request: App.createRequest({
                    url: encodeURI(`${AEManga_DOMAIN}/manga/page:1|order:updated_at`),
                    method: 'GET',
                }),
                section: App.createHomeSection({
                    id: 'updated_at',
                    title: 'المانجا المحدثه',
                    containsMoreItems: true,
                    type: 'singleRowNormal'
                }),
            },
            {
                request: App.createRequest({
                    url: encodeURI(`${AEManga_DOMAIN}/manga/page:1|order:release_date`),
                    method: 'GET',
                }),
                section: App.createHomeSection({
                    id: 'release_date',
                    title: 'تاريخ النشر',
                    containsMoreItems: true,
                    type: 'singleRowNormal'
                }),
            },
            {
                request: App.createRequest({
                    url: encodeURI(`${AEManga_DOMAIN}/manga/page:1|order:chapter_count`),
                    method: 'GET',
                }),
                section: App.createHomeSection({
                    id: 'chapter_count',
                    title: 'عدد الفصول',
                    containsMoreItems: true,
                    type: 'singleRowNormal'
                }),
            },
            {
                request: App.createRequest({
                    url: encodeURI(`${AEManga_DOMAIN}/manga/page:1|order:status`),
                    method: 'GET',
                }),
                section: App.createHomeSection({
                    id: 'status',
                    title: 'الحالة',
                    containsMoreItems: true,
                    type: 'singleRowNormal'
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
        const request = App.createRequest({
            url: encodeURI(`${AEManga_DOMAIN}/manga/page:${page}|order:${homepageSectionId}`),
            method: 'GET',
        });
        const response = await this.requestManager.schedule(request, 1);
        this.CloudFlareError(response.status);
        const $ = this.cheerio.load(response.data);
        const manga = (0, AEMangaParser_1.parseSearch)($, this);
        metadata = (0, AEMangaParser_1.NextPage)($) ? { page: page + 1 } : undefined;
        return App.createPagedResults({
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
            request = App.createRequest({
                url: encodeURI(`${AEManga_DOMAIN}/manga/page:${page}|search:${query.title.replace(/ /g, '%20')}${Order.length !== 0 ? Order[0] : ''}${Sort.length !== 0 ? Sort[0] : ''}`),
                method: 'GET',
            });
        }
        else {
            request = App.createRequest({
                url: encodeURI(`${AEManga_DOMAIN}/manga/page:${page}${Genres.length !== 0 ? Genres[0] : ''}${Order.length !== 0 ? Order[0] : ''}${Sort.length !== 0 ? Sort[0] : ''}`),
                method: 'GET',
            });
        }
        const response = await this.requestManager.schedule(request, 1);
        this.CloudFlareError(response.status);
        const $ = this.cheerio.load(response.data);
        const manga = (0, AEMangaParser_1.parseSearch)($, this);
        metadata = (0, AEMangaParser_1.NextPage)($) ? { page: page + 1 } : undefined;
        return App.createPagedResults({
            results: manga,
            metadata
        });
    }
    async getTags() {
        const request = App.createRequest({
            url: `${AEManga_DOMAIN}/manga/`,
            method: 'GET',
        });
        const response = await this.requestManager.schedule(request, 1);
        this.CloudFlareError(response.status);
        const $ = this.cheerio.load(response.data);
        return (0, AEMangaParser_1.parseTags)($);
    }
    async getMangaDetails(mangaId) {
        const request = App.createRequest({
            url: `${AEManga_DOMAIN}/${mangaId}`,
            method: 'GET',
        });
        const response = await this.requestManager.schedule(request, 1);
        this.CloudFlareError(response.status);
        const $ = this.cheerio.load(response.data);
        return (0, AEMangaParser_1.parseMangaDetails)($, mangaId);
    }
    async getChapters(mangaId) {
        const request = App.createRequest({
            url: `${AEManga_DOMAIN}/${mangaId}`,
            method: 'GET',
        });
        const response = await this.requestManager.schedule(request, 1);
        this.CloudFlareError(response.status);
        const $ = this.cheerio.load(response.data);
        return (0, AEMangaParser_1.parseChapters)($);
    }
    async getChapterDetails(mangaId, chapterId) {
        const request = App.createRequest({
            url: `${AEManga_DOMAIN}/${mangaId}/${chapterId}`,
            method: 'GET',
        });
        const response = await this.requestManager.schedule(request, 1);
        this.CloudFlareError(response.status);
        const $ = this.cheerio.load(response.data);
        return (0, AEMangaParser_1.parseChapterDetails)($, mangaId, chapterId);
    }
    async getCloudflareBypassRequestAsync() {
        return App.createRequest({
            url: AEManga_DOMAIN,
            method: 'GET',
            headers: {
                'user-agent': await this.requestManager.getDefaultUserAgent(),
                'referer': `${AEManga_DOMAIN}/`
            }
        });
    }
    CloudFlareError(status) {
        if (status == 503) {
            throw new Error(`CLOUDFLARE BYPASS ERROR:\nPlease go to the homepage of <${AEManga.name}> and press the cloud icon.`);
        }
    }
}
exports.AEManga = AEManga;

},{"./AEMangaParser":60,"@paperback/types":58}],60:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NextPage = exports.parseSearch = exports.parseTags = exports.parseChapterDetails = exports.parseChapters = exports.parseMangaDetails = void 0;
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
    const tagSections = [App.createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => App.createTag(x)) })];
    const status = $('div.manga-details-extended h4', contentSection).first().text().trim().toLowerCase();
    return App.createSourceManga({
        id: mangaId,
        mangaInfo: App.createMangaInfo({
            titles: titles,
            image: image,
            status: status,
            author: authors.length !== 0 ? authors.join(', ') : '',
            tags: tagSections,
            desc: description,
        })
    });
};
exports.parseMangaDetails = parseMangaDetails;
const parseChapters = ($) => {
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
        chapters.push(App.createChapter({
            id: `${chapterId}/0/allpages`,
            name: decodeHTMLEntity(title),
            chapNum: isNaN(chapNum) ? 0 : chapNum,
            time: new Date(LastUpdated),
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
    return App.createChapterDetails({
        id: chapterId,
        mangaId: mangaId,
        pages: pages,
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
        App.createTagSection({ id: 'empty', label: 'العناوين لن تعمل مع الأنواع', tags: [] }),
        App.createTagSection({ id: '0', label: 'أظهار المانجا التي تحتوي على', tags: arrayTags.map(x => App.createTag(x)) }),
        App.createTagSection({ id: '1', label: 'ترتيب المانجا على حسب', tags: OrderBy.map(x => App.createTag(x)) }),
        App.createTagSection({ id: '2', label: 'ترتيب حسب', tags: sortByTags.map(x => App.createTag(x)) })
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
        results.push(App.createPartialSourceManga({
            mangaId: id,
            image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
            title: decodeHTMLEntity(title),
            subtitle: subtitle ? `أخر فصل : ${subtitle}` : '',
        }));
    }
    return results;
};
exports.parseSearch = parseSearch;
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

},{}]},{},[59])(59)
});
