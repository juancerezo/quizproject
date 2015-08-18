var models = require('../models/models.js')

// Autoload - factoriza el código si ruta incluye :quizId
exports.load = function(req, res, next, quizId) {
  models.Quiz.findById(quizId).then(
    function (quiz) {
      if (quiz) {
        req.quiz = quiz;
        next();
      } else { next(new Error('No existe quizId=' + quizId));}
    }
  ).catch(function (error) { next(error);});
};

// GET /quizes

exports.index=function(req,res){
  if (req.query.search === "" || req.query.search === undefined) {
    models.Quiz.findAll().then(
            function(quizes){
              console.log('quiz_controller: ' + 'mostrando todos los quizes disponibles. Total: ' + quizes.length);
              res.render('quizes/index.ejs',{quizes:quizes});
            }).catch(function(error){next(error);});
  } else {
    var _mask = {where: ['lower(pregunta) like ?','%' + req.query.search.toLowerCase().replace(" ","%") + '%'], order:'pregunta ASC'};
    models.Quiz.findAll(_mask).then(
            function(quizes){
              if (quizes.length === 0) {
                  console.log('quiz_controller: ' + quizes.length + ' quizes encontrados utilizando .index');
                  res.render('quizes/notfound.ejs',{quizes: 'No hay resultados para:' + '"' + req.query.search + '"' });
              } else {
                  console.log('quiz_controller: ' + quizes.length + ' quizes encontrados utilizando .index');
                  res.render('quizes/index.ejs',{quizes:quizes});
              }
            }).catch(function(error){next(error);});
  };
};

// GET /quizes/:id
exports.show = function (req, res) {
  res.render('quizes/show', { quiz: req.quiz});
};

// GET /quizes/:id/answer
exports.answer = function (req, res) {
  var resultado = 'Incorrecto';
  if (req.query.respuesta.toLowerCase() === req.quiz.respuesta.toLowerCase()) {
    resultado = 'Correcto';
  };
  res.render('quizes/answer',{ quiz: req.quiz, respuesta: resultado});
};

// GET /quizes/new
exports.new = function (req, res) {
  var quiz = models.Quiz.build(//crea objeto quiz
    {pregunta: "", respuesta: ""}
  );
  res.render('quizes/new', {quiz: quiz});
}

//POST /quizes/create

exports.create = function (req, res) {
  var quiz = models.Quiz.build(req.body.quiz);

  //guarda en DB los campos pregunta y respuesta de quiz
  quiz.save({fields: ["pregunta", "respuesta"]}).then(function(){
    res.redirect('/quizes');
  }) //Redirección HTTP (URL relativa) lista de preguntas
};

// GET /author
exports.author = function(req, res) {
  res.render('author', {autor: 'Juan Cerezo',
                        pic: 'images/autor.png'});
};
