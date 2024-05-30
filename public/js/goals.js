$(document).ready(function() {
    // Handle delete action when the "Delete" button in the confirmation modal is clicked
    $('#confirmDelete').on('click', function() {
        var goalIndex = $('#confirmationModal').data('goal-index');
        $('#deleteGoalForm' + goalIndex).submit();
    });

    // Store the goal index when the confirmation modal is shown
    $('#confirmationModal').on('show.bs.modal', function(event) {
        var button = $(event.relatedTarget); 
        var goalIndex = button.closest('form').find('input[name="goalIndex"]').val();
        $(this).data('goal-index', goalIndex);
    });

    // AJAX POST function to send data to the server
    function ajaxPOST(url, data) {
        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                console.log('Request successful');
            } else {
                console.error('Error:', xhr.status);
                }
            }
        };
        xhr.open("POST", url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(data));
    }

    // Handle checkbox change event to update the goal completion status in the database
    $('.custom-control-input').on('change', function() {
        var goalIndex = $(this).attr('id').replace('trackGoal', '');
        var isTracked = $(this).is(':checked');
        var track = [];
        track.push(goalIndex);
        track.push(isTracked);

        ajaxPOST('/trackGoal', {track: track});
    });
});