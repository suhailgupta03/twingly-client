require('dotenv').config();

const request = require('request');
const Promise = require('bluebird');
const ExponentialBackoff = require('./exponential-backoff');
let expb = new ExponentialBackoff();
expb.collision(0); // Init the default collision count to zero
const MAX_RETRIES = 50;

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

module.exports = class Twingly {

    /**
     * Platform defaults to blog
     * @param {*} platform 
     */
    constructor(platform = 'blog') {
        this.platform = platform;
        this.blogBaseURL = process.env.BLOG_BASE_URL || "https://api.twingly.com/blog/search/api/v3/search";
        this.apiKey = process.env.API_KEY || "40DA9EC0-6F5D-498F-9295-1C476F2683F7";
        this.format = "xml";
        this.query = "";
    }

    /**
     * Sets the output format  
     * Note: XML is the only allowed value for blog
     * @param {*} outputFormat 
     * @return {Object} Returns the class reference for method chaining
     */
    setFormat(outputFormat = 'xml') {
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
    q(queryText) {
        this.query = queryText;
        return this;
    }

    /**
     * Limit the search to specific content of the post.
     * @param {*} text 
     */
    content(text) {
        if (text) {
            let fmatch = this.query.match(/[\w]+\s{1}[\w]+/g);
            if (fmatch)
                this.query = this.query.replace(fmatch[0], `${fmatch[0]}|summary ${text}`);
            else
                this.query += ` fields:summary ${text}`;

        }
        return this;
    }

    /**
     * Limits the search to posts containing the specific title
     * @param {*} text 
     */
    title(text) {
        if (text) {
            let fmatch = this.query.match(/[\w]+\s{1}[\w]+/g);
            if (fmatch)
                this.query = this.query.replace(fmatch[0], `${fmatch[0]}|title ${text}`);
            else
                this.query += ` fields:title ${text}`;
        }
        return this;
    }

    /**
     * Limits the search to blogname
     * @param {*} text 
     */
    blogname(text) {
        if (text) {
            let fmatch = this.query.match(/[\w]+\s{1}[\w]+/g);
            if (fmatch)
                this.query = this.query.replace(fmatch[0], `${fmatch[0]}|blogname ${text}`);
            else
                this.query += ` fields:blogname ${text}`;
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
    link(link = [], bool = 'and') {
        return this.boolQuery(link, bool, 'link');
    }

    /**
     * Search for blog posts with specific tags.
     * @param {Array} tagList 
     * @param {String} bool 
     */
    tag(tagList = [], bool = 'and') {
        return this.boolQuery(tagList, bool, 'tag');
    }

    /**
     * Search for blog posts with an author
     * @param {String} name 
     */
    author(name) {
        if (name)
            this.query += ` author:${name}`;
        return this;
    }

    excludeAuthor(author) {
        return this.excludeFilter(author, 'author');
    }

    /**
    * Search for posts excluding the link
    * Note that this operation is computationally expensive. 
    * Excessive use of them may slow down the query considerably or even result in a query
    * timeout.
    * @param {String} link 
    */
    excludeLink(link) {
        return this.excludeFilter(link, 'link');
    }

    /**
     * Search for posts excluding the tag
     * @param {String} tag 
     */
    excludeTag(tag) {
        return this.excludeFilter(tag, 'tag')
    }

    excludeFilter(filter, filterType) {
        if (filter) {
            let pattern = `/${filterType}:[\w]+/g`;
            let filterM = this.query.match(pattern);
            if (filterM) {
                this.query = this.query.replace(filterM[0], `${filterM[0]} -${filterType}:${filter}`);
            }
        }
        return this;
    }

    boolQuery(list = [], bool = 'and', filter) {
        if (list.length > 0) {
            if ('AND' == bool.toUpperCase())
                list = list.join(',');
            else if ('OR' == bool.toUpperCase())
                list = list.join('|');

            this.query += ` ${filter}:${list}`;
        }
        return this;
    }



    /**
     * You can search for blog posts on a specific domain, including subdomains. 
     * Note that URLs are normalized in the index
     * @param {Array} name 
     */
    domain(nameList = []) {
        if (nameList.length > 0) {
            this.query += ` site:${nameList.join('|')}`;
        }
        return this;
    }

    /**
     * search for blog posts on a specific blog.
     * @param {Array} blogList 
     */
    blog(blogList = []) {
        if (blogList.length > 0) {
            this.query += ` blog:${blogList.join('|')}`;
        }
        return this;
    }

    /**
     * Search for blog posts written in a specific language.
     * @link https://developer.twingly.com/resources/search-language/#supported-languages
     * @param {Array} langCodeList 
     */
    lang(langCodeList = []) {
        if (langCodeList.length > 0) {
            this.query += ` lang:${langCodeList.join('|')}`;
        }
        return this;
    }

    location(locationList = []) {
        if (locationList.length > 0) {
            this.query += ` location:${locationList.join('|')}`;
        }
        return this;
    }

    /**
     * Search for a blog post by ID
     * @param {String} postId 
     */
    id(postId) {
        if (postId)
            this.query += ` id:${postId}`;
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
    tspan(span) {
        if (span)
            this.query += ` tspan:${span}`;
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
    created(from, to) {
        if (from && to)
            this.query += ` start-created:"${from}" end-created:"${to}"`;
        if (from && !to)
            this.query += ` start-created:"${from}"`;
        return this;
    }


    /**
     * Find for posts published between start date and end date
     * Example: 
     * start-date:"2015-12-01T02:00:00Z" end-date:"2015-12-01T03:00:00Z"
     * @param {String} start 
     * @param {String} end 
     */
    published(start, end) {
        if (start && end)
            this.query += ` start-date:"${start}" end-date:"${end}"`;
        return this;
    }

    sort(by) {
        if (by)
            this.query += ` sort:${by}`;
        return this;
    }

    /**
     * 
     * @param {String} order 
     */
    sortOrder(order) {
        if (order)
            this.query += ` sort-order:${order}`;
        return this;
    }

    /**
     * Makes a HTTP request to the twingly REST API
     * Uses exponential backoff algorithm for the retry logic.
     * Maximum retries done equals 50
     */
    request() {
        this.query = encodeURIComponent(this.query);
        const url = `${this.blogBaseURL}?apikey=${this.apiKey}&q=${this.query}`;
        let options = {
            url: url,
            method: 'GET',
            headers: {
                'Accept': 'text/xml',
                'User-Agent': 'Ramona'
            }
        };

        return new Promise((res, rej) => {

            request(options, (err, resp) => {
                if (resp.statusCode >= 500) {
                    // Server Error; Give a retry
                    let collisionCount = expb.getCollisionNumber() + 1; // Get the current collision count
                    let waitTime = expb
                        .collision(collisionCount)
                        .expectedBackOffTime();

                    if (MAX_RETRIES >= collisionCount) {
                        setTimeout(() => {
                            // Update the new collision count
                            expb.collision(collisionCount);
                            // Make a new request
                            this.request();
                        }, waitTime * 1000);
                    } else {
                        /**
                         * Number of collisions have surpassed the maximum
                         * number of allowed retries
                         */
                        rej(err);
                    }
                } else if (resp.statusCode >= 400) {
                    // Reset the collision counter
                    expb.collision(0);
                    // Client Error; Notify the client; Reject promise
                    rej(err, resp);
                } else if (resp.statusCode >= 200 && resp.statusCode < 300) {
                    // Reset the collision counter
                    expb.collision(0);
                    // All well!! Resolve the promise
                    res(resp.body);
                }
            })
        })

    }
}