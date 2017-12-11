var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var conn = mongoose.connection;
var path = require('path');
var fs = require('fs');
var ffmpeg = require('fluent-ffmpeg');
var Grid = require('gridfs-stream');
Grid.mongo = mongoose.mongo;
var gfs;


/* GET home page. */
/*router.get('/', function(req, res, next) {
    console.log("session");
    //res.render('new-session');
});*/

conn.once("open", function(){
    console.log("Connection opened");

    gfs = Grid(conn.db);

    var db = conn.db;

    //get the video given the filename
    router.get('/', function(req, res){


        gfs.files.findOne({
            filename: req.query.filename
        }, function(err, file){
            if(err){
                return res.status(400).send({message: "File not found"});
            }
            
            var data = [];
            var readstream = gfs.createReadStream({
                filename: file.filename
            });

            readstream.on('data', function (chunk) {
                data.push(chunk);
                console.log(chunk);
            });

            readstream.on('end', function(){
                data = Buffer.concat(data);

                var total = data.length;
                var range = req.headers.range;
                var positions = range.replace(/bytes=/, "").split("-");
                var start = parseInt(positions[0], 10);
                var end = positions[1] ? parseInt(positions[1],10) : total-1;
                var chunksize = (end - start)+1;
                res.writeHead(206, { "Content-Range": "bytes " + start + "-" + end + "/" + total,
                    "Accept-Ranges": "bytes",
                    "Content-Length": chunksize,
                    "Content-Type":"video/mp4"});
                res.end(data.slice(start, end+1), "binary");
            });

            readstream.on('error', function(error){
                console.log('An error occured!', error);
                throw error;
            })


        })

    });

    //get the filename of the video and of the thumbnail given an emotion
    router.get('/thumbnail/:emotion', function(req, res) {
        var filename=[];
        db.collection("fs.files")
            .find({ "metadata.emotion" : req.params.emotion, "metadata.format" : "thumbnail"})
            .toArray(function(err, files){
                if(err) throw error;

                files.forEach(function (file) {
                    filename.push({ thumbnail: file.filename, video : file.metadata.video});
                });

                var index = Math.floor(Math.random() * filename.length);
                res.send(filename[index]);
            });

    });

    // get the thumbnail given the filename
    router.get('/thumbnail', function(req, res){
        console.log("entered get filename");
        var filename = req.query.filename;

        gfs.files.find({
            filename: filename
        }).toArray(function(err, files){
            if(files.length==0){
                return res.status(400).send({message: "File not found"});
            }
            var data = [];
            var readstream = gfs.createReadStream({
                filename: files[0].filename
            });

            readstream.on('data', function (chunk) {
                data.push(chunk);
            });

            readstream.on('end', function(){
                data = Buffer.concat(data);
                res.writeHead(200, {'Content-Type': 'image/png' });
                res.end(data, 'binary');
            });

            readstream.on('error', function(error){
                console.log('An error occured!', error);
                throw error;
            })


        })

    });

    //upload a video and create the thumbnail
    router.post('/upload', function (req, res) {

        var part = req.files[0];
        var emotion = req.body.emotion;
        var filename = "video-" + part.filename;

        var writestream = gfs.createWriteStream({
            filename: filename,
            mode: 'w',
            content_typ: part.mimeType,
            metadata: {
                format : "video",
                emotion: emotion
            }
        });

        fs.createReadStream(part.path).pipe(writestream);

        var thumbnail = "thumbnail-" + part.filename.split(".")[0]+ ".png";

        ffmpeg(part.path)
            .screenshots({
                // Will take screens at 20%, 40%, 60% and 80% of the video
                timestamps: ['10%'],
                folder: 'public/uploads',
                filename : thumbnail,
                size: '320x240'
            }).on('end', function(){
                var writestreampng = gfs.createWriteStream({
                    filename: thumbnail,
                    mode: 'w',
                    content_typ: "image/png",
                    metadata : {
                        format : "thumbnail",
                        emotion : emotion,
                        video : filename
                    }
                });

                var pngpath= "public/uploads/" + thumbnail;

                fs.createReadStream(pngpath).pipe(writestreampng);


                writestreampng.on('close', function(){

                    fs.unlink(path.join(__dirname, "../", part.path), function(err) {
                    if (err) throw err;
                        console.log('successfully deleted '+ filename);
                    });

                    fs.unlink(path.join(__dirname, "../", pngpath), function(err) {
                        if (err) throw err;
                        console.log('successfully deleted '+ thumbnail);
                    });
                });


                return res.send({
                    result : "Success"
                })


        });


    });
});

module.exports = router;
