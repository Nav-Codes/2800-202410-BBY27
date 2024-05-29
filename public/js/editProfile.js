
// AJAX POST function to send data to the server
function ajaxPOST(url, data, callback) {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
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

// function does checking and posts form fields to the server
document.getElementById('editUsernameForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const name = document.getElementById('usernameInput').value;
    const usernameError = document.getElementById('usernameError');
    usernameError.textContent = '';
    // Clear previous error state
    document.getElementById('usernameInput').classList.remove('is-invalid');

    // Validation rules
    if (!name.trim()) {
        usernameError.textContent = 'Username cannot be empty.';
        document.getElementById('usernameInput').classList.add('is-invalid');
        return;
    }

    if (name.length > 15) {
        usernameError.textContent = 'Username cannot be more than 15 characters long.';
        document.getElementById('usernameInput').classList.add('is-invalid');
        return;
    }

    if (!/^[a-zA-Z0-9]+$/.test(name)) {
        usernameError.textContent = 'Username can only contain numbers or letters.';
        document.getElementById('usernameInput').classList.add('is-invalid');
        return;
    }
    ajaxPOST("/editUser", { name: name }, function (response) {
        let parsedResponse = JSON.parse(response);
        let modalBody = document.querySelector(".modal-body-user");
        modalBody.innerHTML = parsedResponse.message;
        $('#usernameSuccessModal').modal('show');

    })

});

document.getElementById('editPasswordForm').addEventListener('submit', function (event) {
    event.preventDefault();

    // Get the form data
    const curpassword = document.getElementById('currentPasswordInput').value;
    const newPass = document.getElementById('newPasswordInput').value;
    const currentPasswordError = document.getElementById('currentPasswordError');
    const newPasswordError = document.getElementById('newPasswordError');

    currentPasswordError.textContent = '';
    newPasswordError.textContent = '';

    // Clear previous error state
    document.getElementById('currentPasswordInput').classList.remove('is-invalid');
    document.getElementById('newPasswordInput').classList.remove('is-invalid');

    // Validation rules
    if (!curpassword.trim()) {
        currentPasswordError.textContent = 'Current password cannot be empty.';
        document.getElementById('currentPasswordInput').classList.add('is-invalid');
        return;
    }

    if (!newPass.trim()) {
        newPasswordError.textContent = 'New password cannot be empty.';
        document.getElementById('newPasswordInput').classList.add('is-invalid');
        return;
    }

    if (newPass.length < 8) {
        newPasswordError.textContent = 'New password must be at least 8 characters long.';
        document.getElementById('newPasswordInput').classList.add('is-invalid');
        return;
    }


    ajaxPOST("/editPass", { curr: curpassword, newPass: newPass }, function (response) {
        let parsedResponse = JSON.parse(response);
        let modalBody = document.querySelector(".modal-body-pass");
        modalBody.innerHTML = parsedResponse.message;
        $('#passwordSuccessModal').modal('show');
    })
});

// Refresh the page when the modal closes
document.addEventListener('DOMContentLoaded', function () {
    var usernameSuccessModal = document.getElementById('usernameSuccessModal');
    var passwordSuccessModal = document.getElementById('passwordSuccessModal');

    usernameSuccessModal.addEventListener('hidden.bs.modal', function () {
        location.reload();
    });

    passwordSuccessModal.addEventListener('hidden.bs.modal', function () {
        location.reload();
    });
});