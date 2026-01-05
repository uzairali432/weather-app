import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCurrentWeather, getWeatherByCoords } from '../services/weatherApi';

const getWeatherEmoji = (weatherMain) => {
  const iconMap = {
    Clear: '☀️',
    Clouds: '☁️',
    Rain: '🌧️',
    Drizzle: '🌦️',
    Thunderstorm: '⛈️',
    Snow: '❄️',
    Mist: '🌫️',
    Fog: '🌫️',
    Haze: '🌫️',
  };
  return iconMap[weatherMain] || '☀️';
};

const StatCard = ({ icon, label, value, unit }) => {
  return (
    <div className="stat-badge group">
      <span className="text-2xl group-hover:scale-110 transition-transform">{icon}</span>
      <div className="text-center">
        <p className="text-xs text-gray-600 dark:text-gray-400 font-light uppercase tracking-wide">
          {label}
        </p>
        <p className="text-lg font-light text-gray-900 dark:text-gray-100 mt-1">
          {value}<span className="text-sm text-gray-500 dark:text-gray-400 ml-1">{unit}</span>
        </p>
      </div>
    </div>
  );
};

const Hero = ({ showSearch: showSearchProp, onSearchClose }) => {
  const [city, setCity] = useState('London');
  const [searchCity, setSearchCity] = useState('London');
  const [coords, setCoords] = useState(null);
  const [useCoords, setUseCoords] = useState(false);
  const [showSearch, setShowSearch] = useState(showSearchProp || false);

  useEffect(() => {
    if (showSearchProp !== undefined) {
      setShowSearch(showSearchProp);
    }
  }, [showSearchProp]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
          setUseCoords(true);
        },
        () => {}
      );
    }
  }, []);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['weather', searchCity, coords, useCoords],
    queryFn: async () => {
      if (useCoords && coords && searchCity === 'London') {
        return await getWeatherByCoords(coords.lat, coords.lon);
      }
      return await getCurrentWeather(searchCity);
    },
    enabled: !!searchCity || !!coords,
    retry: 1,
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (city.trim()) {
      setSearchCity(city.trim());
      setUseCoords(false);
      setShowSearch(false);
      if (onSearchClose) onSearchClose();
    }
  };

  if (isLoading) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-[#f8f9fa] dark:bg-[#202124]">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-3 border-[#1a73e8] border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-light">Loading weather data...</p>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-[#f8f9fa] dark:bg-[#202124] px-4">
        <div className="text-center max-w-md">
          <p className="text-gray-700 dark:text-gray-300 mb-6 font-light">{error?.message || 'Failed to load weather'}</p>
          <button
            onClick={refetch}
            className="px-6 py-3 rounded-full bg-[#1a73e8] text-white text-sm font-medium hover:bg-[#1557b0] transition-colors"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  if (!data) return null;

  const weatherEmoji = getWeatherEmoji(data.weather[0]?.main);
  const temperature = Math.round(data.main.temp);
  const feelsLike = Math.round(data.main.feels_like);
  const currentTime = new Date();
  const sunrise = data.sys?.sunrise ? new Date(data.sys.sunrise * 1000) : null;
  const sunset = data.sys?.sunset ? new Date(data.sys.sunset * 1000) : null;

  return (
    <section className="min-h-screen bg-[#f8f9fa] dark:bg-[#202124] transition-colors duration-300 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {showSearch && (
          <div className="mb-8 slide-up">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Search for a city..."
                autoFocus
                className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-[#303134] border border-gray-300 dark:border-[#5f6368] text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-[#1a73e8] dark:focus:border-[#8ab4f8] text-sm"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-[#1a73e8] text-white text-sm font-medium hover:bg-[#1557b0] transition-colors"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSearch(false);
                  if (onSearchClose) onSearchClose();
                }}
                className="px-4 py-3 rounded-xl bg-white dark:bg-[#303134] border border-gray-300 dark:border-[#5f6368] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#3c4043] transition-colors text-sm"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        <div className="fade-in">
          <div className="mb-2">
            <h2 className="text-3xl font-light text-gray-900 dark:text-gray-100">
              {data.name}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-light mt-1">
              {currentTime.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })} at {currentTime.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            {/* Main Weather Card */}
            <div className="lg:col-span-2 weather-card p-8 sm:p-10 slide-up">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-light uppercase tracking-wide mb-3">
                    Current Weather
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-8xl font-light text-gray-900 dark:text-gray-100">
                      {temperature}
                    </span>
                    <span className="text-3xl text-gray-500 dark:text-gray-400">°C</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 capitalize mt-3 font-light text-lg">
                    {data.weather[0]?.description}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-light">
                    Feels like {feelsLike}°C
                  </p>
                </div>
                <div className="text-9xl animate-bounce" style={{ animationDuration: '2.5s' }}>
                  {weatherEmoji}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-8 border-t border-gray-200 dark:border-[#3c4043]">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-light uppercase tracking-wide mb-2">
                    High
                  </p>
                  <p className="text-3xl font-light text-gray-900 dark:text-gray-100">
                    {Math.round(data.main.temp_max)}°
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-light uppercase tracking-wide mb-2">
                    Low
                  </p>
                  <p className="text-3xl font-light text-gray-900 dark:text-gray-100">
                    {Math.round(data.main.temp_min)}°
                  </p>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-1 flex flex-col gap-6 slide-up" style={{ animationDelay: '0.1s' }}>
              {/* Humidity Card */}
              <div className="weather-card p-6">
                <p className="text-xs text-gray-600 dark:text-gray-400 font-light uppercase tracking-wide mb-3">
                  Humidity
                </p>
                <div className="flex items-center gap-4">
                  <span className="text-4xl">💧</span>
                  <div>
                    <p className="text-3xl font-light text-gray-900 dark:text-gray-100">
                      {data.main.humidity}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Wind Card */}
              <div className="weather-card p-6">
                <p className="text-xs text-gray-600 dark:text-gray-400 font-light uppercase tracking-wide mb-3">
                  Wind Speed
                </p>
                <div className="flex items-center gap-4">
                  <span className="text-4xl">💨</span>
                  <div>
                    <p className="text-3xl font-light text-gray-900 dark:text-gray-100">
                      {(data.wind?.speed || 0).toFixed(1)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">m/s</p>
                  </div>
                </div>
              </div>

              {/* Visibility Card */}
              <div className="weather-card p-6">
                <p className="text-xs text-gray-600 dark:text-gray-400 font-light uppercase tracking-wide mb-3">
                  Visibility
                </p>
                <div className="flex items-center gap-4">
                  <span className="text-4xl">👁️</span>
                  <div>
                    <p className="text-3xl font-light text-gray-900 dark:text-gray-100">
                      {((data.visibility || 0) / 1000).toFixed(1)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">km</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-8">
            <StatCard icon="🌡️" label="Pressure" value={data.main.pressure} unit="hPa" />
            <StatCard icon="💨" label="Feels Like" value={feelsLike} unit="°C" />
            <StatCard icon="☁️" label="Cloud Coverage" value={data.clouds?.all || 0} unit="%" />
            <StatCard icon="💧" label="Dew Point" value={Math.round(data.main.temp - (9/5 * (100 - data.main.humidity) / 100))} unit="°C" />
            {data.rain && <StatCard icon="🌧️" label="Rain (1h)" value={(data.rain['1h'] || 0).toFixed(1)} unit="mm" />}
            {data.uvi && <StatCard icon="☀️" label="UV Index" value={Math.round(data.uvi)} unit="" />}
          </div>

          {/* Sunrise/Sunset Section */}
          {sunrise && sunset && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="weather-card p-6">
                <div className="flex items-center gap-4">
                  <span className="text-5xl">🌅</span>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-light uppercase tracking-wide mb-2">
                      Sunrise
                    </p>
                    <p className="text-3xl font-light text-gray-900 dark:text-gray-100">
                      {sunrise.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="weather-card p-6">
                <div className="flex items-center gap-4">
                  <span className="text-5xl">🌇</span>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-light uppercase tracking-wide mb-2">
                      Sunset
                    </p>
                    <p className="text-3xl font-light text-gray-900 dark:text-gray-100">
                      {sunset.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;
