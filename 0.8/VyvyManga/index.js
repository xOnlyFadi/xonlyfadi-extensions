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
exports.VyvyManga = exports.VyvyMangaInfo = void 0;
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
const types_1 = require("@paperback/types");
const VyvyMangaParser_1 = require("./VyvyMangaParser");
const VyvyManga_Base = 'https://vyvymanga.com';
exports.VyvyMangaInfo = {
    author: 'xOnlyFadi',
    description: 'Extension that pulls manga from VyvyMangas.com',
    icon: 'icon.png',
    name: 'VyvyManga',
    version: '1.0.7',
    authorWebsite: 'https://github.com/xOnlyFadi',
    websiteBaseURL: VyvyManga_Base,
    contentRating: types_1.ContentRating.ADULT,
    language: 'English',
    sourceTags: [
        {
            text: '18+',
            type: types_1.BadgeColor.RED
        }
    ]
};
class VyvyManga extends types_1.Source {
    constructor() {
        super(...arguments);
        this.parser = new VyvyMangaParser_1.Parser();
        this.baseUrl = VyvyManga_Base;
        this.requestManager = App.createRequestManager({
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
        const options = App.createRequest({
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
        const request = App.createRequest({
            url: VyvyManga_Base,
            method: 'GET',
            param
        });
        const response = await this.requestManager.schedule(request, 1);
        const $ = this.cheerio.load(response.data);
        const manga = this.parser.parseSearchResults($);
        metadata = manga.length < 36 ? undefined : { page: page + 1 };
        return App.createPagedResults({
            results: manga,
            metadata
        });
    }
    async getTags() {
        const options = App.createRequest({
            url: `${VyvyManga_Base}/search`,
            method: 'GET'
        });
        const response = await this.requestManager.schedule(options, 1);
        this.CloudFlareError(response.status);
        const $ = this.cheerio.load(response.data);
        return [App.createTagSection({
                id: '1',
                label: 'Genres',
                tags: this.parser.parseTags($)
            })];
    }
    async getMangaDetails(mangaId) {
        const options = App.createRequest({
            url: `${VyvyManga_Base}/manga/${mangaId}`,
            method: 'GET',
        });
        const response = await this.requestManager.schedule(options, 1);
        this.CloudFlareError(response.status);
        const $ = this.cheerio.load(response.data);
        return this.parser.parseMangaDetails($, mangaId, this);
    }
    async getChapters(mangaId) {
        const options = App.createRequest({
            url: `${VyvyManga_Base}/manga/${mangaId}`,
            method: 'GET'
        });
        const response = await this.requestManager.schedule(options, 1);
        this.CloudFlareError(response.status);
        const $ = this.cheerio.load(response.data);
        return this.parser.parseChapters($);
    }
    async getChapterDetails(mangaId, chapterId) {
        const options = App.createRequest({
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
            request = App.createRequest({
                url: encodeURI(`${VyvyManga_Base}/genre/${firstTag.split('.')[1]}`),
                method: 'GET'
            });
        }
        else {
            request = App.createRequest({
                url: encodeURI(`${VyvyManga_Base}/search?q=${query?.title?.replace(/%20/g, '+').replace(/ /g, '+') ?? ''}&completed=&sort=viewed${query?.includedTags?.map((x) => '&genre[]=' + x.id)}`),
                method: 'GET'
            });
        }
        const data = await this.requestManager.schedule(request, 2);
        this.CloudFlareError(data.status);
        const $ = this.cheerio.load(data.data);
        const manga = this.parser.parseSearchResults($);
        metadata = manga.length < 36 ? undefined : { page: page + 1 };
        return App.createPagedResults({
            results: manga,
            metadata
        });
    }
    CloudFlareError(status) {
        if (status == 503) {
            throw new Error(`CLOUDFLARE BYPASS ERROR:\nPlease go to the homepage of <${VyvyManga.name}> and press the cloud icon.`);
        }
    }
}
exports.VyvyManga = VyvyManga;

},{"./VyvyMangaParser":60,"@paperback/types":58}],60:[function(require,module,exports){
"use strict";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
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
        const section1 = App.createHomeSection({ id: '1', title: 'Most Popular Manga', containsMoreItems: true, type: 'singleRowNormal' });
        const section2 = App.createHomeSection({ id: '2', title: 'Latest', containsMoreItems: true, type: 'singleRowNormal' });
        const section3 = App.createHomeSection({ id: '3', title: 'New Releases', containsMoreItems: true, type: 'singleRowNormal' });
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
            popular.push(App.createPartialSourceManga({
                mangaId: id,
                image,
                title: this.decodeHTMLEntity(title),
                subtitle: subTitle,
            }));
        }
        section1.items = popular;
        sectionCallback(section1);
        for (const obj of arrLatest) {
            const id = $('a', obj).attr('href')?.split('/')?.pop() ?? '';
            const title = this.decodeHTMLEntity($('.comic-title', obj).text().trim()) ?? '';
            const image = $('.comic-image', obj).attr('data-background-image') ?? '';
            const subTitle = $('.tray-item', obj).text().trim() ?? '';
            latest.push(App.createPartialSourceManga({
                mangaId: id,
                image,
                title: this.decodeHTMLEntity(title),
                subtitle: subTitle,
            }));
        }
        section2.items = latest;
        sectionCallback(section2);
        for (const obj of arrNewRel) {
            const id = $('a', obj).attr('href')?.split('/')?.pop() ?? '';
            const title = this.decodeHTMLEntity($('.comic-title', obj).text().trim()) ?? '';
            const image = $('.comic-image', obj).attr('data-background-image') ?? '';
            const subTitle = $('.tray-item', obj).text().trim() ?? '';
            newManga.push(App.createPartialSourceManga({
                mangaId: id,
                image,
                title: this.decodeHTMLEntity(title),
                subtitle: subTitle,
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
        return App.createChapterDetails({
            id: chapterId,
            mangaId: mangaId,
            pages: pages,
        });
    }
    parseChapters($) {
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
            chapters.push(App.createChapter({
                id: url,
                name: name,
                chapNum: !isNaN(chapNum) ? chapNum : NaN,
                time: time,
                langCode: 'English'
            }));
        }
        return chapters;
    }
    parseMangaDetails($, mangaId, _source) {
        const details = $('.col-lg-8');
        const title = this.decodeHTMLEntity($('.col-md-7 .title', details).first().text().trim() ?? '');
        const image = this.getImageSrc($('.col-md-5 img', details));
        let desc = $('.summary .content').first().children().remove().end().text().replace(/\s{2,}/g, ' ').trim() ?? '';
        if (desc == '')
            desc = 'No Decscription provided by the source (VyvyManga)';
        let author = '';
        let artist = '';
        let status = '';
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
        const tagSections = [App.createTagSection({ id: '0', label: 'genres', tags: arrayTags.map((x) => App.createTag(x)) })];
        return App.createSourceManga({
            id: mangaId,
            mangaInfo: App.createMangaInfo({
                titles: [title],
                image,
                status: this.parseStatus(status),
                author,
                artist,
                tags: tagSections,
                desc: this.decodeHTMLEntity(desc),
            })
        });
    }
    parseTags($) {
        const genres = [];
        for (const obj of $('#advance-search .check-genre .form-check').toArray()) {
            const label = $('label', obj).text().trim();
            const id = encodeURI($('input', obj).attr('value') ?? '');
            if (!label || !id)
                continue;
            genres.push(App.createTag({
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
            results.push(App.createPartialSourceManga({
                mangaId: id,
                image,
                title: this.decodeHTMLEntity(title),
                subtitle: subTitle,
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
        let status = 'ONGOING';
        switch (str.toLowerCase()) {
            case 'ongoing':
                status = 'ONGOING';
                break;
            case 'completed':
                status = 'COMPLETED';
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

},{}]},{},[59])(59)
});
