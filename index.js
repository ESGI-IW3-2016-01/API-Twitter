require('dotenv').config();
var Twitter = require('twitter');
var fs = require('fs');
var http = require('http');
var path = require('path');
var schedule = require('node-schedule');

var params = {
    q: "%23JO2024",
    count: 100,
    result_type: 'recent'
};
var resTweets;
var maxId;

var server = http.createServer(function (req, response) {
    fs.readFile('index.html', 'utf-8', function (error, data) {
        response.writeHead(200, {'Content-Type': 'text/html'});
        var pieChartData = [];
        for (var i = 0; i < 3; i++)
            pieChartData.push(Math.random() * 50);

        var result = data.replace('{{pieChartData}}', JSON.stringify(pieChartData));
        response.write(result);
        response.end();
    });
});
server.listen(8000);

var MongoClient = require("mongodb").MongoClient;

var client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.TWITTER_TOKEN_SECRET
});

callTwitter();
schedule.scheduleJob('*/1 * * * *', function () {
    callTwitter();
});


function callTwitter() {
	console.log(new Date().toLocaleString());
	getCountry();
    client.get('search/tweets.json', params, function (error, tweets, response) {
        if (error) console.error(error);
        maxId = tweets.search_metadata.max_id;
        params.since_id = maxId;
        writeFile('tweets.json', tweets.statuses);
        addTweet(tweets.statuses);
    });
}

function addTweet(elements) {
    MongoClient.connect('mongodb://' + process.env.MONGO_HOST + ':' + process.env.MONGO_PORT + '/' + process.env.MONGO_DB, function (error, db) {
        if (error) throw error;
        for (var i = 0; i < elements.length; i++) {
            db.collection(process.env.MONGO_COL).insert(elements[i], null, function (error, results) {
                if (error) throw error;
            });
        }
    });
}


function getCountry() {
    MongoClient.connect('mongodb://' + process.env.MONGO_HOST + ':' + process.env.MONGO_PORT + '/' + process.env.MONGO_COL, function (error, db) {
        if (error) throw error;
       	var countryTab = db.collection(process.env.MONGO_COL).aggregate([
			{$group : {
			    _id : '$lang',
			    count : {$sum : 1}
			}},
			{$sort : {
			    count : -1
			}},
			{$limit : 5}
			]);
       	console.log(countryTab);
    });
}

function writeFile(fileName, data) {
    if (!fileName) fileName = 'tweets.json';
    fs.writeFile(fileName, JSON.stringify(data, null, 4), function (err) {
        if (err) throw err;
    });
}