// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;

// load up the user model
var User            = require('../models/user.js');
var Doctor            = require('../models/doctor.js');
var Patient            = require('../models/patient.js');
var Guardian            = require('../models/guardian.js');

// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(data, done) {
        done(null, data.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, data) {
            done(err, data);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {
        console.log("passport signup");
        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function() {

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'data.email' :  email }, function(err, data) {
            // if there are any errors, return the error
            if (err)
                return done(err);

            // check to see if theres already a user with that email
            if (data) {
                return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
            } else {

                // if there is no user with that email
                // create the user
                var newUser            = new User();
                console.log("new user created");
                // set the user's local credentials
                newUser.data.email    = email;
                newUser.data.password = newUser.generateHash(password);

                // console.log("req.body in passport signup :", req.body);
                // console.log("req.body.usertype.value: ", req.body.usertype.value);
				if(req.body.usertype == 0) newUser.data.role = "Patient";
				else if(req.body.usertype == 1) newUser.data.role = "Doctor";
                else if(req.body.usertype == 2) newUser.data.role = "Guardian";
				else console.log("no proper role for " + req.body.usertype);

                
                // save the user
                newUser.save(function(err) {
                    if (err)
                        throw err;
                    if(newUser.data.role=="Doctor"){
                        var DoctorProfile = new Doctor();
                        DoctorProfile.data.email = email;
                         DoctorProfile.data.firstName = req.body.firstName;
                         DoctorProfile.data.lastName = req.body.lastName;
                        DoctorProfile.save(function(err){
                            if(err) throw err;
                        });
                        console.log(" doc profile saved");
                    }
                    else if (newUser.data.role=="Patient"){
                        Patient.findOne({ 'data.email' :  email }, function(err, data) {
                            if (err)
                                return done(err);

                            // check to see if theres already a user with that email
                            if (data) {
                                return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                            }
                        });
                        var PatientProfile = new Patient();
                        PatientProfile.data.email = email;
                        PatientProfile.data.firstName = req.body.firstName;
                        PatientProfile.data.lastName = req.body.lastName;
                        PatientProfile.save(function(err){
                            if(err) throw err;
                        });
                        console.log(" patient profile saved");
                    }
                    else if (newUser.data.role=="Guardian"){
                        var GuardianProfile = new Guardian();
                        GuardianProfile.data.email = email;
                        GuardianProfile.data.firstName = req.body.firstName;
                        GuardianProfile.data.lastName = req.body.lastName;
                        GuardianProfile.save(function(err){
                            if(err) throw err;
                        });
                        console.log(" guardian profile saved");
                    }
                    return done(null, newUser);
                });
            }

        });    

        });

    }));



	passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) { // callback with email and password from our form

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'data.email' :  email }, function(err, data) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (!data)
                return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

            // if the user is found but the password is wrong
            if (!data.validPassword(password))
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata
           
            // all is well, return successful user
            return done(null, data);
        });

    }));

};