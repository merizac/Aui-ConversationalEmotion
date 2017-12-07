var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var userData = require('../models/user_model');


router.get('/', function(req, res, next){
    userData.findById(req.query.id, function(err, resp){
        console.log(resp);
        res.render('user', {user: resp
        });
    });
});

module.exports = router;

