var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our patient model
var doctorSchema = mongoose.Schema({

    data             : {
    	email		 : String,
        // patient_list : [{type: mongoose.Schema.Types.ObjectId, ref: 'Patient'}]
        patient_list:[String]
    }

});

//generate hash
// userSchema.methods.generateHash = function(password) {
//     return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
// };

// // checking if password is valid
// userSchema.methods.validPassword = function(password) {
//     return bcrypt.compareSync(password, this.data.password);
// };


// create the model for doctors and expose it to our app
module.exports = mongoose.model('Doctor', doctorSchema);