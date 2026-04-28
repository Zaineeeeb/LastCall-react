const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  merchant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  originalPrice: { type: Number, required: true },
  discountedPrice: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
  collectionTime: { type: String, required: true }, // e.g., "18:00 - 20:00"
  imageUrl: { type: String }, // optional, for real photos
  status: { type: String, enum: ['available', 'sold_out'], default: 'available' }
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);
