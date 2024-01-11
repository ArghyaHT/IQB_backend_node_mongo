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
const sendPasswordResetEmail = (emailData) => {
  const mailOptions = {
    from: 'arghyahimanstech@gmail.com',
    to: emailData.email,
    subject: emailData.subject,
    html: emailData.html
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};


//Function to send email to customer 
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

//Send Verification Code Email To Customer 
const sendVerificationCodeByEmail = (email,verificationCode) => {
  const mailOptions = {
    from: 'arghyahimanstech@gmail.com',
    to: `${email}`,
    subject: "Your Verification Code",
    html: `<p>Dear User,</p>
           <p>Your Verification Code is ${verificationCode}</p>`,
  }

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
}

//Send QueuePositionChange Email To Customer
const sendQueuePositionChangedEmail = (customerEmail, qPosition) => {
  const mailOptions = {
    from: 'arghyahimanstech@gmail.com', // Replace with your sender email address
    to: customerEmail,
    subject: 'Queue Position Changed',
    html: `<p>Your queue position has changed. Your new position is ${qPosition}.</p>`
    // Customize the email content as per your requirements
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};


//Send QueuePositionChange Email To Customer
const bulkEmail = (subject, message, recipientEmails) => {
  const mailOptions = {
    from: 'arghyahimanstech@gmail.com', // Replace with your sender email address
    to: recipientEmails.join(', '),
    subject: `${subject}`,
    html: `<p>${message}.</p>`
    // Customize the email content as per your requirements
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

// Function to send the password reset email
const sendAppointmentsEmail = (emailDataArray) => {
  emailDataArray.forEach((emailData) => {
    const mailOptions = {
      from: 'arghyahimanstech@gmail.com', // Change this to your sending email
      to: emailData.email,
      subject: emailData.subject,
      html: emailData.html
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });
  });
}

module.exports ={
  sendPasswordResetEmail,
  sendCustomerMail,
  sendVerificationCodeByEmail,
  sendQueuePositionChangedEmail,
  bulkEmail,
  sendAppointmentsEmail,
}