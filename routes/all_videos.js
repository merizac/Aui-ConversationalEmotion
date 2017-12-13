var express = require('express');
var router = express.Router();
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

router.get('/', function(req, res, next) {
    var emotions = ["joy", "sadness", "fear", "disgust", "anger"];
    var param = JSON.parse('{"emotions" : []}');
    var urls = [];

    emotions.forEach(function(emotion){
       urls.push("http://localhost:3000/video/allthumbnail/" + emotion);
        param['emotions'].push({"emotion" : emotion, "filename" : []});
    });

    async.map(urls, httpGet, function (err, result){
        if (err) return console.log(err);
        var itaEmotions=['Gioia', 'Tristezza', 'Paura', 'Disgusto', 'Rabbia'];
        res.render('all_videos', {video : result , emotions : itaEmotions} );
    });
});





module.exports = router;