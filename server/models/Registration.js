const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String }, // Optional for members
    phone: { type: String } // Optional for members
});

const registrationSchema = new mongoose.Schema({
    registrationId: { type: String, unique: true, required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    eventName: { type: String, required: true }, // Redundant but useful for quick display

    // Team Leader / Individual Details
    participantName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    college: { type: String, required: true },

    // Participation Type
    type: { type: String, enum: ['Individual', 'Team'], required: true },
    teamName: { type: String }, // Required if type is Team
    members: [memberSchema],

    // Payment
    paymentReference: { type: String }, // UTR or Transaction ID
    paymentStatus: { type: String, enum: ['Pending', 'Verified', 'Failed'], default: 'Pending' },

    // Meta
    status: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled'], default: 'Pending' },
    emailSent: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Registration', registrationSchema);
