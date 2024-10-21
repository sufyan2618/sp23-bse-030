console.log("javascript loaded");

let Name = document.querySelector("#Name");
let email = document.querySelector("#email");
let number = document.querySelector("#number");
let address = document.querySelector("#address");
let password = document.querySelector("#password");

let capsError = document.querySelector("#caps_error");
let emptyError = document.querySelector("#empty_error");
let submit = document.querySelector("#submit");
console.log(emptyError);

var isCaps = false; // Initialize this variable to track the CapsLock state

// Detect CapsLock status
window.addEventListener("keyup", event => {
    isCaps = event.getModifierState('CapsLock');
});

// Email regex for validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Function to check CapsLock and empty field status
function checkFieldStatus(field, fieldName) {
    let fieldValid = true; // Assume field is valid initially

    if (field.value === "") {
        fieldValid = false; // Field is invalid if it's empty

        if (isCaps) {
            // If CapsLock is ON and field is empty
            emptyError.textContent = `${fieldName} cannot be empty`;  // Show empty field message in emptyError
            capsError.textContent = "WARNING! CAPS LOCK IS ON!";      // Show CapsLock warning in capsError
        } else {
            // If CapsLock is OFF and field is empty
            capsError.textContent = `${fieldName} cannot be empty`;   // Show empty field message in capsError
            emptyError.textContent = "";                              // Clear emptyError
        }
    } else {
        // For email validation
        if (fieldName === "Email" && !emailRegex.test(field.value)) {
            fieldValid = false; // Mark email field as invalid if it doesn't match the regex
            emptyError.textContent = `Invalid ${fieldName}`;          // Show email invalid message in emptyError
        } else {
            // Clear both messages when the field is not empty or invalid
            emptyError.textContent = "";
        }

        if (isCaps) {
            capsError.textContent = "WARNING! CAPS LOCK IS ON!";
        } else {
            capsError.textContent = "";
        }
    }

    return fieldValid;
}

// Function to handle input checks for individual fields
function handleFieldValidation(field, fieldName) {
    field.addEventListener("keyup", function () {
        checkFieldStatus(field, fieldName);
    });
}

// Apply validation for all fields
handleFieldValidation(email, "Email");
handleFieldValidation(number, "Number");
handleFieldValidation(address, "Address");
handleFieldValidation(password, "Password");
handleFieldValidation(Name, "Name");

// Handle form submission
submit.addEventListener("click", function(event) {
    let isValid = true; // Assume the form is valid initially

    // Recheck all fields before submission
    isValid = checkFieldStatus(Name, "Name") && isValid;
    isValid = checkFieldStatus(email, "Email") && isValid;
    isValid = checkFieldStatus(number, "Number") && isValid;
    isValid = checkFieldStatus(address, "Address") && isValid;
    isValid = checkFieldStatus(password, "Password") && isValid;

    if (!isValid) {
        event.preventDefault(); // Prevent form submission if any field is invalid
    } else {
        alert("Form submitted successfully");
    }
});
