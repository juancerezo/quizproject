var path = require('path');

//Postegres DATABASE_URL = postgres://user:passwd@hots:port/database
//SQLite    DATABASE_URL = sqlite://:@:/
var url = process.env.DATABASE_URL.match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\:(.*)\/(.*)/);
var DB_name  = (url[6]||null);
var user     = (url[2]||null);
var pwd      = (url[3]||null);
var protocol = (url[1]||null);
var dialect  = (url[1]||null);
var port     = (url[5]||null);
var host     = (url[4]||null);
var storage  = process.env.DATABASE_STORAGE;

// Cargar Modelo ORM
var Sequelize = require('sequelize');

// Usar BBDD SQLite o Postgres
var sequelize = new Sequelize(DB_name, user, pwd,
  { dialect:  dialect,
    protocol: protocol,
    port:     port,
    host:     host,
    storage:  storage, // solo SQLite (.env)
    omitNull: true     // solo Postgres
  }
);

//Importar la definicion de la tabla Quiz
var Quiz = sequelize.import(path.join(__dirname, 'quiz'));

//Importar la definicion de la tabla Comment
var Comment = sequelize.import(path.join(__dirname,'comment'));

//Definición de relaciones
Comment.belongsTo(Quiz);
Quiz.hasMany(Comment);

//Carga los temas permitidos
var temas = ["Otro", "Humanidades", "Ocio", "Ciencia", "Tecnologia"];

exports.Quiz = Quiz;//exportar definicion de tabla Quiz
exports.Comment = Comment;//exportar definicion de tabla Comment
exports.temas = temas;//exportar la carga de los temas permitidos

// sequelize.sync() crea e inicializa tavla de preguntas en DB
sequelize.sync().then(function(){
  // then(..) ejecuta el manejador una vez creada la tabla
  Quiz.count().then(function (count){
    if(count ===  0) {// la tabla se inicializa solo si está vacía
      Quiz.create({ pregunta:   'Capital de Italia',
                    respuesta:  'Roma',
                    tema:       'Otro'
                  });
      Quiz.create({ pregunta:   'Capital de Portugal',
                    respuesta:  'Lisboa',
                    tema:       'Otro'
                  })
          .then(function(){console.log('Base de datos inicializada')});
    };
  });
});
