const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const Project = require('../models/Project');
const Photo = require('../models/Photo');
const Contact = require('../models/Contact');
const Company = require('../models/Company');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📁 Created uploads directory');
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    console.log('✅ Authenticated user:', req.session.user.username);
    return next();
  }
  console.log('❌ Unauthenticated access attempt');
  res.redirect('/admin/login');
};

// Redirect root admin to login
router.get('/', (req, res) => {
  res.redirect('/admin/login');
});

// Admin login page
router.get('/login', (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect('/admin/dashboard');
  }
  res.render('login', { 
    error: null,
    user: null 
  });
});

// Login handler using environment variables
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  console.log('🔐 Login attempt:', username);
  
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (!adminEmail || !adminPassword) {
    console.error('❌ ADMIN_EMAIL or ADMIN_PASSWORD not set in environment');
    return res.render('login', { 
      error: 'Server configuration error. Please contact administrator.',
      user: null 
    });
  }
  
  if (username === adminEmail && password === adminPassword) {
    console.log('✅ Login successful');
    
    req.session.user = { 
      username: username,
      email: username,
      isAdmin: true,
      loggedInAt: new Date().toISOString()
    };
    
    req.session.save((err) => {
      if (err) {
        console.error('❌ Session save error:', err);
        return res.render('login', { 
          error: 'Session error. Please try again.',
          user: null 
        });
      }
      res.redirect('/admin/dashboard');
    });
  } else {
    console.log('❌ Login failed');
    res.render('login', { 
      error: 'Invalid email or password',
      user: null 
    });
  }
});

// Admin logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/admin/login');
  });
});

// Test route
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Admin routes are working',
    session: req.session.user ? 'Active' : 'Inactive',
    sessionId: req.session.id
  });
});

// Admin dashboard
router.get('/dashboard', isAuthenticated, async (req, res) => {
  try {
    console.log('📊 Dashboard accessed');
    
    const services = await Service.find().sort('order').lean();
    const projects = await Project.find().sort('-createdAt').lean();
    const photos = await Photo.find().sort('-createdAt').lean();
    const contacts = await Contact.find().sort('-createdAt').limit(10).lean();
    
    res.render('admin', {
      services: services || [],
      projects: projects || [],
      photos: photos || [],
      contacts: contacts || [],
      activeTab: req.query.tab || 'dashboard',
      user: req.session.user,
      error: req.query.error || null,
      success: req.query.success || null
    });
  } catch (error) {
    console.error('❌ Dashboard error:', error);
    res.status(500).send('Database error: ' + error.message);
  }
});

// ==================== COMPANY SETTINGS ROUTES ====================

// Get company settings
router.get('/company', isAuthenticated, async (req, res) => {
  try {
    let company = await Company.findOne();
    if (!company) {
      company = await Company.create({});
    }
    
    res.render('admin-company', {
      company,
      user: req.session.user,
      success: req.query.success || null,
      error: req.query.error || null
    });
  } catch (error) {
    console.error('❌ Error loading company settings:', error);
    res.redirect('/admin/dashboard?tab=company&error=' + encodeURIComponent(error.message));
  }
});

// Update company settings
router.put('/company', isAuthenticated, async (req, res) => {
  try {
    const {
      name, tagline, description,
      email, phone, whatsapp,
      facebook, twitter, instagram, linkedin,
      address, city, country,
      primaryColor, secondaryColor,
      metaTitle, metaDescription, metaKeywords
    } = req.body;
    
    let company = await Company.findOne();
    if (!company) {
      company = new Company();
    }
    
    company.name = name || company.name;
    company.tagline = tagline || company.tagline;
    company.description = description || company.description;
    company.email = email || company.email;
    company.phone = phone || company.phone;
    company.whatsapp = whatsapp || company.whatsapp;
    company.facebook = facebook || company.facebook;
    company.twitter = twitter || company.twitter;
    company.instagram = instagram || company.instagram;
    company.linkedin = linkedin || company.linkedin;
    company.address = address || company.address;
    company.city = city || company.city;
    company.country = country || company.country;
    company.primaryColor = primaryColor || company.primaryColor;
    company.secondaryColor = secondaryColor || company.secondaryColor;
    company.metaTitle = metaTitle || company.metaTitle;
    company.metaDescription = metaDescription || company.metaDescription;
    company.metaKeywords = metaKeywords || company.metaKeywords;
    company.updatedAt = new Date();
    
    await company.save();
    
    res.redirect('/admin/company?success=Company settings updated successfully');
  } catch (error) {
    console.error('❌ Error updating company settings:', error);
    res.redirect('/admin/company?error=' + encodeURIComponent(error.message));
  }
});

// Upload company logo
router.post('/company/logo', isAuthenticated, upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.redirect('/admin/company?error=Please select an image');
    }
    
    let company = await Company.findOne();
    if (!company) {
      company = new Company();
    }
    
    // Delete old logo if exists
    if (company.logo) {
      const oldLogoPath = path.join(__dirname, '../public', company.logo);
      if (fs.existsSync(oldLogoPath)) {
        fs.unlinkSync(oldLogoPath);
      }
    }
    
    company.logo = '/uploads/' + req.file.filename;
    await company.save();
    
    res.redirect('/admin/company?success=Logo uploaded successfully');
  } catch (error) {
    console.error('❌ Error uploading logo:', error);
    res.redirect('/admin/company?error=' + encodeURIComponent(error.message));
  }
});

// ==================== SERVICE ROUTES ====================

// Create service
router.post('/services', isAuthenticated, async (req, res) => {
  try {
    const { title, description, icon } = req.body;
    
    if (!title || !description) {
      return res.redirect('/admin/dashboard?tab=services&error=Title and description are required');
    }
    
    await Service.create({
      title,
      description,
      icon: icon || 'code',
      order: await Service.countDocuments()
    });
    
    res.redirect('/admin/dashboard?tab=services&success=Service added successfully');
  } catch (error) {
    console.error('❌ Error adding service:', error);
    res.redirect('/admin/dashboard?tab=services&error=' + encodeURIComponent(error.message));
  }
});

// Update service
router.put('/services/:id', isAuthenticated, async (req, res) => {
  try {
    const { title, description, icon } = req.body;
    
    if (!title || !description) {
      return res.redirect('/admin/dashboard?tab=services&error=Title and description are required');
    }
    
    await Service.findByIdAndUpdate(req.params.id, {
      title,
      description,
      icon: icon || 'code'
    });
    
    res.redirect('/admin/dashboard?tab=services&success=Service updated successfully');
  } catch (error) {
    console.error('❌ Error updating service:', error);
    res.redirect('/admin/dashboard?tab=services&error=' + encodeURIComponent(error.message));
  }
});

// Delete service
router.delete('/services/:id', isAuthenticated, async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.redirect('/admin/dashboard?tab=services&success=Service deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting service:', error);
    res.redirect('/admin/dashboard?tab=services&error=' + encodeURIComponent(error.message));
  }
});

// ==================== PROJECT ROUTES ====================

// Create project
router.post('/projects', isAuthenticated, upload.single('image'), async (req, res) => {
  try {
    const { name, description, link, technologies } = req.body;
    
    if (!name || !description) {
      return res.redirect('/admin/dashboard?tab=projects&error=Name and description are required');
    }
    
    const projectData = {
      name,
      description,
      link: link || '',
      technologies: technologies ? technologies.split(',').map(t => t.trim()) : [],
      featured: req.body.featured === 'on'
    };
    
    if (req.file) {
      projectData.image = '/uploads/' + req.file.filename;
    }
    
    await Project.create(projectData);
    res.redirect('/admin/dashboard?tab=projects&success=Project added successfully');
  } catch (error) {
    console.error('❌ Error adding project:', error);
    res.redirect('/admin/dashboard?tab=projects&error=' + encodeURIComponent(error.message));
  }
});

// Update project
router.put('/projects/:id', isAuthenticated, upload.single('image'), async (req, res) => {
  try {
    const { name, description, link, technologies } = req.body;
    
    if (!name || !description) {
      return res.redirect('/admin/dashboard?tab=projects&error=Name and description are required');
    }
    
    const projectData = {
      name,
      description,
      link: link || '',
      technologies: technologies ? technologies.split(',').map(t => t.trim()) : [],
      featured: req.body.featured === 'on'
    };
    
    if (req.file) {
      const oldProject = await Project.findById(req.params.id);
      if (oldProject && oldProject.image) {
        const oldImagePath = path.join(__dirname, '../public', oldProject.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      projectData.image = '/uploads/' + req.file.filename;
    }
    
    await Project.findByIdAndUpdate(req.params.id, projectData);
    res.redirect('/admin/dashboard?tab=projects&success=Project updated successfully');
  } catch (error) {
    console.error('❌ Error updating project:', error);
    res.redirect('/admin/dashboard?tab=projects&error=' + encodeURIComponent(error.message));
  }
});

// Delete project
router.delete('/projects/:id', isAuthenticated, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (project && project.image) {
      const imagePath = path.join(__dirname, '../public', project.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await Project.findByIdAndDelete(req.params.id);
    res.redirect('/admin/dashboard?tab=projects&success=Project deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting project:', error);
    res.redirect('/admin/dashboard?tab=projects&error=' + encodeURIComponent(error.message));
  }
});

// ==================== PHOTO ROUTES ====================

// Upload photo
router.post('/photos', isAuthenticated, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.redirect('/admin/dashboard?tab=photos&error=Please select a photo to upload');
    }
    
    await Photo.create({
      title: req.body.title || req.file.originalname,
      filename: req.file.filename,
      path: '/uploads/' + req.file.filename,
      category: req.body.category || 'general'
    });
    
    res.redirect('/admin/dashboard?tab=photos&success=Photo uploaded successfully');
  } catch (error) {
    console.error('❌ Error uploading photo:', error);
    res.redirect('/admin/dashboard?tab=photos&error=' + encodeURIComponent(error.message));
  }
});

// Delete photo
router.delete('/photos/:id', isAuthenticated, async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    
    if (photo) {
      const imagePath = path.join(__dirname, '../public', photo.path);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
      await Photo.findByIdAndDelete(req.params.id);
    }
    
    res.redirect('/admin/dashboard?tab=photos&success=Photo deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting photo:', error);
    res.redirect('/admin/dashboard?tab=photos&error=' + encodeURIComponent(error.message));
  }
});

module.exports = router;