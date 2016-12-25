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

 app.post('/doctorRequest', function(req, res) {
 	console.log("email is ", req.body.email);
 	var user_email_id = req.user.data.email;
 	console.log("user emailid ", user_email_id);
 	Doctor.findOne({'data.email':req.body.email},function(err, output) {
 			if(err) return err;
 			//patientList = output.data.patient_list;
 			output.data.pending_patient_requests.push(user_email_id);
 			output.save();
 		});
 	// res.render('home', {title: 'Home', usr: req.user});
 	// loaded = true;
 	res.redirect('/home');
 });

 app.get('/doctor', isLoggedIn,function(req, res) {
 		var patientList,pendingPatientList;
 		Doctor.findOne({'data.email':req.user.data.email},function(err, output) {
 			if(err) return err;
 			pending_patient_Requests = output.data.pending_patient_requests;
 			console.log("pending_patient_Requests in routes:",pending_patient_Requests);
 			patientList = output.data.patient_list;
 			res.render('doctor', {title: 'doctor', usr: req.user,pList: patientList,pendingPList:pending_patient_Requests});
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