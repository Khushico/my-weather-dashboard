import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './App.css';

function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(false);

  const API_KEY = import.meta.env.VITE_API_KEY;

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!API_KEY) {
      setError('API key not found. Please check your .env file.');
      return;
    }
    fetchWeather(city);
    fetchForecast(city);
    updateHistory(city);
  };

  const fetchWeather = async (city) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      const data = await response.json();
      if (data.cod === 200) {
        setWeather(data);
        setError('');
      } else {
        setError(data.message || 'City not found.');
        setWeather(null);
      }
    } catch (err) {
      setError('Failed to fetch weather.');
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchForecast = async (city) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
      );
      const data = await response.json();
      if (data.cod === '200') {
        const filteredForecast = data.list.filter((item, index) => index % 8 === 0);
        setForecast(filteredForecast);
      } else {
        setForecast([]);
      }
    } catch (err) {
      setForecast([]);
    }
  };

  const updateHistory = (newCity) => {
    let updated = [newCity, ...history.filter((c) => c !== newCity)];
    updated = updated.slice(0, 5);
    setHistory(updated);
    localStorage.setItem('weatherHistory', JSON.stringify(updated));
  };

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('weatherHistory')) || [];
    setHistory(stored);
  }, []);

  const handleLocationWeather = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
          );
          const data = await response.json();
          if (data.cod === 200) {
            setWeather(data);
            setCity(data.name);
            setError('');
          } else {
            setError(data.message || 'Location not found.');
            setWeather(null);
          }
        } catch (err) {
          setError('Failed to fetch location weather.');
          setWeather(null);
        }
      });
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  };

  const handleHistoryClick = (selectedCity) => {
    setCity(selectedCity);
    fetchWeather(selectedCity);
    fetchForecast(selectedCity);
  };

  return (
    <div className={`app-container ${theme}`}>
      <div className="header">
        <h1>Weather Dashboard ☁️</h1>
        <button onClick={toggleTheme} className="theme-toggle">
          {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          placeholder="Enter your city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <div className={`form-buttons ${weather ? 'inline-buttons' : ''}`}>
          <button type="submit">Get Weather</button>
          <button type="button" onClick={() => window.location.reload()}>🔁 Refresh</button>
          <button type="button" onClick={handleLocationWeather}>📍 Use My Location</button>
        </div>
      </form>

      {loading && <div className="loader">Loading...</div>}
      {error && <p className="error">{error}</p>}

      {weather && (
        <motion.div
          className="weather-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2>{weather.name}, {weather.sys.country}</h2>
          <p>{weather.main.temp} °C</p>
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: [0, -10, 0, -5, 0] }}
            transition={{ duration: 1 }}
          >
            <img
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}.png`}
              alt="current weather"
            />
          </motion.div>
          <p>{weather.weather[0].main}</p>
        </motion.div>
      )}

      {forecast.length > 0 && (
        <motion.div
          className="forecast"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          <h3>5-Day Forecast</h3>
          <div className="forecast-cards">
            {forecast.map((item, index) => (
              <motion.div
                key={item.dt_txt}
                className="forecast-card"
                whileHover={{ scale: 1.05 }}
              >
                <p>{new Date(item.dt_txt).toLocaleDateString()}</p>
                <p>{item.main.temp} °C</p>
                <motion.div
                  key={item.weather[0].icon}
                  initial={{ y: 0 }}
                  animate={{ y: [0, -10, 0, -5, 0] }}
                  transition={{ duration: 1 }}
                >
                  <img
                    src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
                    alt="forecast icon"
                  />
                </motion.div>
                <p>{item.weather[0].main}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {history.length > 0 && (
        <div className="recent-history">
          <h3>Recent Searches:</h3>
          <div className="history-buttons">
            {history.map((c, i) => (
              <button key={i} onClick={() => handleHistoryClick(c)}>
                {c}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
