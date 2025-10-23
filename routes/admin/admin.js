

const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/admin/admin');
const authMiddleware = require('../../middlewares/auth');
const upload = require('../../utils/multer');


router.post('/login', adminController.login);
router.post('/register',adminController.register)
router.get('/coupons', adminController.getCoupons);
// router.use(authMiddleware.adminAuth);


router.post('/coupon', upload.single('bannerImage'),adminController.createCoupon);
router.put('/coupon/:id', adminController.updateCoupon);
router.delete('/coupon/:id', adminController.deleteCoupon);
router.get('/stores', adminController.getStores);
router.post('/store', upload.single('logo'), adminController.createStore);
router.patch('/updatestore/:id', upload.single('logo'), adminController.updateStore);
router.delete('/deletestore/:id', adminController.deleteStore);

router.get('/stats', adminController.getStats);
router.post('/category',adminController.createCategory)
router.get('/categories',adminController.getCategories)
router.patch('/updateCategory',adminController.updateCategory)
router.patch('/deleteCategory',adminController.deleteCategory)

module.exports = router;