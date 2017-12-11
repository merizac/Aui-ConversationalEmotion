var express = require('express');
var router = express.Router();
var _ = require('underscore');
var request = require('request');
var async = require('async');

function httpGet(url, callback) {
    const options = {
        url :  url,
        json : true
    };
    request(options,
        function(err, res, body) {
            callback(err, body);
        }
    );
}

/* GET session. */
router.get('/', function(req, res, next) {

    var emotion = req.query.emotion;
    var num_video = req.query.num_video;
    var emotions = ["Joy", "Sadness", "Fear", "Disgust", "Anger"];
    emotions = _.last(_.shuffle(_.without(emotions, emotion)), num_video-1);

    var param = '{"emotions" : []}';
    var parse_param = JSON.parse(param);
    parse_param['emotions'].push({"emotion": emotion, "right": true });
    emotions.forEach(function(emotion){
        parse_param['emotions'].push({"emotion" : emotion, "right" : false });
    });


    parse_param=_.shuffle(parse_param['emotions']);

    var urls = [];

    parse_param.forEach(function(param){
        urls.push("http://localhost:3000/video/thumbnail/"+ param.emotion);
    });

    async.map(urls, httpGet, function (err, result){
        if (err) return console.log(err);
        for (i=0; i< parse_param.length; i++){
            parse_param[i].filename = result[i];
        }
        res.render('session', {data : parse_param});
    });



});

module.exports = router;
