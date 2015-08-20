var express = require('express');
var router = express.Router();

var quizController = require('../controllers/quiz_controller');
var commentController = require('../controllers/comment_controller');
var sessionController = require('../controllers/session_controller');

// GET home page.
router.get('/', function(req, res) {
  res.render('index', { title: 'Quiz', errors: []});
});

// Autoload de comandos con :quizId
router.param('quizId',    quizController.load);     // autoload :quizId
router.param('commentId', commentController.load);  // autoload :commentId

// Definicion de rutas de sesion
router.get('/login',     sessionController.new);     // formulario de login
router.post('/login',    sessionController.create);  // crear sesión
router.get('/logout',    sessionController.destroy); // destruir sesión

// Definicion de rutas de /quizes
router.get('/quizes',                       sessionController.timeLogout, quizController.index);
router.get('/quizes/:quizId(\\d+)',         sessionController.timeLogout, quizController.show);
router.get('/quizes/:quizId(\\d+)/answer',  sessionController.timeLogout, quizController.answer);
router.get('/quizes/new',                   sessionController.loginRequired, sessionController.timeLogout, quizController.new);
router.post('/quizes/create',               sessionController.loginRequired, sessionController.timeLogout, quizController.create);
router.get('/quizes/:quizId(\\d+)/edit',    sessionController.loginRequired, sessionController.timeLogout, quizController.edit);
router.put('/quizes/:quizId(\\d+)',         sessionController.loginRequired, sessionController.timeLogout, quizController.update);
router.delete('/quizes/:quizId(\\d+)',      sessionController.loginRequired, sessionController.timeLogout, quizController.destroy);
router.get('/author',                       quizController.author);

//Definicion de rutas de quizes/.../comments
router.get('/quizes/:quizId(\\d+)/comments/new',                      sessionController.timeLogout, commentController.new);
router.post('/quizes/:quizId(\\d+)/comments',                         sessionController.timeLogout, commentController.create);
router.get('/quizes/:quizId(\\d+)/comments/:commentId(\\d+)/publish', sessionController.loginRequired, sessionController.timeLogout, commentController.publish);
module.exports = router;
