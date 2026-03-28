// DNS Configuration - Ensures IPv4 connectivity
const dns = require('node:dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['1.1.1.1', '8.8.8.8']);

const mongoose = require('mongoose');
const readline = require('readline');
const Service = require('../models/Service');
const Project = require('../models/Project');
const Photo = require('../models/Photo');
const Contact = require('../models/Contact');
const Company = require('../models/Company');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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

async function dropCollection(collection, name) {
  try {
    const result = await collection.deleteMany({});
    log(colors.green, `   ✅ Deleted ${result.deletedCount} documents from ${name}`);
    return result.deletedCount;
  } catch (error) {
    log(colors.red, `   ❌ Error deleting ${name}: ${error.message}`);
    return 0;
  }
}

async function dropServices() {
  log(colors.cyan, '\n📦 Dropping Services...');
  return await dropCollection(Service, 'Services');
}

async function dropProjects() {
  log(colors.cyan, '\n📁 Dropping Projects...');
  return await dropCollection(Project, 'Projects');
}

async function dropPhotos() {
  log(colors.cyan, '\n🖼️  Dropping Photos...');
  return await dropCollection(Photo, 'Photos');
}

async function dropContacts() {
  log(colors.cyan, '\n📧 Dropping Contacts...');
  return await dropCollection(Contact, 'Contacts');
}

async function dropCompany() {
  log(colors.cyan, '\n🏢 Dropping Company Settings...');
  return await dropCollection(Company, 'Company');
}

async function dropAll() {
  log(colors.yellow, '\n⚠️  DROPPING ALL DATA!');
  log(colors.yellow, '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const results = {
    services: await dropServices(),
    projects: await dropProjects(),
    photos: await dropPhotos(),
    contacts: await dropContacts(),
    company: await dropCompany()
  };
  
  log(colors.green, '\n✅ All collections cleared!');
  return results;
}

async function showMenu() {
  console.clear();
  log(colors.bright + colors.cyan, '╔═══════════════════════════════════════════════════════════╗');
  log(colors.bright + colors.cyan, '║                 DATABASE MANAGEMENT TOOL                    ║');
  log(colors.bright + colors.cyan, '╚═══════════════════════════════════════════════════════════╝');
  log(colors.yellow, '\nSelect an option to drop:');
  log(colors.green, '  1. Services only');
  log(colors.green, '  2. Projects only');
  log(colors.green, '  3. Photos only');
  log(colors.green, '  4. Contacts only');
  log(colors.green, '  5. Company settings only');
  log(colors.green, '  6. ALL DATA (Services, Projects, Photos, Contacts, Company)');
  log(colors.red, '  0. Cancel / Exit');
  log(colors.yellow, '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  rl.question('\nEnter your choice (0-6): ', async (answer) => {
    const choice = parseInt(answer);
    
    switch(choice) {
      case 1:
        await dropServices();
        break;
      case 2:
        await dropProjects();
        break;
      case 3:
        await dropPhotos();
        break;
      case 4:
        await dropContacts();
        break;
      case 5:
        await dropCompany();
        break;
      case 6:
        log(colors.red, '\n⚠️  WARNING: This will delete ALL data!');
        rl.question('Type "CONFIRM" to proceed: ', async (confirm) => {
          if (confirm === 'CONFIRM') {
            await dropAll();
          } else {
            log(colors.yellow, '❌ Operation cancelled');
          }
          await cleanup();
        });
        return;
      case 0:
        log(colors.yellow, '❌ Operation cancelled');
        await cleanup();
        return;
      default:
        log(colors.red, '❌ Invalid choice. Please try again.');
        await showMenu();
        return;
    }
    
    log(colors.green, '\n✅ Operation completed successfully!');
    await cleanup();
  });
}

async function cleanup() {
  await mongoose.disconnect();
  log(colors.cyan, '\n👋 Disconnected from MongoDB');
  rl.close();
  process.exit(0);
}

async function main() {
  try {
    log(colors.cyan, '🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    log(colors.green, '✅ Connected to MongoDB\n');
    
    await showMenu();
    
  } catch (error) {
    log(colors.red, `❌ Error: ${error.message}`);
    await mongoose.disconnect();
    rl.close();
    process.exit(1);
  }
}

main();