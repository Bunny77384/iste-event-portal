const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const Event = require('../models/Event'); // To validate event exists
const { sendAcknowledgement } = require('../services/emailService');
const { v4: uuidv4 } = require('uuid'); // Native or lightweight alternative if uuid not installed?
// I'll use a simple random string generator if uuid isn't in package.json (it wasn't).
// Actually, I'll just use timestamp + random for now or add uuid to dependencies.
// Let's stick to a simple function to avoid dependency issues for now.

const generateRegId = () => {
    return 'EVT-' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);
};

// POST /api/register
router.post('/', async (req, res) => {
    try {
        const {
            eventId, participantName, email, phone, college,
            type, teamName, members, paymentReference
        } = req.body;

        // 1. Basic Validation
        if (!eventId || !participantName || !email || !phone || !college || !type) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // 2. Check if Event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // 3. Duplicate Check (Simple: email + eventId)
        const existing = await Registration.findOne({ email, eventId });
        if (existing) {
            return res.status(409).json({ message: 'This email is already registered for this event.' });
        }

        // 4. Create Registration Object
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
            status: 'Pending',
            paymentStatus: 'Pending'
        });

        // 5. Save to DB
        const savedReg = await newRegistration.save();

        // 6. Send Email (Async, don't block response)
        sendAcknowledgement(savedReg).then(success => {
            if (success) {
                // Optionally update emailSent flag
                savedReg.emailSent = true;
                savedReg.save();
            }
        });

        res.status(201).json({
            message: 'Registration successful',
            registrationId: savedReg.registrationId
        });

    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

module.exports = router;
