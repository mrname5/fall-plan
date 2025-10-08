// let enterButton = document.getElementById('enter')
let latInfo = document.getElementById('lat-info')
let longInfo = document.getElementById('long-info')
let getLocationButton = document.getElementById('getLocation')
let locationItems = document.getElementById('locationItems')
let dropHeightElem = document.getElementById('drop-info')
let pullHeightElem = document.getElementById('pull-info')
let freefallKElem = document.getElementById('freefallK-info')
let canopyKElem = document.getElementById('canopyK-info')
let groupSpeedElem = document.getElementById('groundSpeed-info')
let conversionElem = document.getElementById('conversion-info')
let timeInput = document.getElementById('time')
let dispIntervalElem = document.getElementById('dispInterval')
// let resultBox = document.getElementById('resultBox')
let dqInput = document.getElementById('dqInput')
let deGs = document.getElementById('deGs')
let deCon = document.getElementById('deCon')
let deMeter = document.getElementById('deMeter')
let dqInfo = document.getElementById('dqInfo')
let locationInfo;
let currentWeatherData;
let allWeatherData;
let networkConnected = true
let forSpeed = document.getElementById('fsInput')
let safeFact = document.getElementById('sfInput')

let changeInputs = [dropHeightElem, pullHeightElem, freefallKElem, canopyKElem, groupSpeedElem, conversionElem, dispIntervalElem, dqInfo, forSpeed, safeFact]

function enforceReadOnly () {
    let items = document.getElementsByClassName('read')
    for (let i = 0; i < items.length; i++) {
        items[i].readOnly = true
    }
}

enforceReadOnly()

function onlineActions () {
    console.log('online')
    locationItems.style.display = 'block'
    networkConnected = true
    whenLocationChange()
}

function offlineActions () {
    console.log('offline')
    locationItems.style.display = 'none'
    networkConnected = false
}

function networkAdaptActions () {
    if (navigator.onLine) {
        onlineActions()
    }
    else {
        offlineActions()
    }
    window.addEventListener('online', onlineActions)
    window.addEventListener('offline', offlineActions)
}

networkAdaptActions()

function calculateDrop () {
//     resultBox.textContent = latInfo.value + longInfo.value + dropHeightElem.value + timeInput.value 

}
// enterButton.onclick = function (e) {
//     resultBox.textContent = latInfo.value + longInfo.value + dropHeightElem.value + windSpeed.value + windDir.value
// }

let dispertionInfo;
function calculateDispertion () {
    let info = {'speed': JSON.parse(groupSpeedElem.value), "interval": JSON.parse(dispIntervalElem.value), "conversion": JSON.parse(conversionElem.value)}
    info.output = info.speed * info.interval * info.conversion
    dispertionInfo = info
    populateDispertionTable(info)
    return info
}

function populateDispertionTable (info) {
    let names = ['disGS', 'disInt', 'disCon', 'disMeter']
    let items = names.map(x => {
        return document.getElementById(x)
    })
    items[0].value = info.speed
    items[1].value = info.interval
    items[2].value  = info.conversion
    items[3].value = info.output
}

function checkIfUpdateDispertionTable (e) {
    if (e === undefined) {
        calculateDispertion()
        return true
    }
    else if (e.target === dispIntervalElem || e.target === groupSpeedElem || e.target === conversionElem) {
        calculateDispertion()
        return true
    }
    return false
}

let ftInfo;
function calculateFt () {
    let info = {'speed': JSON.parse(groupSpeedElem.value), "dq": JSON.parse(dqInfo.value), "conversion": JSON.parse(conversionElem.value)}
    info.output = info.speed * info.dq * info.conversion
    ftInfo = info
    populateFtTable(info)
    return info
}

function populateFtTable (info) {
    dqInput.value = info.dq
    deGs.value = info.speed
    deCon.value  = info.conversion
    deMeter.value = info.output
}

function checkIfCalculateFt (e) {
    if (isNaN(dqInfo.value) || isNaN(groupSpeedElem.value) || isNaN(conversionElem.value)) {
        return false
    }
    else if (e === undefined) {
        calculateFt()
        return true
    }
    if (e.target === dqInfo || e.target === groupSpeedElem || e.target === conversionElem) {
        calculateFt()
        return true
    }
    return false
}
getLocationButton.onclick = function (e) {
    navigator.geolocation.getCurrentPosition((x) => {
        locationInfo = x
        console.log('location get successful', locationInfo)
//         resultBox.value = locationInfo
        fetchFromOpenMeteo(locationInfo.coords.latitude, locationInfo.coords.longitude)
        latInfo.value = locationInfo.coords.latitude
        longInfo.value = locationInfo.coords.longitude
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
    checkIfAllFieldsInputted()
}

// findClosest function and relavent documentation from: https://github.com/renickbell/array-toolkit
/**
  * Finds the largest number smaller than the "item" argument within an array,
  * @param {array} arr - The array to sort through.
  * @param item - The item to find the closest of
  * @param {function} comparatorFn - The conditions to look/compare for.
  * @example console.log(findClosest([0, 1, 2, 3], 2, (inputItem) => {return inputItem.item < 2})) //{ index: 1, item: 1 }
*/
function findClosest (arr, item, comparatorFn){
    let mid = arr.indexOf(item)
    let left = mid
    let right = mid
    let sortedArray = arr.map((x, i) => {
        if (i % 2 === 0 && left > 0){
            left -= 1
            return {index: left, item: arr[left]}
        }
        else if (right < arr.length - 1){
            right += 1
            return {index: right, item: arr[right]}
        }
        else {
            left -= 1
            return {index: left, item: arr[left]}
        }
    })
    sortedArray.pop()
    return sortedArray[sortedArray.findIndex(comparatorFn)]
}

//https://www.weather.gov/epz/wxcalc_pressurealtitude
//https://www.weather.gov/media/epz/wxcalc/pressureAltitude.pdf
function hpaToFeet (hpa) {
    return (1 - (hpa / 1013.25) ** 0.190284) * 145366.45
}
// h = (1 - (hpa / 1013.25) ** 0.190284) * 145366.45
// h/ 145366.45 = 1 - (hpa / 1013.25) ** 0.190284
// (1- (h/ 145366.45)) ** (1 / 0.190284) = (hpa / 1013.25)
// hpa = (1 - (h / 145366.45)) ** (1 / 0.190284) * 1013.25

function feetToHpa (feet) {
    return (1 - (feet / 145366.45)) ** (1 / 0.190284) * 1013.25
}

function metersToFeet (meter) {
    return meter * 3.281
}

let availableHpas = []
function populateAvailableHpas () {
    Object.keys(currentWeatherData.hourly_units).forEach(x => {
        if (x.includes('wind_speed_')) {
            availableHpas.push(JSON.parse(x.slice(11, x.length - 3)))
        }
    })
    availableHpas.sort((a, b) => a - b)
}

function handleTimeChange (fetchedData) {
    let time = new Date ()
    let date = time.toISOString().split('T')[0]
    let hour = time.getUTCHours() + JSON.parse(timeInput.value)
    hour = hour.toString()
    if (hour.length <= 1) {
        hour = '0' + hour
    }
    date += 'T' + hour + ':00'
    allWeatherData = fetchedData
    let currentTimeIndex = -1
    fetchedData.hourly.time.every((x, i) => {
        if (x === date) {
            currentTimeIndex = i
            return false
        }
        else {
            return true
        }
    })
    currentWeatherData = JSON.parse(JSON.stringify(fetchedData))
    Object.keys(fetchedData.hourly).forEach(x => {
        if (typeof currentWeatherData.hourly[x] === 'object') {
            currentWeatherData.hourly[x] = currentWeatherData.hourly[x].slice(currentTimeIndex)
        }
    })
}

async function fetchFromOpenMeteo (latitude, longitude) {
    if (networkConnected === false) {
        return false
    }
    console.log('getting weather data from open meteo')
//     let url = 'https://api.open-meteo.com/v1/forecast?latitude=' + latitude + '&longitude=' + longitude + '&hourly=,wind_speed_10m,wind_direction_10m&current=wind_direction_10m,wind_speed_10m&forecast_days=1'
    let url = "https://api.open-meteo.com/v1/forecast?latitude=" + latitude + '&longitude=' + longitude + "&hourly=temperature_1000hPa,temperature_950hPa,wind_speed_925hPa,wind_speed_800hPa,wind_speed_1000hPa,wind_speed_975hPa,wind_speed_900hPa,wind_speed_950hPa,wind_speed_850hPa,wind_speed_200hPa,wind_speed_250hPa,wind_speed_300hPa,wind_speed_400hPa,wind_speed_500hPa,wind_speed_600hPa,wind_speed_700hPa,wind_speed_100hPa,wind_speed_150hPa,wind_speed_70hPa,wind_speed_50hPa,wind_speed_30hPa,wind_direction_1000hPa,wind_direction_975hPa,wind_direction_950hPa,wind_direction_925hPa,wind_direction_900hPa,wind_direction_850hPa,wind_direction_800hPa,wind_direction_250hPa,wind_direction_200hPa,wind_direction_300hPa,wind_direction_400hPa,wind_direction_500hPa,wind_direction_600hPa,wind_direction_700hPa,wind_direction_150hPa,wind_direction_100hPa,wind_direction_70hPa,wind_direction_50hPa,wind_direction_30hPa,temperature_975hPa,temperature_925hPa,temperature_900hPa,temperature_800hPa,temperature_850hPa,temperature_200hPa,temperature_250hPa,temperature_300hPa,temperature_400hPa,temperature_500hPa,temperature_600hPa,temperature_700hPa,temperature_150hPa,temperature_100hPa,temperature_70hPa,temperature_50hPa,temperature_30hPa&forecast_days=3"
    try {
        let res = await fetch(url)
        if (!res.ok) {
            throw new Error ('Response status from Open Meteo: ', res.status)
        }
        let fetchedData = await res.json()
//         writeCurrentWeatherData (fetchedData)
        handleTimeChange(fetchedData)
//         checkWhichTablesToPopulate()
        checkWhichItemsToUpdate()
        return fetchedData
    }
    catch (e) {
            console.error('Error while fetching from Open Meteo: ', e)
    }
}

function findClosest(sortedArray, target) {
    if (sortedArray.length === 0) {
        return null; // handle empty array
    }
    let left = 0;
    let right = sortedArray.length - 1;
    // If target is outside the array bounds
    if (target <= sortedArray[left]) {
        return sortedArray[left];
    }
    if (target >= sortedArray[right]) {
        return sortedArray[right];
    }
    while (left <= right) {
        let mid = Math.floor((left + right) / 2);
        if (sortedArray[mid] === target) {
            return sortedArray[mid];
        } else if (sortedArray[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    // After the loop, left is the first number greater than target
    // right is the last number less than target
    // Pick the closest
    if ((sortedArray[left] - target) < (target - sortedArray[right])) {
//         return sortedArray[left];
        return left
    } else {
//         return sortedArray[right];
        return right
    }
}

function findClosestHpa (feet) {
    let hpas = Object.keys(currentWeatherData['hourly_units']).filter(x => x.includes('temperature')).map(x => { return JSON.parse(x.slice(12, x.length - 3))}).sort((a, b) => a - b)
    return JSON.stringify(hpas[findClosest(hpas, feetToHpa(feet))])
}

//inclusive
function calcWindAltitudeRangeData (max, min) {
    let altitudeWindData = {}
    for (let i = 0; i < (max - min) / 1000; i++) {
        let feet = max - (i * 1000)
        if (currentWeatherData !== undefined) {
            let hpa = findClosestHpa(feet)
            let directionVar = 'wind_direction_' + hpa + 'hPa'
            let velocityVar = 'wind_speed_' + hpa + 'hPa'
            altitudeWindData[JSON.stringify(feet)] = {direction: currentWeatherData.hourly[directionVar], velocity: currentWeatherData.hourly[velocityVar]}
        }
        else {
            altitudeWindData[JSON.stringify(feet)] = {direction: 0, velocity: 0}
        }
    }
    return altitudeWindData
}

// calcWindAltitudeRangeData(11000, 5000)

function createWindTable (windAltitudeRangeData) {
    let windTable = {}
    Object.keys(windAltitudeRangeData).reverse().forEach(x => {
        let data = windAltitudeRangeData[x]
        windTable[x] = {direction: data.direction[0], velocity: data.velocity[0]}
    })
    return windTable
}

// createWindTable(0)

let tableUnits = {
    "direction": "°",
    'velocity': "km/h",
}

function calculateTableResult (currentWindTable) {
    let dirTotal = 0
    let velTotal = 0
    let values = Object.values(currentWindTable)
    values.forEach(x => {
        dirTotal += x.direction
        velTotal += x.velocity
    })
    let calculated =  {direction: {total: dirTotal, average: dirTotal / values.length}, velocity: {total: velTotal, average: velTotal / values.length}}
    if (currentWeatherData !== undefined) {
        tableUnits.direction = currentWeatherData['hourly_units']['wind_direction_50hPa']
        tableUnits.velocity = currentWeatherData['hourly_units']['wind_speed_50hPa']
    }
    return calculated
}

//calculateTableResult()

function sumOfArray (inputArray) {
    return inputArray.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      initialValue,
    );
}

// let windTableElem = document.getElementById('windTable')

function transformToHeader (title) {
    let txt = JSON.parse(JSON.stringify(title))
    return txt[0].toUpperCase() + txt.slice(1)
}

function tableToHtml (windTableElem, currentWindTable, currentWindResults, captionText) {
    windTableElem.innerHTML = ''
    let table = document.createElement('table')
    let caption = document.createElement('caption')
    caption.textContent = captionText
    table.appendChild(caption)
    let thead = table.createTHead();
    let headerRow = thead.insertRow()
    headerRow.insertCell().outerHTML = '<th>Altitude (ft)</th>'
    Object.keys(Object.values(currentWindTable)[0]).forEach(x => {
        let th = document.createElement('th')
        th.textContent = transformToHeader(x) + ' (' + tableUnits[x] + ')'
        headerRow.appendChild(th)
    })
    let tbody = table.createTBody()
    Object.keys(currentWindTable).reverse().forEach(x => {
        let r = currentWindTable[x]
        let row = tbody.insertRow()
        let td = row.insertCell();
        let input = document.createElement('input')
        input.type = 'number'
        input.value = x
        td.appendChild(input)
        Object.values(r).forEach(i => {
            let td = row.insertCell();
            let input = document.createElement('input')
            input.type = 'number'
            input.value = JSON.stringify(i)
            td.appendChild(input)
        })
    })
    Object.keys(Object.values(currentWindResults)[0]).forEach(x => {
        let row = tbody.insertRow()
        let th = document.createElement('th')
        th.textContent = transformToHeader(x)
        row.appendChild(th)
        Object.keys(currentWindResults).forEach(r => {
            let td = row.insertCell();
            let input = document.createElement('input')
            input.type = 'number'
            input.value = currentWindResults[r][x]
            input.readOnly = true
            input.className = 'read'
            td.appendChild(input)
        })
    })
    windTableElem.appendChild(table)
}

function populateFfdCalcTable (windData, fallAlt, tableResult){
    let k = freefallKElem.value
    if (isNaN(k)) {
        return false
    }
    document.getElementById('ffdk').value = k
    document.getElementById('ffda').value = fallAlt
    document.getElementById('ffdw').value = tableResult.velocity.average
    document.getElementById('ffdm').value = JSON.parse(k) * fallAlt * tableResult.velocity.average
}

function populateFdWindTable (tableData) {
    let fdWind = document.getElementById('fd-wind')
    let dropHeight = document.getElementById('drop-info').value
    let pullHeight = document.getElementById('pull-info').value
    let tableElem = document.getElementById('fd-wind')
    if (isNaN(dropHeight) || isNaN(pullHeight)) {
        return false
    }
    dropHeight = JSON.parse(dropHeight)
    pullHeight = JSON.parse(pullHeight)
    let windData = calcWindAltitudeRangeData(dropHeight, pullHeight)
    if (tableData === undefined) {
        tableData = createWindTable(windData)
    }
    let tableResult = calculateTableResult(tableData)
    let tableHtml = tableToHtml(tableElem, tableData, tableResult, 'WIND DATA FOR FFD')
    populateFfdCalcTable(windData, (dropHeight - pullHeight) / 1000, tableResult)
    fdWind.addEventListener('change', () =>{ console.log('fd table change');populateFdWindTable(objectFromTable(fdWind.children[0]))})
}

function populateCdCalcTable (windData, fallAlt, tableResult){
    let k = canopyKElem.value
    if (isNaN(k)) {
        return false
    }
    document.getElementById('cdk').value = k
    document.getElementById('cda').value = fallAlt
    document.getElementById('cdw').value = tableResult.velocity.average
    document.getElementById('cdm').value = JSON.parse(k) * fallAlt * tableResult.velocity.average
}

function populateCdWindTable (tableData) {
    let cdWind = document.getElementById('cd-wind')
    let pullHeight = document.getElementById('pull-info').value
    let tableElem = document.getElementById('cd-wind')
    if (isNaN(pullHeight)) {
        return false
    }
    pullHeight = JSON.parse(pullHeight)
    let windData = calcWindAltitudeRangeData(pullHeight, 1000)
    if (tableData === undefined) {
        tableData = createWindTable(windData)
    }
    let tableResult = calculateTableResult(tableData)
    let tableHtml = tableToHtml(tableElem, tableData, tableResult, 'WIND DATA FOR CD')
    populateCdCalcTable(windData, pullHeight / 1000, tableResult)
    cdWind.addEventListener('change', () =>{console.log('cd table change'); populateCdWindTable(objectFromTable(cdWind.children[0]))})
}

let windCalcWindData;
let windCalcTableResults;
function populateWindCalcTable (windData, fallAlt, tableResult){
    windCalcWindData = windData
    windCalcTableResults = tableResult
    let k = canopyKElem.value
    let fs = document.getElementById('fsInput').value
    let sf = document.getElementById('sfInput').value
    if (isNaN(k) || isNaN(fs) || isNaN(sf)) {
        return false
    }
    fs = JSON.parse(fs)
    sf = JSON.parse(sf)
    let hcdfsv = fs + tableResult.velocity.average
    let hcdAltSf = fallAlt - sf
    document.getElementById('hcdfsv').value = hcdfsv
    document.getElementById('hcdAltSf').value = hcdAltSf
    document.getElementById('hcdk').value = k
    document.getElementById('hcdnm').value = (hcdfsv * hcdAltSf) / k
}

function populateWindTable (tableData) {
    let windTable = document.getElementById('wind-table')
    let dropHeight = document.getElementById('drop-info').value
    let tableElem = document.getElementById('wind-table')
    if (isNaN(dropHeight)) {
        return false
    }
    let windData = calcWindAltitudeRangeData(JSON.parse(dropHeight), 1000)
    if (tableData === undefined) {
        tableData = createWindTable(windData)
    }
    let tableResult = calculateTableResult(tableData)
    let tableHtml = tableToHtml(tableElem, tableData, tableResult, 'WIND DATA')
    populateWindCalcTable(windData, dropHeight / 1000, tableResult)
    windTable.addEventListener('change', () =>{ console.log('wind table change');populateWindTable(objectFromTable(windTable.children[0]))})
}

function checkIfUpdateWindTableHaho (e) {
    let fs = document.getElementById('fsInput')
    let sf = document.getElementById('sfInput')
    let dropHeight = document.getElementById('drop-info').value
    if (isNaN(dropHeight) || windCalcWindData === undefined || windCalcTableResults === undefined) {
        return false
    }
    if (e === undefined) {
        populateWindCalcTable(windCalcWindData, dropHeight, windCalcTableResults)
        return true
    }
    else if (e.target === fs || e.target === sf) {
        console.log('changed shoudl have triggered')
        populateWindCalcTable(windCalcWindData, dropHeight, windCalcTableResults)
        return true
    }
    else {
        return false
    }
}

function checkWhichTablesToPopulate () {
    let dropHeight = document.getElementById('drop-info').value
    let pullHeight = document.getElementById('pull-info').value
    let freeK = freefallKElem.value
    let canK = canopyKElem.value
    let fs = JSON.parse(document.getElementById('fsInput').value)
    let sf = JSON.parse(document.getElementById('sfInput').value)
    if (isNaN(dropHeight) === false && isNaN(pullHeight) === false) {
        populateFdWindTable()
    }
    if (isNaN(dropHeight) === false) {
        populateWindTable()
    }
    if (isNaN(pullHeight) === false) {
        populateCdWindTable()
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
//         checkIfAllFieldsInputted()
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
// dropHeightElem.onchange = checkIfAllFieldsInputted
time.onchange = (e) => {
    if (currentWeatherData !== undefined) {
//         writeCurrentWeatherData(currentWeatherData)
        handleTimeChange(currentWeatherData)
        checkWhichItemsToUpdate()
    }
//     checkIfAllFieldsInputted()
}

// windDir.onchange = checkIfAllFieldsInputted
// windSpeed.onchange = checkIfAllFieldsInputted


function windTableChanged () {
    let dropHeight = document.getElementById('drop-info').value
    let tableElem = document.getElementById('wind-table')
    if (isNaN(dropHeight)) {
        return false
    }
    let windData = calcWindAltitudeRangeData(JSON.parse(dropHeight), 1000)
    let tableData = createWindTable(windData)
    let tableResult = calculateTableResult(tableData)
    let tableHtml = tableToHtml(tableElem, tableData, tableResult, 'WIND DATA')
    populateWindCalcTable(windData, dropHeight / 1000, tableResult)
}

// windTable.onchange = windTableChanged

function objectFromTable (table) {
    const headers = Array.from(table.querySelectorAll("thead th")).slice(1); // skip first column
    const rows = Array.from(table.querySelectorAll("tbody tr"));
    const tableContent = {};
    rows.forEach(row => {
       const cells = row.querySelectorAll("td");
        if (cells.length <= 2) {
            return false
        }
        let dataObject = {}
        if (isNaN(cells[1].children[0].value) === false && cells[1].children[0].value !== "") {
            dataObject.direction = JSON.parse(cells[1].children[0].value)
        }
        else {
            dataObject.direction = 0
        }
        if (isNaN(cells[2].children[0].value) === false && cells[2].children[0].value !== "") {
            dataObject.velocity = JSON.parse(cells[2].children[0].value)
        }
        else {
            dataObject.velocity = 0
        }
       tableContent[cells[0].children[0].value] = dataObject
    });
    return tableContent
}

function checkIfUpdateWindTables (e) {
    if (e === undefined) {
        checkWhichTablesToPopulate()
        return true
    }
    else if (e.target === dropHeightElem || e.target === pullHeightElem || e.target === latInfo || e.target === longInfo) {
        checkWhichTablesToPopulate()
        return true
    }
    return false
}

let changios;
function checkWhichItemsToUpdate (e) {
    changios = e
    console.log('chagne detected')
    checkIfUpdateDispertionTable(e)
    checkIfCalculateFt(e)
    checkIfUpdateWindTables(e)
    checkIfUpdateWindTableHaho(e)
}

changeInputs.forEach(x => {
    x.onchange = checkWhichItemsToUpdate
})
