require('dotenv').config();
var Twitter = require('twitter');
var fs = require('fs');
var http = require('http');
var path = require('path');
var schedule = require('node-schedule');
var express = require('express');
var app = express();

app.use(express.static('d3-wordcloud-master'));

app.get('/', function (req, res) {
    // fs.readFile('index.html', 'utf-8', function (error, data) {
    //     res.writeHead(200, {'Content-Type': 'text/html'});
    //     var pieChartData = [];
    //     for (var i = 0; i < 3; i++)
    //         pieChartData.push(Math.random() * 50);
    //
    //     var result = data.replace('{{pieChartData}}', JSON.stringify(pieChartData));
    //     res.write(result);
    //     res.end();
    // });
    res.sendfile('index.html', 'utf-8');
});

app.get('/api/country/:city', function (req, res) {
    res.setHeader('Content-Type', 'application/json;charset=utf-8');
    getCountry(req, res, req.params.city);
});

app.get('/api/country/:city', function (req, res) {
    res.setHeader('Content-Type', 'application/json;charset=utf-8');
    getCountry(req, res, req.params.city);
});

app.listen(8000);

var params = {
    count: 100,
    result_type: 'recent'
    //until:'2017-03-12'
};
// MongoDB client
var MongoClient = require("mongodb").MongoClient;

// Twitter API client
var client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.TWITTER_TOKEN_SECRET
});

callTwitter("%23Paris2024", process.env.MONGO_COL_PARIS);
callTwitter("%23La2024", process.env.MONGO_COL_LA);

schedule.scheduleJob('* */1 * * *', function () {
    callTwitter("%23Paris2024", process.env.MONGO_COL_PARIS);
    callTwitter("%23La2024", process.env.MONGO_COL_LA);
});

schedule.scheduleJob('* */1 * * ', function () {
    wordCount();
});

/**
 * Twitter API search call
 * @param hashtag
 * @param collection
 */
function callTwitter(hashtag, collection) {
    params.q = hashtag;
    client.get('search/tweets.json', params, function (error, tweets, response) {
        if (error) console.error(error);
        maxId = tweets.search_metadata.max_id;
        params.since_id = maxId;
        addTweet(tweets.statuses, collection);
        console.log(new Date().toLocaleString() + " " + hashtag + " (" + tweets.statuses.length + ")");
    });
}
/**
 * Save raw tweet in database
 * @param elements
 * @param collection
 */
function addTweet(elements, collection) {
    MongoClient.connect('mongodb://' + process.env.MONGO_HOST + ':' + process.env.MONGO_PORT + '/' + process.env.MONGO_DB, function (error, db) {
        if (error) throw error;
        for (var i = 0; i < elements.length; i++) {
            db.collection(collection).insert(elements[i], null, function (error, results) {
                if (error) throw error;
            });
        }
    });
}

/**
 * Write tweets in a file
 * @param fileName
 * @param data
 */
function writeFile(fileName, data) {
    if (!fileName) fileName = 'tweets.json';
    fs.writeFile(fileName, JSON.stringify(data), function (err) {
        if (err) throw err;
    });
}

/**
 * Aggregate tweets by language
 * @param req
 * @param res
 * @param city
 */
function getCountry(req, res, city) {
    MongoClient.connect('mongodb://' + process.env.MONGO_HOST + ':' + process.env.MONGO_PORT + '/' + process.env.MONGO_DB, function (error, db) {
        if (error) throw error;
        db.collection(city).aggregate([
            {
                $group: {
                    _id: '$lang',
                    count: {$sum: 1}
                }
            },
            {
                $sort: {
                    count: -1
                }
            },
            {$limit: 5}
        ], function (err, result) {
            if (err) console.error(err);
            res.send(JSON.stringify(result, null, 4));
        });
    });
}

function groupByDate(req, res, city) {
    MongoClient.connect('mongodb://' + process.env.MONGO_HOST + ':' + process.env.MONGO_PORT + '/' + process.env.MONGO_DB, function (error, db) {
        if (error) throw error;
        db.collection(city).aggregate([
            {
                $group: {
                    _id: '$created_at',
                    count: {$sum: 1},
                    name: "test"
                }
            },
            {
                $sort: {
                    count: -1
                }
            },
            {$limit: 5}
        ], function (err, result) {
            if (err) console.error(err);
            res.send(JSON.stringify(result, null, 4));
            console.log(JSON.stringify(result, null, 4));
        });
    });
}