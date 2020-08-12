var router = require('express').Router();
var Country = require('../../models/country');

router.get('/all', async(req, res) => {
    res.json(await Country.find({}, '_id name').sort({ name: 1 }).exec());
})

router.post('/all', async(req, res) => {
    res.json(await Country.find({ type: req.body.type }).sort({ name: 1 }).exec());
})

module.exports = router