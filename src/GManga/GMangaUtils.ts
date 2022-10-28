// touching anything in the code it will just break

/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable prefer-arrow-callback */
// @ts-ignore
// @ts-nocheck
/* eslint-disable prefer-rest-params */

import CryptoJS from 'crypto-js'


// taken from hakuneko/src/web/mjs/connectors and cleaned by me
class GMangaUtils {

    IsR(t) {
        return (this.IsR = 'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator ? function(t) {
            return typeof t
        } :
            function(t) {
                return t && 'function' == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? 'symbol' : typeof t
            }
        )(t)
    }

    IsA(t) {
        return (this.IsA = 'function' == typeof Symbol && 'symbol' === this.IsR(Symbol.iterator) ? function(t) {
            return this.IsR(t)
        }.bind(this) :
            function(t) {
                return t && 'function' == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? 'symbol' : this.IsR(t)
            }.bind(this)
        )(t)
    }

    isObject(t) {
        const e = this.IsA(t)
        return 'function' === e || 'object' === e && !!t
    }

    dataExists(t) {
        const e = null !== t
        return 'object' === this.IsA(t) ? e && 0 !== Object.keys(t).length : '' !== t && void 0 !== t && e
    }

    haqiqa(t) {
        const c = {
            default: CryptoJS
        }
        if (!this.dataExists(t) || 'string' != typeof t)
            return !1
        const e = t.split('|'),
            n = e[0],
            r = e[2],
            o = e[3],
            i = c.default.SHA256(o).toString(),
            a = c.default.AES.decrypt({
                ciphertext: c.default.enc.Base64.parse(n)
            }, c.default.enc.Hex.parse(i), {
                iv: c.default.enc.Base64.parse(r)
            })
        return JSON.parse(c.default.enc.Utf8.stringify(a))
    }

    unpack(t) {
        const e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 1

        if (!t || e > t.maxLevel) return t
        if (!this.isObject(t) || !t.isCompact) return t

        const n = t.cols
        const r = t.rows

        if (t.isObject) {
            var o = {}, i = 0
            return n.forEach(function (t) {
                o[t] = this.unpack(r[i], e + 1),
                i += 1
            }.bind(this)),
            o
        }

        if (t.isArray) {
            o = []
            return r.forEach(function (t) {
                var e = {}, r = 0
                n.forEach(function (n) {
                    e[n] = t[r],
                    r += 1
                }),
                o.push(e)
            }),
            o
        }
    }
}

export const GMangaUtil = new GMangaUtils