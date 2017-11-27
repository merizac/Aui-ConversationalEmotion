var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  switch (req.query.service) {
    case "STT":
      res.send(process.env.SPEECH_TO_TEXT_KEY);
      break;
    default: console.log(JSON.stringify(event)); // Debug information

  }
});

module.exports = router;
