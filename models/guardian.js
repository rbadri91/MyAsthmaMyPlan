var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our Guardian model
var guardianSchema = mongoose.Schema({

    data             : {
    	email		 : String,
    	firstName	 : String,
    	lastName	 : String,
        // patient_list : [{type: mongoose.Schema.Types.ObjectId, ref: 'Patient'}]
        patient_list: [String],
    }

});


// create the model for guardians and expose it to our app
module.exports = mongoose.model('Guardian', guardianSchema);