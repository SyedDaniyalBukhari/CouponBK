

const Admin = require('../../models/admin');
const Coupon = require('../../models/coupon');
const Store = require('../../models/store');
const { cloudinaryUpload } = require('../../utils/cloudinary');
const Category = require('../../models/category');
const fs=require('fs')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email })
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
   
    const isMatch = await bcrypt.compare(password, admin.passwordHash); 
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    

    admin.lastLogin = new Date();
    await admin.save();
    
   
    const token = jwt.sign(
      { adminId: admin._id, role: admin.role }, 
      process.env.JWT_SECRET
    );
    
 
 return res.json({ 
      token, 
      admin: { 
        id: admin._id, 
        email: admin.email, 
        name: admin.name,
        role: admin.role,
        lastLogin: admin.lastLogin
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.register = async (req, res) => {
  let { password, ...rest } = req.body;

  try {
    let passwordHash = await bcrypt.hash(password, 10);

    let data = {
      ...rest,
      passwordHash
    };

    await Admin.create(data);

    return res.status(200).json({
      message: "Admin registered successfully"
    });
  } catch (error) {
    console.error("Register error", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find()
      .populate('storeId', 'name logoUrl')
     
      
    res.json(coupons);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createCoupon = async (req, res) => {
  try {
    const {
      title,
      description,
      code,
      deepLink,
      metaKeywords,
      metaDescription,
      discountType,
      discountValue,
      startDate,
      endDate,
      isFeatured,
      isExclusive,
      isVerified,
      isExpirySoon,
      storeId,
      termsConditions,
      couponType,
      displayTitle,
      slug,
      createdBy
    } = req.body;

    let bannerImageUrl = null;

    // Handle file upload if present
    if (req.file) {
      console.log("File path:", req.file.path);
      
      try {
        const uploadResult = await cloudinaryUpload(req.file.path);
        
        if (!uploadResult || !uploadResult.url) {
          console.error('Cloudinary upload failed:', uploadResult);
          throw new Error('Failed to upload image to Cloudinary');
        }
        
        bannerImageUrl = uploadResult.url;
        console.log("Image uploaded successfully:", bannerImageUrl);
        
        // Clean up local file
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        
        // Clean up local file even if upload failed
        if (req.file.path && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        
        return res.status(400).json({
          error: "Failed to upload image to Cloudinary",
          details: uploadError.message
        });
      }
    }

    // Prepare coupon data - only include fields that have values
    const couponData = {};
    
    if (title) couponData.title = title;
    if (description) couponData.description = description;
    if (code) couponData.code = code;
    if (deepLink) couponData.deepLink = deepLink;
    
    if (metaKeywords) {
      couponData.metaKeywords = Array.isArray(metaKeywords) ? metaKeywords : 
                                 typeof metaKeywords === 'string' ? metaKeywords.split(',').map(k => k.trim()) : [];
    }
    
    if (metaDescription) couponData.metaDescription = metaDescription;
    if (discountType) couponData.discountType = discountType;
    
    if (discountValue) {
      couponData.discountValue = parseFloat(discountValue);
    }
    
    if (startDate) couponData.startDate = new Date(startDate);
    if (endDate) couponData.endDate = new Date(endDate);
    
    // Boolean fields - always set them
    couponData.isFeatured = isFeatured === 'true' || isFeatured === true;
    couponData.isExclusive = isExclusive === 'true' || isExclusive === true;
    couponData.isVerified = isVerified === 'true' || isVerified === true;
    couponData.isExpirySoon = isExpirySoon === 'true' || isExpirySoon === true;
    
    if (storeId) couponData.storeId = storeId;
    if (termsConditions) couponData.termsConditions = termsConditions;
    if (bannerImageUrl) couponData.bannerImage = bannerImageUrl;
    
    couponData.couponType = couponType || 'regular';
    couponData.displayTitle = displayTitle || title || '';
    couponData.slug = slug || (title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : '');
    
    if (createdBy) couponData.createdBy = createdBy;

    const newCoupon = new Coupon(couponData);
    const savedCoupon = await newCoupon.save();
    
    res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      coupon: savedCoupon
    });

  } catch (error) {
    console.error('Create coupon error:', error);
    
    // Clean up file if it exists and there's an error
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        error: `${duplicateField} already exists`,
        message: 'Duplicate entry error' 
      });
    }
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: 'Validation failed',
        details: validationErrors 
      });
    }
    
    res.status(500).json({ 
      error: 'Server error',
      message: error.message 
    });
  }
};


exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    
    const coupon = await Coupon.findByIdAndDelete(
      id
    );
    
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    
   return res.json({
    message:"Coupon deleted sucessfully"
   });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Coupon code or slug already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};



exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    console.log("updatedData")
    console.log(updateData)
    
    const coupon = await Coupon.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    
    res.json(coupon);
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Coupon code or slug already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};


exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    
    const coupon = await Coupon.findByIdAndDelete(id);
    
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }
    
    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getStores = async (req, res) => {
  try {
    const stores = await Store.find().sort({ name: 1 });
    console.log(stores)
    res.json(stores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.updateStore = async (req, res) => {
  try {
    let { ...data } = req.body;
    let { id } = req.params;
    
   
    if (req.file) {
      const uploadResult = await cloudinaryUpload(req.file.path);
      
      if (!uploadResult.url) {
        throw new Error('Failed to upload image to Cloudinary');
      }
      
     
      data.logoUrl = uploadResult.url;
      
   
      fs.unlinkSync(req.file.path);
    }
    
    
    await Store.updateOne(
      { _id: id }, 
      { $set: data }
    );
    
    return res.status(200).json({
      message: "Store updated successfully"
    });
    
  } catch (error) {
    console.error(error);
    

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Store slug already exists' 
      });
    }
    
    res.status(500).json({ 
      message: error.message || 'Server error' 
    });
  }
};

exports.createStore = async (req, res) => {
    try {
      let{ ...data } = req.body;
      console.log(data)
      console.log("CREATE STORE")
      let logoUrl = '';
 
if(!req.file){
  console.log("ERROR NO LOGO")
  return res.status(400).json({
    error:"Please upload logo"
  })
}

      if (req.file) {
      
        const uploadResult = await cloudinaryUpload(req.file.path);
        
        if (!uploadResult.url) {
          throw new Error('Failed to upload image to Cloudinary');
        }
        
        logoUrl = uploadResult.url;
        
       
        fs.unlinkSync(req.file.path);
      }
      
      data={
        ...data,
        logoUrl
      }
      const newStore = new Store(data);
      
      await newStore.save();
      
     return res.status(201).json(newStore);
    } catch (error) {
      console.log('error')
      console.error(error);
      
     
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      if (error.code === 11000) {
        return res.status(400).json({ message: 'Store slug already exists' });
      }
      
      res.status(500).json({ 
        message: error.message || 'Server error' 
      });
    }
  };


exports.createCategory=async(req,res)=>{
  let {...data}=req.body;
  try{
await Category.create(data)
return res.status(200).json({
  message:"Category created sucessfully"
})
  }catch(error){
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}


exports.getCategories=async(req,res)=>{
  try{
let categories=await Category.find({})
return res.status(200).json({
  categories
})
  }catch(error){
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}


exports.updateCategory=async(req,res)=>{
let {...data}=req.body;
let {id}=req.params;
  try{
  await Category.findByIdAndUpdate(id,{
    $set:data
  })

  return res.status(200).json({
    message:"Category updated sucessfully"
  })
  }catch(error){
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}


exports.deleteStore=async(req,res)=>{
  let {id}=req.params;
  console.log("ID OF STORE")
  try{
await Store.deleteOne({_id:id})
return res.status(200).json({
  message:"Store deleted sucessfully"
})

  }catch(error){
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

exports.deleteCategory=async(req,res)=>{
  let {id}=req.params;
    try{
    await Category.findByIdAndDelete(id)
  
    return res.status(200).json({
      message:"Category deleted sucessfully"
    })
    }catch(error){
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }


exports.getStats = async (req, res) => {
  try {
    const [totalCoupons, activeCoupons, totalStores, totalCategories] = await Promise.all([
      Coupon.countDocuments(),
      Coupon.countDocuments({ 
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() }
      }),
      Store.countDocuments(),
      Category.countDocuments()
    ]);
    
   return res.json({
      totalCoupons,
      activeCoupons,
      totalStores,
      totalCategories
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};