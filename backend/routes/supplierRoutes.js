const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');

router.route('/get-suppliers').get(supplierController.getAllSuppliers)
router.route('/get-supplier/:id').get(supplierController.getSupplierById)
router.route('/register-supplier').post(supplierController.registerNewSupplier)
router.route('/admin-create-supplier').post(supplierController.createNewSupplier)
router.route('/login').post(supplierController.loginSupplier)
router.route('/approve-supplier/:id').patch(supplierController.approveSupplier)
// router.route('/edit-account').patch(resellersController.updateReseller)
// router.route('/delete-reseller').delete(resellersController.deleteReseller)
    // .patch(resellersController.updateReseller)
    // .delete(resellersController.deleteReseller)

module.exports = router;