
let enterButton = document.getElementById('enter')
let locText = document.getElementById('location-info')
let locDrop = document.getElementById('location-dropdown')
let dropHeightElem = document.getElementById('dropHeight')
let windSpeed = document.getElementById('windSpeed')
let windDir = document.getElementById('windDir')
let resultBox = document.getElementById('resultBox')
let locationInfo;

enterButton.onclick = function (e) {
    resultBox.textContent = locText.value + locDrop.value + dropHeightElem.value + windSpeed.value + windDir.value
}

navigator.geolocation.getCurrentPosition((x) => {
    locationInfo = x
}, console.log)
