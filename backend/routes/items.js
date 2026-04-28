const express = require('express');
const Item = require('../models/Item');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

// Configure Multer for File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Appends file extension
  }
});

const upload = multer({ storage: storage });

const router = express.Router();

// Middleware to verify token
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Middleware to verify merchant
const isMerchant = (req, res, next) => {
  if (req.user.role !== 'merchant') return res.status(403).json({ message: 'Access denied' });
  next();
};

// Get all available items
router.get('/', async (req, res) => {
  try {
    const items = await Item.find({ status: 'available' }).populate('merchant_id', 'businessName address');
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Merchant adds an item
router.post('/', [auth, isMerchant, upload.single('image')], async (req, res) => {
  try {
    const newItem = new Item({
      ...req.body,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
      merchant_id: req.user.userId
    });
    const saved = await newItem.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating item:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get merchant's own items
router.get('/my-items', [auth, isMerchant], async (req, res) => {
  try {
    const items = await Item.find({ merchant_id: req.user.userId });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
