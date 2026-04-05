const form = document.getElementById("contactForm");
const submitButton = form.querySelector(".submit-button");
const formMessage = document.getElementById("formMessage");
const fieldIds = ["name", "email", "subject", "message"];
const contactButton = document.querySelector("[data-scroll-target='contact']");

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

function validateField(fieldId) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(`${fieldId}Error`);
    const validator = validators[fieldId];
    const isValid = validator.pattern.test(field.value.trim());

    errorElement.textContent = isValid ? "" : validator.message;
    errorElement.classList.toggle("show", !isValid);
    field.style.borderColor = isValid ? "rgba(0, 242, 254, 0.2)" : "#ff6b6b";

    return isValid;
}

function clearFieldState(fieldId) {
    document.getElementById(`${fieldId}Error`).classList.remove("show");
    document.getElementById(fieldId).style.borderColor = "rgba(0, 242, 254, 0.2)";
}

function showMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;

    window.clearTimeout(showMessage.timeoutId);
    showMessage.timeoutId = window.setTimeout(() => {
        formMessage.className = "form-message";
        formMessage.textContent = "";
    }, 5000);
}

if (contactButton) {
    contactButton.addEventListener("click", () => {
        document.getElementById("contact").scrollIntoView({ behavior: "smooth" });
    });
}

fieldIds.forEach((fieldId) => {
    const field = document.getElementById(fieldId);

    field.addEventListener("blur", () => validateField(fieldId));
    field.addEventListener("input", () => {
        if (document.getElementById(`${fieldId}Error`).classList.contains("show")) {
            validateField(fieldId);
        }
    });
});

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const allValid = fieldIds.every((fieldId) => validateField(fieldId));
    if (!allValid) {
        showMessage("Please fix the errors above.", "error");
        return;
    }

    submitButton.disabled = true;
    const originalText = submitButton.textContent;
    submitButton.textContent = "Sending...";

    try {
        const response = await fetch("/contact", {
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

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Failed to send message.");
        }

        form.reset();
        fieldIds.forEach(clearFieldState);
        showMessage("Message sent successfully. I will get back to you soon.", "success");
    } catch (error) {
        console.error("Form submission error:", error);
        showMessage(error.message || "Connection error. Please try again later.", "error");
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
});
