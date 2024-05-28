
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


document.getElementById('editUsernameForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const name = document.getElementById('usernameInput').value;

    if (!name.trim()) {
        let modalBody = document.querySelector(".modal-body-user");
        modalBody.innerHTML =  'Username cannot be empty.'
        return;
    }

    ajaxPOST("/editUsername",{name: name}, function(response){
        let parsedResponse = JSON.parse(response);
        let modalBody = document.querySelector(".modal-body-user");
        modalBody.innerHTML = parsedResponse.message;
        $('#usernameSuccessModal').modal('show');

    })

});

document.getElementById('editPasswordForm').addEventListener('submit', function(event) {
    event.preventDefault();

     // Get the form data
     const curpassword = document.getElementById('currentPasswordInput').value;
     const newPass = document.getElementById('newPasswordInput').value;

     if (!curpassword.trim() || !newPass.trim()) {
        let modalBody = document.querySelector(".modal-body-pass");
        modalBody.innerHTML = 'Current password and new password fields cannot be empty.'
        return;
    }

    ajaxPOST("/editPassword",{curr: curpassword, newPass: newPass}, function(response){
        let parsedResponse = JSON.parse(response);
        let modalBody = document.querySelector(".modal-body-pass");
        modalBody.innerHTML = parsedResponse.message;
        $('#passwordSuccessModal').modal('show');
    })
});

document.getElementById('uploadProfilePictureForm').addEventListener('submit', function(e) {
  const fileInput = document.getElementById('profilePictureInput');
  if (!fileInput.value) {
    e.preventDefault();
    alert('Please select a file to upload.');
  }
});

// Refresh the page when the modal closes
$('#usernameSuccessModal').on('hide.bs.modal', function () {
    location.reload();
});

$('#passwordSuccessModal').on('hide.bs.modal', function () {
    location.reload();
});