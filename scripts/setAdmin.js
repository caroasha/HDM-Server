// DNS Configuration - Ensures IPv4 connectivity
const dns = require('node:dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['1.1.1.1', '8.8.8.8']);

const mongoose = require('mongoose');
const readline = require('readline');
const Company = require('../models/Company');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

// Default WirMax Solutions data
const defaultCompanyData = {
  name: 'WirMax Solutions',
  tagline: 'Software and Web Development | Building Your Digital Presence',
  description: 'Professional software and web development company building your digital presence with cutting-edge technology and innovative solutions.',
  email: 'info@wirmaxsolutions.pxxl.click',
  phone: '0768784909',
  whatsapp: '+254768784909',
  facebook: 'https://facebook.com/WirMaxSolutions',
  twitter: '',
  instagram: '',
  linkedin: '',
  address: '',
  city: '',
  country: 'Kenya',
  primaryColor: '#0a5c8e',
  secondaryColor: '#1e3a5f',
  metaTitle: 'WirMax Solutions - Software & Web Development',
  metaDescription: 'Professional software and web development company building your digital presence with cutting-edge technology and innovative solutions.',
  metaKeywords: 'software development, web development, e-commerce, corporate websites, web applications'
};

async function updateEnvFile(email, password) {
  const envPath = path.join(__dirname, '..', '.env');
  const envExamplePath = path.join(__dirname, '..', '.env.example');
  
  // Check if .env exists, if not create from example
  if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
    log(colors.yellow, '📝 Creating .env from .env.example...');
    fs.copyFileSync(envExamplePath, envPath);
  }
  
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update or add ADMIN_EMAIL
    if (envContent.match(/^ADMIN_EMAIL=/m)) {
      envContent = envContent.replace(/^ADMIN_EMAIL=.*$/m, `ADMIN_EMAIL=${email}`);
    } else {
      envContent += `\nADMIN_EMAIL=${email}`;
    }
    
    // Update or add ADMIN_PASSWORD
    if (envContent.match(/^ADMIN_PASSWORD=/m)) {
      envContent = envContent.replace(/^ADMIN_PASSWORD=.*$/m, `ADMIN_PASSWORD=${password}`);
    } else {
      envContent += `\nADMIN_PASSWORD=${password}`;
    }
    
    fs.writeFileSync(envPath, envContent);
    log(colors.green, '✅ Updated .env file');
  } else {
    log(colors.yellow, '⚠️  .env file not found. Creating new one...');
    const envContent = `PORT=3000
NODE_ENV=production
MONGODB_URI=${process.env.MONGODB_URI || 'mongodb+srv://restomanager_admin:Hdm%402002@cluster0.i5j7cns.mongodb.net/WirMax?retryWrites=true&w=majority&appName=Cluster0'}
SESSION_SECRET=${process.env.SESSION_SECRET || 'wirmax-secret-key-2026'}
ADMIN_EMAIL=${email}
ADMIN_PASSWORD=${password}
APP_URL=https://www.wirmaxsolutions.pxxl.click`;
    fs.writeFileSync(envPath, envContent);
    log(colors.green, '✅ Created .env file');
  }
}

async function setCompanyData() {
  log(colors.cyan, '\n🏢 Setting up company information...');
  
  let company = await Company.findOne();
  
  if (company) {
    log(colors.yellow, 'Company already exists. Updating...');
    Object.assign(company, defaultCompanyData);
  } else {
    log(colors.green, 'Creating new company...');
    company = new Company(defaultCompanyData);
  }
  
  await company.save();
  log(colors.green, `✅ Company "${company.name}" saved successfully`);
  return company;
}

async function showAdminInfo(email, password) {
  log(colors.bright + colors.cyan, '\n╔═══════════════════════════════════════════════════════════╗');
  log(colors.bright + colors.cyan, '║                    ADMIN CREDENTIALS                        ║');
  log(colors.bright + colors.cyan, '╚═══════════════════════════════════════════════════════════╝');
  log(colors.yellow, '\n📧 Email:    ' + colors.green + email);
  log(colors.yellow, '🔑 Password: ' + colors.green + password);
  log(colors.yellow, '\n🌐 Login URL: ' + colors.blue + 'http://localhost:3000/admin/login');
  log(colors.yellow, '\n⚠️  IMPORTANT: Change these credentials after first login!');
}

async function main() {
  try {
    console.clear();
    log(colors.bright + colors.cyan, '╔═══════════════════════════════════════════════════════════╗');
    log(colors.bright + colors.cyan, '║              ADMIN SETUP & COMPANY CONFIG                 ║');
    log(colors.bright + colors.cyan, '╚═══════════════════════════════════════════════════════════╝');
    
    log(colors.cyan, '\n🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    log(colors.green, '✅ Connected to MongoDB\n');
    
    // Ask for admin email
    rl.question('Enter admin email (default: info@wirmaxsolutions.pxxl.click): ', async (email) => {
      const adminEmail = email.trim() || 'info@wirmaxsolutions.pxxl.click';
      
      // Ask for admin password
      rl.question('Enter admin password (default: Hdm@2002): ', async (password) => {
        const adminPassword = password.trim() || 'Hdm@2002';
        
        // Confirm
        log(colors.yellow, '\n📋 Summary:');
        log(colors.yellow, `   Email: ${adminEmail}`);
        log(colors.yellow, `   Password: ${'*'.repeat(adminPassword.length)}`);
        
        rl.question('\nProceed with these credentials? (y/n): ', async (confirm) => {
          if (confirm.toLowerCase() === 'y' || confirm.toLowerCase() === 'yes') {
            // Update .env file
            await updateEnvFile(adminEmail, adminPassword);
            
            // Set company data
            const company = await setCompanyData();
            
            // Display admin info
            await showAdminInfo(adminEmail, adminPassword);
            
            // Show company info
            log(colors.bright + colors.cyan, '\n╔═══════════════════════════════════════════════════════════╗');
            log(colors.bright + colors.cyan, '║                   COMPANY INFORMATION                    ║');
            log(colors.bright + colors.cyan, '╚═══════════════════════════════════════════════════════════╝');
            log(colors.yellow, `\n🏢 Name:     ${colors.green}${company.name}`);
            log(colors.yellow, `📧 Email:    ${colors.green}${company.email}`);
            log(colors.yellow, `📞 Phone:    ${colors.green}${company.phone}`);
            log(colors.yellow, `🎨 Primary:  ${colors.green}${company.primaryColor}`);
            log(colors.yellow, `🌐 Website:  ${colors.green}https://www.wirmaxsolutions.pxxl.click`);
            
            log(colors.green, '\n✅ Admin setup completed successfully!');
          } else {
            log(colors.yellow, '❌ Operation cancelled');
          }
          
          await mongoose.disconnect();
          log(colors.cyan, '\n👋 Disconnected from MongoDB');
          rl.close();
          process.exit(0);
        });
      });
    });
    
  } catch (error) {
    log(colors.red, `❌ Error: ${error.message}`);
    await mongoose.disconnect();
    rl.close();
    process.exit(1);
  }
}

main();