const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
    // userId: {
    //     type: mongoose.type.objectId
    // },
    title: {
        type: String
    },
    regPrice: {
        type: Number
    },
    salePrice: {
        type: Number
    },
    quantity: {
        type: Number
    },
    image: {
        type: String
    },
    sold: {
        type: Number,
        default: 0
    },
    description: {
        type: String
    },
    category: {
        type: String
    },
    sex: {
        type: String
    },
    hasSize: {
        type: String
    },
    sizes: [{
        _id: false,
        size: {
            type: String
        },
        qty: {
            type: Number
        }
    }]
})

module.exports = mongoose.model('Product', productSchema);
// module.exports = class Product {

//     constructor(title, image, rPrice, sPrice, category, description, size, s, m, l, xl, xxl, xxxl, id) {
//         this.title = title;
//         this.regPrice = parseFloat(rPrice);
//         this.salePrice = parseFloat(sPrice);
//         this.image = image;
//         this.description = description;
//         this.category = category;
//         this.size = size;
//         this.s = s;
//         this.m = m;
//         this.l = l;
//         this.xl = xl;
//         this.xxl = xxl;
//         this.xxxl = xxxl;
//         this._id = id ? new mongodb.ObjectID(id) : null;
//     }

//     save() {
//         const db = getDb();
//         return db.collection('products').insertOne(this)
//             .then(result => {
//                 return result;
//             })
//             .catch((err) => {
//                 throw err;
//             })
//     }

//     update() {
//         const db = getDb();
//         return db.collection('products').updateOne({ _id: this._id }, { $set: this })
//             .then(result => {
//                 return result;
//             })
//             .catch((err) => {
//                 throw err;
//             })
//     }

//     static findByid(id) {
//         const db = getDb();
//         return db.collection('products').findOne({ _id: new mongodb.ObjectId(id) })
//             .then(result => {
//                 return result;
//             })
//             .catch((err) => {
//                 throw err;
//             })
//     }

//     static findAll() {
//         const db = getDb();
//         return db.collection('products').find().toArray()
//             .then(result => {
//                 return result;
//             })
//             .catch((err) => {
//                 throw err;
//             })
//     }
// }