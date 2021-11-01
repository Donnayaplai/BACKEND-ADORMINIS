const express = require('express');
const router = express.Router();
const { createInvoice, getAdminInvoiceList, getResidentInvoiceList, getInvoiceDetail } = require('../controllers/invoice');

// Create new invoice
router.post('/create/:dormID', createInvoice);

// Get the list of invoice for admin side
router.get('/list/:dormID', getAdminInvoiceList);

// Get resident history invoice list
router.get('/history/:rentID/:dormID', getResidentInvoiceList);

// Get all invoice detail
router.get('/:invoiceID/:dormID', getInvoiceDetail);

module.exports = router;