var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var myPlan = mongoose.Schema({
	filename: String,
	doctor: String,
	timestamp: String
});

// define the schema for our patient model
var patientSchema = mongoose.Schema({

    data             : {
    	firstName	 : String,
    	lastName	 : String,
    	email		 : String,
    	myPlans		 : [myPlan]
        //myPlans		 : { filename : String }
    }
});


// create the model for patients and expose it to our app
module.exports = mongoose.model('Patient', patientSchema);
module.exports = mongoose.model('MyPlan', myPlan);