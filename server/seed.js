require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('./models/Event');

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to DB for Seeding'))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

const seedEvents = async () => {
    try {
        await Event.deleteMany({}); // Clear existing

        // Helper to generate dates relative to today
        const getDaysFromNow = (days) => {
            const date = new Date();
            date.setDate(date.getDate() + days);
            return date;
        };

        const detailedEvents = [
            // Technical Events
            {
                title: "Paper Presentation",
                description: "Present your innovative research and technical papers to a panel of experts. Showcase your knowledge and presentation skills.",
                date: getDaysFromNow(10),
                venue: "Seminar Hall 1",
                registrationFee: 100,
                rules: [
                    "Individual event. No spot registration.",
                    "Abstracts (300-500 words) must be submitted via Unstop.",
                    "Presentation time: 8+2 mins.",
                    "Topics: AI, Circuits, Civil Sustainability, Signal/Image Processing, Cyber Security, Humanoid Robotics."
                ],
                category: "Technical"
            },
            {
                title: "Idea-thon",
                description: "A short, intensive workshop-like experience to address pressing challenges. Validate your innovative ideas.",
                date: getDaysFromNow(11),
                venue: "Innovation Lab",
                registrationFee: 150,
                rules: [
                    "Team size: 3-4 members (same college).",
                    "Idea must be unique and novel.",
                    "Sub-themes: Sustainable Tech, Community Engineering, Circular Economy, Cross-disciplinary Innovation.",
                    "Judged on aesthetics, accuracy, presentation, and detailing."
                ],
                category: "Technical"
            },
            {
                title: "Reverse Coding",
                description: "Decipher logic from output and recreate the source code. A twist on traditional coding challenges.",
                date: getDaysFromNow(12),
                venue: "Computer Lab 2",
                registrationFee: 80,
                rules: [
                    "Platform: Unstop. discussion banned.",
                    "Level 1: 10 basic (30 mins). Level 2: 8 moderate (25 mins). Level 3: 6 hard (15 mins).",
                    "Ranking based on correctly solved problems and time taken.",
                    "Code output must match samples exactly."
                ],
                category: "Technical"
            },
            {
                title: "Webathon",
                description: "Fast-paced coding and design challenge to build innovative web applications.",
                date: getDaysFromNow(13),
                venue: "Computer Center",
                registrationFee: 200,
                rules: [
                    "Team size: 2-3 members (same institution).",
                    "Any frontend/backend stack allowed.",
                    "Themes revealed at start.",
                    "Judged on Innovation, UI/UX, Functionality, and Relevance."
                ],
                category: "Technical"
            },
            {
                title: "Code Debugging",
                description: "Test your analytical thinking by fixing logical and syntactical errors in code snippets.",
                date: getDaysFromNow(14),
                venue: "Lab 3",
                registrationFee: 50,
                rules: [
                    "Individual event. No plagiarism.",
                    "Level 1: 10 bugs (30 mins). Level 2: 8 bugs (25 mins). Level 3: 6 bugs (15 mins).",
                    "Accuracy is key; incorrect output considered invalid.",
                    "Supported by Unstop platform."
                ],
                category: "Technical"
            },
            {
                title: "Project Expo",
                description: "Exhibition platform to present technical creativity and working prototypes.",
                date: getDaysFromNow(15),
                venue: "Main Auditorium Foyer",
                registrationFee: 300,
                rules: [
                    "Team size: 2-4 members.",
                    "Must display working model/prototype.",
                    "5-10 minute presentation required.",
                    "Judged on innovation, practicality, technical soundness, and presentation."
                ],
                category: "Technical"
            },

            // Robotics
            {
                title: "Robo Race",
                description: "Navigate your bot through a challenging obstacle course in the shortest time.",
                date: getDaysFromNow(16),
                venue: "Open Quadrangle",
                registrationFee: 250,
                rules: [
                    "Team size: 1-4 members.",
                    "Bot specs: Max 3kg, 25x25x20cm, 6-24V.",
                    "Max 3 hand touches allowed (penalty applies).",
                    "Fastest time wins. Course includes slopes, sand, and irregularities."
                ],
                category: "Robotics"
            },
            {
                title: "Robo Rumble",
                description: "Bot Wrestling: Push the opponent out of the arena to win.",
                date: getDaysFromNow(16),
                venue: "Open Quadrangle",
                registrationFee: 300,
                rules: [
                    "Bot specs: Max 1.5kg, 250x250mm, 24V DC.",
                    "Push opponent into the white zone to score.",
                    "No damaging weapons or sticky substances.",
                    "Qualifier (3 mins) -> Knockout (3 rounds of 3 mins)."
                ],
                category: "Robotics"
            },
            {
                title: "Line Follower Robot",
                description: "Automated bot that follows a line maze to reach the destination fast.",
                date: getDaysFromNow(17),
                venue: "Robotics Lab",
                registrationFee: 200,
                rules: [
                    "Team size: 4 members.",
                    "Autonomous bots only (no remote). 20x15x10cm max size.",
                    "5 mins access to maze per round.",
                    "3cm black line on white background.",
                    "Touch penalty: Void attempt."
                ],
                category: "Robotics"
            },

            // Design
            {
                title: "Logo Rush",
                description: "Create a captivating logo that embodies innovation and technology.",
                date: getDaysFromNow(18),
                venue: "Design Studio",
                registrationFee: 50,
                rules: [
                    "Individual participation.",
                    "Theme announced on spot.",
                    "Submit in JPEG/PDF (Max 5MB) with description.",
                    "No pre-made templates or AI tools."
                ],
                category: "Design"
            },
            {
                title: "Uxperience-Xperts (UI/UX)",
                description: "Showcase UI/UX skills. Design user-friendly interfaces for given problem statements.",
                date: getDaysFromNow(18),
                venue: "CAD Lab",
                registrationFee: 100,
                rules: [
                    "Team size: 1-3 members.",
                    "Tools: Figma, Adobe XD, Sketch.",
                    "1 hour duration. Problem statement on spot.",
                    "No AI tools allowed."
                ],
                category: "Design"
            },

            // Fun & Logical
            {
                title: "Treasure Hunt",
                description: "Campus-wide puzzle solving. Navigate route maps and crack clues.",
                date: getDaysFromNow(19),
                venue: "Campus Grounds",
                registrationFee: 200,
                rules: [
                    "Team size: Exactly 4 members.",
                    "No electronic devices.",
                    "Two rounds (45 mins each).",
                    "Requires basic C/C++ and logic gate knowledge."
                ],
                category: "Fun"
            },
            {
                title: "One Minute Marvels",
                description: "Complete fun challenges in exactly 60 seconds.",
                date: getDaysFromNow(19),
                venue: "Student Lounge",
                registrationFee: 50,
                rules: [
                    "1 min time limit per challenge.",
                    "Team of 2 members.",
                    "5 games total. Cumulative time decides winner.",
                    "No practice attempts allowed."
                ],
                category: "Fun"
            },
            {
                title: "Debate Competition",
                description: "Engage in stimulating discussions on thought-provoking topics.",
                date: getDaysFromNow(20),
                venue: "Conference Room",
                registrationFee: 50,
                rules: [
                    "Team of 1-2 members. At least one must know Kannada.",
                    "Round 1: Pick and Speak (1 min). Round 2: Debate.",
                    "Civil tone maintained. Cross-examination allowed.",
                    "Judges decision final."
                ],
                category: "Fun"
            },

            // Gaming
            {
                title: "BGMI Tournament",
                description: "Mobile gaming tournament. Squad up for the chicken dinner.",
                date: getDaysFromNow(21),
                venue: "Esports Arena (Seminar Hall 2)",
                registrationFee: 400,
                rules: [
                    "Squad of 4 players. Level 40+ required.",
                    "Mobile only (No tablets/iPads).",
                    "No teaming or emergency pickups.",
                    "Must record POV for evidence.",
                    "Screenshot results required."
                ],
                category: "Gaming"
            }
        ];

        await Event.insertMany(detailedEvents);
        console.log(`Successfully seeded ${detailedEvents.length} detailed events.`);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedEvents();
