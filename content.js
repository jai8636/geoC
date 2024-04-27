let lat = 999;
let long = 999;
let coordInfo = '';
let strCoord = null;

var s = document.createElement('script');
s.src = chrome.runtime.getURL('xhr_inject.js');
s.onload = function () {
    this.remove();
};
(document.head || document.documentElement).appendChild(s);

function convertToMinutes(decimal) {
    return Math.floor(decimal * 60);
}

function convertToSeconds(decimal) {
    return (decimal * 3600 % 60).toFixed(1);
}

function getLatDirection(lat) {
    return lat >= 0 ? "N" : "S";
}

function getLongDirection(long) {
    return long >= 0 ? "E" : "W";
}

window.addEventListener('message', async function (e) {
    const msg = e.data.data;
    if (msg) {
        try {
            const arr = JSON.parse(msg);
            lat = arr[1][0][5][0][1][0][2];
            long = arr[1][0][5][0][1][0][3];
            strCoord = null;
        } catch {
            return;
        }
    }
});
function convertCoords(lat, long) {
    var latResult, longResult, dmsResult;
    latResult = Math.abs(lat);
    longResult = Math.abs(long);
    dmsResult = Math.floor(latResult) + "°" + convertToMinutes(latResult % 1) + "'" + convertToSeconds(latResult % 1) + '"' + getLatDirection(lat);
    dmsResult += "+" + Math.floor(longResult) + "°" + convertToMinutes(longResult % 1) + "'" + convertToSeconds(longResult % 1) + '"' + getLongDirection(long);
    return dmsResult;
}

async function getCoordInfo() {
    if (strCoord !== null) {
        return strCoord;
    }

    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${long}&format=json`);

        if (!response.ok) {
            return;
        }

        const data = await response.json();
        strCoord = data.display_name;
        return strCoord;
    } catch {
        return;
    }
}

window.addEventListener('load', async function () {
    let element = document.querySelector('[class^="styles_columnTwo"]');

    while (!element) {
        await new Promise(resolve => setTimeout(resolve, 500));
        element = document.querySelector('[class^="styles_columnTwo"]');
    }

    if (element) {
        element.innerHTML += `<div class="styles_control__Pa4Ta"><span class="tooltip_reference__CwDbn"><img id="tellLocation" style="width:24px;height:24px; background: #c6c6c6; filter: invert(1);" class="styles_hudButton__kzfFK styles_sizeSmall__O7Bw_ styles_roundBoth__hcuEN" data-qa="set-checkpoint" src='${chrome.runtime.getURL('assets/view.png')}' style="color: transparent;"></button><div class="tooltip_tooltip__3D6bz tooltip_right__wLi_G tooltip_roundnessXS__BGhWu tooltip_hideOnXs__S3erz" style="top: 50%; transform: translateY(-50%) scale(0); opacity: 0; visibility: hidden;">Alert Position<div class="tooltip_arrow__LJ1of"></div></div></span></div>`;
        element.innerHTML += `<div class="styles_control__Pa4Ta"><span class="tooltip_reference__CwDbn"><img id="showLocation" style="width:24px;height:24px; background: #c6c6c6; filter: invert(1);" class="styles_hudButton__kzfFK styles_sizeSmall__O7Bw_ styles_roundBoth__hcuEN" data-qa="set-checkpoint" src='${chrome.runtime.getURL('assets/pin.png')}' style="color: transparent;"></button><div class="tooltip_tooltip__3D6bz tooltip_right__wLi_G tooltip_roundnessXS__BGhWu tooltip_hideOnXs__S3erz" style="top: 50%; transform: translateY(-50%) scale(0); opacity: 0; visibility: hidden;">Show Position<div class="tooltip_arrow__LJ1of"></div></div></span></div>`;
    }

    document.getElementById('tellLocation').addEventListener('click', async function (e) {
        e.preventDefault();
        tellLocation();
    });

    document.getElementById('showLocation').addEventListener('click', async function (e) {
        e.preventDefault();
        showLocation();
    });
});


document.addEventListener('keydown', async function (event) {
    if (lat == 999 && long == 999) return;
    if (event.ctrlKey && event.code === 'Space') {
        showLocation();
    }
    if (event.ctrlKey && event.shiftKey) {
        alert(await getCoordInfo());
    }
});

async function tellLocation() {
    alert(await getCoordInfo());
}

async function showLocation() {
    window.open(`https://www.google.be/maps/search/${convertCoords(lat, long)}`);
}
