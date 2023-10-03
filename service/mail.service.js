const nodemailer = require("nodemailer");

function sendingEmail(req, user, token) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PW,
    },
  });
  const mailOptions = {
    from: "no-reply@abhishek.com",
    to: user.email,
    subject: "Account Verification",
    text:
      "Hello " +
      req?.body?.fullName +
      ",\n\n" +
      "Please verify your account by clicking the link: \nhttp://" +
      req.headers.host +
      "/api/confirmation/" +
      user.email +
      "/" +
      token.token +
      "\n\nThank You!\n",
  };
  transporter.sendMail(mailOptions, function (err) {
    if (err) {
     return res.status(400).json({
        result: err,
        message: "Technical Issue",
      });
    } 
  });
}

module.exports = { sendingEmail };
