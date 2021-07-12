// const mongodb = require('mongodb');
// const getDb = require('../util/connection').getDb;
const Products = require('./product');

module.exports = class Cart {

    constructor() {}

    addToCart(req, prodId, qty, size, cb) {
        const myCart = req.session.cart;
        // console.log(myCart.products[0].prodId, this.prodId);
        const exProductindex = myCart.products.findIndex(p => { return ((p.prodId == prodId) && (p.size == size)) });
        // console.log(exProductindex);
        let update = {};
        if (exProductindex !== -1) {
            update.prodId = prodId;
            update.qty = qty ? +qty : myCart.products[exProductindex].qty + 1;
            update.size = size;
            myCart.products[exProductindex] = update;
        } else {
            update.prodId = prodId;
            update.qty = qty ? +qty : 1;
            update.size = size;
            myCart.products = [...myCart.products, update];
        }
        req.session.cart = myCart;
        cb(req.session.cart.products.length);
    }

    static getCart(req, products, cb) {
        let limited;
        req.session.cart.products.forEach(p => {
            const prod = products.find(q => q._id == p.prodId);
            if (p.size !== 'null') {
                const index = prod.sizes.findIndex(s => s.size === p.size);
                if (prod.sizes[index].qty < p.qty) {
                    p.qty = prod.sizes[index].qty,
                        limited = true;
                }
            } else {
                if (prod.quantity < p.qty) {
                    limited = true;
                    p.qty = prod.quantity;
                }
            }
        })
        const cart = req.session.cart.products.map(p => {
            let prodObj = products.find(q => q._id == p.prodId)
            return {...p, title: prodObj.title, salePrice: prodObj.salePrice, image: prodObj.image }
        })
        cb(cart, limited);
    }

    static totalPrice(products, cb) {
        const prods = products;
        let totalPrice = 0;
        for (let prod of prods) {
            let price = prod.salePrice;
            let qty = prod.qty;
            totalPrice = parseFloat((totalPrice + (price * qty)).toFixed(2));
        }
        cb(totalPrice);
    }

    static deleteFromCart(req, prodId, size, cb) {
        const products = req.session.cart.products;
        const index = products.findIndex(p => { return ((p.prodId == prodId) && (p.size == size)) });
        products.splice(index, 1);
        req.session.cart.products = products;
        cb(req.session.cart.products.length);
    }

    static clearCart(req, cb) {
        req.session.cart.products.forEach(p => {
            Products.findById(p.prodId)
                .then(prod => {
                    prod.quantity = prod.quantity - p.qty;
                    if (p.size !== 'null') {
                        const index = prod.sizes.findIndex(s => s.size === p.size);
                        prod.sizes[index].qty = prod.sizes[index].qty - p.qty;
                    }
                    prod.sold = prod.sold + p.qty;
                    return prod.save()
                })
                .then(() => {
                    return;
                })
                .catch(err => {
                    return;
                })
        })
        req.session.cart.products = [];
        cb();
    }

    // save() {
    //     const db = getDb();
    //     return db.collection('products').insertOne({ userid: this.userId, product: [], total: 0 })
    //         .then(result => {
    //             return result;
    //         })
    //         .catch((err) => {
    //             throw err;
    //         })
    // }

    // update() {
    //     const db = getDb();

    //     return db.collection('cart').findOne({ userId: this.userId })
    //         .then(result => {
    //             const myCart = result;
    //             // console.log(myCart.products[0].prodId, this.prodId);
    //             const exProductindex = myCart.products.findIndex(p => { return ((p.prodId == this.prodId) && (p.size == this.size)) });
    //             // console.log(exProductindex);
    //             let update = {};
    //             if (exProductindex !== -1) {
    //                 update.prodId = this.prod_Id
    //                 update.qty = this.qty ? this.qty : myCart.products[exProductindex].qty + 1;
    //                 update.image = this.prod.image;
    //                 update.size = this.size;
    //                 update.price = this.prod.salePrice;
    //                 update.tprice = this.prod.salePrice * update.qty;
    //                 update.tprice = parseFloat(update.tprice.toFixed(2));
    //                 update.title = this.prod.title;
    //                 myCart.products[exProductindex] = update;
    //             } else {
    //                 update.prodId = this.prod_Id;
    //                 update.qty = this.qty ? this.qty : 1;
    //                 update.size = this.size;
    //                 update.image = this.prod.image;
    //                 update.price = this.prod.salePrice;
    //                 update.tprice = this.prod.salePrice * update.qty;
    //                 update.tprice = parseFloat(update.tprice.toFixed(2));
    //                 update.title = this.prod.title;
    //                 myCart.products.push(update);
    //             }
    //             myCart.total = myCart.total + update.tprice;
    //             myCart.total = parseFloat(myCart.total.toFixed(2));
    //             return db.collection('cart').updateOne({ userId: this.userId }, { $set: { products: myCart.products, total: myCart.total } })
    //         })
    //         .catch((err) => {
    //             throw err;
    //         })
    // }

    // static delete(userId, prodId, size) {
    //     const db = getDb();

    //     return db.collection('cart').findOne({ userId: new mongodb.ObjectId(userId) })
    //         .then(result => {
    //             const myCart = result;
    //             const products = myCart.products;
    //             // console.log(myCart.products[0].prodId, this.prodId);
    //             const index = products.findIndex(p => { return ((p.prodId == prodId) && (p.size == size)) });
    //             myCart.total = myCart.total - products[index].tprice;
    //             myCart.total = parseFloat(myCart.total.toFixed(2));
    //             products.splice(index, 1);
    //             return db.collection('cart').updateOne({ userId: new mongodb.ObjectId(userId) }, { $set: { products: products, total: myCart.total } })
    //         })
    //         .catch((err) => {
    //             throw err;
    //         })
    // }

    // static myCart(id) {
    //     const db = getDb();
    //     return db.collection('cart').findOne({ userId: new mongodb.ObjectId(id) })
    //         .then(result => {
    //             return result;
    //         })
    //         .catch((err) => {
    //             throw err;
    //         })
    // }

    // static updateQty(userId, prodId, size, qty) {
    //     const db = getDb();
    //     return db.collection('cart').findOne({ userId: new mongodb.ObjectId(userId) })
    //         .then(result => {
    //             const cart = result;
    //             const products = cart.products;
    //             const product = products.find(p => { return ((p.prodId == prodId) && (p.size == size)) });

    //             return db.collection('cart').updateOne({ userId: new mongodb.ObjectId(userId), products. })
    //         })
    //         .catch((err) => {
    //             console.log(err);
    //         })

    // }
}