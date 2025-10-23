

const Coupon = require('../../models/coupon');
const Store = require('../../models/store');
const Category = require('../../models/category');

exports.getCoupons = async (req, res) => {
  try {
    const { category, sort, store, search, featured, discountType } = req.query;
    console.log('Category filter:', category);
  
    const filter = {
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    };

   
    if (category) {
      const categoryDoc = await Category.findOne({ slug: category });
      console.log('Found category:', categoryDoc);
      
      if (categoryDoc) {
        
        const storesInCategory = await Store.find({ category: categoryDoc._id });
        console.log('Stores in category:', storesInCategory.map(s => s._id));
        
       
        filter['store'] = { $in: storesInCategory.map(s => s._id) };
      }
    }

 
    if (store) {
      const storeDoc = await Store.findOne({ slug: store });
      if (storeDoc) {
        
        filter['store'] = storeDoc._id;
      }
    }

    
    if (search) {
      filter['$or'] = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    
    if (featured === 'true') {
      filter['isFeatured'] = true;
    }

    if (discountType && ['percentage', 'flat'].includes(discountType)) {
      filter['discountType'] = discountType;
    }

   
    let sortOption = { createdAt: -1 }; 
    
    switch (sort) {
      case 'latest':
        sortOption = { createdAt: -1 };
        break;
      case 'expiring':
        sortOption = { endDate: 1 }; 
        break;
      case 'popular':
        sortOption = { clickCount: -1 };
        break;
      case 'discount-high':
        sortOption = { discountValue: -1 };
        break;
      case 'discount-low':
        sortOption = { discountValue: 1 };
        break;
    }

    console.log('Final filter:', JSON.stringify(filter, null, 2));

    const coupons = await Coupon.find(filter)
      .populate({
        path: 'store', 
        select: 'name logoUrl slug category',
        populate: {
          path: 'category',
          select: 'name slug'
        }
      })
      .sort(sortOption);

    console.log('Found coupons:', coupons.length);
    res.json(coupons);
    
  } catch (error) {
    console.error('Coupon fetch error:', error);
    res.status(500).json({
      message: 'Error fetching coupons',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getCouponBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const coupon = await Coupon.findOne({ slug })
      .populate('storeId', 'name logoUrl slug websiteUrl')
      .populate('createdBy', 'name');
    
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    
    res.json(coupon);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getStores = async (req, res) => {
  try {
    const stores = await Store.find()
      .sort({ name: 1 });
    
    res.json(stores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getStoreBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const store = await Store.findOne({ slug });
    
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }
    
 
    const coupons = await Coupon.find({
      storeId: store._id,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    }).sort({ isFeatured: -1, createdAt: -1 });
    
    res.json({
      store,
      coupons
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.trackCouponClick = async (req, res) => {
  try {
    const { id } = req.params;
    
    
    const coupon = await Coupon.findByIdAndUpdate(
      id,
      { $inc: { clickCount: 1 } },
      { new: true }
    );
    
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};