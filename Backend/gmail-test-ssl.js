// Gmail Test Script with SSL
// This script tests Gmail configuration with SSL (port 465)

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from config.env
dotenv.config({ path: path.join(__dirname, 'config', 'config.env') });

async function testGmailSSL() {
  console.log('=== Gmail SSL Test ===');
  console.log('Testing Gmail with SSL configuration (port 465)');
  
  try {
    // Email configuration for Gmail with SSL
    const emailConfig = {
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // SSL
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      },
      debug: true,
      logger: true
    };
    
    console.log('Email configuration:', {
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      user: emailConfig.auth.user,
      hasPassword: !!emailConfig.auth.pass,
      debug: emailConfig.debug
    });
    
    // Create transporter
    const transporter = nodemailer.createTransport(emailConfig);
    
    // Verify connection
    console.log('Verifying connection...');
    await transporter.verify();
    console.log('Connection verified successfully!');
    
    // Test email content
    const testEmail = process.env.EMAIL_USERNAME; // Send to self for testing
    const message = `
      <h2>Test Email with SSL</h2>
      <p>This is a test email from the RoomLink application using SSL (port 465).</p>
      <p>If you received this email, the Gmail SSL configuration is working correctly.</p>
      <p>Time sent: ${new Date().toLocaleString()}</p>
    `;
    
    // Send email
    console.log('Sending test email to:', testEmail);
    const info = await transporter.sendMail({
      from: `"RoomLink Support" <${process.env.EMAIL_USERNAME}>`,
      to: testEmail,
      subject: 'RoomLink Gmail SSL Test',
      html: message
    });
    
    console.log('Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    
    if (info.accepted && info.accepted.length > 0) {
      console.log('Accepted recipients:', info.accepted);
    }
    if (info.rejected && info.rejected.length > 0) {
      console.log('Rejected recipients:', info.rejected);
    }
    
  } catch (error) {
    console.error('Error sending test email:', error);
    
    console.error('Error details:', {
      code: error.code || 'No error code',
      message: error.message,
      name: error.name,
      stack: error.stack ? error.stack.split('\n')[0] : 'No stack trace'
    });
    
    if (error.code === 'EAUTH') {
      console.error('Authentication error with Gmail. Check your credentials.');
      console.error('For Gmail with 2FA, you need to use an App Password.');
      console.error('For Gmail without 2FA, you need to enable "Less secure app access".');
      console.error('Go to: https://myaccount.google.com/lesssecureapps');
    } else if (error.code === 'ESOCKET' || error.code === 'ETIMEDOUT') {
      console.error('Connection error with Gmail server.');
      console.error('Check your network connection and firewall settings.');
    } else if (error.message && error.message.includes('Invalid login')) {
      console.error('Invalid login credentials for Gmail.');
      console.error('Make sure your email and password are correct.');
    }
  }
}

// Run the test
testGmailSSL();
