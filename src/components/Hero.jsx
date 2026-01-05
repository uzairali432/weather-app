import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCurrentWeather, getWeatherByCoords } from '../services/weatherApi';

const getWeatherEmoji = (weatherMain, isDay = true) => {
  const iconMap = {
    Clear: isDay ? '☀️' : '🌙',
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
          <div className="h-10 w-10 rounded-full border-2 border-[#1a73e8] border-t-transparent animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-light">Loading weather data...</p>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-[#f8f9fa] dark:bg-[#202124] px-4">
        <div className="text-center max-w-md">
          <p className="text-gray-700 dark:text-gray-300 mb-4 font-light">{error?.message || 'Failed to load weather'}</p>
          <button
            onClick={refetch}
            className="px-5 py-2 rounded-full bg-[#1a73e8] text-white text-sm font-medium hover:bg-[#1557b0] transition-colors"
          >
            Retry
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
    <section className="min-h-screen bg-[#f8f9fa] dark:bg-[#202124] transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-6 py-6">
        {showSearch && (
          <div className="mb-6">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Search for a city..."
                autoFocus
                className="flex-1 px-4 py-2.5 rounded-lg bg-white dark:bg-[#303134] border border-gray-300 dark:border-[#5f6368] text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-[#1a73e8] dark:focus:border-[#8ab4f8] text-sm"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-[#1a73e8] text-white text-sm font-medium hover:bg-[#1557b0] transition-colors"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSearch(false);
                  if (onSearchClose) onSearchClose();
                }}
                className="px-4 py-2.5 rounded-lg bg-white dark:bg-[#303134] border border-gray-300 dark:border-[#5f6368] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#3c4043] transition-colors text-sm"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-2xl font-light text-gray-800 dark:text-gray-100">
            {data.name}, {data.sys?.country}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-light mt-0.5">
            {currentTime.toLocaleDateString('en-US', {
              weekday: 'long',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </p>
        </div>

        <div className="bg-white dark:bg-[#303134] rounded-2xl shadow-sm p-6 mb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="text-7xl">{weatherEmoji}</div>
              <div>
                <div className="text-6xl font-light text-gray-900 dark:text-gray-100">
                  {temperature}°
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize mt-1 font-light">
                  {data.weather[0]?.description}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm text-gray-600 dark:text-gray-400 font-light">H: {Math.round(data.main.temp_max)}°</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 font-light">L: {Math.round(data.main.temp_min)}°</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[
            {
              emoji: '💧',
              label: 'Humidity',
              value: `${data.main.humidity}%`,
            },
            {
              emoji: '💨',
              label: 'Wind',
              value: `${(data.wind?.speed || 0).toFixed(1)} m/s`,
            },
            {
              emoji: '🌡️',
              label: 'Feels like',
              value: `${feelsLike}°`,
            },
            {
              emoji: '👁️',
              label: 'Visibility',
              value: `${((data.visibility || 0) / 1000).toFixed(1)} km`,
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white dark:bg-[#303134] rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{item.emoji}</span>
                <span className="text-xs text-gray-600 dark:text-gray-400 font-light">
                  {item.label}
                </span>
              </div>
              <div className="text-xl font-light text-gray-900 dark:text-gray-100">
                {item.value}
              </div>
            </div>
          ))}
        </div>

        {sunrise && sunset && (
          <div className="bg-white dark:bg-[#303134] rounded-xl shadow-sm p-5">
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🌅</span>
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 font-light mb-1">Sunrise</div>
                  <div className="text-lg font-light text-gray-900 dark:text-gray-100">
                    {sunrise.toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-3xl">🌇</span>
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 font-light mb-1">Sunset</div>
                  <div className="text-lg font-light text-gray-900 dark:text-gray-100">
                    {sunset.toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Hero;
