var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var busboy_body_parser = require('busboy-body-parser');
var debug = require('debug')('aui-project:app');
var dotenv = require('dotenv').config();
var multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads')
    },
    filename: function (req, file, cb) {
        var extArray = file.mimetype.split("/");
        var extension = extArray[extArray.length - 1];
        var filename = file.originalname.split(".")[0];
        cb(null, filename + '-' + Date.now()+ '.' +extension)
    }
});
var mongoose = require('mongoose');
mongoose.connect("mongodb://root:AUI-project2017@ds135196.mlab.com:35196/auitest", {
    useMongoClient:true
});

var session1 = require('./routes/session1');
var tone_analyzer = require('./routes/tone-analyzer');
var key = require('./routes/key');
var home = require('./routes/home');
var session = require('./routes/session');
var video = require('./routes/video');
var profiles =  require('./routes/profiles');
var all_videos = require('./routes/all_videos');
var user = require('./routes/user');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(multer({ storage : storage}).any());

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(busboy_body_parser());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/scripts', express.static(path.join(__dirname, 'node_modules/microsoft-speech-browser-sdk/distrib')));
app.use('/scripts', express.static(path.join(__dirname, 'node_modules/chart.js/dist')));

app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap
app.use('/fonts/', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/fonts'))); //redirect bootstrap glyphicons

//routes to render pages
app.use('/', home);
app.use('/tone-analyzer', tone_analyzer);
app.use('/key', key);
app.use('/session1', session1);
app.use('/session2', session);
app.use('/video', video);
app.use('/profiles', profiles);
app.use('/all_videos', all_videos);
app.use('/user', user);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
