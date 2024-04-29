const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requiresAdminSignIn } = require('../middleware/authMiddleware');

router.route('/')
    .get(adminController.getAllAdmins)
    .post(adminController.createNewAdmin)
    .patch(adminController.updateAdmin)

    
    router.get('/get-admins', adminController.getAllAdmins);
    router.get('/get-admin/:id',  adminController.getAdminById);
    router.post('/create-admin', adminController.createNewAdmin);
    router.put('/update-admin/:id', adminController.updateAdmin);
    router.put('/change-password/:id', adminController.changePassword);
    router.post('/login', adminController.loginAdmin);
    router.get("/admin-auth", requiresAdminSignIn, (req, res) => {
        res.status(200).send({ ok: true });
      });
    // router.get('/logout', resellerController.logOutReseller);
    // router.patch('/edit-account', resellersController.updateReseller);
    // router.delete('/delete-reseller', resellersController.deleteReseller);
    // router.patch('/approve-reseller/:id', resellersController.approveReseller);
    // router.patch('/update-reseller/:id', resellersController.updateReseller);
    // router.delete('/delete-reseller/:id', resellersController.deleteReseller);
    // router.post('/forgot-password', resellersController.forgotPassword);
    // router.get('/reset-password/:id/:token', resellersController.resetPassword);
    // router.post('/reset-password/:id/:token', resellersController.resetPasswordComplete);
    
    module.exports = router;

module.exports = router;