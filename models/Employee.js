const mongoose = require('mongoose');
const validator = require('validator');

const employeeSchema = new mongoose.Schema({
    first_name: { 
        type: String, 
        required: true 
    },
    last_name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
        validator: (value) => validator.isEmail(value),
        message: "Invalid email format"
        } 
    },
    gender: { 
        type: String, 
        enum: ['Male', 'Female', 'Other'], 
        required: true 
    },
    designation: { 
        type: String, 
        required: true 
    },
    salary: { 
        type: Number,
        default: 0.0,
        min: 0,
        max: 1000000, 
        validate: function (value) {
        if (value < 0) {
            throw new Error(`${value} Salary can't accept negative value`)
        }
        } 
    },
    date_of_joining: { 
        type: Date, 
        required: true 
    },
    department: { 
        type: String, 
        required: true 
    },
    created_at: { 
        type: Date, 
        default: Date.now 
    },
    updated_at: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Employee', employeeSchema);