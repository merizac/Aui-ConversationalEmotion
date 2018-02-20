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

        userData.find()
            .then(function (users) {
                res.render('profiles', {users: users});
            });
    });

    router.get('/image', function(req, res){

        var imageId = req.query.id;
        var ObjectID = require('mongodb').ObjectID;
        var id = new ObjectID(imageId);

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
                    "image" : file._id,
                    "imageDefault" : false
                };

                userData.collection.insert(newUser, onInsert);
                fs.unlink(path.join(__dirname, "../", part.path), function(err) {
                    if (err) throw err;
                    console.log('successfully deleted '+ filename);
                });

                res.send({
                    result : "Success"
                });

            } );
        }

        else {
            var newUser = {
                "name": req.body.name,
                "surname": req.body.surname,
                "age": req.body.age,
                "disabilityDescription": req.body.disabilityDescription,
                "notes": req.body.notes,
                "imageDefault" : true
            };

            userData.collection.insert(newUser, onInsert);
            res.send({
                result : "Success"
            });

        }




    });

    router.post('/delete', function (req, res, next) {

        var id = req.body.id;
    userData.findById(id)
        .then(function(user){
            if(!user.imageDefault){
                gfs.remove({ _id: ""+user.image });
            }

        });
    userData.findByIdAndRemove(id).exec();
    res.send({
        message : "success"
    });
});

    router.get('/user', function (req, res, next) {
        res.redirect(url.format({
            pathname: "/user",
            query: {
                id: req.query.id
            }
        }));

    });


    router.post('/update', function (req, res, next) {
        var id = req.body.id;
        userData.findById(id)
            .then(function(user){
               user.name = req.body.name;
               user.surname = req.body.surname;
               user.age = req.body.age;
               user.disabilityDescription = req.body.disabilityDescription;
               user.notes = req.body.notes;


                user.save(function (err,user) {
                    if(err) {
                        res.send(err);
                    }
                    else{
                        res.send({
                            message : "success"
                        });
                    }
                });

            });


        });


});
module.exports = router;
