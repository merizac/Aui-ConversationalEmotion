var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var conn = mongoose.connection;
var fs = require('fs');

var Grid = require('gridfs-stream');
Grid.mongo = mongoose.mongo;
var gfs;
mongoose.connect(process.env.MONGODB_URI, {
    useMongoClient:true
});

/* GET home page. */
router.get('/', function(req, res, next) {
    //res.render('new-session');
});

conn.once("open", function(){
    console.log("Connection opened");

    gfs = Grid(conn.db);

    var db = conn.db;

    router.get('/video/:emotion', function(req, res){

        var filename=[];
        db.collection("fs.files")
            .find({"metadata.emotion" : req.params.emotion})
            .toArray(function(err, files){
                if (err) throw err;

                files.forEach(function(file) {
                    filename.push(file.filename);
                });

                gfs.files.find({
                    filename: filename[0]
                }).toArray(function(err, files){
                    if(files.length==0){
                        return res.status(400).send({message: "File not found"});
                    }
                    var data = [];
                    var i = Math.random() * 6;
                    console.log("Random : " + i);
                    var readstream = gfs.createReadStream({
                        filename: files[0].filename
                    });

                    readstream.on('data', function (chunk) {
                        data.push(chunk);
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

    });

    router.post('/upload-video', function (req, res) {
        var part = req.files.file;
        var emotion = req.body.emotion;
        var writestream = gfs.createWriteStream({
            filename: 'video-'+ Date.now() + part.name,
            mode: 'w',
            content_typ: part.mimeType,
            metadata: {
                emotion: emotion
            }
        });

        writestream.on('close', function(file){
            return res.send({
                message: 'Success',
                file:file
            });
        });

        writestream.write(part.data);

        writestream.end();
    });
});

module.exports = router;
