require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const connectDB = require('./db');
const cors = require('cors');
const path = require('path');
const blogsRoutes = require('./enpoints/blogs'); // Import the blogs routes
const jobsRoutes = require('./enpoints/jobs'); // Import the jobs routes
const worksRoutes = require('./enpoints/works'); // Import the works routes
const teamRoutes = require('./enpoints/team'); // Import the team routes
const servicesRoutes = require('./enpoints/services'); // Import the services routes
const formsRoutes = require('./enpoints/forms');

// Initialize express
const app = express();
app.use(cors());

// Serve static files from the 'images' directory
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(express.json());

// Connect to MongoDB
connectDB(); // Call the connection function

// Use the blogs routes
app.use('/', blogsRoutes);

// Use the jobs routes
app.use('/', jobsRoutes);

// Use the works routes
app.use('/', worksRoutes);

// Use the team routes
app.use('/', teamRoutes);

// Use the services routes
app.use('/', servicesRoutes);

// Use the forms routes
app.use('/', formsRoutes);

// Start the server
const PORT = process.env.SERVER_PORT || 5000;
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});