//Validator for profile edit form
function validationForm(inputs) {
    let result = true
    //Regex fr check correct telephone number input
    const regex = /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/
    inputs.forEach(input => {
        //if required fields null?
        if (!input.value) {
            if (input.id == "contact-phone"
                || input.id == "emergency-phone"
                || input.id == "job"
                || input.id == "home-address"
                || input.id == "full-name") {
                input.insertAdjacentHTML("beforebegin", `<span class="error-message">Cant be Empty</span>`)
                result = false
            }
        } else if (input.id == "contact-phone"
            || input.id == "emergency-phone") {
            if (!regex.test(input.value)) {
                input.insertAdjacentHTML("beforebegin", `<span class="error-message">Not correct number</span>`)
                result = false
            }
        }
    })
    //clean error messages
    setTimeout(() => {
        const messages = document.querySelectorAll(".error-message")
        messages.forEach(message => message.remove())
    }, 3000)

    return result
}

//Validate file size before upload
function validateSize(file, size) {
    let fileSize = file.size / 1024 / 1024; // in MiB
    if (fileSize > size) {
        alert(`File size exceeds ${size} MiB`);
        // $(file).val(''); //for clearing with Jquery
    } else {
        return true
    }
}