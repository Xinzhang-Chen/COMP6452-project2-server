const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAILUSER,
    pass: process.env.EMAILPASS,
  },
});

exports.transporter = transporter;
