// Function that opens the forgot password modal and sets its content.
function openForgotPasswordModal() {
    let modalBody = document.querySelector(".modal-body");
    modalBody.innerHTML = `
        <form id="forgotPasswordForm" action="/forgotpassword" method="post">
            <div class="form-group">
                <label for="email">Email address</label>
                <input name="email" type="email" class="form-control" id="email" placeholder="Enter email">
            </div>
            <button type="submit" class="btn btn-primary" onclick="changeModal(event)">Submit</button>
        </form>
    `;
    $('#loginModal').modal('show'); // Show the modal
}

// Function that handles form submission and changes the modal content.
function changeModal(event) {
    event.preventDefault(); // Prevent the default form submission behavior

    // Get the email value from the form
    let email = document.getElementById('email').value;

    // AJAX request to send the email value to the server
    ajaxPOST("/forgotpassword", { email: email }, function(response) {
        let parsedResponse = JSON.parse(response);
        let modalBody = document.querySelector(".modal-body");
        modalBody.innerHTML = parsedResponse.message;
    });
}

// AJAX POST function to send data to the server
function ajaxPOST(url, data, callback) {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                callback(xhr.responseText);
            } else {
                console.error('Error:', xhr.status);
            }
        }
    };
    xhr.open("POST", url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(data));
}

