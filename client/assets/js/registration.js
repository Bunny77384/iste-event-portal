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
    // Max 3 additional members (Total 4 including Lead)
    if (container.children.length >= 3) {
        alert('Maximum team size is 4 (including the Team Lead). You cannot add more members.');
        return;
    }

    const index = container.children.length + 1;
    const div = document.createElement('div');
    div.className = 'member-row';
    div.innerHTML = `
        <input type="text" placeholder="Member ${index} Name" class="member-name">
        <input type="text" placeholder="Member ${index} Email (Optional)" class="member-email">
        <button type="button" onclick="this.parentElement.remove()" style="background:red; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer; margin-left:10px;">X</button>
    `;
    container.appendChild(div);
}

document.getElementById('registration-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = e.target.querySelector('button[type="submit"]');
    const msgObj = document.getElementById('status-message');

    // Gather Data
    const initialFormData = new FormData(e.target);
    const data = Object.fromEntries(initialFormData.entries());

    // Handle Members manually
    if (data.type === 'Team') {
        const memberRows = document.querySelectorAll('.member-row');
        data.members = Array.from(memberRows).map(row => ({
            name: row.querySelector('.member-name').value,
            email: row.querySelector('.member-email').value
        })).filter(m => m.name.trim() !== ''); // Filter empty

        // Validation: Min Team Size 3 (Lead + 2 members)
        if (data.members.length < 2) {
            alert('Team size must be at least 3 members (You + 2 others). Please add more members.');
            return;
        }
    }

    btn.disabled = true;
    btn.textContent = 'Processing...';
    msgObj.style.display = 'none';

    // Prepare FormData For Submission (Required for File Uploads)

    // Prepare FormData For Submission (Required for File Uploads)
    const submissionFormData = new FormData();
    submissionFormData.append('eventId', data.eventId);
    submissionFormData.append('participantName', data.participantName);
    submissionFormData.append('email', data.email);
    submissionFormData.append('phone', data.phone);
    submissionFormData.append('college', data.college);
    submissionFormData.append('type', data.type);
    submissionFormData.append('paymentReference', data.paymentReference);

    if (data.type === 'Team') {
        submissionFormData.append('teamName', data.teamName);
        submissionFormData.append('members', JSON.stringify(data.members));
    }

    const fileInput = document.getElementById('paymentScreenshot');
    if (fileInput.files.length > 0) {
        submissionFormData.append('paymentScreenshot', fileInput.files[0]);
    }

    try {
        const res = await fetch(`${API_BASE_URL}/api/register`, {
            method: 'POST',
            body: submissionFormData
        });

        const result = await res.json();

        if (res.ok) {
            let msg = `Registration Successful! ID: ${result.registrationId}`;
            if (result.ocrStatus === 'Matched') msg += '\n✅ Payment verified automatically!';
            else if (result.ocrStatus === 'Mismatch') msg += '\n⚠ Payment verification pending (Manual review required).';

            alert(msg);
            window.location.href = '/events.html';
        } else {
            throw new Error(result.message || 'Registration failed');
        }
    } catch (err) {
        msgObj.textContent = err.message;
        msgObj.className = 'status-message error';
        msgObj.style.display = 'block';
    } finally {
        btn.disabled = false;
        btn.textContent = 'Register';
    }
});
