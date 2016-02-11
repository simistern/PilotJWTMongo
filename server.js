// =======================
// Get All Packages ======
// =======================
var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var bcrypt = require("bcrypt");
var jwt    = require('jsonwebtoken');
var config = require('./config');
var User   = require('./app/models/user');

// =======================
// configuration =========
// =======================
var port = process.env.PORT || 3000;
mongoose.connect(config.database);
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

var apiRoutes = express.Router();
app.use('/api', apiRoutes);                                           // apply the /api prefix to our routes
apiRoutes.post('/authenticate', function(req, res) {                  //Checks if username/password correct (attach to login view in front end)
  console.log("Checking request body " + JSON.stringify(req.body));
  User.findOne({
    name: req.body.client.clientId
  }, function(err, user) {
    if (err) throw err;
    console.log("Checking request body " + JSON.stringify(req.body.client.clientId) + "and checking name " + JSON.stringify(user));
    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {
      // check if hashed password matches
      if (!(bcrypt.compareSync(req.body.client.clientSecret, user.password))) {
        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
      } else {
        // create a token
        console.log("token Created");
        var token = jwt.sign(user, app.get('superSecret'), {
          expiresInMinutes: 1440
        });
        res.json({
          success: true,
          message: 'Enjoy your token!',
          token: token
        });
      }
    }
  });
});

apiRoutes.post('/register', function(req, res) {

  var salt = bcrypt.genSaltSync(10);
  var hash = bcrypt.hashSync(req.body.clientSecret, salt);
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

  if (err == true){
    return res.status(400).send({
      "msg": msg
    })
  }

  var nick = new User({
    name: req.body.clientId,
    password: hash,
    grantType: "undeclared"
  })
  /* //create a sample user
  var nick = new User({
    name: "terry",
    password: hash,
    grantType: "superAdmin"
  });*/

  // save the user
  nick.save(function(err) {
    if (err) throw err;

    console.log('User saved successfully');
    res.json({ success: true });
  });
});


apiRoutes.use(function(req, res, next) {
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
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
  console.log("Querying token lets check decoded " + JSON.stringify(req.decoded));
  if(req.decoded._doc.grantType === "superAdmin"){
    console.log("Testing grant type " + JSON.stringify(req.decoded));
    req.decoded._doc.grantType = "";
    res.status(200).sendFile(__dirname + "/private/superadminpanel.html");
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
