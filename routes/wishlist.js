const express = require('express');

const router = express.Router();

router.get('/wishlist', (req, res, next) => {
    res.render('wishlist', { path: 'shop', isLoggedIn: req.session.isLoggedIn });
});

module.exports = router;