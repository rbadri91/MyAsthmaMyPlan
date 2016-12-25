var Doctor            = require('../models/doctor.js');
module.exports = function(app, passport,user) {

	var loaded = false;
	app.get('/', function(req, res) {
		res.render('index',{title : 'Welcome', loaded: loaded});
	});
	app.get('/login', alreadyLoggedIn, function(req,res) {
		res.render('login',{title : 'Login', message: req.flash('loginMessage')});
	});
 app.post('/login', passport.authenticate('local-login',{
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }),
 function(req,res){
 	if(req.user.data.role=="Doctor")
 		res.redirect('/doctor');
 	else
 		res.redirect('/home');
 });
 app.get('/signup', alreadyLoggedIn, function(req, res) {
 	res.render('signup', {title: 'Sign Up', message: req.flash('signupMessage')});
 });
 app.post('/signup',passport.authenticate('local-signup',{
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }),
 function(req,res){
 	console.log("user data:",req.user.data);
 	if(req.user.data.role=="Doctor")
 		res.redirect('/doctor');
 	else
 		res.redirect('/home');
 });

 app.get('/doctor', isLoggedIn,function(req, res) {
 		var patientList;
 		Doctor.findOne({'data.email':req.user.data.email},function(err, output) {
 			if(err) return err;
 			console.log("output.data:",output.data);
 			patientList = output.data.patient_list;
 			res.render('doctor', {title: 'doctor', usr: req.user,pList: patientList});
			loaded = true;
 		});
		
	});
 app.get('/home', isLoggedIn,function(req, res) {
		res.render('home', {title: 'Home', usr: req.user});
		loaded = true;
	});
 app.get('/fileupload', isLoggedIn, function(req, res) {
 	res.render('fileupload', {title: 'FileUpload', usr: req.user});
 	loaded = true;
 });

 app.get('/profile', isLoggedIn, function(req, res) {
 	res.render('profile', {title: 'Profile', usr: req.user});
 	loaded = true;
 });
 app.get('/viewPatientProfile', isLoggedIn, function(req, res) {
 	res.render('viewPatientProfile', {title: 'viewPatientProfile', usr: req.user});
 	loaded = true;
 });
 app.get('/mamp', isLoggedIn, function(req, res) {
 	res.render('mamp', {title: 'MyAsthmaMyPlan', usr: req.user});
 	loaded = true;
 });
 app.get('/logout', function(req, res) {
 	req.logout();
 	res.redirect('/');
 	loaded = false;
 });

};

function isLoggedIn(req, res, next) {
	if(req.isAuthenticated()) return next();
	res.redirect('/notloggedin');
};

function alreadyLoggedIn(req, res, next) {
	if(req.isAuthenticated())
		res.redirect('/home');
	return next();
}