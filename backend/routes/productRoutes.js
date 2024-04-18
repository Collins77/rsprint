const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.route('/get-products').get(productController.getAllProducts)
router.route('/get-products-supplier/:supplierId').get(productController.getProductsBySupplier)
router.route('/create-product').post(productController.createNewProduct)
router.route('/delete-supplier-product/:id').delete(productController.deleteSupplierProduct)
router.route('/update-product/:id').patch(productController.deleteSupplierProduct)
// router.route('/login').post(resellersController.loginReseller)
// router.route('/edit-account').patch(resellersController.updateReseller)
// router.route('/delete-reseller').delete(resellersController.deleteReseller)
    // .patch(resellersController.updateReseller)
    // .delete(resellersController.deleteReseller)

module.exports = router;