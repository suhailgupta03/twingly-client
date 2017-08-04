'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

require('dotenv').config();

var HttpClient = require('./http');
var Promise = require('bluebird');

module.exports.SORT = {
    /**
     * sort by published
     */
    PUBLISHED: 'published',
    /**
     * sort by created (i.e. index time)
     */
    CREATED: 'created',
    /**
     * sort by inlinks to the post
     */
    INLINKS: 'inlinks',
    /**
     * sort by TwinglyRank
     * @see https://developer.twingly.com/resources/ranking/#twinglyrank
     */
    TWINGLY_RANK: 'twinglyrank'
};

module.exports.SORT_ORDER = {
    ASCENDING: 'asc',
    DESCENDING: 'desc'
};

module.exports = function () {

    /**
     * Platform defaults to blog
     * @param {*} platform 
     */
    function Twingly() {
        var platform = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'blog';

        _classCallCheck(this, Twingly);

        this.platform = platform;
        this.blogBaseURL = process.env.BLOG_BASE_URL || "https://api.twingly.com/blog/search/api/v3/search";
        this.apiKey = process.env.API_KEY || "40DA9EC0-6F5D-498F-9295-1C476F2683F7";
        this.format = "xml";
        this.query = "";
    }

    /**
     * Sets the total number of matches found
     * @param {Number} total 
     */


    _createClass(Twingly, [{
        key: 'totalMatches',
        value: function totalMatches(total) {
            this.tmatches = total;
            return this;
        }

        /**
         * Returns the previously set total matches found
         * from the search
         * @see totalMatches
         */

    }, {
        key: 'getTotalMatches',
        value: function getTotalMatches() {
            return this.tmatches;
        }

        /**
         * Sets the output format  
         * Note: XML is the only allowed value for blog
         * @param {*} outputFormat 
         * @return {Object} Returns the class reference for method chaining
         */

    }, {
        key: 'setFormat',
        value: function setFormat() {
            var outputFormat = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'xml';

            this.format = outputFormat;
            return this;
        }

        /**
         * General method to set the query string
         * Example:
         * # search for posts containing the words twingly and blog
         *   twingly blog
         * # search for posts containing the phrase "I love blogging"
         *   "I love blogging"
         * # search for posts containing the words twingly or blog
         *    twingly OR blog
         * # search for posts containing the words twingly and either blog or blogs
         *    twingly AND (blog OR blogs)
         * # search for posts containing the word twingly but not the word blog
         *    twingly -blog
         * @link https://developer.twingly.com/resources/search-language
         * @param {String} queryText 
         * @return {Object} Returns the class reference for method chaining
         */

    }, {
        key: 'q',
        value: function q(queryText) {
            this.query = queryText;
            return this;
        }

        /**
         * Limit the search to specific content of the post.
         * @param {*} text 
         */

    }, {
        key: 'content',
        value: function content(text) {
            if (text) {
                var fmatch = this.query.match(/[\w]+\s{1}[\w]+/g);
                if (fmatch) this.query = this.query.replace(fmatch[0], fmatch[0] + '|summary ' + text);else this.query += ' fields:summary ' + text;
            }
            return this;
        }

        /**
         * Limits the search to posts containing the specific title
         * @param {*} text 
         */

    }, {
        key: 'title',
        value: function title(text) {
            if (text) {
                var fmatch = this.query.match(/[\w]+\s{1}[\w]+/g);
                if (fmatch) this.query = this.query.replace(fmatch[0], fmatch[0] + '|title ' + text);else this.query += ' fields:title ' + text;
            }
            return this;
        }

        /**
         * Limits the search to blogname
         * @param {*} text 
         */

    }, {
        key: 'blogname',
        value: function blogname(text) {
            if (text) {
                var fmatch = this.query.match(/[\w]+\s{1}[\w]+/g);
                if (fmatch) this.query = this.query.replace(fmatch[0], fmatch[0] + '|blogname ' + text);else this.query += ' fields:blogname ' + text;
            }
            return this;
        }

        /**
         * Search for blog posts linking to specific sites.
         * Note that this operation is computationally expensive. 
         * Excessive use of them may slow down the query considerably or even result in a query
         * timeout.
         * @param {Array} link List of links to use as a filter
         * @param {String} bool Concatenates the URL list using AND or OR
         */

    }, {
        key: 'link',
        value: function link() {
            var _link = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

            var bool = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'and';

            return this.boolQuery(_link, bool, 'link');
        }

        /**
         * Search for blog posts with specific tags.
         * @param {Array} tagList 
         * @param {String} bool 
         */

    }, {
        key: 'tag',
        value: function tag() {
            var tagList = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
            var bool = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'and';

            return this.boolQuery(tagList, bool, 'tag');
        }

        /**
         * Search for blog posts with an author
         * @param {String} name 
         */

    }, {
        key: 'author',
        value: function author(name) {
            if (name) this.query += ' author:' + name;
            return this;
        }
    }, {
        key: 'excludeAuthor',
        value: function excludeAuthor(author) {
            return this.excludeFilter(author, 'author');
        }

        /**
        * Search for posts excluding the link
        * Note that this operation is computationally expensive. 
        * Excessive use of them may slow down the query considerably or even result in a query
        * timeout.
        * @param {String} link 
        */

    }, {
        key: 'excludeLink',
        value: function excludeLink(link) {
            return this.excludeFilter(link, 'link');
        }

        /**
         * Search for posts excluding the tag
         * @param {String} tag 
         */

    }, {
        key: 'excludeTag',
        value: function excludeTag(tag) {
            return this.excludeFilter(tag, 'tag');
        }
    }, {
        key: 'excludeFilter',
        value: function excludeFilter(filter, filterType) {
            if (filter) {
                var pattern = '/' + filterType + ':[w]+/g';
                var filterM = this.query.match(pattern);
                if (filterM) {
                    this.query = this.query.replace(filterM[0], filterM[0] + ' -' + filterType + ':' + filter);
                }
            }
            return this;
        }
    }, {
        key: 'boolQuery',
        value: function boolQuery() {
            var list = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
            var bool = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'and';
            var filter = arguments[2];

            if (list.length > 0) {
                if ('AND' == bool.toUpperCase()) list = list.join(',');else if ('OR' == bool.toUpperCase()) list = list.join('|');

                this.query += ' ' + filter + ':' + list;
            }
            return this;
        }

        /**
         * You can search for blog posts on a specific domain, including subdomains. 
         * Note that URLs are normalized in the index
         * @param {Array} name 
         */

    }, {
        key: 'domain',
        value: function domain() {
            var nameList = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

            if (nameList.length > 0) {
                this.query += ' site:' + nameList.join('|');
            }
            return this;
        }

        /**
         * search for blog posts on a specific blog.
         * @param {Array} blogList 
         */

    }, {
        key: 'blog',
        value: function blog() {
            var blogList = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

            if (blogList.length > 0) {
                this.query += ' blog:' + blogList.join('|');
            }
            return this;
        }

        /**
         * Search for blog posts written in a specific language.
         * @link https://developer.twingly.com/resources/search-language/#supported-languages
         * @param {Array} langCodeList 
         */

    }, {
        key: 'lang',
        value: function lang() {
            var langCodeList = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

            if (langCodeList.length > 0) {
                this.query += ' lang:' + langCodeList.join('|');
            }
            return this;
        }
    }, {
        key: 'location',
        value: function location() {
            var locationList = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

            if (locationList.length > 0) {
                this.query += ' location:' + locationList.join('|');
            }
            return this;
        }

        /**
         * Search for a blog post by ID
         * @param {String} postId 
         */

    }, {
        key: 'id',
        value: function id(postId) {
            if (postId) this.query += ' id:' + postId;
            return this;
        }

        /**
         * Supported arguments to span:
         * h - posts published the last hour
         * 12h - posts published the last 12 hours
         * 24h - posts published the last 24 hours
         * w - posts published the last week
         * m - posts published the last month
         * 3m - posts published the last three months
         * @param {String} span 
         */

    }, {
        key: 'tspan',
        value: function tspan(span) {
            if (span) this.query += ' tspan:' + span;
            return this;
        }

        /**
         * Filters posts created (indexed) after the passed timestamp.
         * Make sure you always include timezone information in your timestamps, when using the
         * start-end time filters. 
         * @link https://en.wikipedia.org/wiki/ISO_8601#Time_zone_designators
         * @param {String} timestamp 
         * Example: 2016-01-16T00:00:00Z
         */

    }, {
        key: 'created',
        value: function created(from, to) {
            if (from && to) this.query += ' start-created:"' + from + '" end-created:"' + to + '"';
            if (from && !to) this.query += ' start-created:"' + from + '"';
            return this;
        }

        /**
         * Find for posts published between start date and end date
         * Example: 
         * start-date:"2015-12-01T02:00:00Z" end-date:"2015-12-01T03:00:00Z"
         * @param {String} start 
         * @param {String} end 
         */

    }, {
        key: 'published',
        value: function published(start, end) {
            if (start && end) this.query += ' start-date:"' + start + '" end-date:"' + end + '"';
            return this;
        }
    }, {
        key: 'sort',
        value: function sort(by) {
            if (by) this.query += ' sort:' + by;
            return this;
        }

        /**
         * 
         * @param {String} order 
         */

    }, {
        key: 'sortOrder',
        value: function sortOrder(order) {
            if (order) this.query += ' sort-order:' + order;
            return this;
        }

        /**
         * Limit the number of returned posts using the page size
         * option
         * @param {Number} size 
         */

    }, {
        key: 'pageSize',
        value: function pageSize(size) {
            if (size && size.toString().match(/^\d+$/)) this.query += ' page-size:' + size;
            return this;
        }

        /**
         * Use it for moving through pages. Use this in 
         * conjunction with pageSize
         * @see pageSize
         * @param {Number} pageNumber 
         */

    }, {
        key: 'page',
        value: function page(pageNumber) {
            if (pageNumber && pageNumber.toString().match(/^\d+$/)) this.query += ' page:' + pageNumber;
            return this;
        }

        /**
         * Makes a HTTP request to the twingly REST API
         * Uses exponential backoff algorithm for the retry logic.
         * Maximum retries done equals 50
         */

    }, {
        key: 'request',
        value: function request() {
            this.query = encodeURIComponent(decodeURIComponent(this.query));
            var url = this.blogBaseURL + '?apikey=' + this.apiKey + '&q=' + this.query;
            var options = {
                url: url,
                method: 'GET',
                headers: {
                    'Accept': 'text/xml',
                    'User-Agent': 'Ramona/1.0'
                }
            };

            return HttpClient.request(options);
        }
    }]);

    return Twingly;
}();