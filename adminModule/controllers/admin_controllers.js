const bcryptjs = require("bcryptjs");
const admin_model = require("../models/admin_model");
const admission_model = require("../../userModule/models/admission_model");
const path = require('path');
const { PDFDocument, StandardFonts } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const fs = require('fs').promises;
const nodemailer = require('nodemailer');
require('dotenv').config();
const exceljs = require('exceljs')



const adminLogin = (req, res) => {

    res.render('../adminModule/Views/admin_credential')
};

const adminSignup = (req, res) => {

    res.render('../adminModule/Views/admin_signup')
}

const adminSignupPost = async (req, res) => {

    try {

        const adminData = req.body;

        const adminEmail = await admin_model.findOne({ email: adminData.email });
        const adminMobile = await admin_model.findOne({ mobile: adminData.mobile });

        const mobilePattern = /^[6-9]\d{9}$/;

        if (!mobilePattern.test(adminData.mobile)) {
            req.flash('error', 'Invalid mobile number');
            return res.redirect('/nm/admin-signup')
        }

        if (adminMobile) {
            req.flash('error', 'Mobile already exist');
            return res.redirect('/nm/admin-signup')
        }

        if (adminEmail) {
            req.flash('error', 'Email already exist');
            return res.redirect('/nm/admin-signup')
        }

        const new_adminModel = admin_model(adminData);
        await new_adminModel.save();

        console.log(new_adminModel)

        req.flash('success', 'Admin Signup successfully. Please login to continue');
        return res.redirect('/nm/admin-login')
    }
    catch (err) {

        console.log('Admin signup error');
        req.flash('error', 'Admin signup error');
        return res.redirect('/nm-admin-signup')
    }

}

const adminLoginPost = async (req, res) => {

    const { email, password } = req.body;
    const adminEmail = await admin_model.findOne({ email: email });

    if (adminEmail) {

        const matchPassword = await bcryptjs.compare(password, adminEmail.password);
        if (matchPassword) {

            const token = await adminEmail.adminTokenGenerate();

            res.cookie('adminToken', token), {
                httpOnly: true,
                secure: true,
                maxAge: 365 * 24 * 60 * 60 * 1000,
            }
            return res.redirect('/nm/admin-dashboard')
        }

        else {
            req.flash('error', 'Incorrcet Email or Password');
            return res.redirect('/nm/admin-login')
        }

    }

    else {
        req.flash('error', 'Invalid login details');
        return res.redirect('/nm/admin-login')
    }

}

const adminDashboard = async (req, res) => {

    const adminSourse = await admin_model.findById(req.adminId);
    const totalRegistrattion = await admission_model.countDocuments();

    res.render('../adminModule/Views/admin_dashboard', { adminSourse, totalRegistrattion })
}

const studentAdmit = (req, res) => {

    res.render('../adminModule/Views/student_admission')
}

const admissionList = async (req, res) => {


    const allAdmission = await admission_model.find();
    const totalRegistration = allAdmission.length;

    res.render('../adminModule/Views/admission_list', { allAdmission, totalRegistration })
}

const downloadPDF = async (req, res) => {

    try {

        const admissionSourse = await admission_model.findById(req.params.id);

        console.log(admissionSourse)

        const inputPdfPath = path.join(__dirname, '../../admission_form_2026/ilovepdf_merged (1) (7) (2) (1).pdf');
        const existingPdfBytes = await fs.readFile(inputPdfPath);
        const pdfDoc = await PDFDocument.load(existingPdfBytes);

        const form = pdfDoc.getForm();

        form.getTextField('exam_center').setText(admissionSourse.exam_center);
        form.getTextField('admission_date').setText(admissionSourse.admission_date);
        form.getTextField('serial_no').setText(admissionSourse.serial_no);
        form.getTextField('student_name_eng').setText(admissionSourse.student_name_eng);
        form.getTextField('dob').setText(admissionSourse.dob);

        form.getTextField('student_name_capital').setText(admissionSourse.student_name_capital);
        form.getTextField('guardian_name').setText(admissionSourse.guardian_name);
        form.getTextField('relation_with_student').setText(admissionSourse.relation_with_student);
        form.getTextField('guardian_occupation').setText(admissionSourse.guardian_occupation);
        form.getTextField('mother_name').setText(admissionSourse.mother_name);
        form.getTextField('mother_occupation').setText(admissionSourse.mother_occupation);
        form.getTextField('total_family_members').setText(admissionSourse.total_family_members?.toString());
        form.getTextField('family_monthly_income').setText(admissionSourse.family_monthly_income?.toString());
        form.getTextField('total_earner').setText(admissionSourse.total_earner?.toString());

        form.getTextField('village').setText(admissionSourse.village);
        form.getTextField('post_office').setText(admissionSourse.post_office);
        form.getTextField('police_station').setText(admissionSourse.police_station);
        form.getTextField('district').setText(admissionSourse.district);
        form.getTextField('pin_code').setText(admissionSourse.pin_code);
        form.getTextField('mobile_1').setText(admissionSourse.mobile_1);
        form.getTextField('mobile_2').setText(admissionSourse.mobile_2);
        form.getTextField('exam_center').setText(admissionSourse.exam_center);
        form.getTextField('current_institute').setText(admissionSourse.current_institute);
        form.getTextField('current_class').setText(admissionSourse.current_class);
        form.getTextField('address').setText(admissionSourse.address);
        form.getTextField('applied_division').setText(admissionSourse.applied_division);


        const firstPage = pdfDoc.getPage(0);
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        let startY = 355;

        function drawLeft(page, text, col, y, size, font) {
            page.drawText(String(text || ''), { x: col.left, y, size, font });
        }

        const colBounds = {
            bengali: { left: 50 },
            english: { left: 95 },
            history: { left: 144 },
            geography: { left: 190 },
            math: { left: 240 },
            physics: { left: 290 },
            life: { left: 345 },
            total: { left: 400 },
            percentage: { left: 460 },
            science_percentage: { left: 523 }
        };

        const y = startY;   // Single row

        drawLeft(firstPage, admissionSourse.bengali, colBounds.bengali, y, 11, font);
        drawLeft(firstPage, admissionSourse.english, colBounds.english, y, 11, font);
        drawLeft(firstPage, admissionSourse.history, colBounds.history, y, 11, font);
        drawLeft(firstPage, admissionSourse.geo, colBounds.geography, y, 11, font);
        drawLeft(firstPage, admissionSourse.math, colBounds.math, y, 11, font);
        drawLeft(firstPage, admissionSourse.phy_science, colBounds.physics, y, 11, font);
        drawLeft(firstPage, admissionSourse.life_science, colBounds.life, y, 11, font);
        drawLeft(firstPage, admissionSourse.total_marks, colBounds.total, y, 11, font);
        drawLeft(firstPage, admissionSourse.percentage, colBounds.percentage, y, 11, font);
        drawLeft(firstPage, admissionSourse.science_percentage, colBounds.science_percentage, y, 11, font);


        const imagePath = path.join(__dirname, '../../uploads', admissionSourse.student_photo);
        const imageBytes = await fs.readFile(imagePath);
        const fileExtension = path.extname(admissionSourse.student_photo).toLowerCase();
        let image;

        if (fileExtension === '.jpg' || fileExtension === '.jpeg') {
            image = await pdfDoc.embedJpg(imageBytes);
        } else if (fileExtension === '.png') {
            image = await pdfDoc.embedPng(imageBytes);
        }

        firstPage.drawImage(image, {
            x: 488,
            y: 727,
            width: 85,
            height: 92,
        });

        const imagePath2 = path.join(__dirname, '../../uploads', admissionSourse.student_signature);
        const imageBytes2 = await fs.readFile(imagePath2);
        const fileExtension2 = path.extname(admissionSourse.student_signature).toLowerCase();
        let image2;

        if (fileExtension2 === '.jpg' || fileExtension2 === '.jpeg') {
            image2 = await pdfDoc.embedJpg(imageBytes2);
        } else if (fileExtension2 === '.png') {
            image2 = await pdfDoc.embedPng(imageBytes2);
        }

        firstPage.drawImage(image2, {
            x: 62,
            y: 310,
            width: 110,
            height: 20,
        });


        const imagePath3 = path.join(__dirname, '../../uploads', admissionSourse.guardian_signature);
        const imageBytes3 = await fs.readFile(imagePath3);
        const fileExtension3 = path.extname(admissionSourse.guardian_signature).toLowerCase();
        let image3;

        if (fileExtension3 === '.jpg' || fileExtension3 === '.jpeg') {
            image3 = await pdfDoc.embedJpg(imageBytes3);
        } else if (fileExtension3 === '.png') {
            image3 = await pdfDoc.embedPng(imageBytes3);
        }

        firstPage.drawImage(image3, {
            x: 458,
            y: 310,
            width: 110,
            height: 20,
        });


        const imagePath4 = path.join(__dirname, '../../uploads', admissionSourse.student_signature);
        const imageBytes4 = await fs.readFile(imagePath4);
        const fileExtension4 = path.extname(admissionSourse.student_signature).toLowerCase();
        let image4;

        if (fileExtension4 === '.jpg' || fileExtension4 === '.jpeg') {
            image4 = await pdfDoc.embedJpg(imageBytes4);
        } else if (fileExtension4 === '.png') {
            image4 = await pdfDoc.embedPng(imageBytes4);
        }

        firstPage.drawImage(image4, {
            x: 180,
            y: 53,
            width: 110,
            height: 14,
        });


        const imagePath5 = path.join(__dirname, '../../uploads', admissionSourse.student_photo);
        const imageBytes5 = await fs.readFile(imagePath5);
        const fileExtension5 = path.extname(admissionSourse.student_photo).toLowerCase();
        let image5;

        if (fileExtension5 === '.jpg' || fileExtension5 === '.jpeg') {
            image5 = await pdfDoc.embedJpg(imageBytes5);
        } else if (fileExtension5 === '.png') {
            image5 = await pdfDoc.embedPng(imageBytes5);
        }

        firstPage.drawImage(image5, {
            x: 488,
            y: 160,
            width: 85,
            height: 92,
        });

        const pdfBytes = await pdfDoc.save();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="admission_application.pdf"');
        return res.end(pdfBytes);

    }

    catch (err) {

        console.log('admid card pdf generation error', err)
    }
}


const downloadPaymentSS = async (req, res) => {

    try {
        const admissionSourse = await admission_model.findById(req.params.id);
        const pdfpath = path.join(__dirname, '../../uploads', admissionSourse.paymentScreenshot);

        if (pdfpath) {
            res.download(pdfpath)
        }

        else {
            req.flash('error', 'Payment Screenshort is not found');
            return res.redirect('/nm/admin-dashboard/admission-list')
        }
    }

    catch (err) {
        console.log('Payment Screenshort related error');
        req.flash('error', 'Interner error');
        return res.redirect('/nm/admin-dashboard/admission-list')
    }
}

const adminLogout = (req, res, next) => {
    res.clearCookie('adminToken');
    req.flash('success', 'You have logged out successfully');
    return res.redirect('/nm/admin-login');
};

const forgetPassword = async (req, res) => {

    const { email } = req.body;
    const adminEmail = await admin_model.findOne({ email: email });

    if (adminEmail) {

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.User,
                pass: process.env.Pass
            }
        });

        let mailOptions = {
            from: process.env.User,
            to: adminEmail.email,
            subject: 'Forget Password - Nababia Mission',
            text: `To reset your password, please click on the link below:
https://nm-g16x.onrender.com/nm/admin/resetPassword/${adminEmail._id}`
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });


        req.flash('success', 'Plesae check your Email');
        return res.redirect('/nm/admin-login')

    }

    else {

        req.flash('error', 'You have no account')
        return res.redirect('/nm/admin-login')
    }

}

const resetPassword = (req, res) => {

    res.render('../adminModule/Views/reset_password')

}

const resetPasswordPost = async (req, res) => {

    const { reset_password } = req.body;
    const adminSourse = await admin_model.findById(req.params.id);
    adminSourse.password = reset_password;
    await adminSourse.save();
    req.flash('success', 'Password updated succesfully');
    return res.redirect('/nm/admin-login');
}

const verifyRegistration = async (req, res) => {

    const admissionSourse = await admission_model.findById(req.params.id);
    admissionSourse.verification_status = 'Verified';
    await admissionSourse.save();

    req.flash('success', 'Registration verify successfully');
    return res.redirect('/nm/admin-dashboard/admission-list')

}

const deleteRegistration = async (req, res) => {

    await admission_model.findByIdAndDelete(req.params.id);
    req.flash('success', 'Registratioin deleted succesflly');
    return res.redirect('/nm/admin-dashboard/admission-list')
}

const downloadExcel = async (req, res) => {

    try {

        const registrationList = await admission_model.find();

        const workbook = new exceljs.Workbook();
        const sheet = workbook.addWorksheet('Student Registration List');

        const headerRow = sheet.addRow(['Student Name', 'Guardian Name', 'Mobile No', 'DOB', 'Address'])

        headerRow.eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: '00A884' }
            };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = {
                top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
                left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
                bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
                right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
            };
        });


        registrationList.forEach((rl) => {

            sheet.addRow([rl.student_name_eng, rl.guardian_name, rl.mobile_1, rl.dob, rl.address])

        })

        res.setHeader("Content-Disposition", "attachment; filename=teachers.xlsx");
        await workbook.xlsx.write(res);
        res.end();

    }

    catch (err) {

        console.log('Registration list excel file download error', err);
        req.flash('error', 'Excel file download error');
        return res.redirect('/nm/admin-dashboard/admission-list')

    }
}

module.exports = { downloadExcel, deleteRegistration, verifyRegistration, resetPasswordPost, resetPassword, forgetPassword, adminLogout, downloadPaymentSS, downloadPDF, admissionList, studentAdmit, adminDashboard, adminLoginPost, adminSignupPost, adminLogin, adminSignup }