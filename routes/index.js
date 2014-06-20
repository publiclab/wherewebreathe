
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};
exports.test = function(req, res){
  res.render('test', { title: 'teest', cats: ['a', 'b']});
};
exports.questionnaire = function(req, res){
  res.render('questionnaire', { title: 'Questions'});
};
