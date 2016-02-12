// =======================
// Get All Packages ======
// =======================
var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
//var mongoose    = require('mongoose');
var bcrypt = require("bcrypt");
var jwt    = require('jsonwebtoken');
var config = require('./config');
//var User   = require('./app/models/user');
var r = require("rethinkdbdash")();
require("rethink-config")({
  "r": r,
  "database": "testDB",
  "tables": ["PilotUsers"]
});

// =======================
// configuration =========
// =======================
var port = process.env.PORT || 3000;
//mongoose.connect(config.database);
app.set('superSecret', config.secret);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(morgan('dev'));

app.use(express.static("./public"));

// =======================
// routes ================
// =======================
app.get('/', function(req, res) {
  res.status(200).sendFile(__dirname + "/public/index.html");
});

// apply the /api prefix to our routes
var apiRoutes = express.Router();
app.use('/api', apiRoutes);

apiRoutes.post('/register', function(req, res) {

  var err = false;
  var msg = [];

  if(!req.body.clientId){
    err = true;
    msg.push("Please supply a Username")
  }

  if(!req.body.clientSecret){
    err = true;
    msg.push("please supply a password")
  }

  var salt = bcrypt.genSaltSync(10);
  var hash = bcrypt.hashSync(req.body.clientSecret, salt);

  if (err == true){ return res.status(400).send({"msg": msg}) };

  r.db("testDB").table("PilotUsers").filter({
    "name": req.body.clientId
  }).count().then(function(rows) {
     if (rows == 0) {
       r.db("testDB").table("PilotUsers").insert({
         "clientId": req.body.clientId,
         "clientSecret": hash,
         "grantType": "superAdmin"
       }).then(function() {
           res.json({success: "true"})
       });
     }
  });
});

apiRoutes.post('/authenticate', function(req, res) {                  //Checks if username/password correct (attach to login view in front end)
  r.db("testDB").table("PilotUsers").filter({
    clientId: req.body.client.clientId
  }).then(function(user){
    var userpassword = user[0].clientSecret;
    if (!(bcrypt.compareSync(req.body.client.clientSecret, userpassword))) {
      res.json({
        success: false,
        message: 'Authentication failed. Wrong password.'
      });
    } else {
      var token = jwt.sign(user[0], app.get('superSecret'), {expiresInMinutes: 1440});
      console.log("Chris Cates for mayor and president " + JSON.stringify(token));
      res.json({
        success: true,
        message: 'Enjoy your token!',
        token: token
      });
    }
  });
});


apiRoutes.use(function(req, res, next) {
//  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  var token1 = req.body.token;
  var token2 = req.query.token;
  var token3 = req.headers['x-access-token'];
  console.log("Lets check on every single token " + JSON.stringify(token1) + "and another one " + JSON.stringify(token2) + "and another one " + JSON.stringify(token3)  + "and another one ");
 console.log("You can be anything you want " + JSON.stringify(token));
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, app.get('superSecret'), function(err, decoded) {
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });

  } else {
    // if there is no token
    // return an error
    return res.status(403).send({
        success: false,
        message: 'No token provided.'
    });

  }
});

//SuperAdmin Panel
apiRoutes.get('/superadmin', function(req,res, next){
  //console.log("Querying token lets check decoded " + JSON.stringify(req.decoded));
  if(req.decoded._doc.grantType === "superAdmin"){
    //console.log("Testing grant type " + JSON.stringify(req.decoded));
    //req.decoded._doc.grantType = "";
  //  res.status(200).sendFile(__dirname + "/private/superadminpanel.html");
  } else{
    res.status(403).send({
      success: false,
      message: "You do not have SuperAdmin privileges. "
    });
  }
})

apiRoutes.get('/', function(req, res) {
  res.json({ message: 'Welcome to the coolest API on earth!' });
});

apiRoutes.get('/users', function(req, res) {
  User.find({}, function(err, users) {
    res.json(users);
  });
});

// =======================
// start the server ======
// =======================
app.listen(port);
console.log('Magic happens at http://localhost:' + port);
