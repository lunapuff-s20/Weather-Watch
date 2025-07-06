const apiKey = "575fcf489cce2ff7e3b873f8eca5c92c";

// Global state
let favorites = JSON.parse(localStorage.getItem('weatherFavorites')) || [];
let currentWeatherData = null;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

function initializeApp() {
  setupEventListeners();
  loadFavorites();
  
  // Check if user has a saved city
  const lastCity = localStorage.getItem('lastSearchedCity');
  if (lastCity) {
    document.getElementById('cityInput').value = lastCity;
    getWeather();
  }
}

function setupEventListeners() {
  // Theme toggle
  const toggle = document.getElementById("themeToggle");
  const modeLabel = document.getElementById("modeLabel");
  
  // Load saved theme
  const savedTheme = localStorage.getItem('weatherAppTheme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
    toggle.checked = true;
    modeLabel.textContent = "☀️ Light";
  }

  toggle.addEventListener("change", function () {
    document.body.classList.toggle("dark");
    
    if (document.body.classList.contains("dark")) {
      modeLabel.textContent = "☀️ Light";
      localStorage.setItem('weatherAppTheme', 'dark');
    } else {
      modeLabel.textContent = "🌙 Dark";
      localStorage.setItem('weatherAppTheme', 'light');
    }
    
    // Add smooth transition effect
    document.body.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
  });

  // Enter key for search
  document.getElementById('cityInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      getWeather();
    }
  });

  // Enhanced input animations
  const cityInput = document.getElementById('cityInput');
  cityInput.addEventListener('focus', function() {
    this.parentElement.classList.add('focused');
  });
  
  cityInput.addEventListener('blur', function() {
    this.parentElement.classList.remove('focused');
  });
}

function showLoading() {
  const spinner = document.getElementById('loadingSpinner');
  spinner.classList.remove('hidden');
  spinner.classList.add('bounce-in');
}

function hideLoading() {
  const spinner = document.getElementById('loadingSpinner');
  spinner.classList.add('hidden');
  spinner.classList.remove('bounce-in');
}

function updateWeatherBackground(weatherCondition) {
  const animation = document.getElementById('weatherAnimation');
  const background = document.querySelector('.weather-background');
  
  // Remove all existing animation classes and raindrops
  animation.className = 'weather-animation';
  animation.innerHTML = '';
  
  if (!weatherCondition) return;
  
  const condition = weatherCondition.toLowerCase();
  
  // Enhanced weather background logic
  if (condition.includes('rain') || condition.includes('drizzle')) {
    animation.classList.add('rain-animation');
    background.style.background = 'linear-gradient(135deg, #4a90e2 0%, #357abd 50%, #1e3c72 100%)';
    
    // Create realistic raindrops
    for (let i = 0; i < 20; i++) {
      const raindrop = document.createElement('div');
      raindrop.className = 'raindrop';
      raindrop.style.left = Math.random() * 100 + '%';
      raindrop.style.animationDuration = (Math.random() * 0.3 + 0.7) + 's';
      raindrop.style.animationDelay = Math.random() * 2 + 's';
      raindrop.style.height = (Math.random() * 40 + 80) + 'px';
      raindrop.style.width = (Math.random() * 1 + 1) + 'px';
      animation.appendChild(raindrop);
    }
  } else if (condition.includes('snow')) {
    animation.classList.add('snow-animation');
    background.style.background = 'linear-gradient(135deg, #e6f3ff 0%, #b3d9ff 50%, #80bfff 100%)';
  } else if (condition.includes('cloud')) {
    animation.classList.add('clouds-animation');
    background.style.background = 'linear-gradient(135deg, #bdc3c7 0%, #95a5a6 50%, #7f8c8d 100%)';
  } else if (condition.includes('clear') || condition.includes('sun')) {
    animation.classList.add('sunny-animation');
    background.style.background = 'linear-gradient(135deg, #ffd89b 0%, #19547b 100%)';
  } else if (condition.includes('thunder') || condition.includes('storm')) {
    animation.classList.add('thunderstorm-animation');
    background.style.background = 'linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #2c3e50 100%)';
  } else if (condition.includes('mist') || condition.includes('fog') || condition.includes('haze')) {
    background.style.background = 'linear-gradient(135deg, #d7d2cc 0%, #304352 100%)';
  }
  
  // Add transition effect
  background.style.transition = 'background 1s ease-in-out';
}

async function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
  if (!city) {
    showNotification("Please enter a city name!", 'warning');
    return;
  }

  showLoading();
  
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.cod !== 200) {
      showError(data.message || "City not found");
      return;
    }

    currentWeatherData = data;
    localStorage.setItem('lastSearchedCity', city);
    
    displayWeather(data);
    updateWeatherBackground(data.weather[0].main);
    getForecast(city);
    
    showNotification(`Weather loaded for ${data.name}`, 'success');
    
  } catch (err) {
    console.error(err);
    showError("Unable to fetch weather data. Please try again.");
  } finally {
    hideLoading();
  }
}

function displayWeather(data) {
  const {
    name,
    sys: { country, sunrise, sunset },
    main: { temp, feels_like, temp_min, temp_max, humidity, pressure },
    weather,
    wind,
    visibility,
    timezone,
  } = data;

  const icon = `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;
  const isFavorite = favorites.some(fav => fav.name === name && fav.country === country);

  const weatherHTML = `
    <div class="weather-header">
      <div class="city-info">
        <h2>${name}, ${country}</h2>
        <div class="weather-main">
          <img src="${icon}" alt="${weather[0].description}" class="weather-icon-large">
          <div>
            <div class="temperature">${Math.round(temp)}°C</div>
            <div class="weather-description">${weather[0].description}</div>
          </div>
        </div>
      </div>
      <button class="add-favorite ${isFavorite ? 'favorited' : ''}" onclick="toggleFavorite()" title="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
        ${isFavorite ? '❤️' : '🤍'}
      </button>
    </div>
    
    <div class="weather-details">
      <div class="detail-item">
        <span class="detail-icon">🌡️</span>
        <div class="detail-label">Feels Like</div>
        <div class="detail-value">${Math.round(feels_like)}°C</div>
      </div>
      
      <div class="detail-item">
        <span class="detail-icon">📊</span>
        <div class="detail-label">Min / Max</div>
        <div class="detail-value">${Math.round(temp_min)}° / ${Math.round(temp_max)}°</div>
      </div>
      
      <div class="detail-item">
        <span class="detail-icon">💧</span>
        <div class="detail-label">Humidity</div>
        <div class="detail-value">${humidity}%</div>
      </div>
      
      <div class="detail-item">
        <span class="detail-icon">🌬️</span>
        <div class="detail-label">Wind Speed</div>
        <div class="detail-value">${wind.speed} m/s</div>
      </div>
      
      <div class="detail-item">
        <span class="detail-icon">👁️</span>
        <div class="detail-label">Visibility</div>
        <div class="detail-value">${(visibility / 1000).toFixed(1)} km</div>
      </div>
      
      <div class="detail-item">
        <span class="detail-icon">📈</span>
        <div class="detail-label">Pressure</div>
        <div class="detail-value">${pressure} hPa</div>
      </div>
      
      <div class="detail-item">
        <span class="detail-icon">🌅</span>
        <div class="detail-label">Sunrise</div>
        <div class="detail-value">${toTime(sunrise, timezone)}</div>
      </div>
      
      <div class="detail-item">
        <span class="detail-icon">🌇</span>
        <div class="detail-label">Sunset</div>
        <div class="detail-value">${toTime(sunset, timezone)}</div>
      </div>
    </div>
  `;

  const weatherResult = document.getElementById("weatherResult");
  weatherResult.innerHTML = weatherHTML;
  weatherResult.classList.remove('hidden');
  weatherResult.classList.add('fade-in');
  
  // Add staggered animation to detail items
  const detailItems = weatherResult.querySelectorAll('.detail-item');
  detailItems.forEach((item, index) => {
    item.style.animationDelay = `${index * 0.1}s`;
  });
}

async function getForecast(city) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.cod !== "200") {
      console.error("Could not load forecast data");
      return;
    }

    displayForecast(data);
    
  } catch (err) {
    console.error("Error loading forecast:", err);
  }
}

function displayForecast(data) {
  const forecastHTML = data.list
    .slice(0, 8) // Show next 24 hours (8 * 3-hour intervals)
    .map((entry, index) => {
      const date = new Date(entry.dt * 1000);
      const time = date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const day = date.toLocaleDateString([], { weekday: 'short' });
      const temp = Math.round(entry.main.temp);
      const icon = `https://openweathermap.org/img/wn/${entry.weather[0].icon}@2x.png`;
      const desc = entry.weather[0].main;

      return `
        <div class="forecast-card" style="animation-delay: ${index * 0.1}s">
          <div class="forecast-time">${day}<br>${time}</div>
          <img src="${icon}" alt="${desc}" class="forecast-icon">
          <div class="forecast-temp">${temp}°C</div>
          <div class="forecast-desc">${desc}</div>
        </div>
      `;
    })
    .join("");

  const forecastContainer = document.getElementById("forecastContainer");
  const forecastSection = document.getElementById("forecastSection");
  
  forecastContainer.innerHTML = forecastHTML;
  forecastSection.classList.remove('hidden');
  forecastSection.classList.add('fade-in');
}

function toggleFavorite() {
  if (!currentWeatherData) return;
  
  const { name, sys: { country }, main: { temp }, weather } = currentWeatherData;
  const cityKey = `${name}-${country}`;
  const existingIndex = favorites.findIndex(fav => `${fav.name}-${fav.country}` === cityKey);
  
  const favoriteButton = document.querySelector('.add-favorite');
  
  if (existingIndex > -1) {
    // Remove from favorites
    favorites.splice(existingIndex, 1);
    favoriteButton.classList.remove('favorited');
    favoriteButton.innerHTML = '🤍';
    favoriteButton.title = 'Add to favorites';
    showNotification(`${name} removed from favorites`, 'success');
  } else {
    // Add to favorites
    const favoriteData = {
      name,
      country,
      temp: Math.round(temp),
      icon: weather[0].icon,
      description: weather[0].description
    };
    favorites.push(favoriteData);
    favoriteButton.classList.add('favorited');
    favoriteButton.innerHTML = '❤️';
    favoriteButton.title = 'Remove from favorites';
    favoriteButton.classList.add('bounce-in');
    showNotification(`${name} added to favorites`, 'success');
    
    // Remove bounce class after animation
    setTimeout(() => {
      favoriteButton.classList.remove('bounce-in');
    }, 600);
  }
  
  localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
  loadFavorites();
}

function toggleFavorites() {
  const panel = document.getElementById('favoritesPanel');
  panel.classList.toggle('hidden');
  
  if (!panel.classList.contains('hidden')) {
    panel.classList.add('slide-in-left');
    loadFavorites();
    
    // Remove animation class after animation completes
    setTimeout(() => {
      panel.classList.remove('slide-in-left');
    }, 500);
  }
}

function loadFavorites() {
  const favoritesList = document.getElementById('favoritesList');
  
  if (favorites.length === 0) {
    favoritesList.innerHTML = '<p style="text-align: center; opacity: 0.7; animation: fadeInUp 0.5s ease-out;">No favorite cities yet. Add some by clicking the heart icon!</p>';
    return;
  }
  
  const favoritesHTML = favorites.map((fav, index) => `
    <div class="favorite-item" onclick="selectFavoriteCity('${fav.name}')" style="animation-delay: ${index * 0.1}s">
      <button class="remove-favorite" onclick="event.stopPropagation(); removeFavorite(${index})" title="Remove from favorites">×</button>
      <div class="favorite-city">${fav.name}, ${fav.country}</div>
      <div class="favorite-temp">${fav.temp}°C • ${fav.description}</div>
    </div>
  `).join('');
  
  favoritesList.innerHTML = favoritesHTML;
}

function selectFavoriteCity(cityName) {
  const cityInput = document.getElementById('cityInput');
  cityInput.value = cityName;
  
  // Add focus animation
  cityInput.classList.add('bounce-in');
  setTimeout(() => {
    cityInput.classList.remove('bounce-in');
  }, 600);
  
  getWeather();
  document.getElementById('favoritesPanel').classList.add('hidden');
}

function removeFavorite(index) {
  const removedCity = favorites[index];
  const favoriteItem = document.querySelectorAll('.favorite-item')[index];
  
  // Add removal animation
  favoriteItem.style.animation = 'slideOutRight 0.3s ease-in forwards';
  
  setTimeout(() => {
    favorites.splice(index, 1);
    localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
    loadFavorites();
    showNotification(`${removedCity.name} removed from favorites`, 'success');
  }, 300);
}

async function getCurrentLocation() {
  if (!navigator.geolocation) {
    showError("Geolocation is not supported by this browser");
    return;
  }

  showLoading();
  showNotification("Getting your location...", 'info');
  
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
      
      try {
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.cod === 200) {
          const cityInput = document.getElementById('cityInput');
          cityInput.value = data.name;
          cityInput.classList.add('bounce-in');
          
          setTimeout(() => {
            cityInput.classList.remove('bounce-in');
          }, 600);
          
          currentWeatherData = data;
          displayWeather(data);
          updateWeatherBackground(data.weather[0].main);
          getForecast(data.name);
          showNotification(`Location found: ${data.name}`, 'success');
        } else {
          showError("Could not get weather for your location");
        }
      } catch (err) {
        showError("Error getting weather for your location");
      } finally {
        hideLoading();
      }
    },
    (error) => {
      hideLoading();
      showError("Could not get your location. Please enter a city manually.");
    },
    {
      timeout: 10000,
      enableHighAccuracy: true
    }
  );
}

function showError(message) {
  showNotification(message, 'error');
}

function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    padding: 1rem 1.5rem;
    border-radius: 15px;
    color: white;
    font-weight: 500;
    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.1);
    transform: translateX(100%);
    transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    max-width: 300px;
    animation: notificationSlideIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  `;
  
  // Set background color based on type
  const colors = {
    success: 'linear-gradient(135deg, #4CAF50, #45a049)',
    error: 'linear-gradient(135deg, #f44336, #d32f2f)',
    warning: 'linear-gradient(135deg, #ff9800, #f57c00)',
    info: 'linear-gradient(135deg, #2196F3, #1976d2)'
  };
  
  notification.style.background = colors[type] || colors.info;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Remove after 4 seconds
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    notification.style.opacity = '0';
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 400);
  }, 4000);
}

// Utility functions
function toTime(unix, timezoneOffset = 0) {
  const date = new Date((unix + timezoneOffset) * 1000);
  return date.toUTCString().slice(-12, -4);
}

// Add slideOutRight animation for favorite removal
const style = document.createElement('style');
style.textContent = `
  @keyframes slideOutRight {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(100px);
    }
  }
`;
document.head.appendChild(style);