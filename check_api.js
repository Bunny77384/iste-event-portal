fetch('http://localhost:5000/api/events')
    .then(res => res.json())
    .then(data => {
        console.log('Total Events:', data.length);
        if (data.length > 0) {
            console.log('Sample Event Keys:', Object.keys(data[0]));
            console.log('Sample Event ID:', data[0]._id);
            console.log('Sample Event Title:', data[0].title);
        }
    })
    .catch(err => console.error(err));
