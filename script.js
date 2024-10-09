const celsiusButton = document.getElementById('celsiusButton');
const fahrenheitButton = document.getElementById('fahrenheitButton');

let currentTempC = null;
let currentCity = '';

window.onload = function() {
    const preloader = document.getElementById("preloader");
    preloader.style.opacity = "1";
    getUserLocation();
};

function selectButton(buttonToSelect, buttonToDeselect) {
    buttonToSelect.classList.add('selected');
    buttonToDeselect.classList.remove('selected');
}

const apiKey = '91f9967b3e24e3585f4b4ecf58337b5f';
const apiKeyGeocoding = '2e3ed5909c0d454a9f3040cd826089ee';

function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error, { timeout: 10000 });
    } else {
        console.log("Geolocalização não é suportada por este navegador.");
        hidePreloader();
    }
}

function success(position) {
    const { latitude, longitude } = position.coords;
    getCityFromCoordinates(latitude, longitude);
}

function error(err) {
    console.error(`Erro ao obter a localização: ${err.message}`);
    hidePreloader();
}

async function getCityFromCoordinates(lat, lon) {
    const geocodingApiUrl = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${apiKeyGeocoding}`;
    try {
        const response = await fetch(geocodingApiUrl);
        const data = await response.json();
        if (data.results && data.results.length > 0) {
            currentCity = data.results[0].components.city || data.results[0].components.town || data.results[0].components.village;
            if (currentCity) fetchWeather(currentCity);
        }
    } catch (error) {
        console.error('Erro ao buscar dados de geocodificação:', error);
    }
}

async function fetchWeather(city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        if (data.cod === 200) {
            currentTempC = data.main.temp;
            const precipitation = data.weather[0].main === "Rain" ? "Sim" : "Não";
            const humidity = data.main.humidity;
            const windSpeed = data.wind.speed;
            const weatherDescription = data.weather[0].description;
            updateWeatherDisplay(currentTempC, precipitation, humidity, windSpeed, weatherDescription);
        } else {
            console.error(`Erro ao buscar dados do clima: ${data.message}`);
        }
    } catch (error) {
        console.error('Erro ao buscar dados do clima:', error);
    }
}

function getCurrentDateTime() {
    const now = new Date();
    return now.toLocaleString('pt-BR', { weekday: 'long', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Sao_Paulo' });
}

function updateWeatherDisplay(tempC, precipitation, humidity, windSpeed, weatherDescription) {
    const cityElement = document.getElementById('cityName');
    cityElement.innerHTML = `${currentCity}<br/>${getCurrentDateTime()}<br/>${weatherDescription}`;
    document.getElementById('numberWeather').innerHTML = `${Math.round(tempC)}º`;
    document.getElementById('precipitation').innerHTML = `${precipitation}`;
    document.getElementById('humidity').innerHTML = `${humidity}%`;
    document.getElementById('windSpeed').innerHTML = `${(windSpeed * 3.6).toFixed(1)} km/h`;

    const circleWeather = document.querySelector('.circleWeather');
    if (tempC < 17) {
        document.body.style.backgroundColor = '#34ace0';
        circleWeather.style.backgroundImage = "url('https://cdn.pixabay.com/animation/2023/02/15/02/31/02-31-39-143_512.gif')";
        circleWeather.style.backgroundSize = 'cover'; 
        circleWeather.style.backgroundPosition = 'center';
    } else {
        document.body.style.backgroundColor = '';
        circleWeather.style.backgroundImage = "url('https://www.mundoconectado.com.br/wp-content/uploads/2021/11/this-stunning-4k-timelapse-of-the-is-sun-made-from-78846-nasa-photos-1.jpg')";
        circleWeather.style.backgroundSize = 'cover'; 
        circleWeather.style.backgroundPosition = 'center';
    }

    hidePreloader();
}

function hidePreloader() {
    const preloader = document.getElementById("preloader");
    preloader.style.opacity = "0";
    setTimeout(() => {
        preloader.style.display = "none";
        document.getElementById("content").style.display = "block";
    }, 1000);
}

function isMobile() {
    return /Mobi|Android/i.test(navigator.userAgent);
}

celsiusButton.addEventListener('click', () => {
    selectButton(celsiusButton, fahrenheitButton);
    document.getElementById('numberWeather').innerHTML = `${Math.round(currentTempC)}º`;
});

fahrenheitButton.addEventListener('click', () => {
    selectButton(fahrenheitButton, celsiusButton);
    const tempF = (currentTempC * 9 / 5) + 32;
    document.getElementById('numberWeather').innerHTML = `${Math.round(tempF)}º`;
});
