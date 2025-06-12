const API_KEY = 'b2976c8fa1d94b7782433911251206';
const BASE_URL = 'https://api.weatherapi.com/v1';

// Cache to store recent weather data
const weatherCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; //5 mins

//Helper fn to get cached weather data

function getCachedWeather(city) {
    const cacheKey = city.toLowerCase();
    const cached = weatherCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log(`Using cached data for ${city}`)
        return cached.data;
    }
    return null;
}

//Helper fn to cache weather data

function cacheWeatherData(city, data) {
    const cacheKey = city.toLowerCase();
    weatherCache.set(cacheKey, {
        data,
        timestamp: Date.now()
    });
}

//Updated async fn with proper error handling, performance optimisations

async function getWeather() {
    const city = document.getElementById('cityInput').value;
    if (!city) {
        alert('Please enter a city name.');
        return;
    }

    showLoadingState();

    try {
        //Check cache first
        const cachedData = getCachedWeather(city);
        if (cachedData) {
            displayCurrentWeather({
                current: cachedData.current.current,
                location: cachedData.current.location
            });

            // displayCurrentWeather(cachedData.current);
            displayForecast(cachedData.forecast);
            hideLoadingState();
            return;
        }

        console.log(`Fetching fresh data for ${city}`);
        const startTime = performance.now();


        // Fetch current weather from Weather API
        const currentUrl = `${BASE_URL}/current.json?key=${API_KEY}&q=${encodeURIComponent(city)}`;
        const forecastUrl = `${BASE_URL}/forecast.json?key=${API_KEY}&q=${encodeURIComponent(city)}&days=7`;
        
        //Make request for current/forecast in parallel instead of sequential
        const [currentResponse, forecastResponse] = await Promise.all([
            fetch(currentUrl),
            fetch(forecastUrl)
        ]);
        
        //Check if both requests successful
        if (!currentResponse.ok) {
            throw new Error(`Current weather API error: ${currentResponse.status} ${currentResponse.statusText}`);
        }
        if (!forecastResponse.ok) {
            throw new Error(`Forecast API error: ${forecastResponse.status} ${forecastResponse.statusText}`);
        }

        //Parse JSON responses in parallel
        const [currentData, forecastData] = await Promise.all([
            currentResponse.json(),
            forecastResponse.json()
        ]);

        const totalTime = performance.now() - startTime;
        console.log(`API calls completed in ${totalTime.toFixed(2)}ms`);

        //Cache the combined data
        cacheWeatherData(city, {
            current: currentData,
            forecast: forecastData
        });

        //Display the data
        displayCurrentWeather({
            current: currentData.current,
            location: currentData.location
        })
        displayForecast(forecastData);
        
        
        // console.log('Actual API response:', weatherData) 
        // displayCurrentWeather(weatherData);
    
        // Fetch week forecast
        // const forecastResponse = await fetch(`${BASE_URL}forecast?q=${city}&appid=${API_KEY}&units=metric`);
        // const forecastData = await forecastResponse.json();
        // displayForecast(forecastData);

    } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to fetch weather data.');

        //More specific error messages
        if (error.message.includes('404')) {
            alert('City not found. Check spelling and try again.');
        } else if (error.message.includes('401')) {
            alert('API key error. Please check your API configuration');
        } else if (error.message.includes('Failed to fetch')) {
            alert('Network error. Please check your internet connection');
        } else {
            alert('Failed to fetch weather data. Please try again.');
        }
    } finally {
        hideLoadingState();
    }

}

//Fn to display current weather (updated for WeatherAPI response structure)
function displayCurrentWeather(data) {
    console.log('displayCurrentWeather received:', data);
    console.log('current data:', data.current);
    console.log('location data:', data.location);
    

    const weatherInfo = document.getElementById('weather-info');
    const infoContainer = document.getElementById('weather-infoContainer');

    // Extract the current and location data
    const current = data.current;
    const location = data.location;

    weatherInfo.innerHTML = `
    <h1>${Math.round(current.temp_c)}℃</h1>
    <h2>${location.name}</h2>
    <p>${current.condition.text}</p>
    `;

    infoContainer.innerHTML = `
     <div class="feels-like">
         <p>Feels Like: ${Math.round(current.feelslike_c)}℃</p>
     </div>
     <div class="humidity">
         <p>Humidity: ${current.humidity}%</p>
     </div>
     <div class="wind">
         <p>Wind: ${current.wind_kph} km/h</p>
     </div>
     <div class="precip">
         <p>Precipitation: ${current.precip_mm || 0}mm</p>
     </div>
    `;
}

 function displayForecast(data) {
     const forecastBody = document.getElementById('forecastCards');
     forecastBody.innerHTML = '';

     //WeatherAPI forecast structure
     if (data.forecast && data.forecast.forecastday) {
        data.forecast.forecastday.forEach(day => {
            const date = new Date(day.date).toLocaleDateString('en-US', {
                weekday: 'short',
            });

            const forecastCard = document.createElement('div');
            forecastCard.className = 'cardDay';
            forecastCard.innerHTML = `
                <p>${date}</p>
                <i></i>
                <p class="tempForecast">${Math.round(day.day.maxtemp_c)}°/${Math.round(day.day.mintemp_c)}°</p>
            `;
            // `
            // <div class="forecast-date">${date}</div>
            // <div class="forecast-temp">
            //     <span class="temp-high">${Math.round(day.day.maxtemp_c)}°</span>
            //     <span class="temp-low">${Math.round(day.day.mintemp_c)}°</span>
            // <div class="forecast-condition">${day.day.condition.text}</div>
            // <div class="forecast-rain">${day.day.daily_chance_of_rain}% rain</div>
            // `;

            forecastBody.appendChild(forecastCard);
        });
     }  else {
        console.log('Forecast data structure:', data);
     }
}

function showLoadingState() {
    const searchButton = document.getElementById('searchButton');
    const weatherInfo = document.getElementById('weather-info');

    if (searchButton) {
        searchButton.disabled = true;
        searchButton.textContent = 'Loading...';
    }

    if(weatherInfo) {
        weatherInfo.innerHTML = '<p>⏳Loading weather data...</p>'
    }
}


function hideLoadingState() {
    const searchButton = document.getElementById('searchButton');

    if (searchButton) {
        searchButton.disabled = false;
        searchButton.textContent = 'Search';
    }
}

//Event listener with Enter key support
document.addEventListener('DOMContentLoaded', function(){
    const searchButton = document.getElementById('searchButton');
    const cityInput = document.getElementById('cityInput');

    if (searchButton) {
        searchButton.addEventListener('click', getWeather);
    }

    if (cityInput) {
        cityInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                getWeather();
            }
        });

        //Focus on input when page loads
        cityInput.focus();
    }
});

function clearWeatherCache() {
    weatherCache.clear();
    console.log('Weather cache cleared');
}





// Function to display current weather in weather-infoContainer

// function displayCurrentWeather(data) {
//     const weatherInfo = document.getElementById('weather-info');
//     const infoContainer = document.getElementById('weather-infoContainer');

//     Displays current temp in Celsius and city name

//     weatherInfo.innerHTML = `
//     <h1>${data.main.temp}℃</h1>
//     <h2>${data.name}</h2>
//     `;

//     Displays detailed variables with labels

//     infoContainer.innerHTML = `
//     <div class="feels-like">
//         <p>Feels Like: ${data.main.feels_like}℃</p>
//     </div>
//     <div class="humidity">
//         <p>Humidity: ${data.main.humidity}%</p>
//     </div>
//     <div class="wind">
//         <p>Wind: ${data.wind.speed}m/s</p>
//     </div>
//     <div class="precip">
//         <p>Precipitation: ${data.rain ? data.rain['1h'] + 'mm' : 'None'}</p>
//     </div>
//     `;

// }
   
// function displayForecast(data) {
//     const forecastBody = document.getElementById('forecastCards');
//     forecastBody.innerHTML = '';

//     Filter daily forecast from 3-hour intervals
//     const dailyForecasts = data.list.filter(item => item.dt_txt.includes('12:00:00'));
//     dailyForecasts.forEach(forecast => {
//         const date = new Date(forecast.dt_txt).toLocaleDateString();
//         forecastBody.innerHTML += `
//         <p>${date}</p>
//         <p>${forecast.main.temp}°C</p>`;

//     })
// }

// document.getElementById('searchButton').addEventListener('click',getWeather);

// msg.textContent = "";
// form.reset();
// input.focus();
