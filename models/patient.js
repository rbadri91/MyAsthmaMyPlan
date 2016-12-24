var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our patient model
var patientSchema = mongoose.Schema({

    data             : {
    	firstName	 : String,
    	lastName	 : String,
    	email		 : String,
        myPlans		 : [String]
    }

});


// create the model for patients and expose it to our app
module.exports = mongoose.model('Patient', patientSchema);