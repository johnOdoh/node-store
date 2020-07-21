const express = require('express');

const router = express.Router();

router.get('/product-detail', (req, res, next) => {
    res.render('product-detail');
});

module.exports = router;