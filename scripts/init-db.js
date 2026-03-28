const mongoose = require('mongoose');
const Service = require('../models/Service');
require('dotenv').config();

const services = [
    {
        title: 'Modern Web Development',
        description: 'Create responsive, modern websites using latest technologies like React, Node.js, and more.',
        icon: 'globe2',
        order: 1
    },
    {
        title: 'Mobile Applications',
        description: 'Native and cross-platform mobile apps for iOS and Android using React Native and Flutter.',
        icon: 'phone',
        order: 2
    },
    {
        title: 'Desktop Applications',
        description: 'Powerful desktop applications using Electron, .NET, and Java.',
        icon: 'pc-display',
        order: 3
    },
    {
        title: 'Server Configuration',
        description: 'Professional server setup, optimization, and security configuration.',
        icon: 'server',
        order: 4
    },
    {
        title: 'Maintenance & Upgrades',
        description: 'Regular maintenance, security updates, and system upgrades for your applications.',
        icon: 'gear',
        order: 5
    },
    {
        title: 'IT Consulting',
        description: 'Expert advice on technology choices, architecture, and best practices.',
        icon: 'people',
        order: 6
    }
];

async function initializeData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        
        // Clear existing services
        await Service.deleteMany({});
        console.log('Cleared existing services');
        
        // Insert new services
        await Service.insertMany(services);
        console.log('Added initial services');
        
        console.log('Database initialization complete');
        process.exit(0);
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
}

initializeData();