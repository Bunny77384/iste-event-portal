const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken'); // Assuming we install it, if not, fallback to simple check
const Registration = require('../models/Registration');
const Event = require('../models/Event');

const ADMIN_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Auth Middleware
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']; // format: "Bearer <token>"
    if (!token) return res.status(403).json({ message: 'No token provided' });

    try {
        const bearer = token.split(' ')[1];
        const decoded = jwt.verify(bearer, ADMIN_SECRET);
        req.admin = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};

// Login
router.post('/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        const token = jwt.sign({ role: 'admin' }, ADMIN_SECRET, { expiresIn: '1h' });
        return res.json({ token });
    }
    res.status(401).json({ message: 'Invalid Credentials' });
});

// Get Dashboard Stats
router.get('/dashboard', verifyToken, async (req, res) => {
    try {
        const totalEvents = await Event.countDocuments();
        const totalRegistrations = await Registration.countDocuments();
        const pendingPayments = await Registration.countDocuments({ paymentStatus: 'Pending' });

        // Recent Registrations
        const registrations = await Registration.find()
            .sort({ createdAt: -1 })
            .populate('eventId', 'title');

        res.json({
            stats: { totalEvents, totalRegistrations, pendingPayments },
            registrations
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update Registration Status (Verify Payment)
router.patch('/registrations/:id', verifyToken, async (req, res) => {
    try {
        const { status, paymentStatus } = req.body;
        const update = {};
        if (status) update.status = status;
        if (paymentStatus) update.paymentStatus = paymentStatus;

        const reg = await Registration.findOneAndUpdate(
            { registrationId: req.params.id },
            update,
            { new: true }
        );

        // Send Email if status is confirmed
        if (reg && (status === 'Confirmed' || paymentStatus === 'Verified')) {
            const { sendVerificationSuccess } = require('../services/emailService');
            sendVerificationSuccess(reg).catch(err => console.error('Verification email failed:', err));
        }

        res.json(reg);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Debug Email Route
router.get('/debug-email', async (req, res) => {
    try {
        const nodemailer = require('nodemailer');

        // 1. Check Env Vars
        const userSet = !!process.env.EMAIL_USER;
        const passSet = !!process.env.EMAIL_PASS;
        const service = process.env.EMAIL_SERVICE;

        if (!userSet || !passSet) {
            return res.status(500).json({
                status: 'Error',
                message: 'Environment variables missing',
                details: { EMAIL_USER: userSet, EMAIL_PASS: passSet, EMAIL_SERVICE: service }
            });
        }

        // 2. Create Transporter
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // 3. Verify Connection
        await transporter.verify();

        res.json({
            status: 'Success',
            message: 'SMTP Connection Verified Successfully',
            config: {
                user: process.env.EMAIL_USER,
                service: service
            }
        });

    } catch (err) {
        console.error('Debug Email Error:', err);
        res.status(500).json({
            status: 'Failed',
            message: 'SMTP Connection Failed',
            error: err.message,
            code: err.code,
            command: err.command
        });
    }
});

module.exports = router;
