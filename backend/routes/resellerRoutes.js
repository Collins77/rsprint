const express = require('express');
const router = express.Router();
const resellersController = require('../controllers/resellersController');
const auth = require('../middleware/auth');

router.get('/get-resellers', auth, resellersController.getAllResellers);
router.get('/get-reseller',  resellersController.getReseller);
router.get('/logged-in', resellersController.loggedIn);
router.post('/signup', resellersController.createNewReseller);
router.post('/login', resellersController.loginReseller);
router.get('/logout', resellersController.logOutReseller);
router.patch('/edit-account',auth, resellersController.updateReseller);
router.delete('/delete-reseller', auth, resellersController.deleteReseller);
router.patch('/approve-reseller/:id', auth, resellersController.approveReseller);
router.patch('/update-reseller/:id', auth, resellersController.updateReseller);
router.delete('/delete-reseller/:id', auth, resellersController.deleteReseller);

module.exports = router;