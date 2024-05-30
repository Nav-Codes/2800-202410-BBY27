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

//gets the day of the week that is being edited
var selectedDay = document.getElementById('dayOfWeek').innerHTML;

//event listener for when a checkbox is clicked on a workout
var checkbox = document.querySelectorAll(".selectedWorkout").forEach(function(currentElement, currentIndex, listObj) {
    currentElement.addEventListener("click", function(e) {
        if (currentElement.checked) {
            //add workout to database
            ajaxPOST('/scheduleSave', 
            {newWorkout: currentElement.id, day : selectedDay, adding: true}, 
            (val) => {console.log(val)});
        } else {
            //remove workout from database
            ajaxPOST('/scheduleSave', 
            {newWorkout: currentElement.id, day : selectedDay, adding: false}, 
            (val) => {console.log(val)});
        }
    })
});

//clears the list of workouts for the given day 
document.getElementById("clearWorkouts").addEventListener("click", function(e) {
    document.querySelectorAll(".selectedWorkout").forEach(function(currentElement, currentIndex, listObj) {
        ajaxPOST('/scheduleClear', {day : selectedDay}, (val) => {console.log(val)});
    });
    location.reload();
});