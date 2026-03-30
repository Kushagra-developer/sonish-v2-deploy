import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const testMail = async () => {
  console.log('Testing SMTP with:');
  console.log('User:', process.env.EMAIL_USER);
  console.log('Pass:', process.env.EMAIL_PASS ? '********' : 'NOT SET');
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    console.log('Attempting to send test email...');
    const info = await transporter.sendMail({
      from: `"Sonish Test" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: "SMTP Diagnostic Test",
      text: "If you receive this, your SMTP settings are correct.",
      html: "<b>SMTP Diagnostic Test Success!</b>",
    });
    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error occurred while sending email:');
    console.error(error.message);
    if (error.message.includes('Invalid login')) {
      console.log('\n--- DIAGNOSIS: INVALID LOGIN ---');
      console.log('This usually means:');
      console.log('1. The password is incorrect.');
      console.log('2. You need to use an "App Password" from Google, not your main account password.');
      console.log('3. Multi-factor authentication is on and blocking simple login.');
    }
  }
};

testMail();
