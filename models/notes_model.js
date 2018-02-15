var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NotesSchema = new Schema({
    user: {type: String},
    date: String,
    note: String,
});

var notesData = mongoose.model('notesData', NotesSchema);

module.exports = notesData;
