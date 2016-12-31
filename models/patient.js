var mongoose = require('mongoose');

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
// var patientModel= mongoose.model('Patient', patientSchema);
// var myPlanModel=module.exports = mongoose.model('Patient', myPlan);
// module.exports = {
// 	patientModel: patientModel,
// 	myPlanModel:myPlanModel
// }

module.exports = mongoose.model('Patient', patientSchema);