const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const Project = require('../models/Project');
const Photo = require('../models/Photo');
const Contact = require('../models/Contact');
const Company = require('../models/Company');

// Home page
router.get('/', async (req, res) => {
  try {
    const services = await Service.find().sort('order').lean();
    const projects = await Project.find().sort('-createdAt').lean();
    const photos = await Photo.find().sort('-createdAt').lean();
    let company = await Company.findOne();
    
    if (!company) {
      company = {
        name: 'WirMax Solutions',
        tagline: 'Software and Web Development | Building Your Digital Presence',
        description: 'Professional software and web development company building your digital presence.',
        email: 'info@wirmaxsolutions.pxxl.click',
        phone: '0768784909',
        whatsapp: '+254768784909',
        facebook: 'https://facebook.com/WirMaxSolutions',
        primaryColor: '#0a5c8e',
        secondaryColor: '#1e3a5f'
      };
    }
    
    res.render('index', {
      services,
      projects,
      photos,
      company,
      user: req.session.user || null
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Contact form submission
router.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    await Contact.create({ name, email, message });
    res.redirect('/?message=Message sent successfully');
  } catch (error) {
    console.error(error);
    res.redirect('/?error=Failed to send message');
  }
});

module.exports = router;