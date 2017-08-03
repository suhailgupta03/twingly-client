const Twingly = require('./api/blog');
const parser = require('xml2json');

let twingly = new Twingly();

twingly
    .content('guiltybytes')
    .tspan('3m')
    .request()
    .then((resp) => {
        let o = JSON.parse(parser.toJson(resp));
        console.log(o);
    })
    .catch((err) => {
        console.log(err);
    });