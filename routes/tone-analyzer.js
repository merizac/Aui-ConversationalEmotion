var express = require('express');
var router = express.Router();

/* GET tone analyzer page. */
router.get('/', function(req, res, next) {
  var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');

  var tone_analyzer = new ToneAnalyzerV3({
    username: process.env.TONE_ANALYZER_USR,
    password: process.env.TONE_ANALYZER_PWD,
    version_date: '2016-05-19'
  });

  var params = {
    text: req.query.text,
    tones: 'emotion'
  };

  tone_analyzer.tone(params, function(error, response) {
    if (error){
      res.setHeader('Content-Type', 'text/plain');
      res.send(error);
    }

    else{
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(response));
    }
    }
  );
});

module.exports = router;
