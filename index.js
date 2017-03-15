require('dotenv').config();
var Twitter = require('twitter');
var fs = require('fs');

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