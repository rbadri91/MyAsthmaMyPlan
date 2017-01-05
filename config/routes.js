var Doctor            = require('../models/doctor.js');
var Patient 		  = require('../models/patient.js');
var Guardian 		  = require('../models/guardian.js');
module.exports = function(app, passport, fs, MAMP_files_path) {

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
		else if(req.user.data.role=="Guardian")
			res.redirect('/guardian');
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

	app.post('/addToPatientList', isLoggedIn, checkDoctorAuthorization, function(req, res) {
		//console.log("addToPatientList req user obj is ", req.body);
		//console.log("addToPatientList req body obj is ", req.user);

		var patient_email_id = req.body.patientEmail;
		Doctor.findOne({
			'data.email': req.user.data.email}, 
			function(err, output) {
				console.log("Inside Doctor findone ", output);
				if(err){
					res.send(err);
					return;	
				} 

				if(output){
					if(output.data.patient_list){
						console.log("Searching patient in doc's patient_list");
						var search_out = output.data.patient_list.indexOf(patient_email_id);
						if(search_out > 0){
							//No patient in Patient_list
							output.data.pending_patient_requests.pull(patient_email_id);
							console.log("Patient already exists in Patient List");
							output.save();
							res.send("Patient already exists in Patient List");
							return;
						}
					}
					output.data.patient_list.push(patient_email_id);
					output.data.pending_patient_requests.pull(patient_email_id);
					output.save();
					res.send("Patient successfully added to Patient List");
				}
				
			});
	});
	app.post('/removeFromPendingPatientRequests', isLoggedIn, checkDoctorAuthorization, function(req, res) {
		//console.log("removeFromPatientList req user obj is ", req.body);
		//console.log("removeFromPatientList req body obj is ", req.user);

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

	app.post('/addPatient', isLoggedIn, checkGuardianAuthorization, function(req, res) {
		var output = "Success";
		//console.log("In /addPatient req body is ", req.body);
		var user_email_id = req.user.data.email;
		//console.log("user emailid ", user_email_id);
		Guardian.findOne({'data.email':user_email_id},function(err, output) {
			if(err){
				output = err;
			} 
			else{

				Patient.findOne({ 'data.email' :  req.body.email }, function(err, data) {
		            // if there are any errors, return the error
		            if (err){
		                output = err;
		            }
		            // check to see if theres already a user with that email
		            else if (data) {
		            	if(output.data.patient_list.indexOf(req.body.email) < 0){
		            		output.data.patient_list.push(req.body.email);
							output.save();
		            	}
		            	output = "Patient already exists.";
					}
					else {
						var PatientProfile = new Patient();
			            PatientProfile.data.email = req.body.email;
			            PatientProfile.data.firstName = req.body.firstName;
			            PatientProfile.data.lastName = req.body.lastName;
			            PatientProfile.save(function(err){
			                if(err) throw err;
			            console.log(" patient profile saved");
	            		});
	            		output.data.patient_list.push(req.body.email);
						output.save();
						output = "New patient created.";
					}
            	});
			}	
		});
		res.send(output);
	});

	app.post('/doctorRequest', isLoggedIn, function(req, res) {
		//console.log("email is ", req.body.email);
		var user_email_id = req.user.data.email;
		//console.log("user emailid ", user_email_id);
		Doctor.findOne({'data.email':req.body.email},function(err, output) {
			if(err) return err;
			output.data.pending_patient_requests.push(user_email_id);
			output.save();
		});
		res.redirect('/home');
	});
	var userDetails={};

	app.get('/doctor', isLoggedIn, checkDoctorAuthorization, function(req, res) {
		var patientList,pendingPatientList;
		Doctor.findOne({'data.email':req.user.data.email},function(err, output) {
			if(err) return err;
			pending_patient_Requests = output.data.pending_patient_requests;
			//console.log("output.data:",output.data);
			//console.log("pending_patient_Requests in routes:",pending_patient_Requests);
			patientList = output.data.patient_list;
			//console.log("req.user:",req.user);
			userDetails ={firstName:output.data.firstName,lastName:output.data.lastName};
			res.render('doctor', {title: 'doctor', usr: req.user,pList: patientList,pendingPList:pending_patient_Requests,usrDetails:userDetails});
			loaded = true;
		});
		
	});

	app.get('/guardian', isLoggedIn, checkGuardianAuthorization, function(req, res) {
		var patientList;
		Guardian.findOne({'data.email':req.user.data.email},function(err, output) {
			if(err) return err;
			//pending_patient_Requests = output.data.pending_patient_requests;
			//console.log("output.data:",output.data);
			//console.log("pending_patient_Requests in routes:",pending_patient_Requests);
			patientList = output.data.patient_list;
			//console.log("patient list in guardian : ", patientList)
			//console.log("req.user:",req.user);
			userDetails ={firstName:output.data.firstName,lastName:output.data.lastName};
			res.render('guardian', {title: 'guardian', usr: req.user,pList: patientList,usrDetails:userDetails});
			loaded = true;
		});
		
	});

	app.get('/home', isLoggedIn,function(req, res) {
		// console.log("in /home - req.user: ", req.user);
		// console.log("in /home - session: ", req.session);
		if(req.user.data.role=="Doctor")
			res.redirect('/doctor');
		else if(req.user.data.role=="Guardian")
			res.redirect('/guardian');
		else {
			req.session.patientSelected = req.user.data.email;
			Patient.findOne({'data.email':req.user.data.email},function(err, output) {
				if(err) return err;
				userDetails ={firstName:output.data.firstName,lastName:output.data.lastName};
				res.render('home', {title: 'Home', usr: req.user,usrDetails:userDetails});
				loaded = true;
			});
			
		}
	});
	app.get('/fileupload', isLoggedIn, checkDoctorAuthorization, function(req, res) {
		res.render('fileupload', {title: 'FileUpload', usr: req.user ,usrDetails:userDetails});
		loaded = true;
	});

	app.post('/viewPatientProfile', isLoggedIn, checkDoctorAuthorization, function(req, res) {
		//console.log("req.body",req.body);
		req.session.patientSelected = req.body.patient_data;
		res.send("Success");
	});
	app.get('/viewPatientProfile', isLoggedIn, checkDoctorAuthorization, isPatientSelected, function(req, res) {
		res.render('viewPatientProfile', {title: 'viewPatientProfile', usr: req.user,usrDetails:userDetails});
		loaded = true;
	});

	app.get('/mamp', isLoggedIn, isPatientSelected, function(req, res) {

		var patient_id_path = MAMP_files_path + "/" + req.session.patientSelected;
		//console.log("in get /mamp + patient id is ", patient_id_path);
		if (!fs.existsSync(patient_id_path)){
			patient_id_path = MAMP_files_path + "/noimage.txt";
		}
		else{
			var no_files = 0;
			console.log("Going to read directory ", patient_id_path);
			var files = fs.readdirSync(patient_id_path);
			no_files = files.length;
			if(no_files == 0){
				patient_id_path = MAMP_files_path + "/noimage.txt";
			}
			else{
				patient_id_path = patient_id_path + "/MyPlan" + no_files + ".txt";
			}	
		}
		
		//console.log("Final patient MyPlan img path is ", patient_id_path);
		var latest_myplan_dataUri = fs.readFileSync(patient_id_path);
		
		res.render('mamp', {title: 'MyAsthmaMyPlan', usr: req.user, dataUri: latest_myplan_dataUri,usrDetails:userDetails});
		loaded = true;
	});
	app.post('/getFileContent', isLoggedIn, function(req, res) {
		var filePath;
		if(req.user.data.role == 'Patient')
			filePath = MAMP_files_path + "/" +req.user.data.email;
		else
			filePath = MAMP_files_path + "/" +req.session.patientSelected;

			filePath += "/"+req.body.fileName+".txt";
			var planUri = fs.readFileSync(filePath);
			res.send(planUri)
	});
	app.get('/logout', function(req, res) {

		req.session.destroy();
		req.logout();
		res.redirect('/');
		loaded = false;
	});

	app.post('/send', isLoggedIn, checkDoctorAuthorization, isPatientSelected, function(req,res) {
		
		var Tex1 = req.body.MyPlanDataUri;
		var patient_id_path = MAMP_files_path + "/" + req.session.patientSelected;
		//console.log("in  send route + patient id is ", patient_id_path);
		if (!fs.existsSync(patient_id_path)){
			fs.mkdirSync(patient_id_path);
		}

		//GET NUMBER OF CURRENT FILES IN PATIENT_ID_PATH DIR
		var no_files = 0;
		//console.log("Going to read directory ", patient_id_path);
		var files = fs.readdirSync(patient_id_path);
		no_files = files.length;

		//console.log("no of files ", no_files);
		var curr_file_no = no_files + 1;
		var newFile = patient_id_path + "/MyPlan" + curr_file_no + ".txt";
		fs.writeFile(newFile, Tex1, (err) => {
			if (err) {
				res.send(err);
				return;
			}
				
			console.log('File saved successfully ! - ', newFile);
		}
		);

		var Patient_email = req.session.patientSelected;
		var doctor_email = req.user.data.email;
		//console.log("before findone + ", Patient_email);
		Patient.findOne({
			'data.email': Patient_email}, 
			function(err, output) {
				//console.log("Inside Patient findone ", output);
				if(err){
					res.send(err);
					return;	
				} 

				if(output){
					//var newPlan = new MyPlan();
					var current_time = new Date().getTime();
					var file_name = "MyPlan" + curr_file_no + ".txt";
					output.data.myPlans.push({filename: file_name, doctor: doctor_email, timestamp: current_time});
                	//console.log("new myplan created");
                	// newPlan.filename = "MyPlan" + curr_file_no + ".txt";
                	// newPlan.doctor = doctor_email;
                	// newPlan.timestamp = new Date().getTime();
                	// output.data.myPlans.push(newPlan);
                	output.save();
                	res.send("New MyPlan successfuly added.");
					return;
				}
			});

		//res.send("Some issue with finding the patient");
	});

	app.get('/getPatientHistory', isLoggedIn, function(req, res){
		var patientEmail;
		if(req.user.data.role == 'Patient')
			patientEmail = req.user.data.email;
		else
			patientEmail = req.session.patientSelected;
		Patient.findOne({
			'data.email': patientEmail}, 
			function(err, output) {
				console.log("Inside Patient findone ", output);
				if(err){
					// res.send(err);
					return err;	
				} 

				if(output){
                	//console.log("getting patient history");
                	var myPlans = output.data.myPlans;
                	//console.log(myPlans);
                	var patientDetails= {fName:output.data.firstName,lName:output.data.lastName};
                	// res.send("get patient history call was successful.");
                	res.render('MyPlanHistory', {title: 'My Plan History', usr: req.user,usrDetails:userDetails,fileDetails:JSON.stringify(myPlans),pDetails:patientDetails});
					return;
				}
			});
		//res.send("Couldn't find patient in /getPatientHistory");
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

	function checkDoctorAuthorization(req, res, next) {
		if(req.user.data.role=="Doctor")
			return next();
		else
			res.redirect('/home');
	};

	function checkGuardianAuthorization(req, res, next) {
		if(req.user.data.role=="Guardian")
			return next();
		else
			res.redirect('/home');
	};


	function isPatientSelected(req, res, next) {
		if(req.session.patientSelected){
			console.log("Selected Patient from session data ", req.session.patientSelected);
			return next();
		}
		else{
			res.redirect("/home");
			return;
		}
	};

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