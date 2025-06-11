const API_KEY = 'c2367690c029d7ee75b4916b92ad0f54';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/';

async function getWeather() {
    const city = document.getElementById('cityInput').value;
    if (!city) {
        alert('Please enter a city name.');
        return;
    }

    try {
        // Fetch current weather from OpenWeather API
        const weatherResponse = await fetch(`${BASE_URL}weather?q=${city}&appid=${API_KEY}&units=metric`);
        const weatherData = await weatherResponse.json();
        console.log('Actual API response:', weatherData) // log actual response from API to see what data I have to work with
        displayCurrentWeather(weatherData);
    
        // Fetch week forecast
        const forecastResponse = await fetch(`${BASE_URL}forecast?q=${city}&appid=${API_KEY}&units=metric`);
        const forecastData = await forecastResponse.json();
        displayForecast(forecastData);

    } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to fetch weather data.');
    }

}

// Function to display current weather in weather-infoContainer

function displayCurrentWeather(data) {
    const weatherInfo = document.getElementById('weather-info');
    const infoContainer = document.getElementById('weather-infoContainer');

    // Displays current temp in Celsius and city name

    weatherInfo.innerHTML = `
    <h1>${data.main.temp}℃</h1>
    <h2>${data.name}</h2>
    `;

    // Displays detailed variables with labels

    infoContainer.innerHTML = `
    <div class="feels-like">
        <p>Feels Like: ${data.main.feels_like}℃</p>
    </div>
    <div class="humidity">
        <p>Humidity: ${data.main.humidity}%</p>
    </div>
    <div class="wind">
        <p>Wind: ${data.wind.speed}m/s</p>
    </div>
    <div class="precip">
        <p>Precipitation: ${data.rain ? data.rain['1h'] + 'mm' : 'None'}</p>
    </div>
    `;

}
   
function displayForecast(data) {
    const forecastBody = document.getElementById('forecastCards');
    forecastBody.innerHTML = '';

    // Filter daily forecast from 3-hour intervals
    const dailyForecasts = data.list.filter(item => item.dt_txt.includes('12:00:00'));
    dailyForecasts.forEach(forecast => {
        const date = new Date(forecast.dt_txt).toLocaleDateString();
        forecastBody.innerHTML += `
        <p>${date}</p>
        <p>${forecast.main.temp}°C</p>`;

    })
}

document.getElementById('searchButton').addEventListener('click',getWeather);

// msg.textContent = "";
// form.reset();
// input.focus();
