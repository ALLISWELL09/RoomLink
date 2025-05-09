// Simple Gmail Test Script
// This script tests Gmail email sending with minimal configuration

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from config.env
dotenv.config({ path: path.join(__dirname, 'config', 'config.env') });

async function testGmailSimple() {
  console.log('=== Simple Gmail Test ===');
  console.log('Testing Gmail with minimal configuration');
  console.log('');
  
  // Email configuration
  const email = process.env.EMAIL_USERNAME;
  const password = process.env.EMAIL_PASSWORD;
  
  // Display configuration (without password)
  console.log('Email configuration:');
  console.log('- Username:', email);
  console.log('- Password:', password ? '[PROVIDED]' : '[NOT PROVIDED]');
  
  try {
    // Create transporter with minimal configuration
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: email,
        pass: password
      }
    });
    
    console.log('\nCreated transporter with minimal configuration');
    
    // Verify connection
    console.log('Verifying connection to Gmail...');
    await transporter.verify();
    console.log('✅ Connection verified successfully!');
    
    // Send a test email to yourself
    console.log('\nSending test email to yourself...');
    
    const info = await transporter.sendMail({
      from: `"RoomLink Support" <${email}>`,
      to: email, // Send to yourself
      subject: 'Gmail Test Email',
      html: `
        <h2>Gmail Test Email</h2>
        <p>This is a test email sent from the RoomLink application.</p>
        <p>If you received this email, your Gmail configuration is working correctly.</p>
        <p>Time sent: ${new Date().toLocaleString()}</p>
      `
    });
    
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    
    console.log('\n=== GMAIL IS WORKING ===');
    console.log('Your Gmail configuration is working correctly.');
    console.log('You can now use the forgot password feature in your application.');
    
  } catch (error) {
    console.error('❌ Error:', error);
    
    if (error.code === 'EAUTH') {
      console.error('\nAuthentication failed. This usually means:');
      console.error('1. The password you provided is incorrect');
      console.error('2. You need to use an App Password instead of your regular Gmail password');
      console.error('3. Your Gmail account has security restrictions');
      
      console.error('\nTo fix this:');
      console.error('1. Enable 2-Step Verification on your Google account');
      console.error('2. Create an App Password specifically for this application');
      console.error('3. Use that App Password in your config.env file');
    }
    
    if (error.code === 'ESOCKET') {
      console.error('\nConnection error. This usually means:');
      console.error('1. You have no internet connection');
      console.error('2. Gmail SMTP server is blocked by your network');
    }
  }
}

// Run the test
testGmailSimple();
