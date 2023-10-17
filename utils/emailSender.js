const nodemailer = require('nodemailer');

// Configure the email transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'arghyahimanstech@gmail.com',
    pass: 'srseljzsckyykpsg',
  },
});

transporter.verify((err, success) => {
  if (err) console.error(err);
  console.log('Your config is correct');
});

// Function to send the password reset email
const sendPasswordResetEmail = (email, resetLink) => {
  const mailOptions = {
    from: 'arghyahimanstech@gmail.com',
    to: "bikkihimanstech@gmail.com",
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


const sendCustomerMail = (email,subject, text) => {
  const mailOptions = {
    from: 'arghyahimanstech@gmail.com',
    to: `${email}`,
    subject: `${subject}`,
    html: `<p>Dear User,</p>
           <p>${text}</p>`,
  }

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
}

module.exports ={
  sendPasswordResetEmail,
  sendCustomerMail,
}