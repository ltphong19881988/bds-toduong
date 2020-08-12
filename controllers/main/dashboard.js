var router = require('express').Router();
const Middleware = require('../../models/helpers/my-middleware');

var isAuthenticated = [Middleware.isAuthenticated];
router.get('/*', isAuthenticated, async(req, res, next) => {
    res.render('layout/frontPage', {});
})

module.exports = router