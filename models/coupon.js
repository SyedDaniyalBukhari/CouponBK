const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  // Title
  title: {
    type: String
  },
  
  // Description
  description: {
    type: String
  },
  
  // Code
  code: {
    type: String,
    unique: true
  },
  
  // Deep Link
  deepLink: {
    type: String,
    trim: true
  },
  
  // Meta Keywords
  metaKeywords: [{
    type: String,
    trim: true
  }],
  
  // Meta Descriptions
  metaDescription: {
    type: String,
    trim: true
  },
  
  // Discount Type
  discountType: {
    type: String
  },
  
  // Discount Value
  discountValue: {
    type: Number
  },
  
  // Start Date || End Date
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  
  // Featured || Exclusive || Verified
  isFeatured: {
    type: Boolean,
    default: false
  },
  isExclusive: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Expiry Soon
  isExpirySoon: {
    type: Boolean,
    default: false
  },
  
  // Store Name (need to show on FrontEnd) - Reference
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store'
  },
  store: {
    type: mongoose.Schema.ObjectId,
    ref: 'Store',
  },
  
  // Terms & Condition
  termsConditions: {
    type: String,
    trim: true
  },
  
  // Banner Image for Featured Coupons
  bannerImage: {
    type: String,
    trim: true
  },
  
  // Coupon Type for Display Titles
  couponType: {
    type: String,
    enum: ['regular', 'exclusive', 'verified', 'featured'],
    default: 'regular'
  },
  
  // Display Title based on type
  displayTitle: {
    type: String,
    trim: true
  },
  
  slug: {
    type: String,
    unique: true
  },
  
  imageUrl: {
    type: String
  },
  
  tags: [{
    type: String
  }],
  
  clickCount: {
    type: Number,
    default: 0
  },
  
  // Additional useful fields
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Priority for featured coupons
  priority: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});


const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;