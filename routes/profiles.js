var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var fs = require('fs');
var url = require('url');
var path = require('path');
var Grid = require('gridfs-stream');
Grid.mongo = mongoose.mongo;
var conn = mongoose.connection;
var gfs;

var userData = require('../models/user_model');

/*var users = [{
        "name" : "Maria Chiara",
        "surname" : "Zaccardi",
        "age" : "23",
        "disabilityDescription": "porca troia",
        "notes" : "ciao"},

    {
        "name" : "Nicola",
        "surname" : "Sosio",
        "age" : "23",
        "disabilityDescription": "porca troia",
        "notes" : "ciao"},

    {
        "name" : "Matteo",
        "surname" : "Penco",
        "age" : "22",
        "disabilityDescription": "porca troia",
        "notes" : "ciao"}
  ];


userData.collection.insert(users, onInsert);*/


function onInsert(err, docs) {
    if (err) {
        // TODO: handle error
    } else {
        console.info('Users were successfully stored.');
    }
}

conn.once("open", function() {

    gfs = Grid(conn.db);

    router.get('/', function (req, res, next) {
        // res.send(users);
        userData.find()
            .then(function (users) {
                res.render('profiles', {users: users});
            });
    });

    router.get('/image', function(req, res){

        var imageId = req.query.id;
        var id = new ObjectId(imageId);

        gfs.files.find({
            _id: id
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

    router.post('/insert', function (req, res, next) {

        if(req.files.length>0){
            var part = req.files[0];
            var filename = "profileImg-" + part.filename;

            var writestream = gfs.createWriteStream({
                filename: filename,
                mode: 'w',
                content_typ: part.mimeType,
            });


            fs.createReadStream(part.path).pipe(writestream);

            writestream.on("close", function(file){
                var newUser = {
                    "name": req.body.name,
                    "surname": req.body.surname,
                    "age": req.body.age,
                    "disabilityDescription": req.body.disabilityDescription,
                    "notes": req.body.notes,
                    "image" : file._id
                };
                
                userData.collection.insert(newUser, onInsert);
                fs.unlink(path.join(__dirname, "../", part.path), function(err) {
                    if (err) throw err;
                    console.log('successfully deleted '+ filename);
                });

                res.send("success");

            } );
        }

        else {
            var newUser = {
                "name": req.body.name,
                "surname": req.body.surname,
                "age": req.body.age,
                "disabilityDescription": req.body.disabilityDescription,
                "notes": req.body.notes
            };
            userData.collection.insert(newUser, onInsert);

        }




    });

    router.post('/delete', function (req, res, next) {
        console.log(req.body.id);
        var id = req.body.id;
        userData.findById(id)
            .then(function(user){
                gfs.remove({ _id: user.image });
            });
        userData.findByIdAndRemove(id).exec();
        //res.redirect('/profiles');
    });

    router.get('/user', function (req, res, next) {
        res.redirect(url.format({
            pathname: "/user",
            query: {
                id: req.query.id
            }
        }));

    });
});
module.exports = router;
