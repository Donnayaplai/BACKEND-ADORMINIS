const express = require('express');
const router = express.Router();
const { createInvoice } = require('../controllers/invoice');

// Create new invoice
router.post('/create/:dormID', createInvoice);

module.exports = router;