'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var HttpClient = require('./http');
var Promise = require('bluebird');
var moment = require('moment');

module.exports = function () {
    function Social() {
        var platform = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'facebook';

        _classCallCheck(this, Social);

        this.platform = platform;
        this.apiEndPoint = "https://data.twingly.net/socialfeed/a/api/v1.5/search";
        this.apiKey = process.env.API_KEY || "40DA9EC0-6F5D-498F-9295-1C476F2683F7";
        this.format = "json";
        this.query = "";
    }

    /**
     * All words or phrases that are needed in a result posting.
     * @param {String} q 
     * Example: iphone 5s amazon kindle phone
     */


    _createClass(Social, [{
        key: 'all',
        value: function all(q) {
            return this.appendQueryParameter('all', q);
        }

        /**
         * At least one word or phrase provided has to exist in a result posting.
         * @param {String} o 
         * Example: samsung “amazon phone”
         */

    }, {
        key: 'one',
        value: function one(o) {
            return this.appendQueryParameter('one', o);
        }

        /**
         * None of this words or phrases provided must exist in a result posting.
         * @param {String} n 
         */

    }, {
        key: 'none',
        value: function none(n) {
            return this.appendQueryParameter('none', n);
        }

        /**
         * All of the provided hashtags must occur in a posting
         * @param {Array} hashtagList 
         */

    }, {
        key: 'hashtags',
        value: function hashtags() {
            var hashtagList = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

            if (Array.isArray(hashtagList)) return this.appendQueryParameter('hashtags', hashtagList.join(' '));else {
                console.warn('hashtags expects a list');
                return this;
            }
        }

        /**
         * Scope to search for matches. By using the value "post_attachment" the search will cover 
         * the attachment's link, title and description.
         * The value "all" covers "posting", "comment" and "post_attachment" since version 1.5.
         * @param {String} s 
         */

    }, {
        key: 'scope',
        value: function scope() {
            var s = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'all';

            return this.appendQueryParameter('scope', s);
        }

        /**
         * Find postings of a specific media type.
         * @param {String} t
         * Possible values: all, photo, video, link, status 
         */

    }, {
        key: 'type',
        value: function type() {
            var t = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'all';

            return this.appendQueryParameter('post_type', t);
        }

        /**
         * Restricts results to the given language.
         * @param {String} l 
         */

    }, {
        key: 'lang',
        value: function lang(l) {
            return this.appendQueryParameter('lang', l);
        }

        /**
         * Limit your results to specific authors. Use the exact page ID or the page username. 
         * You can find a page username in the URL of the desired Facebook page: E.g.: 
         * http://www.facebook.com/nytimes
         * @param {Array} alist 
         */

    }, {
        key: 'authors',
        value: function authors() {
            var alist = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

            if (alist.length > 0) return this.appendQueryParameter('authors', alist.join(' '));else return this;
        }

        /**
         * Exclude certain authors from your results. Use the exact page ID or 
         * the page username. 
         * You can find a page username in the URL of the desired Facebook page: 
         * E.g.: http://www.facebook.com/nytimes
         * @param {Array} easlist 
         */

    }, {
        key: 'excludedAuthors',
        value: function excludedAuthors() {
            var easlist = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

            if (easlist.length > 0) return this.appendQueryParameter('excluded_authors', easlist.join(' '));else return this;
        }

        /**
         * Only posts that were written on a particular page will be shown in your results. 
         * Use the exact page ID or the page username.
         * @param {Array} pageList 
         */

    }, {
        key: 'pages',
        value: function pages() {
            var pageList = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

            if (pageList.length > 0) return this.appendQueryParameter('pages', pageList.join(' '));else return this;
        }

        /**
         * Only posts that were not written on a particular page will be shown in your results. 
         * Use the exact page ID or the page username.
         * @param {Array} exPlist 
         */

    }, {
        key: 'excludedPages',
        value: function excludedPages() {
            var exPlist = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

            if (exPlist.lenght > 0) return this.appendQueryParameter('excluded_pages', exPlist.join(' '));else return this;
        }

        /**
         * Only posts that mentioned any of the given pages will be shown in your results.
         * Use the exact page ID or the page username
         * @param {Array} plist 
         */

    }, {
        key: 'mentionedPages',
        value: function mentionedPages() {
            var plist = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

            if (plist.length > 0) return this.appendQueryParameter('mentioned_pages', plist.join(' '));else return this;
        }

        /**
         * Returns postings generated after the given date. 
         * @param {Object} momentDate moment instance
         */

    }, {
        key: 'since',
        value: function since(momentDate) {
            if (momentDate instanceof moment) return this.appendQueryParameter('since', momentDate.toISOString());else return this;
        }

        /**
         * Returns postings generated before the given date. 
         * @param {Object} momentDate 
         */

    }, {
        key: 'until',
        value: function until(momentDate) {
            if (momentDate instanceof moment) return this.appendQueryParameter('until', momentDate.toISOString());else return this;
        }

        /**
         * The time base defines the sort sequence of the results. Normally the API 
         * endpoint returns postings sorted by time based on the indexed_at 
         * timestamp descending. If you choose "updated" as the time_base, the results
         * are sorted by time based on their updated_at timestamp descending. 
         * This allows you to also receive updated versions of a single posting 
         * if our system updates a posting at a later time (e.g. social_stats or
         * comments have been updated). The updated_at timestamp equals the indexed_at 
         * timestamp if there have been no changes to the posting by our system. 
         * With time_base=updated a single posting appears again at a later time 
         * if its data was changed.
         * @param {String} base 
         * Possible values: indexed, created, updated
         */

    }, {
        key: 'timeBase',
        value: function timeBase() {
            var base = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'indexed';

            return this.appendQueryParameter('time_base', base);
        }

        /**
         * The name of the timezone which should be used for output and aggregations
         * @param {String} tz 
         */

    }, {
        key: 'timeZone',
        value: function timeZone() {
            var tz = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'Asia/Singapore';

            return this.appendQueryParameter('tz', tz);
        }

        /**
         * Limit the search to postings originating from a page of a specific country.
         * @param {String} ccode 
         */

    }, {
        key: 'country',
        value: function country() {
            var ccode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'all';

            return this.appendQueryParameter('country', ccode);
        }

        /**
         * Sorts the results either by time, relevance or gap average 
         * @param {String} s 
         */

    }, {
        key: 'sort',
        value: function sort() {
            var s = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'time';

            return this.appendQueryParameter('sort', s);
        }

        /**
         * Sets the maximum posting count in the response. Must be numeric, greater than 0
         * and smaller than 250
         * @param {Number} s 
         */

    }, {
        key: 'size',
        value: function size() {
            var s = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 249;

            return this.appendQueryParameter('size', s);
        }
    }, {
        key: 'appendQueryParameter',
        value: function appendQueryParameter(filter, value) {
            if (filter && value) {
                if (this.query) this.query += '&' + filter + '=' + value;else this.query = filter + '=' + value;
            }
            return this;
        }
    }, {
        key: 'request',
        value: function request(url) {
            if (!url) url = this.apiEndPoint + '?apikey=' + this.apiKey + '&' + this.query;
            var options = {
                url: url,
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Ramona/1.0'
                }
            };

            return HttpClient.request(options);
        }
    }]);

    return Social;
}();