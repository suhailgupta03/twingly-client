const Promise = require('bluebird');
const HttpClient = require('./http');

module.exports.SORT = {
    'RELEVANCY': 'relevancy',
    'FB_LIKES': 'social.facebook.likes',
    'FB_SHARES': 'social.facebook.shares',
    'FB_COMMENTS': 'social.facebook.comments',
    'GPLUS_SHARES': 'social.gplus.shares',
    'PINTEREST_SHARES': 'social.pinterest.shares',
    'LINKEDIN_SHARES': 'social.linkedin.shares',
    'STUMBLED_UPON_SHARES': 'social.stumbledupon.shares',
    'VK_SHARES': 'social.vk.shares',
    'REPLY_COUNT': 'replies_count',
    'PARTICI_COUNT': 'participants_count',
    'SPAM_SCORE': 'spam_score',
    'PERFORMANCE_SCORE': 'performance_score',
    'DOMAIN_RANK': 'domain_rank',
    'ORD_THREAD': 'ord_in_thread',
    'RATING': 'rating'
};

module.exports.ORDER = {
    'ASCENDING': 'asc',
    'DESCENDING': 'desc'
};

module.exports = class Forum {

    constructor(platform = 'forum') {
        this.platform = platform;
        this.forumAPIEndpoint = process.env.FORUM_BASE_URL || "https://data.twingly.net/forum/a/search";
        this.forumBaseURL = "https://data.twingly.net";
        this.apiKey = process.env.API_KEY || "40DA9EC0-6F5D-498F-9295-1C476F2683F7";
        this.format = "json";
        this.query = "";
    }

    baseURL() {
        return this.forumBaseURL;
    }

    /**
     * A generalized Boolean query containing the filters that define 
     * which posts will be returned
     * @param {String}
     */
    q(query) {
        this.query = query;
        return this;
    }

    /**
     * 	By default (when the sort parameter isn't specified) the results are sorted by
     *  the recommended order of crawl date. 
     * @param {String} s 
     * @see SORT
     */
    sort(s) {
        return this.appendQueryParameter('sort', s);
    }

    /**
     * Default ordering : Descending
     * @param {String} o 
     */
    order(o) {
        return this.appendQueryParameter('order', o);
    }

    from(f) {
        return this.appendQueryParameter('from', f);
    }

    /**
     * The "ts" (timestamp) parameter is telling the system to return results
     * that were crawled after this timestamp (Unix Timestamp).
     * @param {String} timestamp 
     */
    ts(timestamp) {
        return this.appendQueryParameter('ts', timestamp);
    }

    /**
     * The total number of posts returned per request, ranges between 
     * 1 to 100 (default is 100)
     * @param {Number} s 
     */
    size(s) {
        return this.appendQueryParameter('size', s);
    }

    /**
     * Return the fragments in the post that matched the textual Boolean query. 
     * The matched keywords will be surrounded by <em/> tags.
     * @param {String} t 
     */
    highlight(t) {
        return this.appendQueryParameter('highlight', t);
    }

    /**
     * This will return the latest 100 crawled posts matching your query. 
     * The recommended method to consume the latest data is by using the &ts parameter.
     * @see ts
     */
    latest() {
        return this.appendQueryParameter('latest', true);
    }

    /**
     * 	The language of the post. The default is any.
     * @param {String} lang 
     */
    language(lang = 'any') {
        return this.appendQueryParameter('language', lang, true);
    }

    /**
     * Limit the results to a specific site or sites
     * @param {String} s 
     */
    site(s) {
        return this.appendQueryParameter('site', s, true);
    }

    /**
     * Return posts written by a specific author
     * @param {String} a 
     */
    author(a) {
        return this.appendQueryParameter('author', a, true);
    }

    /**
     * Heuristics is used to determine the country origin of a site, by taking into 
     * account the site's IP, TLD and language. Many times the country origin isn't 
     * conclusive so it isn't set, therefor filtering by country may result in 
     * much less data than when filtering by language.
     * @param {String} c 
     * @link https://countrycode.org/
     */
    country(c) {
        return this.appendQueryParameter('thread.country', c, true);
    }

    /**
     * 	Limit the results to a specific site suffix
     * @param {String} s 
     */
    suffix(s) {
        return this.appendQueryParameter('site_suffix', s, true);
    }

    /**
     * Limit the results to posts originating from sites categorized as one 
     * (or more) of the following: search_engine, entertainment, shopping, 
     * vehicles, gambling, tech, games, sports, finance, hacking, social, 
     * messaging, health, personals, religion, travel, abortion, education, 
     * drugs, business, advertising, humor, food, real_estate, virtual_reality, 
     * jobs, media, adult, alcohol_and_tobacco, weapons.
     * @param {Strings} c 
     */
    category(c) {
        return this.appendQueryParameter('site_category', c, true);
    }

    /**
     * A Boolean parameter that specifies if to search only on the first post (exclude the comments)
     */
    first() {
        return this.appendQueryParameter('is_first', true, true);
    }

    /**
     * A Boolean parameter that specifies if to search only for posts that contain a video.	
     * @param {Boolean} v 
     */
    video(v = true) {
        return this.appendQueryParameter('has_video', true, true);
    }

    /**
     * A textual boolean query describing the keywords that should (or shouldn’t) 
     * appear in the thread title
     * @param {String} t 
     */
    title(t) {
        return this.appendQueryParameter('thread.title', t, true);
    }

    /**
     * 	Search for posts that included links to another site.
     * @param {*} l 
     */
    externalLinks(l) {
        return this.appendQueryParameter('external_links', l, true);
    }

    /**
     * Get all the posts of a specific thread
     * @param {} u 
     */
    url(u) {
        /**
         * Note that you must escape the http:// part of the URL like so: http\:\/\/
         */
        if (u)
            u = u.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        return this.appendQueryParameter('thread.url', u, true);
    }

    /**
     * A score value between 0 to 1, indicating how spammy the thread text is.
     * @param {String} score 
     * Example arguments:
     * <=0.8
     * >0.2
     * >=0.1
     * .05
     */
    spamScore(score) {
        return this.appendQueryParameter('spam_score', score, true);
    }

    /**
     * A rank that specifies how popular a domain is (by monthly traffic)
     * @param {String} rank 
     * Example arguments:
     * <1000
     * >=33
     */
    domainRank(rank) {
        return this.appendQueryParameter('domain_rank', rank, true);
    }


    appendQueryParameter(filterName, parameter, additional = false) {
        if (filterName && parameter) {
            if (this.query) {
                if (additional)
                    this.query += ` ${filterName}:${parameter}`;
                else
                    this.query += `&${filterName}=${parameter}`;
            }
            else {
                if (additional)
                    this.query = `${filterName}:${parameter}`;
                else
                    this.query = `${filterName}=${parameter}`;

            }
        }
        return this;
    }

    /**
     * Makes a HTTP request to the twingly REST API
     * Uses exponential backoff algorithm for the retry logic.
     * Maximum retries done equals 50
     */
    request() {
        this.query = encodeURIComponent(decodeURIComponent(this.query));
        const url = `${this.forumAPIEndpoint}?apikey=${this.apiKey}&q=${this.query}`;
        let options = {
            url: url,
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Ramona/1.0'
            }
        };

        return HttpClient.request(options);
    }
}
