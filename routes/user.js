const express = require('express');
const router = express.Router();
const { getResidentInfo, getResidentRoomDorm } = require('../controllers/residentInfo');
const { verifyUser, residentRegister, adminRegister, userLogin, getUserDetail, getUserInfo, editUser, isFirstLogin } = require('../controllers/user');

// Get resident info in roomTable page
router.get('/resident/:roomID', getResidentInfo);

// Get dorm, room and rent info
router.get('/rent/:rentID', getResidentRoomDorm);

// Check id card and date of birth before register (resident side)
router.post('/verifyUser', verifyUser);

// Resident register
router.post('/register/:userId', residentRegister);

// Admin register
router.post('/adminRegister', adminRegister);

// Login
router.post('/login', userLogin);

// Get user detail to local storage
router.get('/detail', getUserDetail);

// Get user info in profile
router.get('/info/:userID', getUserInfo);

// Edit user profile
router.post('/edit/:userID', editUser);

// Check is first time login
router.get('/check/:userID', isFirstLogin);

module.exports = router;
