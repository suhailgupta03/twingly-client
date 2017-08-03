const Twingly = require('./api/blog');
const parser = require('xml2json');

let twingly = new Twingly();


/**
 * Following example illustrates how to use the API
 * and shows how to scroll through large records
 * @param {Number} pageSize 
 * @param {Number} pageNumber 
 */
function call(pageSize, pageNumber) {
    twingly
        .content('guiltybytes')
        .pageSize(pageSize)
        .page(pageNumber)
        .request()
        .then((resp) => {
            let records = JSON.parse(parser.toJson(resp));
            records = records.twinglydata;

            const matchesReturned = parseInt(records.numberOfMatchesReturned);
            if (!twingly.getTotalMatches())
                twingly.totalMatches(parseInt(records.numberOfMatchesTotal)); // Set the total number of matches found 

            const totalMatches = twingly.getTotalMatches();
            if (matchesReturned != 0 && matchesReturned < totalMatches) {
                // Need to scroll more records
                pagesToTraverse++;
                let postList = records.post;
                console.log(JSON.parse(parser.toJson(resp)), "$$$$")
                call(10, pagesToTraverse); // Scrolling mode
            }
        })
        .catch((err) => {
            console.log(err);
        });
}

let pagesToTraverse = 1;
call(10, 1);