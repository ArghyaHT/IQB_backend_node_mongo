const nodemailer = require("nodemailer")

// Configure the email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'arghyahimanstech@gmail.com',
      pass: 'A211994a@',
    },
  });
  
  // Function to send the password reset email
  const sendPasswordResetEmail = (email, resetLink) => {
    const mailOptions = {
      from: 'arghyahimanstech@gmail.com',
      to: email,
      subject: 'Password Reset Instructions',
      html: `<p>Dear User,</p>
             <p>Please click the following link to reset your password:</p>
             <a href="${resetLink}">Reset Password</a>`,
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });
  };
  
  module.exports = { sendPasswordResetEmail };