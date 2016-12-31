var Doctor            = require('../models/doctor.js');
module.exports = function(app, passport, user, fs,multer) {

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
	app.post('/addToPatientList', function(req, res) {
		console.log("addToPatientList req user obj is ", req.body);
		console.log("addToPatientList req body obj is ", req.user);

		var patient_email_id = req.body.patientEmail;
		Doctor.findOne({
			'data.email': req.user.data.email, 'data.patient_list' : patient_email_id}, 
			function(err, output) {
				console.log("Inside Doctor findone ", output);
				if(err){
					res.send(err);
					return;	
				} 

				if(output){
					output.data.pending_patient_requests.pull(patient_email_id);
					output.save();
					res.send("Patient already exists in Patient List");
					return;
				}
				output.data.patient_list.push(patient_email_id);
				output.data.pending_patient_requests.pull(patient_email_id);
				output.save();
				res.send("Patient successfully added to Patient List");
			});
	});
	app.post('/removeFromPendingPatientRequests', function(req, res) {
		console.log("removeFromPatientList req user obj is ", req.body);
		console.log("removeFromPatientList req body obj is ", req.user);

		var patient_email_id = req.body.patientEmail;
		Doctor.findOne({
			'data.email': req.user.data.email}, 
			function(err, output) {
				if(err) {
					res.send(err);
					return;
				} 
				output.data.pending_patient_requests.pull(patient_email_id);
				output.save();
				res.send("Patient request successfully removed from Pending Patient Requests")
			});
	});

	app.post('/doctorRequest', function(req, res) {
		console.log("email is ", req.body.email);
		var user_email_id = req.user.data.email;
		console.log("user emailid ", user_email_id);
		Doctor.findOne({'data.email':req.body.email},function(err, output) {
			if(err) return err;
 			output.data.pending_patient_requests.push(user_email_id);
 			output.save();
 		});
 	res.redirect('/home');
 });

	app.get('/doctor', isLoggedIn, checkDoctorAuthorization, function(req, res) {
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
		if(req.user.data.role=="Doctor")
			res.redirect('/doctor');
		else {
			res.render('home', {title: 'Home', usr: req.user});
			loaded = true;
		}
	});
	app.get('/fileupload', isLoggedIn, function(req, res) {
		res.render('fileupload', {title: 'FileUpload', usr: req.user});
		loaded = true;
	});

	app.get('/profile', isLoggedIn, function(req, res) {
		res.render('profile', {title: 'Profile', usr: req.user});
		loaded = true;
	});
	app.post('/viewPatientProfile', isLoggedIn, checkDoctorAuthorization, function(req, res) {
		console.log("req.body",req.body);
		req.session.patientSelected = req.body.patient_data;
		res.send("Success");
	});
	app.get('/viewPatientProfile', isLoggedIn, checkDoctorAuthorization, function(req, res) {
		if(req.session.patientSelected)
			console.log("session data ", req.session.patientSelected);
		else{
			res.redirect("/doctor");
			return;
		}
		res.render('viewPatientProfile', {title: 'viewPatientProfile', usr: req.user});
		loaded = true;
	});
	app.get('/mamp', isLoggedIn, function(req, res) {
		// var content;
		// var dirName ="/views";
		// var f = getNewestFile(dirName, new RegExp('.*\.txt'));
		// console.log("file path:",f);
		// fs.readFile('/'+dirName+'/'+, function read(err, data) {
		// 	if (err) {
		// 		throw err;
		// 	}
		// 	content = data;
		// });
		res.render('mamp', {title: 'MyAsthmaMyPlan', usr: req.user});
		loaded = true;
	});
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
		loaded = false;
	});

app.post('/send', function(req,res) {
	var Tex1 = req.body.MyPlanDataUri;
	console.log("Tex1:",req.body);
	console.log("in  send route req:",req.body.files);
	//res.render('patientout',{title : 'Patient1', tex : Tex1});
	fs.writeFile('patient11.txt', Tex1);
	res.send("Successfull");
});

function isLoggedIn(req, res, next) {
	if(req.isAuthenticated()) return next();
	res.redirect('/notloggedin');
};

function alreadyLoggedIn(req, res, next) {
	if(req.isAuthenticated())
		if(req.user.data.role=="Doctor")
			res.redirect('/doctor');
		else
			res.redirect('/home');
	return next();
};

function getNewestFile(dir, regexp) {
    var fs = require("fs"),
     path = require('path'),
    newest = null,
    files = fs.readdirSync(dir),
    one_matched = 0,
    i

    for (i = 0; i < files.length; i++) {

        if (regexp.test(files[i]) == false)
            continue
        else if (one_matched == 0) {
            newest = files[i];
            one_matched = 1;
            continue
        }

        f1_time = fs.statSync(path.join(dir, files[i])).mtime.getTime()
        f2_time = fs.statSync(path.join(dir, newest)).mtime.getTime()
        if (f1_time > f2_time)
            newest[i] = files[i]  
    }

    if (newest != null)
        return (path.join(dir, newest))
    return null
}

function checkDoctorAuthorization(req, res, next) {
	if(req.user.data.role=="Doctor")
		return next();
	else
		res.redirect('/home');
};

var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './views');
  },
  filename: function (req, file, callback) {
  	console.log("file in file name:",file);
  	console.log("req body  in file name:",req.body);
  	console.log("callback:",callback);
    callback(null, file.fieldname + '-' + Date.now()+".txt");
  }
});
var upload = multer({ storage : storage}).single('displayImage');
app.post('/api/photo',function(req,res){
	console.log("req.files in multer:",req.files);
    upload(req,res,function(err) {
    	console.log("req.files:",req.body.files);
        if(err) {
            return res.end("Error uploading file.");
        }
        res.end("File is uploaded");
    });
});

}
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