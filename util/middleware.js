const Functions = require('./functions');

exports.auth = ((req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/auth/login');
    }
    res.locals.fName = req.user.firstName;
    res.locals.lName = req.user.lastName;
    res.locals.role = req.user.role;
    next();
})

exports.isAdmin = ((req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/auth/login');
    }
    if (req.session.role !== 'admin' && req.session.role !== 'super') {
        return res.redirect('/home');
    }
    res.locals.fName = req.user.firstName;
    res.locals.lName = req.user.lastName;
    res.locals.role = req.user.role;
    next();
})

exports.cartLength = ((req, res, next) => {
    req.session.cart = req.session.cart || {};
    req.session.cart.products = req.session.cart.products || [];
    res.locals.length = req.session.cart.products.length;
    next();
})

exports.checkDataCookie = ((req, res, next) => {
    res.locals.cred = {};
    res.locals.cred.email = ''
    res.locals.cred.password = '';
    if (!req.session.isLoggedIn) {
        if (req.cookies['data']) {
            const data = req.cookies['data'].split('::');
            res.locals.cred.email = Functions.decrypt(data[0]);
            res.locals.cred.password = Functions.decrypt(data[1]);
        }
    }
    next();
})