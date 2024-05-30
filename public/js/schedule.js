//ajax function to send data from client to server
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

var myDay = document.getElementById('dayOfWeek').innerHTML;

//place event listener out here and call function when the checkbox is pressed
var checkbox = document.querySelectorAll(".selectedWorkout").forEach(function(currentElement, currentIndex, listObj) {
    currentElement.addEventListener("click", function(e) {
        if (currentElement.checked) {
            ajaxPOST('/scheduleSave', {newWorkout: currentElement.id, day : myDay, adding: true}, (val) => {console.log(val)});
        } else {
            ajaxPOST('/scheduleSave', {newWorkout: currentElement.id, day : myDay, adding: false}, (val) => {console.log(val)});
        }
    })
});