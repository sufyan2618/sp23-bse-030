document.getElementById('userForm').addEventListener('submit', function (event) {
    event.preventDefault();

    // Clear previous error messages
    document.getElementById('nameError').innerText = '';
    document.getElementById('phoneError').innerText = '';
    document.getElementById('addressError').innerText = '';
    document.getElementById('cityError').innerText = '';
    document.getElementById('countryError').innerText = '';

    // Get form values
    let name = document.getElementById('name').value;
    let phone = document.getElementById('phone').value;
    let address = document.getElementById('address').value;
    let city = document.getElementById('city').value;
    let country = document.getElementById('country').value;

    let isValid = true;

    // Validate fields
    if (!name) {
        document.getElementById('nameError').innerText = 'Name is empty';
        isValid = false;
    }
    if (!phone) {
        document.getElementById('phoneError').innerText = 'Phone number is empty';
        isValid = false;
    }
    if (!address) {
        document.getElementById('addressError').innerText = 'Address is empty';
        isValid = false;
    }
    if (!city) {
        document.getElementById('cityError').innerText = 'City is empty';
        isValid = false;
    }
    if (!country) {
        document.getElementById('countryError').innerText = 'Country is empty';
        isValid = false;
    }

    // If form is valid, clear the form
    if (isValid) {
        alert('Form submitted successfully!');
        document.getElementById('userForm').reset();
    }
});