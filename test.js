// let enterButton = document.getElementById('enter')
let latInfo = document.getElementById('lat-info')
let longInfo = document.getElementById('long-info')
let getLocationButton = document.getElementById('getLocation')
let dropHeightElem = document.getElementById('dropHeight')
let timeInput = document.getElementById('time')
let windSpeed = document.getElementById('windSpeed')
let windDir = document.getElementById('windDir')
let resultBox = document.getElementById('resultBox')
let locationInfo;
let currentWeatherData;

function calculateDrop () {
    resultBox.textContent = latInfo.value + longInfo.value + dropHeightElem.value + timeInput.value + windSpeed.value + windDir.value

}
// enterButton.onclick = function (e) {
//     resultBox.textContent = latInfo.value + longInfo.value + dropHeightElem.value + windSpeed.value + windDir.value
// }

getLocationButton.onclick = function (e) {
    navigator.geolocation.getCurrentPosition((x) => {
        console.log('location get successful', locationInfo)
        let locData = JSON.stringify(x)
        fetchFromOpenMeteo(locData.coords.latitude, locData.coords.longitude)
        locationInfo = x
        latInfo.value = locData.coords.latitude
        longInfo.value = locData.coords.longitude
    }, console.log)
}


//source: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register
if ("serviceWorker" in navigator) {
  // Register a service worker hosted at the root of the
  // site using the default scope.
  navigator.serviceWorker.register("./sw.js").then(
    (registration) => {
      console.log("Service worker registration succeeded:", registration);
    },
    (error) => {
      console.error(`Service worker registration failed: ${error}`);
    },
  );
} else {
  console.error("Service workers are not supported.");
}

//manifest.json modifed from: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable

function writeCurrentWeatherData (currentData) {
    if (isNaN(timeInput.value)) {
        return false
    }
    let time = JSON.parse(timeInput.value)
    if (time === 0) {
        windDir.value = currentData.current['wind_direction_10m']
        windSpeed.value = currentData.current['wind_speed_10m']
    }
    else {
        windDir.value = currentData['wind_direction_10m'][time]
        windSpeed.value = currentData['wind_speed_10m'][time]
    }
}

async function fetchFromOpenMeteo (latitude, longitude) {
    console.log('getting weather data from open meteo')
    let url = 'https://api.open-meteo.com/v1/forecast?latitude=' + latitude + '&longitude=' + longitude + '&hourly=,wind_speed_10m,wind_direction_10m&current=wind_direction_10m,wind_speed_10m&forecast_days=1'
    try {
        let res = await fetch(url)
        if (!res.ok) {
            throw new Error ('Response status from Open Meteo: ', res.status)
        }
        let currentData = await res.json()
        currentWeatherData = currentData
        writeCurrentWeatherData (currentData)
        return currentData
    }
    catch (e) {
            console.error('Error while fetching from Open Meteo: ', e)
    }
}


function checkIfAllFieldsInputted () {
    let items = [latInfo.value, longInfo.value, dropHeightElem.value, timeInput.value, windSpeed.value, windDir.value]
    let verdict = items.every(x => {
        if (x === undefined && x !== '' && isNaN(x) === false) {
            return false
        }
        else {
            return true
        }
    })
    if (verdict === true) {
        calculateDrop()
        return true
    }
}

function whenLocationChange () {
    console.log('change detected')
    if (latInfo.value !== '' && longInfo.value !== '') {
        fetchFromOpenMeteo(JSON.parse(latInfo.value), JSON.parse(longInfo.value))
        checkIfAllFieldsInputted()
    }
}

function handleCoordsPasting (e) {
    let pastedData = (e.clipboardData || window.clipboardData).getData('text')
    if (pastedData.includes(',')) {
        let splitData = pastedData.split(',')
        setTimeout(() => {
            longInfo.value = ''
            latInfo.value = ''
            latInfo.value = splitData[0].trim()
            longInfo.value = splitData[1].trim()
            whenLocationChange()
        })
    }
}

latInfo.addEventListener('paste', handleCoordsPasting)
latInfo.addEventListener('paste', handleCoordsPasting)

longInfo.onchange = whenLocationChange
latInfo.onchange = whenLocationChange
dropHeightElem.onchange = checkIfAllFieldsInputted
time.onchange = (e) => {
    if (currentWeatherData !== undefined) {
        writeCurrentWeatherData(currentWeatherData)
    }
    checkIfAllFieldsInputted()
}

windDir.onchange = checkIfAllFieldsInputted
windSpeed.onchange = checkIfAllFieldsInputted
