// Test script to verify email functionality
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from config.env
dotenv.config({ path: path.join(__dirname, 'config', 'config.env') });

async function testEmailSending() {
  console.log('Starting email test...');
  
  try {
    // Email configuration
    const emailConfig = {
      service: process.env.EMAIL_SERVICE || 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // Use SSL
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      },
      debug: true,
      logger: true
    };
    
    console.log('Email configuration:', {
      service: emailConfig.service,
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      user: emailConfig.auth.user,
      hasPassword: !!emailConfig.auth.pass
    });
    
    // Create transporter
    const transporter = nodemailer.createTransport(emailConfig);
    
    // Verify connection
    console.log('Verifying email connection...');
    await transporter.verify();
    console.log('Email connection verified successfully!');
    
    // Test email content
    const testEmail = 'test@example.com'; // Replace with your test email
    const message = `
      <h2>Test Email</h2>
      <p>This is a test email from the RoomLink application.</p>
      <p>If you received this email, the email functionality is working correctly.</p>
      <p>Temporary password: <strong>test123</strong></p>
    `;
    
    // Send email
    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"RoomLink Support" <${process.env.EMAIL_USERNAME}>`,
      to: testEmail,
      subject: 'RoomLink Test Email',
      html: message,
      headers: {
        'X-Priority': '1 (Highest)',
        'X-MSMail-Priority': 'High',
        'Importance': 'High'
      }
    });
    
    console.log('Email sent successfully!');
    console.log('Message ID:', info.messageId);
    
    // If using Ethereal, show preview URL
    if (info.messageId && emailConfig.host === 'smtp.ethereal.email') {
      const previewURL = nodemailer.getTestMessageUrl(info);
      console.log('Preview URL:', previewURL);
    }
    
  } catch (error) {
    console.error('Error sending test email:', error);
    
    if (error.code === 'EAUTH') {
      console.error('Authentication error. Check your email credentials.');
    } else if (error.code === 'ESOCKET') {
      console.error('Socket connection error. Check your network connection.');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('Connection timed out. Check your network connection.');
    }
    
    console.error('Error details:', error.message);
  }
}

// Run the test
testEmailSending();
