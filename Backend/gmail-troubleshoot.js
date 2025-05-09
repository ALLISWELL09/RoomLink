// Gmail Troubleshooting Script
// This script tests different Gmail configurations to find one that works
// It provides detailed error reporting to help identify issues

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import fs from 'fs';

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

// Function to save working configuration to config.env
const saveConfigToEnv = (config) => {
  try {
    const configPath = path.join(__dirname, 'config', 'config.env');
    let configContent = fs.readFileSync(configPath, 'utf8');
    
    // Update EMAIL_HOST
    configContent = configContent.replace(/EMAIL_HOST=.*/g, `EMAIL_HOST=${config.host || 'smtp.gmail.com'}`);
    
    // Update EMAIL_PORT
    configContent = configContent.replace(/EMAIL_PORT=.*/g, `EMAIL_PORT=${config.port || 587}`);
    
    // Update EMAIL_SECURE
    configContent = configContent.replace(/EMAIL_SECURE=.*/g, `EMAIL_SECURE=${config.secure === true ? 'true' : 'false'}`);
    
    // Update EMAIL_PASSWORD if provided
    if (config.auth && config.auth.pass) {
      configContent = configContent.replace(/EMAIL_PASSWORD=.*/g, `EMAIL_PASSWORD=${config.auth.pass}`);
    }
    
    // Write updated content back to file
    fs.writeFileSync(configPath, configContent);
    console.log('✅ Configuration saved to config.env');
  } catch (error) {
    console.error('Error saving configuration:', error.message);
  }
};

async function troubleshootGmail() {
  console.log('=== Gmail Troubleshooting Tool ===');
  console.log('This script will test different Gmail configurations to find one that works');
  console.log('');
  
  // Get email credentials from user
  const email = await prompt('Enter your Gmail address (default: ' + process.env.EMAIL_USERNAME + '): ') || process.env.EMAIL_USERNAME;
  const password = await prompt('Enter your Gmail password or App Password: ');
  const testEmail = await prompt('Enter an email address to send a test email to: ');
  
  if (!email || !password || !testEmail) {
    console.error('Error: Email, password, and test email are required');
    rl.close();
    return;
  }
  
  console.log('\nTesting different Gmail configurations...');
  
  // Configuration options to try
  const configurations = [
    {
      name: 'Gmail Service (Recommended)',
      config: {
        service: 'gmail',
        auth: { user: email, pass: password },
        debug: true,
        logger: true
      }
    },
    {
      name: 'Gmail with TLS (Port 587)',
      config: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: { user: email, pass: password },
        tls: { rejectUnauthorized: false }
      }
    },
    {
      name: 'Gmail with SSL (Port 465)',
      config: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user: email, pass: password }
      }
    },
    {
      name: 'Gmail with OAuth2 emulation',
      config: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: { user: email, pass: password },
        authMethod: 'LOGIN'
      }
    }
  ];
  
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
    <p>Time sent: ${new Date().toLocaleString()}</p>
  `;
  
  // Test each configuration
  let success = false;
  let workingConfig = null;
  
  for (const { name, config } of configurations) {
    console.log(`\nTrying configuration: ${name}`);
    console.log('Configuration details:', JSON.stringify(config, null, 2));
    
    try {
      // Create transporter
      const transporter = nodemailer.createTransport(config);
      
      // Verify connection
      console.log('Verifying connection...');
      await transporter.verify();
      console.log('✅ Connection verified successfully!');
      
      // Try sending a test email
      console.log('Sending test email...');
      const info = await transporter.sendMail({
        from: `"RoomLink Support" <${email}>`,
        to: testEmail,
        subject: 'Your RoomLink Password',
        html: message
      });
      
      console.log('✅ Email sent successfully!');
      console.log('Message ID:', info.messageId);
      console.log('Response:', info.response);
      
      success = true;
      workingConfig = config;
      
      console.log('\n=== WORKING CONFIGURATION FOUND ===');
      console.log(`Configuration "${name}" works correctly.`);
      
      // Ask if user wants to save this configuration
      const saveConfig = await prompt('Do you want to save this configuration to config.env? (y/n): ');
      if (saveConfig.toLowerCase() === 'y' || saveConfig.toLowerCase() === 'yes') {
        saveConfigToEnv(config);
      }
      
      // Ask if user wants to try other configurations
      const continueTest = await prompt('Do you want to try other configurations? (y/n): ');
      if (continueTest.toLowerCase() !== 'y' && continueTest.toLowerCase() !== 'yes') {
        break;
      }
    } catch (error) {
      console.error('❌ Error with configuration:', error.message);
      
      // Provide more detailed error information
      if (error.code === 'EAUTH') {
        console.error('Authentication failed. This usually means:');
        console.error('1. The password you provided is incorrect');
        console.error('2. You need to use an App Password instead of your regular Gmail password');
        console.error('3. "Less secure app access" is disabled (though this is being phased out by Google)');
      } else if (error.code === 'ESOCKET') {
        console.error('Socket connection error. This usually means:');
        console.error('1. You have no internet connection');
        console.error('2. The email server is blocking your connection');
        console.error('3. Your firewall or antivirus is blocking the connection');
      } else if (error.code === 'ETIMEDOUT') {
        console.error('Connection timed out. This usually means:');
        console.error('1. The email server is taking too long to respond');
        console.error('2. Your internet connection is unstable');
      }
      
      console.error('Full error object:', error);
    }
  }
  
  if (!success) {
    console.log('\n❌ None of the configurations worked.');
    console.log('Please check the following:');
    console.log('1. Make sure you\'re using the correct Gmail address');
    console.log('2. If you have 2-Step Verification enabled, you must use an App Password');
    console.log('3. Check your internet connection');
    console.log('4. Make sure Gmail is not blocking the connection (check your Gmail security settings)');
  } else if (workingConfig) {
    console.log('\n✅ At least one configuration worked successfully!');
    console.log('You can now use the forgot password feature in your application.');
  }
  
  rl.close();
}

// Run the troubleshooting tool
troubleshootGmail();
