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
let worky = Array.from(document.querySelectorAll('input[name="work"]:checked')).map(input => input.value);

//place event listener out here and call function when the checkbox is pressed
var checkbox = document.querySelectorAll(".selectedWorkout").forEach(function(currentElement, currentIndex, listObj) {
    currentElement.addEventListener("click", function(e) {
        for (let i = 0; i < this.parentNode.childNodes.length; i++) {
            if (this.parentNode.childNodes[i].nodeType == Node.ELEMENT_NODE) {
                // console.log(this.parentNode.childNodes[i].checked); //can check whether the checkbox is on or off like so
                //Credit: ChatGPT - create an array based on the values of the checkboxes
                worky = Array.from(document.querySelectorAll('input[name="work"]:checked')).map(input => input.value);
            }
        }
    })
});

//gets the current day; used to specify which day to update
var myDay = document.getElementById('dayOfWeek').innerHTML;
document.getElementById("saveButton").addEventListener("click", function(e){
    if (worky.length == 0) {
        worky.push('No workouts');
    }
    ajaxPOST('/scheduleSave', {newSched: worky, day : myDay}, (val) => {console.log(val)});
});