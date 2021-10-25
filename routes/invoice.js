const express = require('express');
const router = express.Router();
const { createInvoice, getAdminInvoiceList, getInvoiceDetail } = require('../controllers/invoice');

// Create new invoice
router.post('/create/:dormID', createInvoice);

// List of invoice in admin view
router.get('/list/:dormID', getAdminInvoiceList);

// Invoice detail
router.get('/:dormID', getInvoiceDetail);

module.exports = router;