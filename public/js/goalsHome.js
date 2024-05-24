const progress = document.querySelector('.progress-done');

function updateProgressBar() {
    if (randomGoal) {
        const finalValue = randomGoal[3];
        const maxValue = randomGoal[0];
        if (maxValue > 0) {
            const widthPercentage = (finalValue / maxValue) * 100;
            progress.style.width = `${widthPercentage}%`;
            progress.innerText = `${Math.ceil(widthPercentage)}%`;
        }
    }
}

// Initial render
updateProgressBar();