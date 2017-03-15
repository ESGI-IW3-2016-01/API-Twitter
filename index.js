require('dotenv').config();
var Twitter = require('twitter');

var client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret: process.env.TWITTER_TOKEN_SECRET
});

var params = {};
client.get('search/tweets.json?q=porn', params, function (error, tweets, response) {
    if (!error) {
        console.log(tweets);
    }
});