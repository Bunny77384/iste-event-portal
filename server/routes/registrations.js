const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const Event = require('../models/Event'); // To validate event exists
const { sendAcknowledgement } = require('../services/emailService');
const { v4: uuidv4 } = require('uuid'); // Native or lightweight alternative if uuid not installed?
// I'll use a simple random string generator if uuid isn't in package.json (it wasn't).
// Actually, I'll just use timestamp + random for now or add uuid to dependencies.
// Let's stick to a simple function to avoid dependency issues for now.

const multer = require('multer');
const path = require('path');
const Tesseract = require('tesseract.js');

// Configure Multer Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, 'PAY-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

const generateRegId = () => {
    return 'EVT-' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);
};

// POST /api/register
router.post('/', upload.single('paymentScreenshot'), async (req, res) => {
    try {
        // Parse body (because multipart form data makes everything strings)
        // If members is stringified JSON (from client), parse it.
        // But our client logic sends individual fields, let's see. 
        // Best approach: Client should send stringified JSON for members.

        let {
            eventId, participantName, email, phone, college,
            type, teamName, members, paymentReference
        } = req.body;

        if (typeof members === 'string') {
            try { members = JSON.parse(members); } catch (e) { members = []; }
        }

        // 1. Basic Validation
        if (!eventId || !participantName || !email || !phone || !college || !type) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // 2. Check if Event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // 3. Duplicate Check
        const existing = await Registration.findOne({ email, eventId });
        if (existing) {
            return res.status(409).json({ message: 'This email is already registered for this event.' });
        }

        // 4. OCR Verification (Helper Feature)
        let ocrMatchStatus = 'Pending';
        let paymentScreenshotPath = req.file ? req.file.path : null;

        if (req.file && paymentReference) {
            console.log('Starting OCR for:', req.file.path);
            try {
                // Determine absolute path for Tesseract
                // const absPath = path.resolve(req.file.path); 
                // Tesseract works well with file paths in Node
                const { data: { text } } = await Tesseract.recognize(
                    req.file.path,
                    'eng',
                    //{ logger: m => console.log(m) }
                );

                const cleanOCR = text.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                const cleanRef = paymentReference.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

                console.log(`OCR Text: ${cleanOCR.substring(0, 50)}... vs Ref: ${cleanRef}`);

                if (cleanOCR.includes(cleanRef)) {
                    ocrMatchStatus = 'Matched';
                } else {
                    ocrMatchStatus = 'Mismatch';
                }
            } catch (ocrErr) {
                console.error('OCR Failed:', ocrErr);
                ocrMatchStatus = 'Error';
            }
        }

        // 5. Create Registration Object
        const registrationId = generateRegId();

        const newRegistration = new Registration({
            registrationId,
            eventId,
            eventName: event.title,
            participantName,
            email,
            phone,
            college,
            type,
            teamName: type === 'Team' ? teamName : undefined,
            members: type === 'Team' ? members : [],
            paymentReference,
            paymentScreenshot: paymentScreenshotPath,
            ocrMatchStatus,
            status: 'Pending',
            paymentStatus: 'Pending'
        });

        // 6. Save to DB
        const savedReg = await newRegistration.save();

        // 7. Send Email
        sendAcknowledgement(savedReg).then(success => {
            if (success) {
                savedReg.emailSent = true;
                savedReg.save();
            }
        });

        res.status(201).json({
            message: 'Registration successful',
            registrationId: savedReg.registrationId,
            ocrStatus: ocrMatchStatus
        });

    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

module.exports = router;
