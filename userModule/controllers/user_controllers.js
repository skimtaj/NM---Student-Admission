const admission_model = require("../models/admission_model");

const { PDFDocument, StandardFonts } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const fs = require('fs').promises;
const path = require('path');
const nodemailer = require('nodemailer');
const admin_model = require("../../adminModule/models/admin_model");
require('dotenv').config();


const studentAdmission = (req, res) => {

    res.render('../userModule/Views/student_admission')

}

const studentAdmissionPost = async (req, res) => {
    try {

        const admissionSourse = req.body;

        admissionSourse.admission_date = new Date().toISOString().split('T')[0];
        admissionSourse.address = admissionSourse.village + ", " + admissionSourse.district;


        const lastAdmission = await admission_model.findOne()
            .sort({ serial_no: -1 });

        let newSerialNo = 1101;

        if (lastAdmission) {
            newSerialNo = parseInt(lastAdmission.serial_no) + 1;
        }

        admissionSourse.serial_no = String(newSerialNo).padStart(4, '0');



        if (req.files['student_photo']) {
            admissionSourse.student_photo = req.files['student_photo'][0].filename;
        }

        if (req.files['guardian_signature']) {
            admissionSourse.guardian_signature = req.files['guardian_signature'][0].filename;
        }

        if (req.files['paymentScreenshot']) {
            admissionSourse.paymentScreenshot = req.files['paymentScreenshot'][0].filename;
        }

        if (req.files['student_signature']) {
            admissionSourse.student_signature = req.files['student_signature'][0].filename;
        }

        const newAdmission = new admission_model(admissionSourse);
        await newAdmission.save();



        const allAdmin = await admin_model.find();

        const adminEmail = allAdmin.map((admin) => admin.email.split(','))



        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.User,
                pass: process.env.Pass
            }
        });

        let mailOptions = {
            from: process.env.User,
            to: adminEmail,
            subject: 'New Online Registration - 2026',
            text: `New online registration:\nName: ${admissionSourse.student_name_eng}\nMobile: ${admissionSourse.mobile_1}`
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        req.flash('success', 'Registration successful! Download your application.');
        return res.redirect(`/nm/student-admission/download-application/${newAdmission._id}`)

    } catch (err) {

        console.log('Registration error:', err);
        req.flash('error', 'Something went wrong. Please try again later');
        return res.redirect('/nm/student-admission');
    }
};

const applicationButton = async (req, res) => {

    const admissionSourse = await admission_model.findById(req.params.id)

    res.render('../userModule/Views/download_application', { admissionSourse })
}

const downloadApplication = async (req, res) => {

    try {

        const admissionSourse = await admission_model.findById(req.params.id);

        const inputPdfPath = path.join(__dirname, '../../admission_form_2026/ilovepdf_merged (1) (7) (2).pdf');
        const existingPdfBytes = await fs.readFile(inputPdfPath);
        const pdfDoc = await PDFDocument.load(existingPdfBytes);

        const form = pdfDoc.getForm();

        form.getTextField('exam_center').setText(admissionSourse.exam_center);
        form.getTextField('admission_date').setText(admissionSourse.admission_date);
        form.getTextField('serial_no').setText(admissionSourse.serial_no);
        form.getTextField('student_name_eng').setText(admissionSourse.student_name_eng);
        form.getTextField('dob').setText(admissionSourse.dob);
        form.getTextField('guardian_name').setText(admissionSourse.guardian_name);
        form.getTextField('relation_with_student').setText(admissionSourse.relation_with_student);
        form.getTextField('guardian_occupation').setText(admissionSourse.guardian_occupation);
        form.getTextField('mother_name').setText(admissionSourse.mother_name);
        form.getTextField('mother_occupation').setText(admissionSourse.mother_occupation);
        form.getTextField('total_family_members').setText(admissionSourse.total_family_members?.toString());
        form.getTextField('family_monthly_income').setText(admissionSourse.family_monthly_income?.toString());
        form.getTextField('total_earner').setText(admissionSourse.total_earner?.toString());
        form.getTextField('student_name_capital').setText(admissionSourse.student_name_capital);

        form.getTextField('payment_mode').setText(admissionSourse.payment_mode);



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

        // Save PDF
        const pdfBytes = await pdfDoc.save();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="admission_application.pdf"');
        return res.end(pdfBytes);


    }
    catch (err) {

        console.log('Admit pdf genering error'); 
      
    }

}

module.exports = { downloadApplication, applicationButton, studentAdmissionPost, studentAdmission }