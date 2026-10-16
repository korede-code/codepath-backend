# Build a Weather App

Build a real weather app that fetches data from an API.

## What You'll Learn

- Fetching data from APIs
- Handling async operations
- Error handling
- Loading states

## Setup

Get an API key from [OpenWeatherMap](https://openweathermap.org/api).

## HTML Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Weather App</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="app">
        <h1>Weather</h1>
        <div class="search">
            <input type="text" id="cityInput" placeholder="Enter city...">
            <button id="searchBtn">Search</button>
        </div>
        <div id="loading" class="loading hidden">
            <div class="spinner"></div>
        </div>
        <div id="error" class="error hidden"></div>
        <div id="weather" class="weather hidden">
            <h2 id="cityName"></h2>
            <p id="date"></p>
            <div class="main">
                <img id="weatherIcon" src="" alt="">
                <div>
                    <span id="temperature"></span>
                    <span id="description"></span>
                </div>
            </div>
            <div class="details">
                <div>Humidity: <span id="humidity"></span></div>
                <div>Wind: <span id="wind"></span></div>
            </div>
        </div>
    </div>
    <script src="script.js"></script>
</body>
</html>
```

## JavaScript Logic

```javascript
const API_KEY = 'YOUR_API_KEY_HERE';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const weatherEl = document.getElementById('weather');

async function getWeather(city) {
    if (!city.trim()) return showError('Please enter a city name');

    loadingEl.classList.remove('hidden');
    errorEl.classList.add('hidden');
    weatherEl.classList.add('hidden');

    try {
        const url = `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 404) throw new Error('City not found');
            if (response.status === 401) throw new Error('Invalid API key');
            throw new Error('Failed to fetch weather');
        }

        const data = await response.json();
        displayWeather(data);
    } catch (error) {
        showError(error.message);
    } finally {
        loadingEl.classList.add('hidden');
    }
}

function displayWeather(data) {
    document.getElementById('cityName').textContent = `${data.name}, ${data.sys.country}`;
    document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°C`;
    document.getElementById('description').textContent = data.weather[0].description;
    document.getElementById('weatherIcon').src =
        `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;
    document.getElementById('wind').textContent = `${data.wind.speed} m/s`;

    weatherEl.classList.remove('hidden');
}

function showError(message) {
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
    weatherEl.classList.add('hidden');
}

searchBtn.addEventListener('click', () => getWeather(cityInput.value));
cityInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') getWeather(cityInput.value);
});

// Load default city
getWeather('London');
```

## What You've Learned

- Async/await and Promises
- Fetch API and HTTP requests
- Error handling
- Loading states
- DOM manipulation
- Responsive design