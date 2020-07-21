const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let db;

const mongoConnect = () => {
    MongoClient.connect('mongodb+srv://johnny:12345678++--@johnny-u8qnc.mongodb.net/shop?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
        .then((client) => {
            console.log('connected');
            db = client.db();
        })
        .catch((err) => {
            console.log(err);
        });
}

const getDb = () => {
    if (db) {
        return db;
    }
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;