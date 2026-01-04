import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  WiDaySunny,
  WiCloudy,
  WiRain,
  WiSnow,
  WiThunderstorm,
  WiFog,
  WiDayHaze,
  WiStrongWind,
  WiHumidity,
  WiBarometer,
} from 'react-icons/wi';
import { FiSearch, FiX } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import { getCurrentWeather, getWeatherByCoords } from '../services/weatherApi';

const getWeatherIcon = (weatherMain) => {
  const iconMap = {
    Clear: WiDaySunny,
    Clouds: WiCloudy,
    Rain: WiRain,
    Drizzle: WiRain,
    Thunderstorm: WiThunderstorm,
    Snow: WiSnow,
    Mist: WiFog,
    Fog: WiFog,
    Haze: WiDayHaze,
  };
  return iconMap[weatherMain] || WiDaySunny;
};

const Hero = ({ showSearch: showSearchProp, onSearchClose }) => {
  const [city, setCity] = useState('London');
  const [searchCity, setSearchCity] = useState('London');
  const [coords, setCoords] = useState(null);
  const [useCoords, setUseCoords] = useState(false);
  const [showSearch, setShowSearch] = useState(showSearchProp || false);

  // Sync with prop changes
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
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full border-2 border-blue-500 dark:border-blue-400 border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Loading weather data...</p>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 to-white dark:from-gray-900 dark:to-gray-800 px-4">
        <div className="text-center max-w-md">
          <p className="text-gray-700 dark:text-gray-300 mb-4">{error?.message || 'Failed to load weather'}</p>
          <button
            onClick={refetch}
            className="px-6 py-2 rounded-full bg-blue-500 dark:bg-blue-600 text-white shadow hover:shadow-lg transition"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  if (!data) return null;

  const WeatherIcon = getWeatherIcon(data.weather[0]?.main);
  const temperature = Math.round(data.main.temp);
  const feelsLike = Math.round(data.main.feels_like);
  const currentTime = new Date();

  return (
    <section className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-sky-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl sm:text-4xl font-normal text-gray-900 dark:text-white tracking-tight">
              {data.name}, {data.sys?.country}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="mb-8">
            <form onSubmit={handleSearch} className="flex gap-3">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Search for a city..."
                autoFocus
                className="flex-1 px-5 py-3 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-full bg-blue-500 dark:bg-blue-600 text-white shadow hover:shadow-lg transition flex items-center gap-2"
              >
                <FiSearch />
                Search
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSearch(false);
                  if (onSearchClose) onSearchClose();
                }}
                className="px-4 py-3 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                <FiX />
              </button>
            </form>
          </div>
        )}

        {/* Main Weather Card */}
        <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl rounded-[32px] shadow-xl dark:shadow-2xl p-8 sm:p-10 mb-8 overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
          {/* Ambient Glow */}
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-sky-300/30 dark:bg-blue-500/20 rounded-full blur-3xl"></div>

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Left: Icon and Temperature */}
            <div className="flex items-center gap-6">
              <WeatherIcon className="text-[100px] sm:text-[120px] text-blue-500 dark:text-blue-400 drop-shadow-sm" />
              <div>
                <div className="text-[80px] sm:text-[100px] font-extralight leading-none text-gray-900 dark:text-white">
                  {temperature}°
                </div>
                <p className="capitalize text-lg text-gray-600 dark:text-gray-300 tracking-wide">
                  {data.weather[0]?.description}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Feels like {feelsLike}°
                </p>
              </div>
            </div>

            {/* Right: Time */}
            <div className="text-right">
              <p className="text-2xl font-light text-gray-800 dark:text-gray-200">
                {currentTime.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {currentTime.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Weather Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 mb-8">
          {[
            {
              icon: WiHumidity,
              label: 'Humidity',
              value: `${data.main.humidity}%`,
            },
            {
              icon: WiStrongWind,
              label: 'Wind',
              value: `${(data.wind?.speed || 0).toFixed(1)} m/s`,
            },
            {
              icon: WiBarometer,
              label: 'Pressure',
              value: `${data.main.pressure} hPa`,
            },
            {
              icon: null,
              label: 'Visibility',
              value: `${((data.visibility || 0) / 1000).toFixed(1)} km`,
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-2xl p-5 shadow-md dark:shadow-lg hover:shadow-lg dark:hover:shadow-xl transition border border-gray-200/50 dark:border-gray-700/50"
            >
              <div className="flex items-center gap-3 text-gray-400 dark:text-gray-500 mb-2">
                {item.icon && (
                  <item.icon className="text-2xl text-gray-500 dark:text-gray-400" />
                )}
                <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {item.label}
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-extralight text-gray-800 dark:text-white">
                {item.value}
              </div>
            </div>
          ))}
        </div>

        {/* Temperature Range Card */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-2xl p-6 shadow-md dark:shadow-lg border border-gray-200/50 dark:border-gray-700/50">
          <p className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-4 tracking-wide">
            Temperature Range
          </p>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">High</p>
              <p className="text-3xl font-light text-gray-800 dark:text-white">
                {Math.round(data.main.temp_max)}°
              </p>
            </div>

            <div className="flex-1 h-2.5 bg-gray-200/70 dark:bg-gray-700/70 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 dark:from-blue-500 dark:via-blue-600 dark:to-indigo-600"
                style={{
                  width: `${
                    ((data.main.temp - data.main.temp_min) /
                      (data.main.temp_max - data.main.temp_min)) *
                    100
                  }%`,
                }}
              />
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Low</p>
              <p className="text-3xl font-light text-gray-800 dark:text-white">
                {Math.round(data.main.temp_min)}°
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
