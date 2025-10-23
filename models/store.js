const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  // 1. Store Name (Already exists)
  name: {
    type: String,
    required: true
  },
  
  // 2. Store Title (MISSING - ADDED)
  storeTitle: {
    type: String,
    required: true,
    trim: true
  },
  
  // 3. Store Deal Info (MISSING - ADDED)
  dealInfo: {
    type: String,
    trim: true
  },
  
  // 4. Store Description / Store About (Already exists as description)
  description: {
    type: String
  },
  storeAbout: {
    type: String,
    trim: true
  },
  
  // 5. Slug || SEO URL (Already exists)
  slug: {
    type: String,
    required: true,
    unique: true
  },
  
  // 6. Web URL (Already exists as websiteUrl)
  websiteUrl: {
    type: String
  },
  
  // 7. Affiliate URL (MISSING - ADDED)
  affiliateUrl: {
    type: String,
    trim: true
  },
  
  // 8. Category (Already exists)
  category: {
  type:String
  },
  
  // 9. Image || Logo (Already exists as logoUrl)
  logoUrl: {
    type: String
  },
  
  
  // 10. Meta Title (MISSING - ADDED)
  metaTitle: {
    type: String,
    trim: true
  },
  
  // 11. Meta Description (MISSING - ADDED)
  metaDescription: {
    type: String,
    trim: true
  },
  
  // 12. Meta Keywords (MISSING - ADDED)
  metaKeywords: [{
    type: String,
    trim: true
  }],
  
  // 13. Network Name (MISSING - ADDED)
  networkName: {
    type: String,
    trim: true
  },
  
  // 14. FAQ (MISSING - ADDED)
  faq: [{
    question: {
      type: String,
      required: true,
      trim: true
    },
    answer: {
      type: String,
      required: true,
      trim: true
    }
  }],
  
  // Additional useful fields
  isActive: {
    type: Boolean,
    default: true
  },
  
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  clickCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});



const Store = mongoose.model('Store', storeSchema);

module.exports = Store;