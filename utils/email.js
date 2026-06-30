const nodemailer = require('nodemailer');

let transporter;
if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
}

const sendCredentialsEmail = async (email, username, password) => {
  if (!transporter) {
    console.warn('Email sending skipped: EMAIL_USER or EMAIL_PASSWORD not configured.');
    return { success: false, message: 'Email service not configured' };
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'OWL Community - Your Login Credentials',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #c4621a;">Welcome to OWL Community</h2>
          <p>Your account has been created. Here are your login credentials:</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 4px; margin: 20px 0;">
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Username:</strong> ${username}</p>
            <p><strong>Password:</strong> ${password}</p>
          </div>
          
          <p style="color: #666;">Please keep these credentials safe. You can change your password after logging in.</p>
          
          <p style="color: #666;">
            <a href="/login" style="color: #c4621a; text-decoration: none;">Click here to login</a>
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">© OWL Community - Access the Community</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Credentials email sent successfully' };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendCredentialsEmail };
