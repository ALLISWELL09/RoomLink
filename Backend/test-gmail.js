// Test script to verify Gmail email functionality
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from config.env
dotenv.config({ path: path.join(__dirname, 'config', 'config.env') });

async function testGmailSending() {
  console.log('Starting Gmail test...');

  try {
    // Email configuration
    const emailConfig = {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true' ? true : false, // TLS
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      },
      // Required for Gmail
      tls: {
        rejectUnauthorized: false
      }
    };

    console.log('Gmail configuration:', {
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      user: emailConfig.auth.user,
      hasPassword: !!emailConfig.auth.pass,
      tls: emailConfig.tls ? "Configured" : "Not configured"
    });

    // Create transporter
    const transporter = nodemailer.createTransport(emailConfig);

    // Verify connection
    console.log('Verifying Gmail connection...');
    await transporter.verify();
    console.log('Gmail connection verified successfully!');

    // Test email content
    const testEmail = process.env.EMAIL_USERNAME; // Send to yourself for testing
    const message = `
      <h2>Test Email</h2>
      <p>This is a test email from the RoomLink application.</p>
      <p>If you received this email, the Gmail functionality is working correctly.</p>
      <p>Temporary password: <strong>test123</strong></p>
    `;

    // Send email
    console.log('Sending test email to:', testEmail);
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"RoomLink Support" <${process.env.EMAIL_USERNAME}>`,
      to: testEmail,
      subject: 'RoomLink Test Email',
      html: message
    });

    console.log('Email sent successfully!');
    console.log('Message ID:', info.messageId);

  } catch (error) {
    console.error('Error sending test email:', error);

    if (error.code === 'EAUTH') {
      console.error('Authentication error. Check your Gmail credentials.');
      console.error('For Gmail with 2FA, you need to use an App Password.');
      console.error('Go to: https://myaccount.google.com/apppasswords');
      console.error('For Gmail without 2FA, you need to enable "Less secure app access".');
      console.error('Go to: https://myaccount.google.com/lesssecureapps');
    } else if (error.code === 'ESOCKET') {
      console.error('Socket connection error. Check your network connection and firewall settings.');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('Connection timed out. Check your network connection.');
    } else if (error.message && error.message.includes('Invalid login')) {
      console.error('Invalid login credentials for Gmail. Check your email and password.');
    }

    console.error('Error details:', error.message);
  }
}

// Run the test
testGmailSending();
