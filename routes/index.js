var mongoose = require( 'mongoose' );
var Schema = mongoose.Schema;
var Question = require('../models/question');
var Answer = require('../models/answer');
var authenticateUser = require('./authUser');
var User = require('../models/account').user;

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
    Question.find({_id: req.session.questions[0]}, function ( err, questions){
      //if user answered question already redir to nextQ
 
      //if question not found
      if (questions.length <= 0){
        return res.render('login/message', { title: 'Oops!', user : req.user, message: {text:"It doesnt look like there is a question there yet", msgType: "alert-danger"} });
      }//end if question
      
      var question = questions[0];
      console.log(question);
      pageOptions = {
        user : req.user,
        title: 'Questionnaire',
        question: question.question, 
        label: question.label,
        qType: question.qType,
        nextQ: question.order + 1,
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
  //make sure user logged in 
  if(!req.user){
    return res.send(400, "It looks like you have been logged out. please log in again to submit your answer")
  }
  var ans = new Answer({
    qid: req.body.qid,
    uid: req.user._id,
    d: new Date(), 
    a: req.body.answer
  });
  ans.save( function(err, data){
    if (err) {
      return res.send(400, "Something went wrong on our side of things. Please try again, or contact us to let us know. (Error ID: 617)")     
    }
    //append qid to users array of answered questions
    User.findByIdAndUpdate(req.user._id, {$push: {answered: req.body.qid}}, function (err, results) {
      if (err) {
        return res.send(400, "Something went wrong on our side of things. Please try again, or contact us to let us know. (Error ID: 618)")
      }
      //remove question from session array
      var temp = req.session.questions;
      index = temp.indexOf(req.body.qid);
      temp.splice(index, 1)
      req.session.questions = temp;
      res.send(200);
    });//end findby...

  });//end ans.save      
}
/**********************************************************************
TEST - remove later
***********************************************************************/
exports.test =  function(req, res) {
  authenticateUser(req, res, function(){
    /* this will create an array of all of the questions that a user hasnt answered to be stored in a session variable for directing the questionnaire*/
    Question.find({}, 'order _id',
    {
      sort:{
          order: 1 //Sort ascending
      }
    }, 
    function(err, questions)
    {
      if (err) console.log(err);
      //create an array of question ids
      var unanswered = []
      console.log(questions);
      User.findOne(req.user._id, 'answered', function(err, answered){
        if (err) console.log(err);
        var answered = answered.answered; 
        //loop through questions
        for(var i in questions){
          var append = true
          console.log(i+ ": "+questions[i]._id);
          //compare to already answered
          var qid = questions[i]._id.toString();
          for (var j = 0; j < answered.length; j++) {
            //if question already answered, set append variable to false so that it doesnt get appended
            if(qid == answered[j]){
               append = false;
            }//end if
          }//end answered loop
          if(append){
            unanswered.push(questions[i]._id); 
          } 
        }
        console.log(unanswered);
        req.session.questions = unanswered
      });
    }
    );
    res.locals.myVar = 'fjdklfjsdkflsjfkdl';
    res.render('test', { title: 'test', user : req.user, message: null });
    //res.send("x")
    console.log('here');
  });//end auth
}
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
