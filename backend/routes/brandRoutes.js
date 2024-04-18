const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brandController');

router.route('/')
    .get(brandController.getAllBrands)
    .post(brandController.createNewBrand)
    .patch(brandController.updateBrand)
    .delete(brandController.deleteBrand)

module.exports = router;