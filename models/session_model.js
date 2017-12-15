var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SessionSchema = new Schema({
    user: {type: String},
    date: Date,
    score: Number,
    dominantEmotion: String,
    choices: Number
});

var sessionData = mongoose.model('sessionData', SessionSchema);

module.exports = sessionData;
