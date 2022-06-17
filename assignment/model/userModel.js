const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({ 
    fname: {
        type: String, 
        required: true,
        trim:true
    },
    lname: {
        type: String, 
        required: true,
        trim:true
    },
    email: {
        type: String, 
        required: true,
        unique: true   //valid email
    },
    profileImage: {
        type: String,
        required: true,
        trim:true
    }, // s3 link
    phone: {
        type: String, 
        required: true,
        unique: true    //valid indian phone num
    }, 
    password: {
        type: String, 
        required: true,
        minLen: 8,
        maxLen: 15,     //valid password 8-15
        trim:true
    } // encrypted password
}, { timestamps: true });


module.exports = mongoose.model('user', userSchema)