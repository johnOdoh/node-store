// const mongodb = require('mongodb');
// const getDb = require('../util/connection').getDb;
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const orderSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
    },
    status: {
        type: String
    },
    trackingCode: {
        type: String
    },
    discount: {
        type: Number,
        default: 0
    },
    total: {
        type: Number
    },
    shipping: {
        method: {
            type: String,
            default: 'Standard'
        },
        fee: {
            type: Number,
            default: 10
        }
    },
    products: [{
        prodId: Schema.Types.ObjectId,
        image: {
            type: String
        },
        salePrice: {
            type: Number
        },
        title: {
            type: String
        },
        qty: {
            type: Number
        },
        size: {
            type: String
        }
    }],
    deliveryAddress: {
        firstName: {
            type: String
        },
        lastName: {
            type: String
        },
        email: {
            type: String
        },
        address1: {
            type: String
        },
        address2: {
            type: String
        },
        country: {
            type: String
        },
        city: {
            type: String
        },
        phone: {
            type: String
        },
        zip: {
            type: Number
        },
    },
    time: {
        type: Date
    }
})

module.exports = mongoose.model('Order', orderSchema);
// module.exports = class Order {
//     constructor(first, last, email, address1, address2, country, city, phone, zip) {
//         this.firstName = first;
//         this.lastName = last;
//         this.email = email;
//         this.address1 = address1;
//         this.address2 = address2 ? address2 : '';
//         this.country = country;
//         this.city = city;
//         this.phone = phone;
//         this.zip = zip;
//     }

//     save(user) {
//         const db = getDb();
//         return db.collection('cart').findOne({ userId: new mongodb.ObjectId(user) })
//             .then(result => {
//                 const order = {};
//                 const myCart = result;
//                 order.userId = myCart.userId;
//                 order.status = 'unlogged';
//                 order.total = myCart.total;
//                 order.products = myCart.products;
//                 order.deliveryAddress = this;
//                 order.time = new Date().getTime();
//                 db.collection('orders').insertOne(order)
//                     .then(() => {
//                         myCart.products.splice(0, myCart.products.length);
//                         return db.collection('cart').updateOne({ userId: new mongodb.ObjectId(user) }, { $set: { total: 0, products: myCart.products } })
//                     })
//                     .catch((err) => {
//                         console.log(err);
//                     })
//             })
//             .catch((err) => {
//                 console.log(err);
//             })
//     }

//     static logOrder(id) {
//         const db = getDb();
//         return db.collection('orders').updateOne({ _id: new mongodb.ObjectId(id) }, { $set: { status: 'logged' } })
//     }

//     static allOrders() {
//         const db = getDb();
//         return db.collection('orders').find().toArray()
//     }

//     static order(id) {
//         const db = getDb();
//         return db.collection('orders').findOne({ _id: new mongodb.ObjectId(id) })
//     }
// }