// Function to validate email format
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// // Helper function to validate URL format
// function isValidUrl(url) {
//     // Regular expression for URL validation
//     const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
//     return urlRegex.test(url);
// }

module.exports = {
    validateEmail
};