var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('session1', { user: 'Giovanni' });
});

module.exports = router;
