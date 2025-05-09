// Test script to verify Gmail configuration directly
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

async function testGmailDirect() {
  console.log('=== Gmail Direct Test ===');
  console.log('This script will test your Gmail configuration directly');
  console.log('');
  
  try {
    // Get email credentials from user or use environment variables
    const email = await prompt(`Enter your Gmail address (default: ${process.env.EMAIL_USERNAME}): `) || process.env.EMAIL_USERNAME;
    const password = await prompt('Enter your Gmail password or App Password: ') || process.env.EMAIL_PASSWORD;
    const testEmail = await prompt('Enter an email address to send a test email to: ');
    
    if (!email || !password || !testEmail) {
      console.error('Error: Email, password, and test email are required');
      rl.close();
      return;
    }
    
    console.log('\nTesting Gmail configuration...');
    
    // Create Gmail transport configuration
    const gmailConfig = {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: email,
        pass: password
      },
      tls: {
        rejectUnauthorized: false
      }
    };
    
    console.log('Gmail configuration:', {
      host: gmailConfig.host,
      port: gmailConfig.port,
      secure: gmailConfig.secure,
      user: email,
      hasPassword: !!password
    });
    
    // Create transporter
    const transporter = nodemailer.createTransport(gmailConfig);
    
    // Verify connection
    console.log('Verifying connection...');
    await transporter.verify();
    console.log('✅ Connection verified successfully!');
    
    // Generate a temporary password for testing
    const tempPassword = Math.random().toString(36).slice(-8);
    
    // Create email message with the password
    const message = `
      <h2>Your RoomLink Password</h2>
      <p>You requested your password for your RoomLink account.</p>
      <p>Here is your temporary password:</p>
      <div style="margin: 20px 0; padding: 10px; background-color: #f8f9fa; border: 1px solid #ddd; border-radius: 5px; font-family: monospace; font-size: 18px; text-align: center;">
          ${tempPassword}
      </div>
      <p>Please use this password to log in to your account.</p>
      <p>We recommend changing your password after logging in for security reasons.</p>
      <p>If you didn't request this, please contact support immediately.</p>
    `;
    
    // Send test email
    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: `"RoomLink Support" <${email}>`,
      to: testEmail,
      subject: 'Your RoomLink Password',
      html: message
    });
    
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('\n=== CONFIGURATION WORKING ===');
    console.log('Your Gmail configuration is working correctly.');
    console.log('You can now use the forgot password feature in your application.');
    
    // If the password is different from the one in config.env, suggest updating it
    if (password !== process.env.EMAIL_PASSWORD) {
      console.log('\nIMPORTANT: Update your config.env file with the working password:');
      console.log(`EMAIL_PASSWORD=${password}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.code === 'EAUTH') {
      console.error('\nAuthentication failed. This usually means:');
      console.error('1. The password you provided is incorrect');
      console.error('2. You need to use an App Password instead of your regular Gmail password');
      console.error('\nTo create an App Password:');
      console.error('1. Go to your Google Account settings (https://myaccount.google.com/)');
      console.error('2. Enable 2-Step Verification if not already enabled');
      console.error('3. Go to "Security" > "2-Step Verification" > "App passwords"');
      console.error('4. Create a new app password for your application');
      console.error('5. Use this app password instead of your regular Gmail password');
    }
    
    if (error.code === 'ESOCKET') {
      console.error('\nConnection error. This usually means:');
      console.error('1. You have no internet connection');
      console.error('2. Gmail SMTP server is blocked by your network');
      console.error('3. There might be a temporary issue with Gmail servers');
    }
  } finally {
    rl.close();
  }
}

// Run the test
testGmailDirect();
