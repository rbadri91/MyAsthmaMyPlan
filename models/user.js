var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our patient model
var userSchema = mongoose.Schema({

    data             : {
        email        : String,
        password     : String,
        role         : String
    }

});

//generate hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.data.password);
};


// create the model for patients and doctors and expose it to our app
module.exports = mongoose.model('User', userSchema);