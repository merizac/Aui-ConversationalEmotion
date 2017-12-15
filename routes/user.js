var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var userData = require('../models/user_model');
var sessionData = require('../models/session_model');

/*var sessions= [{
    user: "5a2ebb00ce76390302cd7e1d",
    date: Date.now,
    score: "23",
    dominantEmotion: "Gioia",
    choices: "3"},

    {
    user: "5a2ebb00ce76390302cd7e1d",
    date: Date.now,
    score: "5",
    dominantEmotion: "Rabbia",
    choices: "1"}
];

sessionData.collection.insert(sessions, onInsert);*/


function onInsert(err, docs) {
    if (err) {
        // TODO: handle error
    } else {
        console.info('Sessions were successfully stored.');
    }
}

router.get('/', function(req, res, next){
    userData.findById(req.query.id, function(err, resp){
        sessionData.find({"user" : req.query.id}, function (err, sessions) {
                console.log(sessions);
                res.render('user', {user: resp, session: sessions});
            })
    });

});

module.exports = router;

