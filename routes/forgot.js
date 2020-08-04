var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/reset', function(req, res, next) {
    res.render('forgot');
    next();
});

router.get('/', function(req, res, next) {
    res.render('forgot-getuser');
    next();
});

module.exports = router;