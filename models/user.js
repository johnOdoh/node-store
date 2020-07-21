const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    role: {
        type: String,
        default: 'user'
    },
    resetToken: {
        type: String
    },
    tokenExpire: {
        type: Date
    },
    addressDetails: {
        country: {
            type: String
        },
        city: {
            type: String
        },
        address1: {
            type: String
        },
        address2: {
            type: String
        },
        zip: {
            type: Number
        },
        phoneNo: {
            type: Number
        }
    },
    wishlist: [{
        type: Schema.Types.ObjectId,
        ref: 'Product'
    }]
})

module.exports = mongoose.model('User', userSchema);
// userSchema.methods.addToCart = function(prodId, qty, size) {
//     const myCart = this.cart;
//     // console.log(myCart.products[0].prodId, this.prodId);
//     const exProductindex = myCart.products.findIndex(p => { return ((p.prodId == prodId) && (p.size == size)) });
//     // console.log(exProductindex);
//     let update = {};
//     if (exProductindex !== -1) {
//         update.prodId = prodId
//         update.qty = qty ? qty : myCart.products[exProductindex].qty + 1;
//         update.size = size;
//         myCart.products[exProductindex] = update;
//     } else {
//         update.prodId = prodId;
//         update.qty = qty ? qty : 1;
//         update.size = size;
//         myCart.products = [...myCart.products, update];
//     }
//     return this.save();
// }

// userSchema.methods.deleteFromCart = function(prodId, size) {
//     const myCart = this.cart;
//     const products = myCart.products;
//     // console.log(myCart.products[0].prodId, this.prodId);
//     const index = products.findIndex(p => { return ((p.prodId == prodId) && (p.size == size)) });
//     products.splice(index, 1);
//     return this.save();
// }

// userSchema.methods.totalPrice = function(products, cb) {
//     const prods = products;
//     let totalPrice = 0;
//     for (let prod of prods) {
//         let price = prod.prodId.salePrice;
//         let qty = prod.qty;
//         totalPrice = parseFloat((totalPrice + (price * qty)).toFixed(2));
//     }
//     cb(totalPrice);
// }

// userSchema.methods.clearCart = function() {
//     this.cart.products.splice(0, this.cart.products.length);
//     return this.save();
// }

// module.exports = class User {

//     constructor(name, email) {
//         this.name = name;
//         this.email = email;
//     }

//     save() {
//         const db = getDb();
//         return db.collection('products').insertOne({ userid: this.userId, product: [], total: 0 })
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
//         return db.collection('users').findOne({ _id: new mongodb.ObjectId(id) })
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
//                 console.log(result);
//                 return result;
//             })
//             .catch((err) => {
//                 throw err;
//             })
//     }
// }