// nodemailerConfig.js

const nodemailer = require('nodemailer');
require('dotenv').config();

// Create a transporter object using SMTP transport
export const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {

    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  },
});

