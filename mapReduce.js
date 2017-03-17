require('dotenv').config();
var MongoClient = require("mongodb").MongoClient;

/**
 * Map function for mapReduce
 */
var mapper = function () {
    var text = this.text;
    text = text.replace(/[.,\/!$%\^&\*;:{}=\-_`~()?]/g, "");
    text = text.replace(/[\n]/g, "");
    text = text.toLowerCase().split(" ");
    for (var i = text.length - 1; i >= 0; i--) {
        if (text[i]) emit(text[i], 1);
    }
};

/**
 * Reduce function for mapReduce
 * @param key
 * @param values
 * @returns {number}
 */
var reducer = function (key, values) {
    var count = 0;
    values.forEach(function (v) {
        count += v;
    });
    return count;
};

/**
 * Word Count in collections using mapReduce
 */
function wordCount() {
    paris = process.env.MONGO_COL_PARIS;
    la = process.env.MONGO_COL_LA;
    MongoClient.connect('mongodb://' + process.env.MONGO_HOST + ':' + process.env.MONGO_PORT + '/' + process.env.MONGO_DB, function (err, db) {
        if (err) throw err;
        db.collection(paris).mapReduce(mapper, reducer, {out: {replace: 'word_count_' + paris}});
        db.collection(la).mapReduce(mapper, reducer, {out: {replace: 'word_count_' + la}});
        console.log(new Date().toLocaleString() + ' word counted');
        db.close();
    });
}

wordCount();