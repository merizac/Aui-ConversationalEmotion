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
    //picture:
});






var userData = mongoose.model('UserData', user);
var users = [{
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

function onInsert(err, docs) {
    if (err) {
        // TODO: handle error
    } else {
        console.info('%d users were successfully stored.', docs.length);
    }
}

/*document.addEventListener("DOMContentLoaded", function () {
    newUser = document.getElementById("addProfile");
});

/*newUser.addEventListener("click", function(){

})*/

module.exports = router;


router.get('/', function(req, res, next){
   // res.send(users);
    res.render('profiles', { users: users });
});
