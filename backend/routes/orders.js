const express = require('express');
const Order = require('../models/Order');
const Item = require('../models/Item');
const jwt = require('jsonwebtoken');

const router = express.Router();

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Customer reserves an item
router.post('/reserve', auth, async (req, res) => {
  if (req.user.role !== 'customer') return res.status(403).json({ message: 'Only customers can reserve' });

  try {
    const { item_id, quantity } = req.body;
    const item = await Item.findById(item_id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.quantity < quantity) return res.status(400).json({ message: 'Not enough quantity' });

    // Deduct quantity
    item.quantity -= quantity;
    if (item.quantity === 0) item.status = 'sold_out';
    await item.save();

    // Create order
    const order = new Order({
      customer_id: req.user.userId,
      item_id,
      quantity,
      totalPrice: quantity * item.discountedPrice,
      pickupCode: Math.floor(100000 + Math.random() * 900000).toString() // Generate random 6-digit code
    });

    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get customer's orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ customer_id: req.user.userId }).populate('item_id');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
