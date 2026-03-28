// DNS Configuration - Ensures IPv4 connectivity
const dns = require('node:dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['1.1.1.1', '8.8.8.8']);

const mongoose = require('mongoose');
const Service = require('../models/Service');
const Project = require('../models/Project');
const Company = require('../models/Company');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Color codes for console output
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

const servicesData = [
  {
    title: 'E-commerce Sites',
    description: 'Professional online stores with secure payment integration, shopping carts, and inventory management systems. Perfect for businesses looking to sell products online.',
    icon: 'cart',
    order: 1
  },
  {
    title: 'Corporate Websites',
    description: 'Professional business websites that establish your company\'s online presence. Includes company profile, services, team, and contact information.',
    icon: 'building',
    order: 2
  },
  {
    title: 'Portfolios & Blogs',
    description: 'Beautiful portfolio websites to showcase your work and blogs to share your expertise with the world. Perfect for creatives and professionals.',
    icon: 'person',
    order: 3
  },
  {
    title: 'Web Applications',
    description: 'Custom web applications tailored to your business needs. From dashboards to complex business systems, we build it all.',
    icon: 'window',
    order: 4
  },
  {
    title: 'Booking Systems',
    description: 'Online appointment and reservation systems for businesses. Let your customers book services 24/7 with automated scheduling.',
    icon: 'calendar-check',
    order: 5
  },
  {
    title: 'Custom Solutions',
    description: 'Tailored software solutions designed specifically for your unique requirements. No project is too complex for our team.',
    icon: 'gear',
    order: 6
  }
];

const companyData = {
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

async function seedDatabase() {
  try {
    log(colors.cyan, '\n🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    log(colors.green, '✅ Connected to MongoDB\n');

    // ==================== SEED SERVICES ====================
    log(colors.cyan, '📦 Seeding Services...');
    
    const deletedServices = await Service.deleteMany({});
    log(colors.yellow, `🗑️  Deleted ${deletedServices.deletedCount} existing services`);
    
    const insertedServices = await Service.insertMany(servicesData);
    log(colors.green, `✅ Added ${insertedServices.length} services:`);
    insertedServices.forEach((service, index) => {
      log(colors.green, `   ${index + 1}. ${service.title} (bi-${service.icon})`);
    });
    console.log();

    // ==================== SEED COMPANY INFO ====================
    log(colors.cyan, '🏢 Setting up Company Information...');
    
    let company = await Company.findOne();
    if (company) {
      Object.assign(company, companyData);
      await company.save();
      log(colors.green, '✅ Updated existing company information');
    } else {
      company = await Company.create(companyData);
      log(colors.green, '✅ Created new company information');
    }
    
    log(colors.green, `   Name: ${company.name}`);
    log(colors.green, `   Tagline: ${company.tagline}`);
    log(colors.green, `   Email: ${company.email}`);
    log(colors.green, `   Phone: ${company.phone}`);
    console.log();

    // ==================== SUMMARY ====================
    log(colors.bright + colors.cyan, '\n╔═══════════════════════════════════════════════════════════╗');
    log(colors.bright + colors.cyan, '║                    SEED COMPLETE!                         ║');
    log(colors.bright + colors.cyan, '╠═══════════════════════════════════════════════════════════╣');
    log(colors.bright + colors.cyan, `║ Services Seeded:    ${insertedServices.length}                                          ║`);
    log(colors.bright + colors.cyan, `║ Company Info:       ${company.name.substring(0, 20)}...                         ║`);
    log(colors.bright + colors.cyan, '╠═══════════════════════════════════════════════════════════╣');
    log(colors.bright + colors.cyan, '║ Login Credentials:                                        ║');
    log(colors.bright + colors.cyan, `║ Email:    ${process.env.ADMIN_EMAIL || 'info@wirmaxsolutions.pxxl.click'}   ║`);
    log(colors.bright + colors.cyan, `║ Password: ${process.env.ADMIN_PASSWORD || 'Hdm@2002'}                                    ║`);
    log(colors.bright + colors.cyan, '╚═══════════════════════════════════════════════════════════╝');
    console.log();

    log(colors.green, '✨ Database seeding completed successfully!');
    await mongoose.disconnect();
    log(colors.cyan, '👋 Disconnected from MongoDB');
    process.exit(0);
    
  } catch (error) {
    log(colors.red, `❌ Error seeding database: ${error.message}`);
    console.error(error.stack);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedDatabase();