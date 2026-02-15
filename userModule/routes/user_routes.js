const express = require('express');
const multer = require('multer');
const path = require('path');
const route = express.Router();

route.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
    limits: { fileSize: 10000000 },
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },

    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
    }
})

const upload = multer({ storage: storage })





const { downloadApplication, applicationButton, studentAdmissionPost, studentAdmission } = require('../controllers/user_controllers')

route.get('/nm/student-admission', studentAdmission);

const uploadMiddleware = upload.fields([{ name: 'student_photo', maxCount: 1 }, { name: 'guardian_signature', maxCount: 8 }, { name: 'paymentScreenshot', maxCount: 8 }, { name: 'student_signature', maxCount: 8 }])


route.post('/nm/student-admission', uploadMiddleware, studentAdmissionPost);

route.get('/nm/student-admission/download-application/:id', applicationButton);

route.get('/download-application/:id', downloadApplication)

module.exports = route;