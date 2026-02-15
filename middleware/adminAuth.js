const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const JWT = require('jsonwebtoken');
require('dotenv').config();

app.use(cookieParser());


const adminAuth = (req, res, next) => {

    const token = req.cookies.adminToken;

    if (!token) {
        req.flash('error', 'You have to login to continue');
        return res.redirect('/nm/admin-login');
    }

    try {
        const verified = JWT.verify(token, process.env.Admin_Token_Password);
        req.adminId = verified._id;
        next();
    } catch (error) {
        req.flash('error', 'Session expired. Please login again');
        return res.redirect('/nm/admin-login');
    }

}

module.exports = adminAuth;