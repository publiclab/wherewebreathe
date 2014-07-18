var mongoose = require( 'mongoose' );
var Schema = mongoose.Schema;
var Question = require('../models/question');
var Answer = require('../models/answer');
var authenticateUser = require('./authUser');




exports.index = function(req, res){
  res.render('index', { title: 'Home', user : req.user});
};
exports.about = function(req, res){
  res.render('about', { title: 'About Where We Breathe', user : req.user});
};
exports.knowledgebase = function(req, res){
  res.render('knowledge-base', { title: 'Knowledge base', user : req.user});
};
exports.vinhud = function(req, res){
  res.render('vinhud', { title: 'Am I looking for a VIN or a HUD number?', user : req.user});
};
exports.questionnaire = function ( req, res ){
  authenticateUser(req, res, function(){
    var qnum = 1;//question # to start at
    //deal with if there is get param for qnum or not
    if (req.params.qnum){
     qnum = parseInt(req.params.qnum);     
    }       
    Question.find({order: qnum}, function ( err, questions){
      var question = questions[0];
      console.log(question);
      pageOptions = {
        user : req.user,
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
    });//end auth user
};
//append answers into answers collection
exports.answer = function ( req, res ){
  Answer.findByIdAndUpdate(req.body.qid, { $push: { userResponses: {
            uId: 1,
            a: req.body.answer
          } }}, function (err, results) {
    if (err) console.log(err);
    console.log("findandupdate response : "+results)
    if(!results){
      var ans = new Answer({
        _id: req.body.qid
      });
        ans.userResponses.push({
            uId: 1,
            a: req.body.answer
          });
        ans.save( function( err, data){
          if (err){console.log(err);}
          console.log("enter new " +data)
          res.redirect('/questionnaire/'+req.body.nextq);
      });
      
    }
    else{
      res.redirect('/questionnaire/'+req.body.nextq);
    }
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
