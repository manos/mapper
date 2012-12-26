/*
   Request mapper.
   Displays markers on the map, for locations provided via POSTs.

   Meant to take an incoming stream, and therefore it removes all markers
   every few seconds.
 */
var express = require('express');
app = express();

var db_file = './geoip.dat';
    geodata = '';
    fs = require('fs');
    cache = [];

var fake_locations = [];
    fakeEnabled = false;

app.listen(3000);
console.log('Listening on port 3000');

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set("view options", {layout: false});

    app.engine('html', require('ejs').renderFile);
});

//
// Load the database from disk, into memory:
// synchronously, because we can't serve requests until the data is loaded.
// var geodata = fs.readFileSync(db_file).toString().split("\n");

/*
   Express Middleware
 */

app.use(express.logger());
app.use(express.bodyParser());

/*// resolve the IP in the header (or querystring) to coordinates:
// NOT USED
app.use(function(req, res, next){
    //console.log('in middleware now');
    res.coordinates = 'oh hai there: ' + req.query;
    next();
}); */

/*
   Custom functions
 */


function appendToCache(place) {
    // if passed a String, it appends it; if an Array, it appends it.

    if (typeof place === "string") {
        cache[cache.length] = place;
    }
    else if (place instanceof Array) {
        cache.push.apply(cache, place);
    }
    return;
}

function store(req) {

    // first, we should only buffer 10,000 data points at a time. If we're over 10K, delete the oldest
    if (cache.length > 10000) {
        cache.shift();
    }

    // then append this request to the array:
    appendToCache(req.body.place);
    return;
}

function dump() {

    // returns everything in the cache, and clears it.
    var tmp_cache = cache.slice(0);
    cache.length = 0;

    return tmp_cache;
}

// implement a randomize method for arrays
Array.prototype.randomize = function (){
    this.sort(
        function(a,b) {
            return Math.round(Math.random());
        });
};


function generateData() {
        // start generating fake data
        // assume something will consume it.. so just run in a loop

        if (!fakeEnabled) { return; }

        if (fake_locations.length === 0) {
            fake_locations = fs.readFileSync('./fake_data.txt').toString().split("\n");
            // random sorting:
            fake_locations.randomize();
        }

        // just do 10 at a time
        var count = 0;
        while (fake_locations.length > 0 && count < 10) {
            appendToCache(fake_locations.shift());
            count++;
        }

        // do this forever
        setTimeout(generateData, 1000);
        return;
}

/*
   Routes
 */

app.get('/', function(req, res){
    res.render('index.html');
});

// dump (and clear) the cache of locations:
app.get('/consume', function(req, res){
    //console.log(dump());
    res.contentType('json');
    res.send(JSON.stringify(dump()));
});

app.post('/submit', function(req, res) {
    //console.log(req.body);
    store(req);
    res.contentType('json');
    res.send(JSON.stringify({response:'success'}));
});

app.post('/fakedata', function(req, res) {
    if (req.body.enabled === "true" && fakeEnabled === false) {
        console.log("Enabling fake data generation...");
        fakeEnabled = true;
        generateData();
    }
    else if (req.body.enabled === "false") {
        console.log("Stopping fake data...");
        fakeEnabled = false;
    }
    res.contentType('json');
    res.send(JSON.stringify({response:'success'}));
});

// we got here? wtf is happening?
app.all('*', function(req, res){
    res.send('uh, not found.', 404);
});


