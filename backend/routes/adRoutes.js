const express = require('express');
const router = express.Router();
const adController = require('../controllers/adController');
const multer = require('multer');

router.route('/get-ads').get(adController.getAllAds)
router.route('/get-ads-supplier/:supplierId').get(adController.getAdsBySupplier)
router.route('/create-ad').post(adController.createNewAd)
// router.route('/admin-create-product').post(productController.adminCreateProduct)
// router.route('/delete-supplier-product/:id').delete(productController.deleteSupplierProduct)
// router.route('/update-product/:id').patch(productController.deleteSupplierProduct)
// router.get('/download-template', productController.downloadTemplate);
// router.post('/upload-bulk', productController.uploadBulkProducts);

module.exports = router;