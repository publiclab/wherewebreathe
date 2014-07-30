var mongoose = require( 'mongoose' );
var Schema = mongoose.Schema;
var Question = require('../models/question');
var Answer = require('../models/answer');
var authenticateUser = require('./authUser');
var User = require('../models/account').user;
var generateUnanswered = require('./generateUnanswered');

function removeFromUnansweredSession(req, qid, cb){
  var temp = req.session.unanswered;
  index = temp.indexOf(qid);
  console.log(index + "index")
  console.log(qid + "    -->qid") 
  //if qid found in unanswered, remove it
  if (index !== -1){
    temp.splice(index, 1)
    req.session.unanswered = temp;
    console.log("removefromunans = = = = = = = = = = = = = = = = = = = = = = = = = = = =")

    
  }
  console.log(temp);
  if(cb){
    cb();
  }
}
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
exports.goBackSkipped = function(req, res){
  generateUnanswered(req, function(){   
    res.redirect('/questionnaire');
  });//end gen unanswered
};
exports.narratives = function(req, res){
  authenticateUser(req, res, function(){ 
    res.render('narratives', { title: 'Graphs and Narratives', user : req.user});
  });
};
exports.narrativesData = function(req, res){
  authenticateUser(req, res, function(){ 
  //keep track of which chart user is looking at to determine sequence
    if(!req.session.graphIndex){
      req.session.graphIndex = 0
    }
    var questionsForShowing = [6,7,9, 1000, 1001, 10, 1002, 1003, 11, 1004, 1005, 12, 1006, 1007, 13, 1008, 1009, 14, 1010, 1011, 15, 1012, 1013, 16, 1014, 1015, 17, 1016, 1017, 18, 1018, 1019, 19, 1020, 1021, 20, 1022, 1023, 21, 1024, 1025, 22, 1026, 1027, 23, 1028, 1029, 24, 1030, 1031, 25, 1038, 1039, 26, 1036, 1037, 27, 1034, 1035, 28, 29, 30]
    //if user clicks previous or next question (value will either be 1 or -1)
    if(req.body.progression){
      var newIndex = req.session.graphIndex + Number(req.body.progression);
      //make sure to block progression if it progresses the index beyond the array length
      if(newIndex< questionsForShowing.length){
        req.session.graphIndex = newIndex;
      }
      else{
        res.send(400, "Oops! Looks like that is the last question.");
      }
      if(newIndex<0){
        req.session.graphIndex = 0
        res.send(400, "Oops! Looks like that is the first question.");
      }
    }
    //control if next or previous question hrefs are shown
    var next = true; 
    var previous = true;
    if(req.session.graphIndex == 0){
    console.log("noPrev");
    previous = false}
    else if(req.session.graphIndex == (questionsForShowing.length -1)){console.log("noNext");next = false}
    console.log(req.session.graphIndex +" : " + (questionsForShowing.length -1));
    console.log("INDEX==============" +req.session.graphIndex);
    qOrder = questionsForShowing[req.session.graphIndex];
    Question.findOne({order: qOrder}, function ( err, questions){
      if (err){
        return res.send(400, "Something went wrong on our side of things. Please try again, or contact us to let us know. (Error ID: 620)")
      } //end if err 
      //console.log(questions)
      if (!questions) {
        return res.send(400, "Something went wrong on our side of things. Please try again, or contact us to let us know. (Error ID: 621)")
      }  
      Answer.find({qid: questions._id}, function(err, results){
      //console.log("omg!")
      //console.log(results)
      });
      Answer.aggregate([
        {$match: { qid: questions._id}},
        { $group: {
            _id: '$a', 
            count: {$sum: 1}
        }}
      ], function(err, results){ 
      //loop through results and append colour
      for (i in results){
        if (results[i]._id == "No, never" || results[i]._id == "No"){
          results[i].color = "red";        
        }
        else if (results[i]._id == "Yes, often (every week)" || results[i]._id == "Yes"){
          results[i].color = "green";        
        }
        else if (results[i]._id == "Yes, sometimes"){
          results[i].color = "blue";        
        }
      }
     //console.log("Aggregate results");
      console.log(results);
      if(results.length<=0){
        var answers = "no data"
      }
      else{
        answers = results
      }
      response = {
        question: questions.question,
        graphType: questions.graphType,
        answers: answers,
        previous: previous,
        next: next  
      }
      
      res.send (200, response)
      });
      
    }); //end Question.find
  });//end auth user
}
exports.questionnaire = function ( req, res ){
  authenticateUser(req, res, function(){  
    //deal with if there is get param for skipq or not
    if (req.params.skipq !== undefined && req.params.skipq !== "0"){
      removeFromUnansweredSession(req, req.params.skipq); 
      req.session.skip = true;   
    } 
    var query =  {_id: req.session.unanswered[0]};
    //if conditional question prompted by answer to another question
    if (req.params.nextq){
      query = {order: req.params.nextq};
    } 
    //if user has answered but not skipped all questions in db
    else if (req.session.unanswered.length <= 0 && !req.session.skip){
      return res.render('message', { title: 'Questionnaire complete!', user : req.user, message: {text:"Thank you! You have answered all of the survey questions.", msgType: "alert-success"}});
    }
    //if user has skipped some questions
    else if(req.session.unanswered.length <= 0 && req.session.skip) {
      return res.render('go-back-to-skipped', { title: 'Questionnaire complete!', user : req.user, message: {text:"You have reached the end of the survey, but you skipped some questions. You may go back and answer them if you would like.", msgType: "alert-warning"}});
    }
    Question.find(query, function ( err, questions){     
      //if question not found
      if (questions.length <= 0){
        return res.render('message', { title: 'Oops!', user : req.user, message: {text:"It doesn't look like there is a question there yet", msgType: "alert-danger"} });
      }//end if question
      
      var question = questions[0];
      //console.log(question);
      pageOptions = {
        user : req.user,
        title: 'Questionnaire',
        subheading: question.qSet,
        question: question.question, 
        label: question.label,
        qType: question.qType,
        qid: question._id        
      }
      //append suggested answers if they exist (mongoose creates empty array it seems even if query returns nothing for answers key)
      if (typeof question.answers !== 'undefined' && question.answers.length > 0){
        pageOptions['answers']= question.answers; 
      }
      //append validation logic if present
      if (typeof question.validation !== 'undefined'){
          pageOptions['validate']= question.validation;         
      }
      else{
        pageOptions['validate']= null;
      }
      //append validation mesage
      if (typeof question.valMsg !== 'undefined'){
          pageOptions['valMsg']= question.valMsg;         
      }
      else{
        pageOptions['valMsg']= null;
      }
      //append input placeholder
      if (typeof question.placeholder !== 'undefined'){
          //console.log("there"); 
          pageOptions['placeholder']= question.placeholder;         
      }
      else{
        pageOptions['placeholder']= null;
      }      
      //console.log(pageOptions);
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
  var qid = req.body.qid;
  var uid= req.user._id; 
  var a = req.body.answer;
  //check that there already isnt an answer for that question/user combo (redundant, but clean data is awesome!)
  Answer.find({qid: qid, uid: uid}, function(err, existingResults){
    if (err) {
      return res.send(400, "Something went wrong on our side of things. Please try again, or contact us to let us know. (Error ID: 619)")     
    }
    if(existingResults.length > 0){
      return res.send(400, "Looks like you already answered that question.")
    }
    //check if answer isnt too short or too long, and doesnt have any crazy characters
    // could read specific validation loged from questions table, but probably overkill
    if(! /^[A-Za-z0-9_ .-:(),;?'\/]{1,50}$/.test(a)){ 
      return res.send(400, "Your answer, '"+a+"', looks either too long or too short, or has characters that arent allowed.") 
    } 
    //no validation arrors, continue on...
    else{
     var ans = new Answer({
        qid: qid,
        uid: uid, 
        a: a
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
          removeFromUnansweredSession(req, req.body.qid, function(){
          var msgResponse = "OK";
          if (req.body.nextq){
            msgResponse = req.body.nextq.toString();
            console.log("nextQ========================"+req.body.nextq);
          }
          console.log("ANSWEEEEEEEEEEEEEEEEEEEEER");
          res.send(200, msgResponse);
          });
        });//end findby...

      });//end ans.save       
    }
  });
    
}
/**********************************************************************
TEST - remove later
***********************************************************************/
exports.test =  function(req, res) {
   var y = new Date().getFullYear();
console.log(y);
    res.locals.myVar = 'fjdklfjsdkflsjfkdl';
    res.render('test', { title: 'test', user : req.user, message: null });
    //res.send("x")
    console.log('here');
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
