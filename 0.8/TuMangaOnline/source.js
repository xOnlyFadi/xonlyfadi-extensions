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
exports.TuMangaOnline = exports.TuMangaOnlineInfo = void 0;
const types_1 = require("@paperback/types");
const TuMangaOnlineParser_1 = require("./TuMangaOnlineParser");
const TuMangaOnlineSettings_1 = require("./TuMangaOnlineSettings");
const TuMangaOnline_Base = 'https://visortmo.com';
exports.TuMangaOnlineInfo = {
    author: 'xOnlyFadi',
    description: 'Extensi\u00F3n que extrae el manga de visortmo.com',
    icon: 'icon.png',
    name: 'TuMangaOnline',
    version: '2.0.2',
    authorWebsite: 'https://github.com/xOnlyFadi',
    websiteBaseURL: TuMangaOnline_Base,
    contentRating: types_1.ContentRating.ADULT,
    intents: types_1.SourceIntents.MANGA_CHAPTERS | types_1.SourceIntents.HOMEPAGE_SECTIONS | types_1.SourceIntents.SETTINGS_UI,
    language: 'SPANISH',
    sourceTags: [
        {
            text: 'Spanish',
            type: types_1.BadgeColor.GREY
        }
    ]
};
class TuMangaOnline {
    constructor(cheerio) {
        this.cheerio = cheerio;
        this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36';
        this.parser = new TuMangaOnlineParser_1.Parser();
        this.baseUrl = TuMangaOnline_Base;
        this.requestManager = App.createRequestManager({
            requestsPerSecond: 3,
            requestTimeout: 15000,
            interceptor: {
                interceptRequest: async (request) => {
                    console.log(request.url);
                    request.headers = {
                        ...(request.headers ?? {}),
                        ...{
                            'user-agent': this.userAgent,
                            'referer': `${TuMangaOnline_Base}/`
                        }
                    };
                    return request;
                },
                interceptResponse: async (response) => {
                    return response;
                }
            }
        });
        this.stateManager = App.createSourceStateManager();
    }
    getMangaShareUrl(mangaId) {
        return `${TuMangaOnline_Base}/library/${mangaId}`;
    }
    async getSourceMenu() {
        return App.createDUISection({
            id: 'main',
            header: 'Source Settings',
            rows: async () => [
                (0, TuMangaOnlineSettings_1.contentSettings)(this.stateManager)
            ],
            isHidden: false
        });
    }
    async getCloudflareBypassRequestAsync() {
        return App.createRequest({
            url: TuMangaOnline_Base,
            method: 'GET',
            headers: {
                'referer': `${TuMangaOnline_Base}/`,
                'user-agent': this.userAgent
            }
        });
    }
    async getHomePageSections(sectionCallback) {
        const getNSFWOption = await (0, TuMangaOnlineSettings_1.getNSFW)(this.stateManager);
        const sections = [
            {
                request: App.createRequest({
                    url: `${TuMangaOnline_Base}/library?order_item=creation&order_dir=desc&filter_by=title${getNSFWOption ? '' : '&exclude_genders%5B%5D=6&exclude_genders%5B%5D=17&exclude_genders%5B%5D=18&exclude_genders%5B%5D=19&erotic=false'}&_pg=1&page=1`,
                    method: 'GET'
                }),
                section: App.createHomeSection({
                    id: '1',
                    title: 'Últimas actualizaciones',
                    containsMoreItems: true,
                    type: 'singleRowNormal'
                })
            },
            {
                request: App.createRequest({
                    url: `${TuMangaOnline_Base}/library?order_item=likes_count&order_dir=desc&filter_by=title${getNSFWOption ? '' : '&exclude_genders%5B%5D=6&exclude_genders%5B%5D=17&exclude_genders%5B%5D=18&exclude_genders%5B%5D=19&erotic=false'}&_pg=1&page=1`,
                    method: 'GET'
                }),
                section: App.createHomeSection({
                    id: '2',
                    title: 'Series populares',
                    containsMoreItems: true,
                    type: 'singleRowNormal'
                })
            }
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
        await Promise.all(promises);
    }
    async getViewMoreItems(homepageSectionId, metadata) {
        const getNSFWOption = await (0, TuMangaOnlineSettings_1.getNSFW)(this.stateManager);
        const page = metadata?.page ?? 1;
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
        const request = App.createRequest({
            url: `${TuMangaOnline_Base}${param}`,
            method: 'GET'
        });
        const response = await this.requestManager.schedule(request, 1);
        const $ = this.cheerio.load(response.data);
        const manga = this.parser.parseHomeSection($, this);
        metadata = this.parser.NextPage($) ? { page: page + 1 } : undefined;
        return App.createPagedResults({
            results: manga,
            metadata
        });
    }
    async getSearchTags() {
        const getNSFWOption = await (0, TuMangaOnlineSettings_1.getNSFW)(this.stateManager);
        const options = App.createRequest({
            url: `${TuMangaOnline_Base}/library`,
            method: 'GET'
        });
        const response = await this.requestManager.schedule(options, 1);
        this.CloudFlareError(response.status);
        const $ = this.cheerio.load(response.data);
        return this.parser.parseTags($, getNSFWOption);
    }
    async getMangaDetails(mangaId) {
        const options = App.createRequest({
            url: `${TuMangaOnline_Base}/library/${mangaId}`,
            method: 'GET'
        });
        const response = await this.requestManager.schedule(options, 1);
        this.CloudFlareError(response.status);
        const $ = this.cheerio.load(response.data);
        return this.parser.parseMangaDetails($, mangaId);
    }
    async getChapters(mangaId) {
        const options = App.createRequest({
            url: `${TuMangaOnline_Base}/library/${mangaId}`,
            method: 'GET'
        });
        const response = await this.requestManager.schedule(options, 1);
        this.CloudFlareError(response.status);
        const $ = this.cheerio.load(response.data);
        return this.parser.parseChapters($, mangaId, this);
    }
    async getChapterDetails(mangaId, chapterId) {
        const options = App.createRequest({
            url: await this.getChapterURL(chapterId, mangaId),
            method: 'GET'
        });
        const response = await this.requestManager.schedule(options, 1);
        this.CloudFlareError(response.status);
        const $ = this.cheerio.load(response.data);
        return this.parser.parseChapterDetails($, mangaId, chapterId);
    }
    async getChapterURL(chapterId, mangaId) {
        const request = App.createRequest({
            url: `${this.baseUrl}/view_uploads/${chapterId}/`,
            headers: {
                'referer': `${this.baseUrl}/library/${mangaId}`
            },
            method: 'GET'
        });
        const data = await this.requestManager.schedule(request, 1);
        this.CloudFlareError(data.status);
        const $ = this.cheerio.load(data.data);
        const button = $('.flex-row button.btn-social').attr('onclick')?.match(/copyToClipboard\(['"`](.*)['"`]\)/i);
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
    }
    async getSearchResults(query, metadata) {
        const getNSFWOption = await (0, TuMangaOnlineSettings_1.getNSFW)(this.stateManager);
        const page = metadata?.page ?? 1;
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
        const tags = query.includedTags?.map(tag => tag.id) ?? [];
        const genres = [];
        tags.map((value) => {
            if (value.indexOf('.') === -1) {
                genres.push(`&genders[]=${value}`);
            }
            else {
                switch (value.split('.')[0]) {
                    case 'types':
                        search.types = value.split('.')[1] ?? '';
                        break;
                    case 'status':
                        search.status = value.split('.')[1] ?? '';
                        break;
                    case 'trstatus':
                        search.translationstatus = value.split('.')[1] ?? '';
                        break;
                    case 'demog':
                        search.demography = value.split('.')[1] ?? '';
                        break;
                    case 'filby':
                        search.filter = value.split('.')[1] ?? 'title';
                        break;
                    case 'sorting':
                        search.sorting = value.split('.')[1] ?? 'likes_count';
                        break;
                    case 'byaplha':
                        search.sortby = value.split('.')[1] ?? 'asc';
                        break;
                    case 'contenttype':
                        // eslint-disable-next-line no-case-declarations
                        const contype = value.split('.')[1] ?? '';
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
        search.genres = (genres ?? []).join('');
        let request;
        if (query.includedTags?.length == 0) {
            request = App.createRequest({
                url: encodeURI(`${TuMangaOnline_Base}/library?title=${query?.title?.replace(/%20/g, '+').replace(/ /g, '+') ?? ''}${getNSFWOption ? '' : '&exclude_genders%5B%5D=6&exclude_genders%5B%5D=17&exclude_genders%5B%5D=18&exclude_genders%5B%5D=19&erotic=false'}&page=${page}&_pg=1`),
                method: 'GET'
            });
        }
        else {
            request = App.createRequest({
                url: encodeURI(`${TuMangaOnline_Base}/library?title=${query?.title?.replace(/%20/g, '+').replace(/ /g, '+') ?? ''}${getNSFWOption ? '' : '&exclude_genders%5B%5D=6&exclude_genders%5B%5D=17&exclude_genders%5B%5D=18&exclude_genders%5B%5D=19&erotic=false'}&page=${page}&_pg=1&type=${search.types}&demography=${search.demography}&status=${search.status}&translation_status=${search.translationstatus}&${search.filter}&order_item=${search.sorting}&order_dir=${search.sortby}&webcomic=${search.webcomic}&yonkoma=${search.yonkoma}&amateur=${search.amateur}&erotic=${search.erotic}${search.genres}`),
                method: 'GET'
            });
        }
        const data = await this.requestManager.schedule(request, 2);
        this.CloudFlareError(data.status);
        const $ = this.cheerio.load(data.data);
        const manga = this.parser.parseHomeSection($, this);
        metadata = this.parser.NextPage($) ? { page: page + 1 } : undefined;
        return App.createPagedResults({
            results: manga,
            metadata
        });
    }
    CloudFlareError(status) {
        if (status == 503 || status == 403) {
            throw new Error(`CLOUDFLARE BYPASS ERROR:\nPlease go to Settings > Sources > ${TuMangaOnline.name} and press Cloudflare Bypass`);
        }
    }
}
exports.TuMangaOnline = TuMangaOnline;

},{"./TuMangaOnlineParser":63,"./TuMangaOnlineSettings":64,"@paperback/types":61}],63:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
require("../scopes");
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
        const items = [];
        for (const obj of $('div.element').toArray()) {
            const info = $('div.element > a', obj);
            const id = this.idCleaner(info.attr('href')?.trim() ?? '', source) ?? '';
            const title = this.decodeHTMLEntity($('h4.text-truncate', info).text().trim()) ?? this.decodeHTMLEntity($('h4.text-truncate', info)?.attr('title')?.trim() ?? '') ?? '';
            const image = $(obj).find('style').toString().substringAfterFirst('(\'').substringBeforeFirst('\')') ?? '';
            if (!id || !title)
                continue;
            items.push(App.createPartialSourceManga({
                image,
                title: this.decodeHTMLEntity(title),
                mangaId: id,
                subtitle: undefined
            }));
        }
        return items;
    }
    parseChapterDetails($, mangaId, chapterId) {
        const pages = [];
        for (const obj of $('div.viewer-container img').toArray()) {
            const page = $(obj).attr('data-src') ?? $(obj).attr('src') ?? '';
            if (!page) {
                throw new Error(`Could not parse page for ${chapterId}`);
            }
            pages.push(page);
        }
        return App.createChapterDetails({
            id: chapterId,
            mangaId: mangaId,
            pages: pages
        });
    }
    parseChapters($, mangaId, source) {
        const chapters = [];
        const ChapterNumRegex = /capítulo ([\d.]+)?|capitulo ([\d.]+)?/i;
        if ($('div.chapters').contents().length == 0) {
            for (const obj of $('div.chapter-list-element > ul.list-group li.list-group-item').toArray()) {
                const id = this.idCleaner($('div.row > .text-right > a', obj).attr('href') ?? '', source);
                const name = 'One Shot';
                const scanlator = $('div.col-md-6.text-truncate', obj).text().trim() ?? '';
                const date_upload = $('span.badge.badge-primary.p-2', obj).first().text() ?? '';
                if (typeof id === 'undefined') {
                    throw new Error(`Could not parse out ID when getting chapters for ${mangaId}`);
                }
                chapters.push(App.createChapter({
                    id: id,
                    name: name,
                    group: scanlator,
                    chapNum: 1,
                    time: new Date(date_upload),
                    langCode: '🇪🇸'
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
                    const id = this.idCleaner($('div.row > .text-right > a', allchaps).attr('href') ?? '', source);
                    const scanlator = $('div.col-md-6.text-truncate', allchaps).text().trim() ?? '';
                    const date_upload = $('span.badge.badge-primary.p-2', allchaps).first().text() ?? '';
                    if (typeof id === 'undefined') {
                        throw new Error(`Could not parse out ID when getting chapters for ${mangaId}`);
                    }
                    chapters.push(App.createChapter({
                        id: id,
                        name: name,
                        group: scanlator,
                        chapNum: chapNum ?? 0,
                        time: new Date(date_upload),
                        langCode: '🇪🇸'
                    }));
                }
            }
        }
        return chapters;
    }
    parseMangaDetails($, mangaId) {
        const infotitle = $('h1.element-title').first();
        infotitle.find('small').remove();
        const title = infotitle.text().trim() ?? '';
        const title2 = this.decodeHTMLEntity($('h2.element-subtitle').first().text().trim()) ?? '';
        const image = $('.book-thumbnail').attr('src') ?? 'https://paperback.moe/icons/logo-alt.svg';
        const desc = this.decodeHTMLEntity($('p.element-description').text().trim()) ?? '';
        const infoAuth = $('h5.card-title');
        const author = this.decodeHTMLEntity(infoAuth.first().text().trim().substringAfterFirst(', ')) ?? '';
        const artist = this.decodeHTMLEntity(infoAuth.last().text().trim().substringAfterFirst(', ')) ?? '';
        const status = this.decodeHTMLEntity($('span.book-status').text().trim()) ?? '';
        const arrayTags = [];
        const genreregex = /genders.*?=(\d+)?/i;
        for (const obj of $('a.py-2').toArray()) {
            const link = $(obj)?.attr('href') ?? '';
            const idRegex = link.match(genreregex);
            let id;
            if (idRegex && idRegex[1])
                id = idRegex[1];
            const label = $(obj).text() ?? '';
            if (!id || !label)
                continue;
            arrayTags.push({
                id,
                label
            });
        }
        return App.createSourceManga({
            id: mangaId,
            mangaInfo: App.createMangaInfo({
                titles: [title, title2],
                image,
                status,
                author: author,
                artist: artist,
                tags: [App.createTagSection({ id: '0', label: 'genres', tags: arrayTags.map((x) => App.createTag(x)) })],
                desc: desc !== '' ? desc : 'La fuente no proporciona ninguna decscripci\u00F3n (TuMangaOnline)'
            })
        });
    }
    parseTags($, isNSFW) {
        const arrayTags = [];
        const arrayTags2 = [
            {
                id: 'types.manga',
                label: 'Manga'
            },
            {
                id: 'types.manhua',
                label: 'Manhua'
            },
            {
                id: 'types.manhwa',
                label: 'Manhwa'
            },
            {
                id: 'types.novel',
                label: 'Novela'
            },
            {
                id: 'types.one_shot',
                label: 'One shot'
            },
            {
                id: 'types.doujinshi',
                label: 'Doujinshi'
            },
            {
                id: 'types.oel',
                label: 'Oel'
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
            const id = $('input', tag).attr('value') ?? '0';
            if (!NSFWids.includes(id)) {
                if (!id || !label)
                    continue;
                arrayTags.push({ id: id, label: label });
            }
        }
        return [
            App.createTagSection({ id: '0', label: 'Géneros', tags: arrayTags.map(x => App.createTag(x)) }),
            App.createTagSection({ id: '1', label: 'Filtrar por tipo', tags: arrayTags2.map(x => App.createTag(x)) }),
            App.createTagSection({ id: '2', label: 'Ignorado sino se filtra por tipo', tags: [] }),
            App.createTagSection({ id: '3', label: 'Filtrar por estado de serie', tags: arrayTags3.map(x => App.createTag(x)) }),
            App.createTagSection({ id: '4', label: 'Ignorado sino se filtra por tipo', tags: [] }),
            App.createTagSection({ id: '5', label: 'Filtrar por estado de traducción', tags: arrayTags4.map(x => App.createTag(x)) }),
            App.createTagSection({ id: '6', label: 'Filtrar por demografía', tags: arrayTags5.map(x => App.createTag(x)) }),
            App.createTagSection({ id: '7', label: 'Filtrar por', tags: arrayTags6.map(x => App.createTag(x)) }),
            App.createTagSection({ id: '8', label: 'Ordenar por', tags: arrayTags7.map(x => App.createTag(x)) }),
            App.createTagSection({ id: '9', label: 'Ordenar por by', tags: arrayTags8.map(x => App.createTag(x)) }),
            App.createTagSection({ id: '10', label: 'Filtrar por tipo de contenido', tags: arrayTags9.map(x => App.createTag(x)) })
        ];
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

},{"../scopes":65}],64:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contentSettings = exports.getNSFW = void 0;
const getNSFW = async (stateManager) => {
    return await stateManager.retrieve('nsfw') ?? false;
};
exports.getNSFW = getNSFW;
const contentSettings = (stateManager) => {
    return App.createDUINavigationButton({
        id: 'content_settings',
        label: 'Configuración del contenido',
        form: App.createDUIForm({
            sections: async () => [
                App.createDUISection({
                    id: 'content',
                    footer: 'Activa el NSFW en la aplicación',
                    isHidden: false,
                    rows: async () => [
                        App.createDUISwitch({
                            id: 'nsfw',
                            label: 'NSFW',
                            value: App.createDUIBinding({
                                get: async () => await stateManager.retrieve('nsfw') ?? false,
                                set: async (newValue) => await stateManager.store('nsfw', newValue)
                            })
                        })
                    ]
                })
            ]
        })
    });
};
exports.contentSettings = contentSettings;

},{}],65:[function(require,module,exports){
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

},{}]},{},[62])(62)
});
