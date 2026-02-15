const mongoose = require('mongoose');

const admissionSchema = mongoose.Schema({

    admission_date: {
        type: String
    },

    payment_mode: {

        type: String,
        default: 'Online'
    },

    science_percentage: {

        type: String
    },

    science_total: {

        type: String
    },

    serial_no: {
        type: String
    },

    student_name_eng: {
        type: String,
        trim: true
    },

    student_name_capital: {
        type: String,
        trim: true
    },

    dob: {
        type: String
    },

    student_photo: {
        type: String
    },

    student_signature: {

        type: String
    },

    guardian_name: {
        type: String,
        trim: true
    },

    relation_with_student: {
        type: String
    },

    guardian_occupation: {
        type: String
    },

    mother_name: {
        type: String,
        trim: true
    },

    mother_occupation: {
        type: String
    },

    guardian_signature: {
        type: String
    },

    total_family_members: {
        type: String
    },

    family_monthly_income: {
        type: String
    },

    total_earner: {

        type: String
    },

    village: {
        type: String
    },

    post_office: {
        type: String
    },

    police_station: {
        type: String
    },

    district: {
        type: String
    },

    pin_code: {
        type: String
    },

    address: {
        type: String
    },

    exam_center: {
        type: String
    },

    mobile_1: {
        type: String
    },

    mobile_2: {
        type: String
    },

    current_institute: {
        type: String
    },

    current_class: {
        type: String
    },

    applied_division: {
        type: String
    },

    bengali: { type: Number },
    english: { type: Number },
    math: { type: Number },
    phy_science: { type: Number },
    life_science: { type: Number },
    geo: { type: Number },
    history: { type: Number },

    total_marks: {
        type: String
    },

    percentage: {
        type: String
    },

    paymentScreenshot: {
        type: String
    },

    verification_status: {
        type: String,
        default: 'Pending'
    }

})


const admission_model = mongoose.model('admission_model', admissionSchema);

module.exports = admission_model;
