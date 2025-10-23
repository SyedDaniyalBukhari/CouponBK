const express = require('express');
const router = express.Router();
const publicController = require('../../controllers/public/public');

router.get('/coupons', publicController.getCoupons);
router.get('/coupon/:slug', publicController.getCouponBySlug);
router.post('/coupon/:id/click', publicController.trackCouponClick);
router.get('/stores', publicController.getStores);
router.get('/store/:slug', publicController.getStoreBySlug);

module.exports = router;