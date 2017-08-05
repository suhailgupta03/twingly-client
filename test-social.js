const Social = require('./api/social');
const Table = require('cli-table');
const pretty = require('prettysize');

let social = new Social();

let bytesDownloaded = 0;
let requestsMade = 0;

function call(url) {

    social
        .all('ted talk')
        .hashtags(['radio'])
        .size(20)
        .request()
        .then((resp) => {
            let table = new Table();
            bytesDownloaded += Buffer.byteLength(resp);
            ++requestsMade;
            let records = JSON.parse(resp);
            if (records.paging && records.paging.next) {
                table.push(
                    { 'Status': 'In progress ...' },
                    { 'Data downloaded': pretty(bytesDownloaded) },
                    { 'URL': records.paging.next },
                    { 'Requests made': requestsMade }
                );
                console.log(table.toString()); // Print the intermediate output
                call(records.paging.next);
            } else {
                table.push(
                    { 'Status': 'Completed!' },
                    { 'Data downloaded': pretty(bytesDownloaded) },
                    { 'Requests made': requestsMade });
                console.log(table.toString()); // Print the final output
            }
        })
        .catch((e) => {
            let table = new Table();
            table.push(
                { 'Status': 'Error reported' },
                { 'Error': e.message ? e.message : '' },
                { 'Requests made': requestsMade },
                { 'Data downloaded': pretty(bytesDownloaded) });
            console.log(table.toString()); // Print the error 
        });
}

// Start fetching the posts
call();