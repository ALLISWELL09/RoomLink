// App Password Test Script
// This script tests Gmail email sending with the App Password

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from config.env
dotenv.config({ path: path.join(__dirname, 'config', 'config.env') });

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt for input
const prompt = (question) => new Promise((resolve) => {
  rl.question(question, (answer) => resolve(answer));
});

async function testAppPassword() {
  console.log('=== App Password Test ===');
  console.log('Testing Gmail with App Password');
  console.log('');
  
  // Email configuration
  const email = process.env.EMAIL_USERNAME;
  const appPassword = process.env.EMAIL_PASSWORD;
  
  // Display configuration (without password)
  console.log('Email configuration:');
  console.log('- Username:', email);
  console.log('- App Password:', appPassword ? '[PROVIDED]' : '[NOT PROVIDED]');
  
  try {
    // Get test email from user
    const testEmail = await prompt('Enter an email address to send a test email to: ');
    
    if (!testEmail) {
      console.error('Error: Test email is required');
      rl.close();
      return;
    }
    
    // Create transporter with App Password
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: email,
        pass: appPassword
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    
    console.log('\nCreated transporter with App Password');
    
    // Verify connection
    console.log('Verifying connection to Gmail...');
    await transporter.verify();
    console.log('✅ Connection verified successfully!');
    
    // Send a test email
    console.log('\nSending test email to:', testEmail);
    
    const info = await transporter.sendMail({
      from: `"RoomLink Support" <${email}>`,
      to: testEmail,
      subject: 'App Password Test Email',
      html: `
        <h2>App Password Test Email</h2>
        <p>This is a test email sent from the RoomLink application using an App Password.</p>
        <p>If you received this email, your Gmail configuration with App Password is working correctly.</p>
        <p>Time sent: ${new Date().toLocaleString()}</p>
      `
    });
    
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    
    console.log('\n=== APP PASSWORD IS WORKING ===');
    console.log('Your Gmail configuration with App Password is working correctly.');
    console.log('You can now use the forgot password feature in your application.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.code === 'EAUTH') {
      console.error('\nAuthentication failed. This usually means:');
      console.error('1. The App Password you provided is incorrect');
      console.error('2. The App Password should be entered without spaces');
      console.error('3. Your Gmail account has additional security restrictions');
      
      console.error('\nTo fix this:');
      console.error('1. Make sure you\'ve enabled 2-Step Verification on your Google account');
      console.error('2. Create a new App Password specifically for this application');
      console.error('3. Enter the App Password without any spaces');
    }
    
    if (error.code === 'ESOCKET') {
      console.error('\nConnection error. This usually means:');
      console.error('1. You have no internet connection');
      console.error('2. Gmail SMTP server is blocked by your network');
    }
  } finally {
    rl.close();
  }
}

// Run the test
testAppPassword();
