// Simple Email Test Script
// This script uses a free email testing service (mailtrap.io) as a fallback

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
  console.log('=== Simple Email Test ===');
  
  try {
    // First try with Gmail
    console.log('Attempting to use Gmail...');
    
    // Create Gmail transport configuration
    const gmailConfig = {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    };
    
    console.log('Gmail configuration:', {
      host: gmailConfig.host,
      port: gmailConfig.port,
      secure: gmailConfig.secure,
      user: gmailConfig.auth.user,
      hasPassword: !!gmailConfig.auth.pass
    });
    
    // Create transporter
    let transporter = nodemailer.createTransport(gmailConfig);
    
    try {
      // Verify connection
      console.log('Verifying Gmail connection...');
      await transporter.verify();
      console.log('Gmail connection verified successfully!');
    } catch (gmailError) {
      console.error('Gmail verification failed:', gmailError.message);
      console.log('\nFalling back to Mailtrap (test email service)...');
      
      // Create a Mailtrap test account
      const testAccount = await nodemailer.createTestAccount();
      
      // Create a Mailtrap transporter
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      
      console.log('Mailtrap test account created:', {
        user: testAccount.user
      });
      
      // Verify Mailtrap connection
      await transporter.verify();
      console.log('Mailtrap connection verified successfully!');
    }
    
    // Send test email
    console.log('\nSending test email...');
    const info = await transporter.sendMail({
      from: '"RoomLink Support" <support@roomlink.com>',
      to: process.env.EMAIL_USERNAME, // Send to self
      subject: 'RoomLink Email Test',
      html: `
        <h2>Email Test</h2>
        <p>This is a test email from the RoomLink application.</p>
        <p>If you received this email, the email functionality is working correctly.</p>
        <p>Time sent: ${new Date().toLocaleString()}</p>
      `
    });
    
    console.log('Email sent successfully!');
    console.log('Message ID:', info.messageId);
    
    // If using Ethereal, show preview URL
    if (info.messageId && transporter.options.host === 'smtp.ethereal.email') {
      const previewURL = nodemailer.getTestMessageUrl(info);
      console.log('\nPreview URL:', previewURL);
      console.log('Open this URL in your browser to view the test email');
      
      console.log('\n=== RECOMMENDATION ===');
      console.log('Since Gmail is not working, consider updating your config.env to use Ethereal for testing:');
      console.log(`
EMAIL_HOST=smtp.ethereal.email
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USERNAME=${transporter.options.auth.user}
EMAIL_PASSWORD=${transporter.options.auth.pass}
EMAIL_FROM="RoomLink Support <support@roomlink.com>"
      `);
    }
    
  } catch (error) {
    console.error('Error in email test:', error);
    console.error('Error details:', error.message);
  }
}

// Run the test
testEmailSending();
