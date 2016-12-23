/*
 * Module dependencies
 */
var express = require('express'), 
	stylus = require('express-stylus'), 
	nib = require('nib'),
	pug = require('pug'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	flash = require('connect-flash'),
	morgan = require('morgan'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	session = require('express-session'),
	uuidV4 = require('uuid/v4'),
	db = require("./config/database.js");

//set up middleware, bools, mongoose
var app = express();
var AAP1Loaded = false, AAP2Loaded = false, AAP3Loaded = false;
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(stylus({
	src: __dirname + '/public',
	use: [nib()]
}));
app.use(express.static(__dirname + '/public'));
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
require('./config/routes.js')(app, passport);

app.listen(3001);