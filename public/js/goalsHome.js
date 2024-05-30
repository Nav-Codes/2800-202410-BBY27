document.addEventListener("DOMContentLoaded", function() {
    function updateProgressBar(index, goal) {
        const progress = document.querySelector(`.progress-done.progress-done${index}`);
        const finalValue = goal[3];
        const maxValue = goal[0];
        if (maxValue > 0) {
            const widthPercentage = (finalValue / maxValue) * 100;
            progress.style.width = `${widthPercentage}%`;
            progress.innerText = `${Math.ceil(widthPercentage)}%`;
        }
    }

    // Iterate through each goal and update the progress bar
    goals.forEach((goal, index) => {
        updateProgressBar(index, goal);
    });
});
