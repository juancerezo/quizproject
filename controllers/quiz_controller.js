var models = require('../models/models.js')

// Autoload - factoriza el código si ruta incluye :quizId
exports.load = function(req, res, next, quizId) {
  models.Quiz.find({
    where: {id: Number(quizId)},
    include: [{model: models.Comment}]
  })
  .then(
    function (quiz) {
      if (quiz) {
        req.quiz = quiz;
        console.log('quiz_controller.load: Quiz ' + '"' + quiz.pregunta + '"' + ' cargado correctamente.');
        next();
      } else {next(new Error('No existe quizId=' + quizId));};
    }
  )
  .catch(
    function (error) {
      console.log('quiz_controller.load: Autoload Error!' + '[' + error + ']');
      next(error);
    }
  );
};

// GET /quizes

exports.index=function(req,res){
  if (req.query.search === "" || req.query.search === undefined) {
    models.Quiz.findAll()
    .then(
      function(quizes){
        console.log('quiz_controller.index: mostrando todos los quizes disponibles. Total: ' + quizes.length);
        res.render('quizes/index.ejs',{quizes:quizes, errors: []});
      }
    )
    .catch(function(error){next(error);});
  } else {
    var _mask = {
      where: ['lower(pregunta) like ?','%' + req.query.search.toLowerCase().replace(" ","%") + '%'],
      order:'pregunta ASC'
    };

    models.Quiz.findAll(_mask)
    .then(
      function(quizes){
        if (quizes.length === 0) {
          console.log('quiz_controller.index: ' + quizes.length + ' quizes encontrados.');
          res.render('quizes/notfound.ejs',{quizes: 'No hay resultados para:' + '"' + req.query.search + '"', errors: []});
        } else {
          console.log('quiz_controller.index: ' + quizes.length + ' quizes encontrados.');
          res.render('quizes/index.ejs',{quizes:quizes, errors: []});
        };
      }
    ).catch(function(error){next(error);});
  };
};

// GET /quizes/:id
exports.show = function (req, res) {
  console.log('quiz_controller.show: Mostrando el Quiz ' + '"' + req.quiz.pregunta + '".');
  res.render('quizes/show', { quiz: req.quiz, errors: []});
};

// GET /quizes/:id/answer
exports.answer = function (req, res) {
  console.log('quiz_controller.answer: comprobando respuesta recibida para el Quiz ' + '"' + req.quiz.pregunta + '".');
  var resultado = 'Incorrecto';
  if (req.query.respuesta.toLowerCase() === req.quiz.respuesta.toLowerCase()) {
    resultado = 'Correcto';
  };
  res.render('quizes/answer',{ quiz: req.quiz, respuesta: resultado, errors: []});
};

// GET /quizes/new
exports.new = function (req, res) {
  console.log('quiz_controller.new: Mostrando formulario para nueva pregunta');
  var quiz = models.Quiz.build(//crea objeto quiz
    {pregunta: "", respuesta: "", tema: "Otro"}
  );
  res.render('quizes/new', {quiz: quiz, errors: []});
}

//POST /quizes/create

exports.create = function (req, res) {
  var quiz = models.Quiz.build(req.body.quiz);
  var temas = models.temas;

  quiz
  .validate()
  .then(
    function(err){
      if (err) {
        console.log('quiz_controller.create: Create Error!');
        res.render('quizes/new', {quiz: quiz, errors: err.errors});
      } else {
        if (temas.indexOf(quiz.tema) < 0) {
          res.render('quizes/new', {quiz: quiz, errors:[{message: "El tema seleccionado no existe: " + quiz.tema}]});
        } else {
          quiz //save: guarda en DB campos pregunta y respuesta de quiz
          .save({fields: ["pregunta", "respuesta", "tema"]})
          .then(function(){res.redirect('/quizes')})
        };      //res.redirect: Redirección HTTP a lista de preguntas
      };
    }
  );
};

// GET /quizes/:id/edit
exports.edit = function (req, res) {
  console.log('quiz_controller.edit: Mostrando formulario de edicion de pregunta');
  var quiz = req.quiz; //autoload de instancia de quiz
  res.render('quizes/edit', {quiz: quiz, errors: []});
}

// PUT /quizes:id
exports.update = function (req, res) {
  var temas = models.temas;
  req.quiz.pregunta = req.body.quiz.pregunta;
  req.quiz.respuesta = req.body.quiz.respuesta;
  req.quiz.tema = req.body.quiz.tema;

  req.quiz
  .validate()
  .then(
    function (err) {
      if (err) {
        res.render('quizes/edit', {quiz: req.quiz, errors: err.errors});
      } else {
        if (temas.indexOf(req.quiz.tema) < 0) {
          res.render('quizes/edit', {quiz: req.quiz, errors: [{message: "El tema seleccionado no existe: " + req.quiz.tema}]});
        } else {
          req.quiz // save: guarda campos pregunta y respuesta en DB
          .save({fields: ["pregunta", "respuesta", "tema"]})
          .then(
            function() {
              console.log('quiz_controller.update: Acualizando Quiz a ' + '"' + req.quiz.pregunta + '".');
              res.redirect('/quizes'); // Redirección HTTP a lista de preguntas (URL relativo)
            }
          );
        };
      };
    }
  )
  .catch(
    function (error) {
      console.log('quiz_controller.update: Update Error!' + '[' + error + ']');
      next(error);
    }
  );
};

// DELETE /quizes/:id
exports.destroy = function (req, res) {
  req.quiz
  .destroy()
  .then(
    function(){
      console.log('quiz_controller.destroy: Quiz ' + '"' + req.quiz.pregunta + '" borrado!');
      res.redirect('/quizes')
    }
  )
  .catch(function(error){next(error)});
};

// GET /author
exports.author = function(req, res) {
  console.log('quiz_controller.author: Mostrando autor.');
  res.render(
    'author',
    { autor: 'Juan Cerezo',
      pic: 'images/autor.png',
      errors: []
    }
  );
};
