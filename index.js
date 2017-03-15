require('dotenv').config();
var Twitter = require('twitter');
var fs = require('fs');
var http = require('http'),
    fs = require('fs'),
    path = require('path');

var server = http.createServer(function(req, response) {

	fs.readFile('index.html', 'utf-8', function (error, data) {
        response.writeHead(200, { 'Content-Type': 'text/html' });

        var chartData = [];
        for (var i = 0; i < 7; i++)
            chartData.push(Math.random() * 50);

        var result = data.replace('{{chartData}}', JSON.stringify(chartData));
        response.write(result);
        response.end();
    });

});

server.listen(8080);

var client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.TWITTER_TOKEN_SECRET
});

var params = {
    q: "%23PowerRangers",
    count: 10
};

client.get('search/tweets.json', params, function (error, tweets, response) {
    if (error) console.error(error);
    console.log(tweets);

    fs.writeFile('tweets.json', JSON.stringify(tweets, null, 4), function (err) {
        if (err) throw err;
        console.log('It\'s saved!');
    });

});