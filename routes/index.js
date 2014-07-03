var mongoose = require( 'mongoose' );
var Question = mongoose.model( 'Question' );
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};
//exports.test = function(req, res){
//  res.render('test', { title: 'teest', cats: ['a', 'b']});
//};
//exports.questionnaire = function(req, res){
//  res.render('questionnaire', { title: 'Questions'});
//};
// query db for all todo items
exports.questionnaire = function ( req, res ){
  var qnum = 1;//question # to start at
  //deal with if there is get param for qnum or not
  if (req.params.qnum){
   qnum = parseInt(req.params.qnum);     
  }       
  Question.find({order: qnum}, function ( err, questions){
    var question = questions[0];
    console.log(question);
    pageOptions = {
      title: 'Questionnaire',
      question: question.question, 
      label: question.label,
      qType: question.qType,
      qnum: question.order,
      qid: question._id           
    }
    //append suggested answers if they exist (mongoose creates empty array it seems even if query returns nothing for answers key)
    if (typeof question.answers !== 'undefined' && question.answers.length > 0){
      pageOptions['answers']= question.answers; 
    }
    
    res.render( 'questionnaire', pageOptions);
    });
};
//exports.questionnaire_cat = function ( req, res ){
//  Cat.aggregate([
//        { $group: {
//            _id: '$breed',
//            weightAvg: { $avg: '$weight'}
//        }}
//    ], function (err, aveWeight) {
//        if (err) {
//            console.error(err);
//        } else {
//            console.log(aveWeight);
 //           Cat.find( function ( err, cats){
///              //console.log(cats);
//              res.render( 'questionnaire_cat', {
//                title : 'Cats Test',
//                cats : cats,
//                aveWeight : aveWeight
//                
//              });
//            });
//        }
//    }
//);
  
//};

//test write to db
//exports.create = function ( req, res ){
///  new Cat({
//    name    : req.body.txtName,
//    weight: req.body.numWeight, 
//    breed: req.body.txtBreed
//  }).save( function( err, todo, count ){
//    res.redirect( '/questionnaire_cat' );
//  });
//};
