const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/auth');
const itemRoutes = require('./routes/items');
const orderRoutes = require('./routes/orders');

app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/orders', orderRoutes);

// Database Connection
const connectDB = async () => {
  try {
    // Try to connect to localhost or provided URI first. 
    // Note: options like useNewUrlParser are removed as they are default in Mongoose 6+ and throw errors if passed.
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lastcall');
    console.log('MongoDB connection established successfully');
  } catch (err) {
    console.warn('Standard MongoDB connection failed: ', err.message);
    console.warn('Booting up an In-Memory Database for local development testing...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log(`In-Memory MongoDB connected successfully at ${mongoUri}`);
    } catch (memoryErr) {
      console.error('Failed to start In-Memory Database:', memoryErr.message);
    }
  }
};

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

app.get('/', (req, res) => {
  res.send('LastCall API is running...');
});
