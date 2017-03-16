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
        var chartData = [];
        for (var i = 0; i < 7; i++)
            chartData.push(Math.random() * 50);

        var result = data.replace('{{chartData}}', JSON.stringify(chartData));
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

callTwitter("%23Paris2024",process.env.MONGO_COL_PARIS);
callTwitter("%23La2024",process.env.MONGO_COL_LA);
schedule.scheduleJob('*/1 * * * *', function () {
    callTwitter("%23Paris2024",process.env.MONGO_COL_PARIS);
    callTwitter("%23La2024",process.env.MONGO_COL_LA);
});

schedule.scheduleJob('* */1 * * *', function () {
    wordCount();
});

function callTwitter(hashtag,collection) {
	var params = {
    q: hashtag,
    count: 100,
    result_type: 'recent'
	};

    console.log(new Date().toLocaleString() + " " + hashtag);
    client.get('search/tweets.json', params, function (error, tweets, response) {
        if (error) console.error(error);
        maxId = tweets.search_metadata.max_id;
        params.since_id = maxId;
        writeFile('tweets.json', tweets.statuses);
        addTweet(tweets.statuses,collection);
    });
}

function addTweet(elements,collection) {
    MongoClient.connect('mongodb://' + process.env.MONGO_HOST + ':' + process.env.MONGO_PORT + '/' + process.env.MONGO_DB, function (error, db) {
        if (error) throw error;
        for (var i = 0; i < elements.length; i++) {
            db.collection(collection).insert(elements[i], null, function (error, results) {
                if (error) throw error;
            });
        }
    });
}

function writeFile(fileName, data) {
    if (!fileName) fileName = 'tweets.json';
    fs.writeFile(fileName, JSON.stringify(data, null, 4), function (err) {
        if (err) throw err;
    });
}

/*
 db.twitter_search.aggregate([
 {$group : {
 _id : '$lang',
 count : {$sum : 1}
 }},
 {$sort : {
 count : -1
 }},
 {$limit : 5}
 ]);*/

var mapper = function () {
    var text = this.text;
    text = text.toLowerCase().split(" ");
    for (var i = text.length - 1; i >= 0; i--) {
        if (text[i]) emit(text[i], 1);
    }
};

var reducer = function (key, values) {
    var count = 0;
    values.forEach(function (v) {
        count += v;
    });
    return count;
};

function wordCount() {
    paris = process.env.MONGO_COL_PARIS;
    la = process.env.MONGO_COL_LA;
    MongoClient.connect('mongodb://' + process.env.MONGO_HOST + ':' + process.env.MONGO_PORT + '/' + process.env.MONGO_DB, function (error, db) {
        db.paris.mapReduce(mapper, reducer, {out: 'word_count' + paris});
        db.la.mapReduce(mapper, reducer, {out: 'word_count' + la});
    });
}