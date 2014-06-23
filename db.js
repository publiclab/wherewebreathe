var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CatSchema = new Schema({
    name : String
});

mongoose.model( 'Cat', CatSchema );

//Image.schema.path('desc').validate(function (value) {
  // example: //return /blue|green|white|red|orange|periwinkle/i.test(value);
  //return (value.split(' ').length > 1000);
//}, 'Description must be less than 1000 words');

mongoose.connect( 'mongodb://localhost/wherewebreathe' );
