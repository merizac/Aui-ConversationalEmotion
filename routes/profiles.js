var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
mongoose.connect('localhost:3000/profiles.ejs');
var Schema = mongoose.Schema;


var user = new Schema({
    name: {type: String, required: true},
    surname: {type: String, required: true},
    age: {type: Number, min:0, max:99, required: true},
    disabilityDescription: String,
    notes: String,
    //picture?
});

var userData = mongoose.model('UserData', user);

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


module.exports = router;
