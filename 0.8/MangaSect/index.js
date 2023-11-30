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
Object.defineProperty(exports, "__esModule", { value: true });

},{}],5:[function(require,module,exports){
"use strict";
/**
 * Request objects hold information for a particular source (see sources for example)
 * This allows us to to use a generic api to make the calls against any source
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.urlEncodeObject = exports.convertTime = exports.Source = void 0;
/**
* @deprecated Use {@link PaperbackExtensionBase}
*/
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

},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentRating = exports.SourceIntents = void 0;
var SourceIntents;
(function (SourceIntents) {
    SourceIntents[SourceIntents["MANGA_CHAPTERS"] = 1] = "MANGA_CHAPTERS";
    SourceIntents[SourceIntents["MANGA_TRACKING"] = 2] = "MANGA_TRACKING";
    SourceIntents[SourceIntents["HOMEPAGE_SECTIONS"] = 4] = "HOMEPAGE_SECTIONS";
    SourceIntents[SourceIntents["COLLECTION_MANAGEMENT"] = 8] = "COLLECTION_MANAGEMENT";
    SourceIntents[SourceIntents["CLOUDFLARE_BYPASS_REQUIRED"] = 16] = "CLOUDFLARE_BYPASS_REQUIRED";
    SourceIntents[SourceIntents["SETTINGS_UI"] = 32] = "SETTINGS_UI";
})(SourceIntents = exports.SourceIntents || (exports.SourceIntents = {}));
/**
 * A content rating to be attributed to each source.
 */
var ContentRating;
(function (ContentRating) {
    ContentRating["EVERYONE"] = "EVERYONE";
    ContentRating["MATURE"] = "MATURE";
    ContentRating["ADULT"] = "ADULT";
})(ContentRating = exports.ContentRating || (exports.ContentRating = {}));

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
__exportStar(require("./ByteArray"), exports);
__exportStar(require("./Badge"), exports);
__exportStar(require("./interfaces"), exports);
__exportStar(require("./SourceInfo"), exports);
__exportStar(require("./HomeSectionType"), exports);
__exportStar(require("./PaperbackExtensionBase"), exports);

},{"./Badge":1,"./ByteArray":2,"./HomeSectionType":3,"./PaperbackExtensionBase":4,"./Source":5,"./SourceInfo":6,"./interfaces":15}],8:[function(require,module,exports){
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
Object.defineProperty(exports, "__esModule", { value: true });

},{}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],15:[function(require,module,exports){
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
__exportStar(require("./CloudflareBypassRequestProviding"), exports);
__exportStar(require("./HomePageSectionsProviding"), exports);
__exportStar(require("./MangaProgressProviding"), exports);
__exportStar(require("./MangaProviding"), exports);
__exportStar(require("./RequestManagerProviding"), exports);
__exportStar(require("./SearchResultsProviding"), exports);

},{"./ChapterProviding":8,"./CloudflareBypassRequestProviding":9,"./HomePageSectionsProviding":10,"./MangaProgressProviding":11,"./MangaProviding":12,"./RequestManagerProviding":13,"./SearchResultsProviding":14}],16:[function(require,module,exports){
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
Object.defineProperty(exports, "__esModule", { value: true });

},{}],58:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],59:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],60:[function(require,module,exports){
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
__exportStar(require("./Exports/MangaProgress"), exports);
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
__exportStar(require("./Exports/TrackerActionQueue"), exports);

},{"./DynamicUI/Exports/DUIBinding":17,"./DynamicUI/Exports/DUIForm":18,"./DynamicUI/Exports/DUIFormRow":19,"./DynamicUI/Exports/DUISection":20,"./DynamicUI/Rows/Exports/DUIButton":21,"./DynamicUI/Rows/Exports/DUIHeader":22,"./DynamicUI/Rows/Exports/DUIInputField":23,"./DynamicUI/Rows/Exports/DUILabel":24,"./DynamicUI/Rows/Exports/DUILink":25,"./DynamicUI/Rows/Exports/DUIMultilineLabel":26,"./DynamicUI/Rows/Exports/DUINavigationButton":27,"./DynamicUI/Rows/Exports/DUIOAuthButton":28,"./DynamicUI/Rows/Exports/DUISecureInputField":29,"./DynamicUI/Rows/Exports/DUISelect":30,"./DynamicUI/Rows/Exports/DUIStepper":31,"./DynamicUI/Rows/Exports/DUISwitch":32,"./Exports/Chapter":33,"./Exports/ChapterDetails":34,"./Exports/Cookie":35,"./Exports/HomeSection":36,"./Exports/IconText":37,"./Exports/MangaInfo":38,"./Exports/MangaProgress":39,"./Exports/MangaUpdates":40,"./Exports/PBCanvas":41,"./Exports/PBImage":42,"./Exports/PagedResults":43,"./Exports/PartialSourceManga":44,"./Exports/RawData":45,"./Exports/Request":46,"./Exports/RequestManager":47,"./Exports/Response":48,"./Exports/SearchField":49,"./Exports/SearchRequest":50,"./Exports/SecureStateManager":51,"./Exports/SourceCookieStore":52,"./Exports/SourceInterceptor":53,"./Exports/SourceManga":54,"./Exports/SourceStateManager":55,"./Exports/Tag":56,"./Exports/TagSection":57,"./Exports/TrackedMangaChapterReadAction":58,"./Exports/TrackerActionQueue":59}],61:[function(require,module,exports){
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

},{"./base/index":7,"./compat/DyamicUI":16,"./generated/_exports":60}],62:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MangaSect = exports.MangaSectInfo = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
const types_1 = require("@paperback/types");
const MangaSectParser_1 = require("./MangaSectParser");
const DOMAIN = 'https://mangasect.com';
exports.MangaSectInfo = {
    version: '2.0.0',
    name: 'MangaSect',
    icon: 'icon.png',
    author: 'xOnlyFadi',
    authorWebsite: 'https://github.com/xOnlyFadi',
    description: 'Extension that pulls comics from mangasect.com',
    contentRating: types_1.ContentRating.EVERYONE,
    websiteBaseURL: DOMAIN,
    language: 'ENGLISH',
    intents: types_1.SourceIntents.HOMEPAGE_SECTIONS | types_1.SourceIntents.MANGA_CHAPTERS
};
class MangaSect {
    constructor(cheerio) {
        this.cheerio = cheerio;
        this.baseUrl = DOMAIN;
        this.requestManager = App.createRequestManager({
            requestsPerSecond: 2,
            requestTimeout: 15000,
            interceptor: {
                interceptRequest: async (request) => {
                    request.headers = {
                        ...(request.headers ?? {}),
                        ...{
                            'user-agent': await this.requestManager.getDefaultUserAgent(),
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
    }
    async getCloudflareBypassRequestAsync() {
        return App.createRequest({
            url: DOMAIN,
            method: 'GET',
            headers: {
                'referer': `${DOMAIN}/`,
                'user-agent': await this.requestManager.getDefaultUserAgent()
            }
        });
    }
    getMangaShareUrl(mangaId) { return `${DOMAIN}/manga/${mangaId}`; }
    async getHomePageSections(sectionCallback) {
        const request = App.createRequest({
            url: DOMAIN,
            method: 'GET'
        });
        const response = await this.requestManager.schedule(request, 2);
        const $ = this.cheerio.load(response.data);
        await (0, MangaSectParser_1.parseHomeSections)($, sectionCallback);
    }
    async getViewMoreItems(homepageSectionId, metadata) {
        const page = metadata?.page ?? 1;
        const request = App.createRequest({
            url: encodeURI(`${DOMAIN}/filter/${page}/?sort=${homepageSectionId}`),
            method: 'GET'
        });
        const response = await this.requestManager.schedule(request, 1);
        this.CloudFlareError(response.status);
        const $ = this.cheerio.load(response.data);
        const manga = (0, MangaSectParser_1.parseSearch)($);
        metadata = manga.length >= 19 ? { page: page + 1 } : undefined;
        return App.createPagedResults({
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
            request = App.createRequest({
                url: encodeURI(`${DOMAIN}/search/${page}/?keyword=${query.title}`),
                method: 'GET'
            });
        }
        else {
            request = App.createRequest({
                url: encodeURI(`${DOMAIN}/filter/${page}/?sort=${Sort.length > 0 ? Sort[0] : 'default'}${Status.length > 0 ? Status[0] : ''}${Genres.length > 0 ? `&genres=${Genres.join('%2C')}` : ''}`),
                method: 'GET'
            });
        }
        const response = await this.requestManager.schedule(request, 1);
        this.CloudFlareError(response.status);
        const $ = this.cheerio.load(response.data);
        const manga = (0, MangaSectParser_1.parseSearch)($);
        metadata = manga.length >= 19 ? { page: page + 1 } : undefined;
        return App.createPagedResults({
            results: manga,
            metadata
        });
    }
    async getSearchTags() {
        const request = App.createRequest({
            url: `${DOMAIN}/filter/`,
            method: 'GET'
        });
        const response = await this.requestManager.schedule(request, 1);
        this.CloudFlareError(response.status);
        const $ = this.cheerio.load(response.data);
        return (0, MangaSectParser_1.parseTags)($);
    }
    async getMangaDetails(mangaId) {
        const request = App.createRequest({
            url: `${DOMAIN}/manga/${mangaId}`,
            method: 'GET'
        });
        const response = await this.requestManager.schedule(request, 1);
        this.CloudFlareError(response.status);
        const $ = this.cheerio.load(response.data);
        return (0, MangaSectParser_1.parseMangaDetails)($, mangaId);
    }
    async getChapters(mangaId) {
        const request = App.createRequest({
            url: `${DOMAIN}/manga/${mangaId}`,
            method: 'GET'
        });
        const response = await this.requestManager.schedule(request, 1);
        this.CloudFlareError(response.status);
        const $ = this.cheerio.load(response.data);
        return (0, MangaSectParser_1.parseChapters)($);
    }
    async getChapterDetails(mangaId, chapterId) {
        const request = App.createRequest({
            url: `${DOMAIN}/ajax/image/list/chap/${chapterId}`,
            method: 'GET'
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
    CloudFlareError(status) {
        if (status == 503 || status == 403) {
            throw new Error(`CLOUDFLARE BYPASS ERROR:\nPlease go to Settings > Sources > ${exports.MangaSectInfo.name} and press Cloudflare Bypass`);
        }
    }
}
exports.MangaSect = MangaSect;

},{"./MangaSectParser":63,"@paperback/types":61}],63:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseHomeSections = exports.parseSearch = exports.parseTags = exports.parseChapterDetails = exports.parseChapters = exports.parseMangaDetails = void 0;
const types_1 = require("@paperback/types");
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
    const description = decodeHTMLEntity($('article #syn-target').text().trim() ?? '');
    return App.createSourceManga({
        id: mangaId,
        mangaInfo: App.createMangaInfo({
            titles: [title],
            image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
            status: rawStatus ?? '',
            author: author ? author : '',
            tags: [App.createTagSection({ id: '0', label: 'genres', tags: arrayTags.map(x => App.createTag(x)) })],
            desc: description
        })
    });
};
exports.parseMangaDetails = parseMangaDetails;
const parseChapters = ($) => {
    const chapters = [];
    for (const chapter of $('article #myUL li')?.toArray()) {
        const AElement = $('a', chapter);
        const title = AElement.text().trim() ?? '';
        const chapterId = AElement.attr('href')?.replace(`${DOMAIN}/manga/`, '')?.split('/').pop() ?? '';
        const time = $('.timeago', chapter)?.attr('datetime') ?? '';
        if (!chapterId)
            continue;
        const numRegex = title.match(/Chapter\s+(\d+(?:\.\d+)?)(?::\s+)?\w*/);
        let chapNum;
        if (numRegex && numRegex[1])
            chapNum = numRegex[1];
        chapters.push(App.createChapter({
            id: chapterId,
            name: decodeHTMLEntity(title),
            chapNum: chapNum ? !isNaN(Number(chapNum)) ? Number(chapNum) : 0 : 0,
            time: time ? new Date(Number(time) * 1000) : undefined,
            langCode: '🇬🇧'
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
    return App.createChapterDetails({
        id: chapterId,
        mangaId: mangaId,
        pages: pages
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
        App.createTagSection({ id: 'status', label: 'Status', tags: Status.map(x => App.createTag(x)) }),
        App.createTagSection({ id: 'sort', label: 'Sort', tags: Sort.map(x => App.createTag(x)) }),
        App.createTagSection({ id: 'genres', label: 'Genres', tags: Genres.map(x => App.createTag(x)) })
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
        results.push(App.createPartialSourceManga({
            image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
            title: decodeHTMLEntity(title),
            mangaId: id
        }));
    }
    return results;
};
exports.parseSearch = parseSearch;
const parseHomeSections = async ($, sectionCallback) => {
    const featured_section = App.createHomeSection({ id: 'featured', title: 'Featured', type: types_1.HomeSectionType.featured, containsMoreItems: false });
    const recommend_section = App.createHomeSection({ id: 'recommend', title: 'Recommend', type: types_1.HomeSectionType.singleRowNormal, containsMoreItems: false });
    const latest_section = App.createHomeSection({ id: 'latest-updated', title: 'Latest', type: types_1.HomeSectionType.singleRowNormal, containsMoreItems: true });
    const new_section = App.createHomeSection({ id: 'new', title: 'New', type: types_1.HomeSectionType.singleRowNormal, containsMoreItems: false });
    const monthly_section = App.createHomeSection({ id: 'monthly', title: 'Top Monthly', type: types_1.HomeSectionType.singleRowNormal, containsMoreItems: false });
    const weekly_section = App.createHomeSection({ id: 'weekly', title: 'Top Weekly', type: types_1.HomeSectionType.singleRowNormal, containsMoreItems: false });
    const daily_section = App.createHomeSection({ id: 'daily', title: 'Top  Daily', type: types_1.HomeSectionType.singleRowNormal, containsMoreItems: false });
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
        featured.push(App.createPartialSourceManga({
            image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
            title: title,
            mangaId: id,
            subtitle: subTitle
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
        recommend.push(App.createPartialSourceManga({
            image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
            title: title,
            mangaId: id
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
        latest.push(App.createPartialSourceManga({
            image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
            title: title,
            mangaId: id
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
        newm.push(App.createPartialSourceManga({
            image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
            title: title,
            mangaId: id
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
        monthly.push(App.createPartialSourceManga({
            image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
            title: title,
            mangaId: id
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
        weekly.push(App.createPartialSourceManga({
            image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
            title: title,
            mangaId: id
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
        daily.push(App.createPartialSourceManga({
            image: image ? image : 'https://i.imgur.com/GYUxEX8.png',
            title: title,
            mangaId: id
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

},{"@paperback/types":61}]},{},[62])(62)
});
