const celsiusButton = document.getElementById('celsiusButton');
const fahrenheitButton = document.getElementById('fahrenheitButton');

// Armazenar a temperatura atual em Celsius
let currentTempC = null; 

// Função para selecionar um botão e deselecionar o outro
function selectButton(buttonToSelect, buttonToDeselect) {
    buttonToSelect.classList.add('selected');
    buttonToDeselect.classList.remove('selected');
}

// Chave da API e URL
const apiKey = '91f9967b3e24e3585f4b4ecf58337b5f'; // Substitua pela sua chave de API
const apiKeyGeocoding = '2e3ed5909c0d454a9f3040cd826089ee'; // Substitua pela sua chave da OpenCage

// Função para obter a localização do usuário
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error, { timeout: 10000 });
    } else {
        console.log("Geolocalização não é suportada por este navegador.");
    }
}

// Função de sucesso
function success(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    getCityFromCoordinates(latitude, longitude);
}

// Função de erro
function error(err) {
    console.error(`Erro ao obter a localização: ${err.message}`);
}

// Função para obter a cidade a partir das coordenadas
async function getCityFromCoordinates(lat, lon) {
    const geocodingApiUrl = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${apiKeyGeocoding}`;

    try {
        const response = await fetch(geocodingApiUrl);
        const data = await response.json();
        if (data.results && data.results.length > 0) {
            const city = data.results[0].components.city || data.results[0].components.town || data.results[0].components.village;
            if (city) {
                console.log(`Cidade encontrada: ${city}`);
                fetchWeather(city); // Chama a função fetchWeather com a cidade encontrada
            } else {
                console.log("Cidade não encontrada.");
            }
        }
    } catch (error) {
        console.error('Erro ao buscar dados de geocodificação:', error);
    }
}

// Função para buscar os dados do clima
async function fetchWeather(city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        // Verifica se a resposta contém dados válidos
        if (data.cod === 200) {
            // Extraindo os dados do JSON retornado pela API
            currentTempC = data.main.temp; // Temperatura em Celsius
            const precipitation = data.weather[0].main === "Rain" ? "Sim" : "Não"; // Exemplo para precipitação
            const humidity = data.main.humidity; // Umidade em %
            const windSpeed = data.wind.speed; // Velocidade do vento em m/s
            const weatherDescription = data.weather[0].description; // Descrição do clima

            // Atualizando os elementos da página com os dados obtidos
            updateWeatherDisplay(currentTempC, precipitation, humidity, windSpeed, weatherDescription);
        } else {
            console.error(`Erro ao buscar dados do clima: ${data.message}`);
        }
    } catch (error) {
        console.error('Erro ao buscar dados do clima:', error);
    }
}

// Função para obter e formatar a data atual
function getCurrentDateTime() {
    const now = new Date();
    const options = { weekday: 'long', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Sao_Paulo' };
    const formattedDate = now.toLocaleString('pt-BR', options);
    return `${formattedDate}`;
}

// Atualiza a exibição de dados do clima
function updateWeatherDisplay(tempC, precipitation, humidity, windSpeed, weatherDescription) {
    const city = document.getElementById('cityName'); // Elemento para exibir a cidade
    city.innerHTML = `São Bernardo<br/>${getCurrentDateTime()}<br/>${weatherDescription}`; // Atualiza a descrição

    document.getElementById('numberWeather').innerHTML = `${Math.round(tempC)}º`;
    document.getElementById('precipitation').innerHTML = `${precipitation}`;
    document.getElementById('humidity').innerHTML = `${humidity}%`;
    document.getElementById('windSpeed').innerHTML = `${(windSpeed * 3.6).toFixed(1)} km/h`; // Convertendo de m/s para km/h
    
    // Atualiza a cor do círculo e o fundo com base na temperatura
    const circleWeather = document.querySelector('.circleWeather');
    if (tempC < 20) {
        document.body.style.backgroundColor = '#34ace0'; // Cor para temperaturas abaixo de 20 graus
        circleWeather.style.backgroundImage = "url('https://cdn.pixabay.com/animation/2023/02/15/02/31/02-31-39-143_512.gif')"; // Imagem de fundo para temperaturas frias
        circleWeather.style.backgroundSize = 'cover'; // Faz a imagem cobrir todo o círculo
        circleWeather.style.backgroundPosition = 'center'; // Centraliza a imagem
    } else {
        document.body.style.backgroundColor = ''; // Reseta a cor de fundo
        circleWeather.style.backgroundImage = "url('https://cdn.pixabay.com/animation/2022/11/28/18/39/18-39-14-149_512.gif')"; // Imagem padrão ou nenhuma imagem
    }
}

// Chama a função ao carregar a página
getUserLocation();

// Lógica para alternar entre Celsius e Fahrenheit
celsiusButton.addEventListener('click', () => {
    selectButton(celsiusButton, fahrenheitButton);
    document.getElementById('numberWeather').innerHTML = `${Math.round(currentTempC)}º`; // Mostra a temperatura em Celsius
});

fahrenheitButton.addEventListener('click', () => {
    selectButton(fahrenheitButton, celsiusButton);
    const tempF = (currentTempC * 9 / 5) + 32; // Conversão para Fahrenheit
    document.getElementById('numberWeather').innerHTML = `${Math.round(tempF)}º`; // Mostra a temperatura em Fahrenheit
});
