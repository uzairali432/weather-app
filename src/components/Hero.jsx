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
import { FiSearch } from 'react-icons/fi';
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

const Hero = () => {
  const [city, setCity] = useState('London');
  const [searchCity, setSearchCity] = useState('London');
  const [coords, setCoords] = useState(null);
  const [useCoords, setUseCoords] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Get user's location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoords({ lat: latitude, lon: longitude });
          setUseCoords(true);
        },
        () => {
          console.log('Geolocation not available, using default city');
        }
      );
    }
  }, []);

  const {
    data: weatherData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
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
    }
  };

  if (isLoading) {
    return (
      <section className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Loading weather data...</p>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="bg-white min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-gray-700 mb-4 text-sm">{error?.message || 'Failed to load weather'}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  if (!weatherData) return null;

  const WeatherIcon = getWeatherIcon(weatherData.weather[0]?.main);
  const temperature = Math.round(weatherData.main.temp);
  const feelsLike = Math.round(weatherData.main.feels_like);
  const humidity = weatherData.main.humidity;
  const pressure = weatherData.main.pressure;
  const windSpeed = weatherData.wind?.speed || 0;
  const description = weatherData.weather[0]?.description || '';
  const currentTime = new Date();
  const timeString = currentTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <section className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Search Bar */}
        <div className="mb-6">
          {showSearch ? (
            <form
              onSubmit={handleSearch}
              className="flex gap-2"
            >
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Search for a city..."
                autoFocus
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <FiSearch className="text-base" />
                Search
              </button>
              <button
                type="button"
                onClick={() => setShowSearch(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
              >
                Cancel
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-normal text-gray-800">
                  {weatherData.name}, {weatherData.sys?.country}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <button
                onClick={() => setShowSearch(true)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Search"
              >
                <FiSearch className="text-xl" />
              </button>
            </div>
          )}
        </div>

        {/* Main Weather Card */}
        <div
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6"
        >
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
            {/* Left: Icon and Temperature */}
            <div className="flex items-center gap-6">
              <div>
                <WeatherIcon className="text-8xl md:text-9xl text-blue-500" />
              </div>
              <div>
                <div className="text-7xl md:text-8xl font-light text-gray-800 leading-none">
                  {temperature}°
                </div>
                <div className="text-lg text-gray-600 mt-2 capitalize">
                  {description}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Feels like {feelsLike}°
                </div>
              </div>
            </div>

            {/* Right: Time */}
            <div className="text-right">
              <div className="text-2xl font-light text-gray-800">
                {timeString}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {currentTime.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Weather Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div
            className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-2">
              <WiHumidity className="text-2xl text-gray-400" />
              <div className="text-xs text-gray-500 uppercase tracking-wide">Humidity</div>
            </div>
            <div className="text-2xl font-light text-gray-800">{humidity}%</div>
          </div>

          <div
            className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-2">
              <WiStrongWind className="text-2xl text-gray-400" />
              <div className="text-xs text-gray-500 uppercase tracking-wide">Wind</div>
            </div>
            <div className="text-2xl font-light text-gray-800">
              {windSpeed.toFixed(1)} m/s
            </div>
          </div>

          <div
            className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-2">
              <WiBarometer className="text-2xl text-gray-400" />
              <div className="text-xs text-gray-500 uppercase tracking-wide">Pressure</div>
            </div>
            <div className="text-2xl font-light text-gray-800">{pressure} hPa</div>
          </div>

          <div
            className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
          >
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Visibility</div>
            <div className="text-2xl font-light text-gray-800">
              {(weatherData.visibility / 1000).toFixed(1)} km
            </div>
          </div>
        </div>

        {/* Temperature Range Card */}
        <div
          className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm"
        >
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-4">Temperature Range</div>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">High</div>
              <div className="text-3xl font-light text-gray-800">
                {Math.round(weatherData.main.temp_max)}°
              </div>
            </div>
            <div className="flex-1 mx-6">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                  style={{
                    width: `${((weatherData.main.temp - weatherData.main.temp_min) / 
                      (weatherData.main.temp_max - weatherData.main.temp_min)) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">Low</div>
              <div className="text-3xl font-light text-gray-800">
                {Math.round(weatherData.main.temp_min)}°
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
