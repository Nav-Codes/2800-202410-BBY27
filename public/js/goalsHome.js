
const progress = document.querySelector('.progress-done');
const input = document.querySelector('.input');
const maxInput = document.querySelector('.maxInput');
let finalValue = 0;
let maxValue = 0;

function changeWidth() {
    if (maxValue > 0) {
        const widthPercentage = (finalValue / maxValue) * 100;
        progress.style.width = `${widthPercentage}%`;
        progress.innerText = `${Math.ceil(widthPercentage)}%`;
    }
}

input.addEventListener('keyup', function () {
    finalValue = parseInt(input.value, 10) || 0;
    changeWidth();
});

maxInput.addEventListener('keyup', function () {
    maxValue = parseInt(maxInput.value, 10) || 0;
    changeWidth();
});