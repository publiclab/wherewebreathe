var mongoose = require( 'mongoose' );
var Schema = mongoose.Schema;
var Question = require('../models/db').question;
var Answer = require('../models/db').answer;
var authenticateUser = require('./authUser');
var User = require('../models/db').user;
var StoryPrompt = require('../models/db').storyPrompt;
var Story = require('../models/db').story;
var generateUnanswered = require('./generateUnanswered');
var csv = require('express-csv')

function removeFromUnansweredSession(req, qid, cb){
  var temp = req.session.unanswered;
  index = temp.indexOf(qid);
  //if qid found in unanswered, remove it
  if (index !== -1){
    temp.splice(index, 1)
    req.session.unanswered = temp;   
  }
  if(cb){
    cb();
  }
}
exports.dashboard = function(req, res){
  authenticateUser(req, res, function(){ 
    Answer.aggregate([
        {$match: {}},
        { $group: {
            _id: '$qSet', 
            count: {$sum: 1}
        }}
      ], function(err, results){ 
        if (err){
            return res.send(400, "Something went wrong on our side of things. Please try again, or contact us to let us know. (Error ID: 628)")
        } //end if err
        if (!results) {
          return res.send(400, "Something went wrong on our side of things. Please try again, or contact us to let us know. (Error ID: 629)")
        } 
        var housingA = 0;
        var symptomsA = 0;
        var mitigationA = 0; 
        var otherA = 0;
        var demographicsA = 0;
        console.log("Answers: ");
        console.log(results);
        for (i in results){
          if(results[i]._id == "Household"){
          housingA = results[i].count
          }
          if(results[i]._id == "Symptoms"){
          symptomsA = results[i].count
          }
          if(results[i]._id == "Mitigation"){
          mitigationA = results[i].count
          }
          if(results[i]._id == "Other"){
          otherA = results[i].count
          }
          if(results[i]._id == "Demographics"){
          demographicsA = results[i].count
          }
        }  
        Question.aggregate([
          {$match: {}},
          { $group: {
              _id: '$qSet', 
              count: {$sum: 1}
          }}
          ], function(err, questions){ 
            if (err){
                return res.send(400, "Something went wrong on our side of things. Please try again, or contact us to let us know. (Error ID: 630)")
            } //end if err
            if (!questions) {
                return res.send(400, "Something went wrong on our side of things. Please try again, or contact us to let us know. (Error ID: 631)")
            } 
            var housingQ = 0;
            var symptomsQ = 0;
            var mitigationQ = 0; 
            var otherQ = 0;
            var demographicsQ = 0;
            console.log("questions: ");
            console.log(questions)
            for (i in questions){
              if(questions[i]._id == "Household"){
              housingQ = questions[i].count
              }
              if(questions[i]._id == "Symptoms"){
              symptomsQ = questions[i].count
              }
              if(questions[i]._id == "Mitigation"){
              mitigationQ = questions[i].count
              }
              if(questions[i]._id == "Other"){
              otherQ = questions[i].count
              }
              if(questions[i]._id == "Demographics"){
              demographicsQ = questions[i].count
              }
            }   
            console.log("here");      
        var options = { 
          title: 'Dashboard', 
          user : req.user, 
          housingA: housingA,
          symptomsA: symptomsA,
          mitigationA: mitigationA, 
          otherA: otherA, 
          demographicsA: demographicsA,
          housingQ: housingQ,
          symptomsQ: symptomsQ,
          mitigationQ: mitigationQ, 
          otherQ: otherQ, 
          demographicsQ: demographicsQ     
        }
        res.render('dashboard', options);       
    })
   });  //end Question aggregate 
  });//end AnswerAggregate?
};
exports.checkStoryExists = function(req, res){
  //authenticateUser(req, res, function(){ 
  //check if user has already entered a story for a qSet
  console.log(req.params.qSet+" : "+req.user._id);
    Story.findOne({qSet: req.params.qSet, uid: req.user._id}, function (err, story){
      if (err){
        return res.send(400, "Something went wrong on our side of things. Please try again, or contact us to let us know. (Error ID: 627)")
      } //end if err
      var response;
      console.log(story);
      if (story) {
        response = true;
      }
      else{
        response = false;
      } 
      res.send(200, response);
    }) ;//end find
 //});// end auth user
};
exports.skipQ = function(req, res){
  authenticateUser(req, res, function(){ 
    if (req.params.skipq !== undefined && req.params.skipq !== "0"){
      removeFromUnansweredSession(req, req.params.skipq,
        function(){
          //flag that a question has been skipped
          req.session.skip = true;  
          res.send(200);
        }
      );        
    } 
  });
};
exports.storiesPrompt = function(req, res){
  authenticateUser(req, res, function(){ 
      StoryPrompt.findOne({qSet: req.params.qSet}, function ( err, prompt){
        if (err){
          return res.send(400, "Something went wrong on our side of things. Please try again, or contact us to let us know. (Error ID: 624)")
        } //end if err
        if (!prompt) {
          return res.send(400, "Something went wrong on our side of things. Please try again, or contact us to let us know. (Error ID: 625)")
        } 
        console.log(prompt)
        res.render('stories-prompt', { title: 'Tell your story', user : req.user, heading: prompt.heading, subheading: prompt.subheading, seedQuestions: prompt.seedQuestions, qSet: req.params.qSet}); 
      });   //end find    
  });
};
exports.saveStory = function(req, res){
  authenticateUser(req, res, function(){ 
  var story = new Story({
    uid: req.user._id, 
    qSet: req.body.qSet,
    story: req.body.story
  }); 
  story.save( function(err, data){
    if (err) {
      return res.send(400, "Something went wrong on our side of things. Please try again, or contact us to let us know. (Error ID: 626)")     
    }    
    res.send(200)
  })//end story save
  });//end auth user
};
exports.index = function(req, res){
  req.session.returnTo = req.path;
  res.render('index', { title: 'Home', user : req.user});
};
exports.welcome = function(req, res){
  authenticateUser(req, res, function(){ 
  res.render('welcome', { title: 'Home', user : req.user, tour: 'yes'});
  });
};
exports.about = function(req, res){
  req.session.returnTo = req.path;
  res.render('about', { title: 'About Where We Breathe', user : req.user});
};
exports.knowledgebase = function(req, res){
  req.session.returnTo = req.path;
  res.render('knowledge-base', { title: 'Knowledge base', user : req.user});
};
exports.vinhud = function(req, res){
  req.session.returnTo = req.path;
  res.render('vinhud', { title: 'Am I looking for a VIN or a HUD number?', user : req.user});
};
exports.goBackSkipped = function(req, res){
  generateUnanswered(req, function(){   
    res.redirect('/questionnaire');
  });//end gen unanswered
};
exports.narratives = function(req, res){
  authenticateUser(req, res, function(){ 
    res.render('narratives', { title: 'Forums', user : req.user});
  });
};
exports.narrativesData = function(req, res){
  authenticateUser(req, res, function(){ 
  //keep track of which chart user is looking at to determine sequence
    if(!req.session.graphIndex){
      req.session.graphIndex = 0
    }
    var questionsForShowing = [1,2,3,4,5,6,7,9, 1000, 1001, 10, 1002, 1003, 11, 1004, 1005, 12, 1006, 1007, 13, 1008, 1009, 14, 1010, 1011, 15, 1012, 1013, 16, 1014, 1015, 17, 1016, 1017, 18, 1018, 1019, 19, 1020, 1021, 20, 1022, 1023, 21, 1024, 1025, 22, 1026, 1027, 23, 1028, 1029, 24, 1030, 1031, 25, 1038, 1039, 26, 1036, 1037, 27, 1034, 1035, 28, 29, 30]
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
    previous = false}
    else if(req.session.graphIndex == (questionsForShowing.length -1)){next = false}
    qOrder = questionsForShowing[req.session.graphIndex];
    Question.findOne({order: qOrder}, function ( err, questions){
      if (err){
        return res.send(400, "Something went wrong on our side of things. Please try again, or contact us to let us know. (Error ID: 620)")
      } //end if err
      if (!questions) {
        return res.send(400, "Something went wrong on our side of things. Please try again, or contact us to let us know. (Error ID: 621)")
      }  
      //Answer.find({qid: questions._id}, function(err, results){
      //});///does this line do anything or should we axe it? commented out on Sep 23
      Answer.aggregate([
        {$match: { qid: questions._id}},
        { $group: {
            _id: '$a', 
            count: {$sum: 1}
        }}
      ], function(err, results){ 
      //loop through results and append colour
      //palett inspired by http://www.colourlovers.com/palette/1663477/A_Thousand_Rainbows
      var otherCount = 0
      var modifiedResults = []
      //var palette = ['#F2D43F', '#492D61']
      for (i in results){
        //if other: make count
        var object = {}
        if(new RegExp("Other:").test(results[i]._id)){
         otherCount += 1;         
        }
        //if not 'other:...' add to results 
        else{
          object._id = results[i]._id;
          object.count = results[i].count;
          
          if (results[i]._id == "No, never" || results[i]._id == "No"){
            object.color = "#D1026C";        
          }
          else if (results[i]._id == "Yes, often (every week)" || results[i]._id == "Yes"){
            object.color = "#61C155";        
          }
          else if (results[i]._id == "Yes, sometimes"){
            object.color = "#048091";        
          }
          //use colors in palette (rest will be randomly assigned)
          //else if(palette.length >0){
          //  object.color = palette[0];
          //  palette.splice(0, 1)
          //}
          modifiedResults.push(object);
        }
      }
              //push other on to modifiedResults if exists
        if (otherCount > 0){
          modifiedResults.push({_id: "Other", color: "#C0C0C0", count: otherCount})
        }
      if(results.length<=0){
        var answers = "no data"
      }
      else{
        answers = modifiedResults
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
    //if user has answered and not skipped all questions in db
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
      console.log(question.storiesPrompt );
      pageOptions = {
        user : req.user,
        title: 'Questionnaire',
        qSet: question.qSet,
        question: question.question, 
        label: question.label,
        qType: question.qType,
        qid: question._id,
        numUnans: req.session.unanswered.length,
        storiesPrompt:  question.storiesPrompt       
      }
      //append suggested answers if they exist (mongoose creates empty array it seems even if query returns nothing for answers key)
      //if (typeof question.answers !== 'undefined' && question.answers.length > 0){
        pageOptions['answers']= question.answers;
         
      //}
      //if autocomplete info exists, overwrite answers to that
      //console.log(encodeURIComponent(question.autocomplete))
      if(typeof question.autocomplete !== 'undefined' && question.autocomplete.length > 0){
      //console.log("autocomplete")
        pageOptions['answers']= encodeURIComponent(question.autocomplete);
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
  var qSet = req.body.qSet //added later so can create summary of answered by qSet on dashboard
  console.log(a);
    if (!a) {
      return res.send(400, "Your answer shouldnt be blank")     
    }
    else{
      //cant trim if undefined
      a = a.trim()
      if(a == ""){
        return res.send(400, "Your answer shouldnt be blank")  
      }
    }
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
    if(! /^[A-Za-z0-9_ .:(),;?&'\/-]{1,50}$/.test(a)){ 
      return res.send(400, "Your answer, '"+a+"', looks either too long or too short, or has characters that arent allowed.") 
    } 
    //no validation arrors, continue on...
    else{
     var ans = new Answer({
        qid: qid,
        uid: uid, 
        a: a,
        qSet: qSet
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
            //console.log("nextQ========================"+req.body.nextq);
          }
          //console.log("ANSWEEEEEEEEEEEEEEEEEEEEER");
          res.send(200, msgResponse);
          });
        });//end findby...

      });//end ans.save       
    }
  });
    
}
/**********************************************************************
DATA DOWNLOAD
***********************************************************************/ 
exports.download =  function(req, res) {
  req.session.returnTo = req.path;
  res.render('download', { title: 'Export Where We Breathe Data', user : req.user});
}  
exports.exportData =  function(req, res) {
req.session.returnTo = req.path;
//this is where it really seems like we should have used a RDBMS... Mongo doesnt *really* join data well, and also js being async doesnt make this app-side join/conversion straightforward. Its probably unlikely that our server will get overloaded with data download requests, so I apologize for the convoluted next bit of code (this is better than starting from scratch with a RDBMS!).
  Question.find({},'question order',{sort:{order: 1}}, function(err, questions){
    if (err) {return res.send(400, "Something went wrong on our side of things. Please try that again, or contact us to let us know. (Error ID: 622)")}

    var csv = [];
    var titles = [];
    
    //create title row for csv
    for(j in questions){
      titles.push(questions[j].question)          
    }//end for loop
    csv.push(titles)

    //get unique users who have answered questions (each user will have a csv row)
    Answer.distinct('uid', function(err, usersAnswered){
      //create function to iterate through each userid to create row/array for csv, but waiting for mongo query to return and the  processing of the results before continuing onto the next iteration (for loops create a mess here)     
      var recursiveLoop = function(i){
        //for each user create a row of answers 
        if(i< usersAnswered.length){
          //find all of the answers form this user
          Answer.find({uid: usersAnswered[i]},'',{sort:{ qid: 1}}, function(err, answers){
            if (err) {return res.send(400, "Something went wrong on our side of things. Please that try again, or contact us to let us know. (Error ID: 623)")}
            //temp array to hold array/row of user's answers in order       
            var userCsvRow = [];
            //for each question, loop through and fill in the userCsvRow array with the answer in the index location that matches the questions index in the title row (j) 
            for(j in questions){
              //default value null
              userCsvRow[j] = '<null>'
              //console.log(questions[j].question);
              for (k in answers){
                if (answers[k].qid.equals(questions[j]._id)){
                  //if the answer's qid matched the question's id, then overwrite the null value at the same index location as the title row for the particular question
                  userCsvRow[j] = answers[k].a
                  //console.log(userCsvRow[j])
                }
                
              }//end for k in answers
            }//end for j in questions
            csv.push(userCsvRow);
            //continue to next user
            i++;
            recursiveLoop(i);
          });//end ans.find        
        }
        else {
          //console.log(csv);
          res.csv(csv)
          return console.log('end'); // exit condition
        }
      }//end recursiveLoop
      
      //start iteration through users to create their answer rows
      recursiveLoop(0);
    });
  });//end Q.find
}
/**********************************************************************
TEST - remove later
***********************************************************************/   
exports.test =  function(req, res) {

}

