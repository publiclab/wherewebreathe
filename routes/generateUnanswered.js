var Question = require('../models/question');
var User = require('../models/account').user;
module.exports = 
function generateUnanswered(req, cb){
    /* this will create an array of all of the questions that a user hasnt answered to be stored in a session variable for directing the questionnaire 
      It EXCLUDES questions with order values higher than 1000, which are reserved for conditional questions asked depending on responses to others
      */
    Question.find({order: {$lt: 1000}}, 'order _id',
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
        User.findOne(req.user._id, 'answered', 
          function(err, answered)
          {
            if (err) console.log(err);
            var answered = answered.answered; 
            //loop through questions
            for(var i in questions){
              var append = true
              //compare to already answered
              var qid = questions[i]._id.toString();
              //console.log(qid);
              for (var j = 0; j < answered.length; j++) {
                //if question already answered, set append variable to false so that it doesnt get appended
                if(qid == answered[j]){
                   append = false;
                   //console.log("false");
                }//end if
              }//end answered loop
              if(append){
                unanswered.push(questions[i]._id); 
              } 
            }
            req.session.unanswered = unanswered
            cb();
          });
      }//end callback function for question find
    );//question.find(...)        
}//end function

