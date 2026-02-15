const express = require('express');
const route = express.Router();



const { downloadExcel, deleteRegistration, verifyRegistration, resetPasswordPost, resetPassword, forgetPassword, adminLogout, downloadPaymentSS, downloadPDF, admissionList, studentAdmit, adminDashboard, adminLoginPost, adminSignupPost, adminLogin, adminSignup } = require('../../adminModule/controllers/admin_controllers')

const auth = require('../../middleware/adminAuth')

route.get('/nm/admin-login', adminLogin);
route.post('/nm/admin-login', adminLoginPost);


route.get('/nm/admin-signup', adminSignup);
route.post('/nm/admin-signup', adminSignupPost);

route.get('/nm/admin-dashboard', auth, adminDashboard);

route.get('/nm/admin-dashboard/student-admission', studentAdmit);

route.get('/nm/admin-dashboard/admission-list', admissionList);

route.get('/nm/admin-dashboard/download-admission-pdf/:id', downloadPDF);

route.get('/download-payment-ss/:id', downloadPaymentSS);

route.post('/nm/admin/forget-password', forgetPassword);

route.get('/nm/admin/resetPassword/:id', resetPassword);
route.post('/nm/admin/resetPassword/:id', resetPasswordPost);

route.get('/verify-registration/:id', verifyRegistration);

route.get('/delete-registration/:id', deleteRegistration);

route.get('/nm/download-registration-excel', downloadExcel)





route.get('/logout', adminLogout)



module.exports = route; 