var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var user = new Schema({
    name: {type: String, required: true},
    surname: {type: String, required: true},
    age: {type: Number, min:0, max:99, required: true},
    disabilityDescription: String,
    notes: String,
    image : {type: String, required: true}
});

var userData = mongoose.model('UserData', user);

module.exports = userData;