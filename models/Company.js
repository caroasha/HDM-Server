const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  // Company Info
  name: { type: String, default: 'WirMax Solutions' },
  tagline: { type: String, default: 'Software and Web Development | Building Your Digital Presence' },
  description: { type: String, default: 'Professional software and web development company building your digital presence with cutting-edge technology and innovative solutions.' },
  
  // Contact Info
  email: { type: String, default: 'info@wirmaxsolutions.pxxl.click' },
  phone: { type: String, default: '0768784909' },
  whatsapp: { type: String, default: '+254768784909' },
  
  // Social Media
  facebook: { type: String, default: 'https://facebook.com/WirMaxSolutions' },
  twitter: { type: String, default: '' },
  instagram: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  
  // Address
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  country: { type: String, default: 'Kenya' },
  
  // Branding
  logo: { type: String, default: '' },
  favicon: { type: String, default: '' },
  primaryColor: { type: String, default: '#0a5c8e' },
  secondaryColor: { type: String, default: '#1e3a5f' },
  
  // SEO
  metaTitle: { type: String, default: 'WirMax Solutions - Software & Web Development' },
  metaDescription: { type: String, default: 'Professional software and web development company building your digital presence' },
  metaKeywords: { type: String, default: 'software development, web development, e-commerce, corporate websites' },
  
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Company', companySchema);