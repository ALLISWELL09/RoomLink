// Gmail Diagnostic Script
// This script tests different Gmail configurations to find one that works

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

async function testGmailConfigurations() {
  console.log('=== Gmail Authentication Diagnostic Tool ===');
  console.log('This tool will test different Gmail configurations to find one that works');
  console.log('');
  
  // Get email credentials from user
  const email = await prompt('Enter your Gmail address (default: ' + process.env.EMAIL_USERNAME + '): ') || process.env.EMAIL_USERNAME;
  const password = await prompt('Enter your Gmail password or App Password: ');
  const testEmail = await prompt('Enter an email address to send a test email to: ');
  
  console.log('\nTesting different Gmail configurations...');
  
  // Configuration options to try
  const configurations = [
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
      name: 'Gmail using service name',
      config: {
        service: 'gmail',
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
        authMethod: 'LOGIN',
        tls: { rejectUnauthorized: false }
      }
    }
  ];
  
  // Test each configuration
  for (const { name, config } of configurations) {
    console.log(`\nTesting configuration: ${name}`);
    console.log('Configuration:', {
      host: config.host || 'N/A',
      port: config.port || 'N/A',
      secure: config.secure !== undefined ? config.secure : 'N/A',
      service: config.service || 'N/A',
      authMethod: config.authMethod || 'DEFAULT'
    });
    
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
        subject: 'RoomLink Gmail Test',
        html: `
          <h2>Gmail Test Successful</h2>
          <p>This email confirms that your Gmail configuration is working correctly.</p>
          <p>Configuration used: ${name}</p>
          <p>Time sent: ${new Date().toLocaleString()}</p>
        `
      });
      
      console.log('✅ Email sent successfully!');
      console.log('Message ID:', info.messageId);
      console.log('\n=== WORKING CONFIGURATION FOUND ===');
      console.log('Please update your config.env file with the following settings:');
      console.log(`
EMAIL_HOST=${config.host || 'smtp.gmail.com'}
EMAIL_PORT=${config.port || (config.service ? '587' : '587')}
EMAIL_SECURE=${config.secure === true ? 'true' : 'false'}
EMAIL_USERNAME=${email}
EMAIL_PASSWORD=your_password_here
${config.service ? `EMAIL_SERVICE=${config.service}` : '# No service specified, using host/port instead'}
${config.authMethod ? `EMAIL_AUTH_METHOD=${config.authMethod}` : '# Using default auth method'}
      `);
      
      // Exit the loop if a working configuration is found
      break;
    } catch (error) {
      console.log('❌ Configuration failed with error:');
      console.log('Error code:', error.code || 'N/A');
      console.log('Error message:', error.message);
      
      if (error.code === 'EAUTH') {
        console.log('Authentication error. Check your credentials.');
        if (email.endsWith('@gmail.com')) {
          console.log('For Gmail with 2FA, you need to use an App Password.');
          console.log('Go to: https://myaccount.google.com/apppasswords');
          console.log('For Gmail without 2FA, you need to enable "Less secure app access".');
          console.log('Go to: https://myaccount.google.com/lesssecureapps');
        }
      }
      
      console.log('Trying next configuration...');
    }
  }
  
  rl.close();
}

// Run the test
testGmailConfigurations();
