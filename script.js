const API_KEY = 'c2367690c029d7ee75b4916b92ad0f54';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

async function getWeather() {
    const city = document.getElementById('cityInput').value;
    if (!city) {
        alert('Please enter a city name.');
        return;
    }

    try {
        // Fetch current weather from OpenWeather API
        const weatherResponse = await fetch(`${ BASE_URL}weather?q=${city}&appid=${API_KEY}&units=metric`);
        const weatherData = await weatherResponse.json();
        displayCurrentWeather(weatherData);
    
        // Fetch week forecast
        const forecastResponse = await fetch(`${ BASE_URL}forecast?q=${city}&appid=${API_KEY}&units=metric`);
        const forecastData = await forecastResponse.json();
        displayForecast(forecastData);

    } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to fetch weather data.');
    }

}

function displayCurrentWeather(data) {
    const weatherInfo = document.getElementById('weather-info');
    weatherInfo.innerHTML = `
    <h1>${data.main.temp}</h1>
    <h2>${data.location}</h2>
    `;
}

function displayForecast(data) {
    const forecastBody = document.getElementById('weeklyForecastContainer');
    forecastBody.innerHTML = '';

    // Filter daily forecast from 3-hour intervals
    const dailyForecasts = data.list.filter(item => item.dt_txt.includes('12:00:00'));
    dailyForecasts.forEach(forecast => {
        const date = new Date(forecast.dt_txt).toLocaleDateString();
        forecastBody.innerHTML += `
        <p>${date}</p>
        <p>${forecast.main.temp}°C</p>
        `;

    })
}

msg.textContent = "";
form.reset();
input.focus();
