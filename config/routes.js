module.exports = function(app, passport) {

	var loaded = false;
	app.get('/', function(req, res) {
		res.render('index',{title : 'Welcome', loaded: loaded});
	});
	app.get('/login', alreadyLoggedIn, function(req,res) {
		res.render('login',{title : 'Login', message: req.flash('loginMessage')});
	});
	app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/home', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
	app.get('/signup', alreadyLoggedIn, function(req, res) {
		res.render('signup', {title: 'Sign Up', message: req.flash('signupMessage')});
	});
	app.post('/signup', passport.authenticate('local-signup', {
				successRedirect : '/home', // redirect to the secure profile section
				failureRedirect : '/', // redirect back to the signup page if there is an error
				failureFlash : true // allow flash messages
	}));

	app.get('/home', isLoggedIn, function(req, res) {
		console.log("usr here:",req.user);
		console.log("usr role is : ", req.user.data.role);
		if(req.user.data.role == 'Doctor')
			res.render('doctor', {title: 'doctor', usr: req.user});	
		else
			res.render('home', {title: 'Home', usr: req.user});
		loaded = true;
	});
	app.get('/fileupload', isLoggedIn, function(req, res) {
		console.log("usr here:",req.user);
		res.render('fileupload', {title: 'FileUpload', usr: req.user});
		loaded = true;
	});
	
	app.get('/profile', isLoggedIn, function(req, res) {
		console.log("usr here:",req.user);
		res.render('profile', {title: 'Profile', usr: req.user});
		loaded = true;
	});
	app.get('/viewPatientProfile', isLoggedIn, function(req, res) {
		res.render('viewPatientProfile', {title: 'viewPatientProfile', usr: req.user});
		loaded = true;
	});
	app.get('/mamp', isLoggedIn, function(req, res) {
		console.log("usr here:",req.user);
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
	console.log("in already logged in");
	if(req.isAuthenticated())
		res.redirect('/home');
	return next();
}

// app.get('/preDoctor1', function(req,res) {
// 	res.render('preDoctor1',{title : 'Doctor1'});
// });
// app.get('/preDoctor2', function(req,res) {
// 	res.render('preDoctor2',{title : 'Doctor2'});
// });
// app.get('/patient1', function(req,res) {
// 	res.render('patient1',{title : 'Patient1', apl : AAP1Loaded});
// });
// app.get('/patient2', function(req,res) {
// 	res.render('patient2',{title : 'Patient2', apl : AAP2Loaded});
// });
// app.get('/patient3', function(req,res) {
// 	res.render('patient3',{title : 'Patient3', apl : AAP3Loaded});
// });
// app.get('/Doctor1a', function(req,res) {
// 	res.render('Doctor1a',{title : 'Doctor1', apl : AAP1Loaded});
// });
// app.get('/Doctor1b', function(req,res) {
// 	res.render('Doctor1b',{title : 'Doctor1', apl : AAP2Loaded});
// });
// app.get('/Doctor2b', function(req,res) {
// 	res.render('Doctor2b',{title : 'Doctor2', apl : AAP2Loaded});
// });
// app.get('/Doctor2c', function(req,res) {
// 	res.render('Doctor2c',{title : 'Doctor2', apl : AAP3Loaded});
// });
// app.get('/send1', function(req,res) {
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