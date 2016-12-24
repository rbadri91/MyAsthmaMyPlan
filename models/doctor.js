var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our Doctor model
var doctorSchema = mongoose.Schema({

    data             : {
    	email		 : String,
    	firstName	 : String,
    	lastName	 : String,
        // patient_list : [{type: mongoose.Schema.Types.ObjectId, ref: 'Patient'}]
        patient_list: [String],
        pending_patient_requests: [String]
    }

});


// create the model for doctors and expose it to our app
module.exports = mongoose.model('Doctor', doctorSchema);