// db.js

const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env file

// MongoDB connection function
const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_DB;
  
  if (!uri) {
    console.error('MongoDB connection error: MONGO_DB environment variable is not set');
    process.exit(1);
  }
  
  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    console.error('MongoDB connection error: Invalid MONGO_DB format. Expected connection string starting with mongodb:// or mongodb+srv://');
    console.error('Current MONGO_DB value appears to be:', uri.substring(0, 50));
    process.exit(1);
  }
  
  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit the process with failure if the connection fails
  }
};

module.exports = connectDB;
