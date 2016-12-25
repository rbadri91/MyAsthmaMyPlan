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
 	if(req.user.data.role=="Doctor")
 		res.redirect('/doctor');
 	else
 		res.redirect('/home');
 });
 app.post('/addToPatientList', function(req, res) {
 	console.log("addToPatientList req user obj is ", req.body);
 	console.log("addToPatientList req body obj is ", req.user);

 	// var patient_email_id = req.body.email;
 	// Doctor.findOne({
 	// 	'data.email': req.user.data.email}, 
 	// 	function(err, output) {
 	// 		if(err) return err;
 	// 		output.data.patient_list.push(patient_email_id);
 	// 		output.save();
 	// 	});
 	res.redirect('doctor');
 	
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
 		var patientList;
 		Doctor.findOne({'data.email':req.user.data.email},function(err, output) {
 			if(err) return err;
 			pending_patient_Requests = output.data.pending_patient_requests;
 			console.log(pending_patient_Requests);
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
app.get('/send1', function(req,res) {
// 	var Tex1 = req.query.pInfo;
// 	res.render('patientout',{title : 'Patient1', tex : Tex1});
// 	fs.writeFile('patient1.txt', Tex1);
// });
// app.get('/send2', function(req,res) {
// 	var Tex2 = req.query.pInfo;
// 	res.render('patientout',{title : 'Patient2', tex : Tex2});
// 	fs.writeFile('patient2.txt', Tex2);
// });
// app.get('/send3', function(req,res) {
// 	var Tex3 = req.query.pInfo;
// 	res.render('patientout',{title : 'Patient3', tex : Tex3});
// 	fs.writeFile('patient3.txt', Tex3);
// });
// app.post('/pl1', function(req,res) {
// 	var input = fs.readFileSync('aap1.txt');
// 	res.send(input);
// });
// app.post('/pl2', function(req,res) {
// 	var input = fs.readFileSync('aap2.txt');
// 	res.send(input);
// });
// app.post('/pl3', function(req,res) {
// 	var input = fs.readFileSync('aap3.txt');
// 	res.send(input);
// });
// app.post('/fr1', function(req,res) {
// 	fs.writeFile('aap1.txt', JSON.stringify(req.body));
// 	console.log("test1");
// 	AAP1Loaded = true;
// 	res.send(req.body);
// });
// app.post('/fr2', function(req,res) {
// 	fs.writeFile('aap2.txt', JSON.stringify(req.body));
// 	console.log("test2");
// 	AAP2Loaded = true;
// 	res.send(req.body);
// });
// app.post('/fr3', function(req,res) {
// 	fs.writeFile('aap3.txt', JSON.stringify(req.body));
// 	console.log("test3");
// 	AAP3Loaded = true;
// 	res.send(req.body);
// });