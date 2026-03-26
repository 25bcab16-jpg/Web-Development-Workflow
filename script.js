// ==================== FORM VALIDATION ==================== 
const form = document.getElementById("contactForm");
const submitButton = form.querySelector(".submit-button");
const formMessage = document.getElementById("formMessage");

// Validation rules
const validators = {
    name: {
        pattern: /^[a-zA-Z\s]{2,50}$/,
        message: "Name must be 2-50 characters and contain only letters"
    },
    email: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: "Please enter a valid email address"
    },
    subject: {
        pattern: /^.{3,100}$/,
        message: "Subject must be 3-100 characters"
    },
    message: {
        pattern: /^.{10,1000}$/,
        message: "Message must be 10-1000 characters"
    }
};

// Validate individual field
function validateField(fieldId) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(fieldId + "Error");
    const validator = validators[fieldId];
    
    if (!validator) return true;

    const isValid = validator.pattern.test(field.value.trim());
    
    if (!isValid) {
        errorElement.textContent = validator.message;
        errorElement.classList.add("show");
        field.style.borderColor = "#ff6b6b";
    } else {
        errorElement.textContent = "";
        errorElement.classList.remove("show");
        field.style.borderColor = "rgba(0, 242, 254, 0.2)";
    }
    
    return isValid;
}

// Real-time validation
["name", "email", "subject", "message"].forEach(fieldId => {
    const field = document.getElementById(fieldId);
    field.addEventListener("blur", () => validateField(fieldId));
    field.addEventListener("input", () => {
        if (document.getElementById(fieldId + "Error").classList.contains("show")) {
            validateField(fieldId);
        }
    });
});

// Form submission
form.addEventListener("submit", async function(e) {
    e.preventDefault();

    // Validate all fields
    const fieldsToValidate = ["name", "email", "subject", "message"];
    const allValid = fieldsToValidate.every(field => validateField(field));

    if (!allValid) {
        showMessage("Please fix the errors above", "error");
        return;
    }

    // Disable button during submission
    submitButton.disabled = true;
    const originalText = submitButton.textContent;
    submitButton.textContent = "Sending...";

    try {
        const response = await fetch("http://localhost:3000/contact", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: document.getElementById("name").value.trim(),
                email: document.getElementById("email").value.trim(),
                subject: document.getElementById("subject").value.trim(),
                message: document.getElementById("message").value.trim()
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success) {
            showMessage("✅ Message sent successfully! I'll get back to you soon.", "success");
            form.reset();
            
            // Clear error states
            fieldsToValidate.forEach(fieldId => {
                document.getElementById(fieldId + "Error").classList.remove("show");
                document.getElementById(fieldId).style.borderColor = "rgba(0, 242, 254, 0.2)";
            });
        } else {
            showMessage(data.message || "Failed to send message", "error");
        }
    } catch (error) {
        console.error("Error:", error);
        showMessage("❌ Connection error. Please try again later.", "error");
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
});

// Show message helper
function showMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        formMessage.className = "form-message";
    }, 5000);
}