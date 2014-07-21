var mongoose = require('mongoose');
mongoose.set('debug', true);
//mongoose.set('debug', true);
var wwb = mongoose.createConnection('mongodb://localhost/wherewebreathe');

var Schema = mongoose.Schema;

var UserResponseSchema = new Schema({
  uId: Number,
  a: String
});  

var AnswerSchema = new Schema({
  _id: Schema.Types.ObjectId,
  graph_type: String,
  userResponses: [UserResponseSchema]
  
}); 


module.exports = wwb.model('Answer', AnswerSchema);
