const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { isEmail } = require('validator');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, "Please enter name"]
    },
    email: {
        type: String,
        required: [true, "Please enter email"],
        unique: true,
        lowercase: true,
        validate: [isEmail, "Please enter valid email"]
    },
    password: {
        type: String,
        required: [true, "Please enter password"],
        minlength: [6, "Password should be minimum of 6 characters"]
    }
});

// mongoose hooks Pre
userSchema.pre('save', async function(next) {
    // firstly we generate a salt and then use the hash method of bcrypt with password and generated salt
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    
    // console.log('before save', this);
    next();
})

// Mongoose After Save Hook
// userSchema.post('save', function(doc, next) {
//     console.log('after save', doc);
//     next();
// });

userSchema.statics.login = async function(email, password) {
    const user = await this.findOne({ email });
    if(user) {
        const isAuthenticated = await bcrypt.compare(password, user.password);
        if(isAuthenticated) {
            return user;
        }
        throw Error("incorrect pwd");
    } else {
        throw Error("incorrect email");
    }
}

// Compile the scheme
const User = mongoose.model('User', userSchema);
module.exports = User;