/*
 * Module dependencies
 */
var express = require('express'), 
	mongoose = require('mongoose'),
	passport = require('passport'),
	ejs = require('ejs'),
	flash = require('connect-flash'),
	morgan = require('morgan'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	session = require('express-session'),
	uuidV4 = require('uuid/v4'),
	path = require('path'),
	db = require("./config/database.js");
  var fs = require('fs');
	var ConnectRoles = require('connect-roles');

//set up middleware, bools, mongoose
var app = express();
app.use('/static', express.static(path.join(__dirname, 'public')));
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');

var user = new ConnectRoles({
  failureHandler: function (req, res, action) {
    // optional function to customise code that runs when 
    // user fails authorisation 
    var accept = req.headers.accept || '';
    res.status(403);
    if (~accept.indexOf('html')) {
      res.render('access-denied', {action: action});
    } else {
      res.send('Access Denied - You don\'t have permission to: ' + action);
    }
  }
});

// app.set('views', __dirname + '/views');
// app.set('view engine', 'ejs');

    app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

app.use(morgan('dev'));
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

mongoose.Promise = global.Promise; //because mongoose's default promise library is deprecated
mongoose.connect(db.url, function(err) {
	if(err) throw err;
});
mongoose.connection.on('connected', function () {  
  console.log('Mongoose default connection open to ' + db.url);
}); 

// If the connection throws an error
mongoose.connection.on('error',function (err) {  
  console.log('Mongoose default connection error: ' + err);
}); 

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {  
  console.log('Mongoose default connection disconnected'); 
});

//initialize passport
require('./config/passport')(passport);
app.use(session({secret: 'dlikhoiuhwaf', resave: false, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//routes
require('./config/routes.js')(app, passport, user, fs);
app.listen(3001);