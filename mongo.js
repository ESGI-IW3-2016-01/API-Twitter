require('dotenv').config();
var MongoClient = require("mongodb").MongoClient;
MongoClient.connect('mongodb://' + process.env.MONGO_HOST + ':' + process.env.MONGO_PORT + '/' + process.env.MONGO_DB, function (error, db) {
    if (error) throw error;
    db.collection('paris').aggregate([
        {
            $group: {
                _id: '$created_at',
                count: {$sum: 1}
            }
        },
        {
            $sort: {
                count: -1
            }
        },
        {
            limit: 10
        }
    ], function (err, result) {
        if (err) console.error(err);
        // res.send(JSON.stringify(result, null, 4));
        console.log(JSON.stringify(result, null, 4));
    });
});