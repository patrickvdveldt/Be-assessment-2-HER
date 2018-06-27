console.log('server is starting!!');

var express = require('express');
var multer = require("multer")
var upload = multer({
  dest: "db/image/" // the folder where the uploaded images go
})
var app = express();
var bodyParser = require('body-parser').urlencoded({extended: true});
var mysql = require('mysql');
var session = require('express-session');
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'matchyourvoice'
})
connection.connect()

function listening() {
  console.log("listening....");
}

module.exports = express()
  .set('view engine', 'ejs')
  .set('views','view')
  .use(bodyParser)
  .use(express.static('website'))
  .use('/image', express.static('db/image'))
  .use('/images', express.static('db/image'))
  .use(express.static(__dirname + '/public'))
  .use(session({
    secret: 'patrick', //sleutel encriptie van alle cookies.
    resave: false, //
    saveUninitialized: false, //alleen wanneer de gebruiker inlogt wil je een session.
  }))
  .post('/index', handleLogin)
  //.post('/chat', saveMessage)
  .post('/signup', upload.fields([{name: 'images'}, {name: 'spraakmemo'}]), signup)
  //.post('/signup', upload.array('images','spraakmemo'), signup)
  .post('/change', change)
  .get('/loggedprofile.ejs', loggedProfile)
  .get('/', index)
  .get('/messages.ejs', messages)
  .get('/chat/:id', chatten)
  .get('/matchprofile/:id', profielMatch)
  .get('/logOut', logOut)
  .get('/error.ejs', error)
  .get('/remove', getRemove)
  .get('/wijzigprofiel', wijzigprofiel)
  //.get('/updateprofile/:id', updateprofile)
  .use(function(req, res, next){
     res.status(404).render('error.ejs')
   })
  .listen(3001, listening)

  function matches(req, res, users) {
  var user = users[0]
  if (req.session.user.geslacht = "Vrouw") {
    connection.query("SELECT * FROM person WHERE geslacht = 'Man'", onDone)
  } else {
    connection.query("SELECT * FROM person WHERE geslacht = 'Vrouw'", onDone)
  }

  function onDone(err, data) {
    if (err) {
      console.log("Error: ", err)
      return res.status(404).render("error.ejs")
    } else {
      var locals = {
        data: data,
        session: req.session
      }
      console.log(data);
      res.render("/")
    }
  }
}

function wijzigprofiel(req, res){
  res.render('wijzigprofiel.ejs', {
    user: req.session.user
  })
}

  function error(req, res) {
    res.render('error.ejs')
  }


// Uitloggen uit je account
  function logOut(req, res){
    req.session.destroy(onDone)
    function onDone (err, data) {
      if(err) throw err
      res.redirect('/Login_v2/login.html')
    }
  }

//Verwijderen van een account
  function getRemove(req, res) {

    var id = req.session.user.id
    connection.query('DELETE FROM person WHERE id = ?', id, onDone)

    function onDone(err, data) {
    res.redirect('/Login_v2/login.html')
    }
  }

//Account aanmaken
function signup(req, res) {
/*var body = req.body
var id*/

console.log('werkt!');

var imageName;
var spraakmemoName;
console.log(req.files.images);

if(req.files.images != undefined || req.files.spraakmemo != undefined)
{
console.log('file is not empty');
   imageName = req.files.images[0].filename;
   spraakmemoName = req.files.spraakmemo[0].filename

}else{

   imageName = null;
   spraakmemoName = null;

}
connection.query('INSERT INTO person SET ?', {
id: req.body.id,
naam: req.body.naam,
wachtwoord: req.body.wachtwoord,
email: req.body.email,
leeftijd: req.body.leeftijd,
geslacht: req.body.geslacht,
berichtgeving: req.body.berichtgeving,
geslachtkeuze: req.body.geslachtkeuze,
maxaftstand: req.body.maxaftstand,
maxleeftijd: req.body.maxleeftijd,
burgelijkestaat: req.body.burgelijkestaat,
postuur: req.body.postuur,
images: imageName/*(req.files.images[0].filename != '') ? req.files.images[0].filename : null*/,
spraakmemo: spraakmemoName/*(req.files.spraakmemo[0].filename != '') ? req.files.spraakmemo[0].filename : null*/
}, onDone)

function onDone (err, data) {
  if(err) throw err
  id = data.insertId
  res.redirect('/Login_v2/login.html')
}

}

  function handleLogin(req, res) {
    var body = Object.assign({}, req.body)
    connection.query('SELECT * FROM person WHERE email = ?', body.email, function (err, users) {
      if(err) throw (err)
      var user = users[0]
      if (user.wachtwoord === body.wachtwoord) {
        req.session.loggedIn = true
        req.session.user = user
        res.redirect('/')
    }
      else {
        res.redirect('/error.ejs')
      }
    })
  }

  function loggedProfile(req, res) {
    console.log(req.session)
    connection.query('SELECT * FROM person', onDone)

    function onDone(err, data) {
      if (err || data.length === 0) {
        //acount niet gevonden
        console.log('Error: ', err)
        return res.status(404).render('error.ejs', {id: 404, description: 'page not found'})

      } else {
        console.log('data2 '+data)
        res.render('loggedprofile.ejs', {
          title: 'index',
          data: data, user:req.session.user
        })
      }
    }
  }

  function index(req, res) {
    console.log(req.session.user.geslachtkeuze);
    connection.query('SELECT * FROM person WHERE geslacht = ?', req.session.user.geslachtkeuze, onDone)

    function onDone(err, data) {
      console.log(data);
      if (err || data.length === 0) {
        //acount niet gevonden
        console.log('Error: ', err)
        return res.status(404).render('error.ejs', {id: 404, description: 'page not found'})

      } else {
        console.log(data)
        res.render('index.ejs', {
          title: 'index',
          data: data, user:req.session.user
        })
      }
    }
  }

function messages(req, res) {
  connection.query('SELECT * FROM person WHERE geslacht = ?', req.session.user.geslachtkeuze, onDone)

  function onDone(err, data) {
    if (err || data.length === 0) {
      //acount niet gevonden
      console.log('Error: ', err)
      return res.status(404).render('error.ejs', {id: 404, description: 'page not found'})

    } else {
      console.log(data)
      res.render('messages.ejs', {
        title: 'messages',
        data: data, user:req.session.user
      })
    }
  }
  }

  function chatten(req, res) {
    connection.query('SELECT * FROM person', onDone)
    function onDone(err, data) {
      if (err || data.length === 0) {
        //acount niet gevonden
        console.log('Error: ', err)
        return res.status(404).render('error.ejs', {id: 404, description: 'page not found'})

      } else {
        var id = req.params.id
        console.log(data)
        res.render('chat.ejs', {
          person: req.params.id,
          title: 'chat',
          data:data[id]
        })
      }
    }
  }

  /*function saveMessage(req, res) {
    var body = Object.assign({}, req.body)

    connection.query('INSERT INTO chat SET ?', {
      usermsg: req.body.usermsg,
    }, onDone)

    function onDone(err, data) {
      if(err) {
        console.log(err)
        return res.status(404).render('error.ejs')
      }
      else {
        var id = req.params.id
        res.render('chat.ejs', {
          person: req.params.id,
          title: 'chat',
          data:data[id]
        })
      }
    }
  }*/


function profielMatch(req, res) {
  connection.query('SELECT * FROM person', onDone)
  function onDone(err, data) {
    if (err || data.length === 0) {
      //acount niet gevonden
      console.log('Error: ', err)
      return res.status(404).render('error.ejs', {id: 404, description: 'page not found'})

    } else {
      var id = req.params.id
      console.log(data)
      res.render('matchprofile.ejs', {
        person: req.params.id,
        title: 'matchprofile',
        data:data[id]
      })
    }
  }
}

//Profiel veranderen
function change(req, res) {
  var user = req.session.user.id
  var body = req.body
  connection.query('UPDATE person SET naam = ?, wachtwoord = ?, email = ?, leeftijd = ?, geslacht = ?, geslachtkeuze = ?, maxaftstand = ?, maxleeftijd = ?, burgelijkestaat = ?, postuur = ?, images = ? WHERE id = ?', [body.naam, body.wachtwoord, body.email, body.leeftijd, body.geslacht, body.geslachtkeuze, body.maxaftstand, body.maxleeftijd, body.burgelijkestaat, body.postuur, body.images, user], onDone)
  function onDone(err, data) {
    if (err) throw err
    connection.query('SELECT * FROM person WHERE email = ?', body.email, gotuser)
  } function gotuser(err, data) {
    if (err) throw err
    req.session.user = data[0]
    res.redirect('/')



  }
}
