const express = require('express');
const router = express.Router();
const { sendComplaint, getComplaintDetail, getResidentComplaintList, getAdminComplaintList, removeComplaint, reviseComplaint } = require('../controllers/problem');

// Send the complaint to admin
router.post('/send/:userID/:dormID', sendComplaint);

// Get complaint detail for both sides
router.get('/:problemID', getComplaintDetail);

// Get resident history complaint list
router.get('/history/:rentID', getResidentComplaintList);

// Get the list of complaints for admin side
router.get('/list/:dormID', getAdminComplaintList);

// Remove complaint
router.delete('/remove/:problemID', removeComplaint);

// Revise complaint
router.post('/revise/:problemID', reviseComplaint);

module.exports = router;