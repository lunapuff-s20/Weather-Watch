const apiKey = "575fcf489cce2ff7e3b873f8eca5c92c"; 

function kelvinToCelsius(k) {
  return (k - 273.15).toFixed(1);
}

function toTime(unix, timezoneOffset = 0) {
  const date = new Date((unix + timezoneOffset) * 1000);
  return date.toUTCString().slice(-12, -4);
}

async function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
  if (!city) return alert("Enter a city name!");

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.cod !== 200) {
      document.getElementById(
        "weatherResult"
      ).innerHTML = `<p>${data.message}</p>`;
      return;
    }

    const {
      name,
      sys: { country, sunrise, sunset },
      main: {
        temp,
        feels_like,
        temp_min,
        temp_max,
        humidity,
        pressure,
        sea_level,
        grnd_level,
      },
      weather,
      wind,
      visibility,
      timezone,
    } = data;

    const icon = `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;

    document.getElementById("weatherResult").innerHTML = `
      <h2 style="text-align: center; margin-bottom: 0">${name}, ${country}</h2>
      <div style="height: 80px; text-align: center; margin: 0"><img style="size: cover; " src="${icon}" alt="${
      weather[0].description
    }"></div>
      <p style="text-align: center; margin-top: 0; margin-bottom: 12px; font-size: 16px; font-weight: bold">${weather[0].main} (${weather[0].description})</p>
      <p>🌡️ Temp: ${temp}°C (Feels like: ${feels_like}°C)</p>
      <p>📉 Min: ${temp_min}°C | 📈 Max: ${temp_max}°C</p>
      <p>💧 Humidity: ${humidity}%</p>
      <p>🌅 Sunrise: ${toTime(sunrise, timezone)} | 🌇 Sunset: ${toTime(
      sunset,
      timezone
    )}</p>
      <p>👁️ Visibility: ${visibility / 1000} km</p>
      
    `;
    document.getElementById("weatherResult").style.display = "block";

  } catch (err) {
    console.error(err);
    document.getElementById("weatherResult").innerHTML =
      "<p>Unable to fetch weather data.</p>";
    }
    getForecast(city);

}

async function getForecast(city) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.cod !== "200") {
      document.getElementById("forecastContainer").innerHTML =
        "<p>Could not load forecast data.</p>";
      return;
    }

    const forecastHTML = data.list
      .slice(0, 6)
      .map((entry) => {
        const time = new Date(entry.dt * 1000).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        const temp = entry.main.temp.toFixed(1);
        const icon = `https://openweathermap.org/img/wn/${entry.weather[0].icon}@2x.png`;
        const desc = entry.weather[0].main;

        return `
          <div class="forecast-card">
            <p>${time}</p>
            <img src="${icon}" alt="${desc}">
            <p style="font-size: 18px">${temp}°C</p>
            <p style="margin-top: 16px">${desc}</p>
          </div>
        `;
      })
      .join("");

    document.getElementById("forecast").style.display = "block";
    document.getElementById("forecastContainer").innerHTML = forecastHTML;
  } catch (err) {
    console.error(err);
    document.getElementById("forecastContainer").innerHTML =
      "<p>Error loading forecast.</p>";
  }
}

// Trigger search on Enter key
document.getElementById("cityInput").addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    getWeather();
  }
});
window.onload = () => document.getElementById("cityInput").focus();
