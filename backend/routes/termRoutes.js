const express = require('express');
const router = express.Router();
const termController = require('../controllers/termController');

router.route('/')
    .get(termController.getAllTerms)
    .post(termController.createNewTerm)
    .patch(termController.updateTerm)
    .delete(termController.deleteTerm)

module.exports = router;