const express = require('express');
const router = express.Router();
const { createInvoice, getAdminInvoiceList, getResidentInvoiceList, getInvoiceDetail } = require('../controllers/invoice');

// Create new invoice
router.post('/create/:dormID', createInvoice);

// List of invoice in admin view
router.get('/list/:dormID', getAdminInvoiceList);

// List of invoice in resident view
router.get('/history/:rentID', getResidentInvoiceList);

// Invoice detail
router.get('/:invoiceID/:dormID', getInvoiceDetail);

module.exports = router;