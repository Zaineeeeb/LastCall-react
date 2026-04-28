const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  item_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  quantity: { type: Number, required: true, default: 1 },
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ['reserved', 'collected', 'cancelled'], default: 'reserved' },
  pickupCode: { type: String, required: true } // simple verification code
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
