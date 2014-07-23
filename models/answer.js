var mongoose = require('mongoose');
mongoose.set('debug', true);
//mongoose.set('debug', true);
var wwb = mongoose.createConnection('mongodb://localhost/wherewebreathe');

var Schema = mongoose.Schema;

var AnswerSchema = new Schema({
  qid: Schema.Types.ObjectId,
  uid: Schema.Types.ObjectId,
  a: String
  
}); 


module.exports = wwb.model('Answer', AnswerSchema);
