let enterButton = document.getElementById('enter')
let locText = document.getElementById('location-info')
let locDrop = document.getElementById('location-dropdown')
let dropHeightElem = document.getElementById('dropHeight')
let windSpeed = document.getElementById('windSpeed')
let windDir = document.getElementById('windDir')
let resultBox = document.getElementById('resultBox')
// let locationInfo;

enterButton.onclick = function (e) {
    resultBox.textContent = locText.value + locDrop.value + dropHeightElem.value + windSpeed.value + windDir.value
}

// navigator.geolocation.getCurrentPosition((x) => {
//     locationInfo = x
// }, console.log)

//source: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register
if ("serviceWorker" in navigator) {
  // Register a service worker hosted at the root of the
  // site using the default scope.
  navigator.serviceWorker.register("/sw.js").then(
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
