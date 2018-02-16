var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var userData = require('../models/user_model');
var sessionData = require('../models/session_model');
var notesData = require('../models/notes_model');

var moment = require('moment');


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
    dominantEmotvar moment = require('moment');
ion: "Rabbia",
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
            notesData.find({"user" : req.query.id}, function(err, notes) {
               res.render('user', {user :resp, session:sessions, note: notes});
            })

        })
    });

});

router.post('/insert', function (req, res, next) {
 var newsession = {
     "user": req.body.user,
     "date": moment().format("DD/MM/YY HH:mm"),
     "score": req.body.points,
     "dominantEmotion": req.body.emotion,
     "choices": req.body.choices
    };
sessionData.collection.insert(newsession, onInsert);

});

router.post('/insert2', function (req, res, next) {
    var newnote = {
        "user": req.body.user,
        "date": moment().format("DD/MM/YY HH:mm"),
        "note": req.body.note,
    };
    notesData.collection.insert(newnote, onInsert);
    res.send({message: "success"});

});


module.exports = router;

