const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "sagniknandy27@gmail.com",
      pass: "injk wzue xnkq ddcr",
    },
});

// injk wzue xnkq ddcr

const emailWithNodeMail = async(emailData) => {
   try {
    const mailOptions = {
        from: "sagniknandy27@gmail.com", // sender address
        to: emailData.email, // list of receivers
        subject: emailData.subject, // Subject line
        html: emailData.html, // html body
       }
    
       const info = await transporter.sendMail(mailOptions)
    //    console.log(`Message send: %s`,info)
   } catch (error) {
        console.error(error)
   }
}

module.exports = emailWithNodeMail