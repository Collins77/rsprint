const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { requireSignIn, isSupplier, requiresSupplierSignIn } = require('../middleware/authMiddleware');

// router.route('/get-suppliers').get(supplierController.getAllSuppliers)
router.get("/get-suppliers", supplierController.getAllSuppliers);
router.route('/get-supplier/:id').get(supplierController.getSupplierById)
router.route('/register-supplier').post(supplierController.registerNewSupplier)
router.route('/admin-create-supplier').post(supplierController.createNewSupplier)
router.route('/login').post(supplierController.loginSupplier)
router.route('/approve-supplier/:id').patch(supplierController.approveSupplier)
router.get("/supplier-auth", requiresSupplierSignIn, (req, res) => {
    res.status(200).send({ ok: true });
  });
router.post('/forgot-password', supplierController.forgotPassword);
router.get('/reset-password/:id/:token', supplierController.resetPassword);
router.post('/reset-password/:id/:token', supplierController.resetPasswordComplete);
// router.get("/test", isSupplier, supplierController.testController);
// router.route('/edit-account').patch(resellersController.updateReseller)
// router.route('/delete-reseller').delete(resellersController.deleteReseller)
    // .patch(resellersController.updateReseller)
    // .delete(resellersController.deleteReseller)

module.exports = router;