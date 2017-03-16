require('dotenv').config();
var Twitter = require('twitter');
var fs = require('fs');
var http = require('http');
var path = require('path');

var params = {
    q: "%23ASMMCI",
    count: 100
};
var resTweets;

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

client.get('search/tweets.json', params, function (error, tweets, response) {
    if (error) console.error(error);
    resTweets = tweets;
    // fs.writeFile('tweets.json', JSON.stringify(tweets, null, 4), function (err) {
    //     if (err) throw err;
    //     console.log('It\'s saved!');
    // });
    addTweet(resTweets.statuses);
});


function addTweet(elements) {
    MongoClient.connect('mongodb://' + process.env.MONGO_HOST + ':' + process.env.MONGO_PORT + '/' + process.env.MONGO_COL, function (error, db) {
        if (error) throw error;
        for (var i = 0; i < elements.length; i++) {
            db.collection("tweet").insert(elements[i], null, function (error, results) {
                if (error) throw error;
            });
        }
    });
}
