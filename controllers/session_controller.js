// MW de autorización de accesos HTTP restringidos
exports.loginRequired = function(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  };
};

// MW de auto-logout

exports.timeLogout = function(req, res, next){
  if (req.session.user) {
    var currentTime = (new Date).getTime();
    req.session.lastTime = req.session.lastTime || currentTime;
    if ((currentTime - req.session.lastTime)/1000 < 120) {
      req.session.lastTime = (new Date).getTime();
      next();
    } else {
      delete req.session.lastTime;
      delete req.session.user;
      res.redirect('/login');
    };
  } else {
    next();
  };
};

// GET /login --Formulario de login
exports.new = function(req, res) {
  var errors = req.session.errors || {};
  //req.sessions.errors = {};

  res.render('sessions/new', {errors: errors});
};

// POST /login --Crear Sesión
exports.create = function(req, res) {
  var login    = req.body.login;
  var password = req.body.password;

  var userController = require('./user_controller');
  userController
  .autenticar(login, password, function(error, user) {
    if (error) { //si hay error retornamos mensajes de error de sesion
      req.session.errors = [{message: 'Se ha producido un error: ' + error}];
      res.redirect("/login");
      return;
    }

    // Crear req.session.user y guardar campos id y username
    // La sesión se define por la existencia de: req.session.user
    req.session.user = {id: user.id, username: user.username};
    res.redirect(req.session.redir.toString());
  });
};

// DELETE /logout --Destruir session
exports.destroy = function(req, res){
  delete req.session.lastTime;
  delete req.session.user;
  res.redirect(req.session.redir.toString());
};
