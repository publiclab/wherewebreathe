var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var QuestionSchema = new Schema({
  _id: Number,
  type: String,
  set: String,
  label: String,
  answers: Array,
  question: String,
  answers: Array
});
  
mongoose.model( 'Question', QuestionSchema );
mongoose.connect( 'mongodb://localhost/wherewebreathe' );

//var CatSchema = new Schema({
   // name : String,
   // weight : Number,
   // breed : String
//});

//mongoose.model( 'Cat', CatSchema );


//Image.schema.path('desc').validate(function (value) {
  // example: //return /blue|green|white|red|orange|periwinkle/i.test(value);
  //return (value.split(' ').length > 1000);
//}, 'Description must be less than 1000 words');

//mongoose.connect( 'mongodb://localhost/wherewebreathe_test' );


