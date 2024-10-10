const express = require("express");
const app = express();
const cors = require('cors');
const cookieParser = require("cookie-parser");
const errorMiddleware = require("./middleware/error");

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:5173',  // Frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow all relevant HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(cookieParser());

// Route Imports
const user = require("./routes/userRoutes");
app.use("/api/v1", user);

// Middleware for Errors
app.use(errorMiddleware);

module.exports = app;
