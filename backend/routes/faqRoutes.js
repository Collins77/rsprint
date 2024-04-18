const express = require('express');
const router = express.Router();
const faqController = require('../controllers/faqController');

router.route('/')
    .get(faqController.getAllFAQs)
    .post(faqController.createNewFAQ)
    .patch(faqController.updateFAQ)
    .delete(faqController.deleteFAQ)

module.exports = router;