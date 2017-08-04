const Forum = require('./api/forum');
const Table = require('cli-table');
const pretty = require('prettysize');

let forum = new Forum();
let table = new Table();

let bytesDownloaded = 0; // Keeps track of the bytes downloaded
let requestsMade = 0;

function call(url) {

    forum
        .q('stackoverflow.com')
        .language('spanish')
        .request(url)
        .then((r) => {
            ++requestsMade;
            bytesDownloaded += Buffer.byteLength(r);
            let records = JSON.parse(r);
            if (records.totalResults != 0 || records.moreResultsAvailable != 0) {
                let nextURL = `${forum.baseURL()}/${records.next}`;
                table.push(
                    { 'Status': 'In progress ...' },
                    { 'Data downloaded': pretty(bytesDownloaded) },
                    { 'URL': nextURL },
                    { 'Requests made': requestsMade }
                );
                console.log(table.toString()); // Print the intermediate output
                call(nextURL);
            } else {
                table.push(
                    { 'Status': 'Completed!' },
                    { 'Data downloaded': pretty(bytesDownloaded) },
                    { 'Requests made': requestsMade });
                console.log(table.toString()); // Print the final output
            }
        })
        .catch((e) => {
            table.push(
                { 'Status': 'Error reported' },
                { 'Error': e.message },
                { 'Data downloaded': pretty(bytesDownloaded) });
            console.log(table.toString()); // Print the error 
        });

}

call();