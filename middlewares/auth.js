const Admin = require('../models/admin');
const jwt = require('jsonwebtoken');

exports.adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    // Debug logs
    console.log('Raw Authorization header:', authHeader);
    
    if (!authHeader) {
      return res.status(401).json({ message: 'No authorization header provided' });
    }
    
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization header must start with "Bearer "' });
    }
    
    const token = authHeader.replace('Bearer ', '').trim();
    
    console.log('Extracted token:', token);
    console.log('Token length:', token.length);
    
    if (!token || token.length === 0) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    // Check if token has the basic JWT structure (3 parts separated by dots)
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.log('Token parts:', tokenParts.length);
      return res.status(401).json({ message: 'Malformed token - invalid JWT structure' });
    }
    
    // Verify JWT_SECRET exists
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not found in environment variables');
      return res.status(500).json({ message: 'Server configuration error' });
    }
    
    console.log('Attempting to verify token with secret');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully:', decoded);
    
    if (!decoded.adminId) {
      return res.status(401).json({ message: 'Token missing adminId' });
    }
    
    const admin = await Admin.findById(decoded.adminId);
    console.log('Admin found:', admin ? 'Yes' : 'No');
    
    if (!admin) {
      return res.status(401).json({ message: 'Admin not found - invalid token' });
    }
    
    // Attach admin info to request
    req.adminId = decoded.adminId;
    req.admin = admin;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    // Handle specific JWT errors
    if (error.name === 'JsonWebTokenError') {
      console.error('JWT Error details:', error.message);
      return res.status(401).json({ 
        message: 'Invalid token format',
        details: error.message
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    } else if (error.name === 'NotBeforeError') {
      return res.status(401).json({ message: 'Token not yet valid' });
    }
    
    // Generic error
    return res.status(401).json({ 
      message: 'Token validation failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};