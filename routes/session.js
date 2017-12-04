var express = require('express');
var router = express.Router();
var _ = require('underscore');

/* GET session. */
router.get('/', function(req, res, next) {

    var emotion = req.query.emotion;
    var num_video = req.query.num_video;
    var emotions = ["joy", "sadness", "fear", "disgust", "anger"];
    emotions = _.last(_.shuffle(_.without(emotions, emotion)), num_video-1);

    var param = '{"emotions" : []}';
    var parse_param = JSON.parse(param);
    parse_param['emotions'].push({"emotion": emotion, "right": true});
    emotions.forEach(function(emotion){
       parse_param['emotions'].push({"emotion" : emotion, "right" : false});
    });

    parse_param=_.shuffle(parse_param['emotions']);
    res.render('session', { data : parse_param});

});

module.exports = router;
