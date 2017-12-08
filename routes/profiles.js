var express = require('express');
var router = express.Router();

var url = require('url');

var userData = require('../models/user_model');

/*var users = [{
        "name" : "Maria Chiara",
        "surname" : "Zaccardi",
        "age" : "23",
        "notes" : "ciao"},

    {
        "name" : "Nicola",
        "surname" : "Sosio",
        "age" : "23",
        "notes" : "ciao"},

    {
        "name" : "Matteo",
        "surname" : "Penco",
        "age" : "22",
        "notes" : "ciao"}
  ];


userData.collection.insert(users, onInsert);
*/

function onInsert(err, docs) {
    if (err) {
        // TODO: handle error
    } else {
        console.info('Users were successfully stored.');
    }
}


router.get('/', function(req, res, next){
   // res.send(users);
    userData.find()
        .then(function(users){
            res.render('profiles', { users: users });
        });

});

router.post('/insert', function(req, res, next){
    var newUser = {
        "name": req.body.name,
        "surname": req.body.surname,
        "age": req.body.age,
        "disabilityDescription": req.body.description,
        "notes": req.body.notes
    };
    userData.collection.insert(newUser, onInsert);
    res.send("success");
});

router.post('/delete', function(req, res, next){
    console.log(req.body.id);
    var id= req.body.id;
    userData.findByIdAndRemove(id).exec();
    res.redirect('/profiles');
});

router.get('/user', function(req, res, next){
    res.redirect(url.format({
        pathname : "/user",
        query : {
            id : req.query.id
        }
    }));
});

module.exports = router;
