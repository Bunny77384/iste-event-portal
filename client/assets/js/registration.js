document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');

    // Debug Log
    console.log('Current URL:', window.location.href);
    console.log('Parsed Event ID:', eventId);

    if (!eventId) {
        alert(`No event specified! Please select an event from the Events page using the 'Register' button.\n\nCurrent URL: ${window.location.href}`);
        window.location.href = '/events.html';
        return;
    }

    // Populate Event Name
    try {
        const res = await fetch(`${API_BASE_URL}/api/events/${eventId}`);
        if (!res.ok) throw new Error('Failed to fetch event details');

        const event = await res.json();
        if (event.title) {
            document.getElementById('event-name-display').textContent = `Registering for: ${event.title}`;
            document.getElementById('eventId').value = event._id;
        } else {
            throw new Error('Invalid event data');
        }
    } catch (err) {
        console.error(err);
        alert('Error loading event details. Redirecting to events page.');
        window.location.href = '/events.html';
    }
});

function toggleTeamFields() {
    const type = document.querySelector('input[name="type"]:checked').value;
    const teamFields = document.getElementById('team-fields');
    if (type === 'Team') {
        teamFields.classList.remove('hidden');
        if (document.getElementById('members-container').children.length === 0) {
            addMemberRow(); // Add at least one row
        }
    } else {
        teamFields.classList.add('hidden');
    }
}

function addMemberRow() {
    const container = document.getElementById('members-container');
    const index = container.children.length + 1;
    const div = document.createElement('div');
    div.className = 'member-row';
    div.innerHTML = `
        <input type="text" placeholder="Member ${index} Name" class="member-name">
        <input type="text" placeholder="Member ${index} Email (Optional)" class="member-email">
    `;
    container.appendChild(div);
}

document.getElementById('registration-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = e.target.querySelector('button[type="submit"]');
    const msgObj = document.getElementById('status-message');

    btn.disabled = true;
    btn.textContent = 'Processing...';
    msgObj.style.display = 'none';

    // Gather Data
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    // Handle Members manually
    if (data.type === 'Team') {
        const memberRows = document.querySelectorAll('.member-row');
        data.members = Array.from(memberRows).map(row => ({
            name: row.querySelector('.member-name').value,
            email: row.querySelector('.member-email').value
        })).filter(m => m.name.trim() !== ''); // Filter empty
    }

    try {
        const res = await fetch(`${API_BASE_URL}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if (res.ok) {
            msgObj.className = 'status-message success';
            msgObj.innerHTML = `Success! Check your email. Registration ID: <strong>${result.registrationId}</strong>`;
            msgObj.style.display = 'block';
            e.target.reset();
            setTimeout(() => window.location.href = '/events.html', 3000); // Redirect after success
        } else {
            throw new Error(result.message || 'Registration failed');
        }
    } catch (err) {
        msgObj.className = 'status-message error';
        msgObj.textContent = err.message;
        msgObj.style.display = 'block';
    } finally {
        btn.disabled = false;
        btn.textContent = 'Register';
    }
});
