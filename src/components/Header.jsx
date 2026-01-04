import { WiDaySunny } from 'react-icons/wi';
import { FiSearch, FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

const Header = ({ onSearchClick }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/60 dark:border-gray-700/60 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-400/20 dark:bg-blue-500/30 blur-xl rounded-full"></div>
                <div className="relative p-2.5 bg-gradient-to-br from-blue-50 to-sky-100 dark:from-blue-900/30 dark:to-sky-800/30 rounded-2xl shadow-inner border border-blue-100/50 dark:border-blue-800/30">
                  <WiDaySunny className="text-3xl text-blue-500 dark:text-blue-400" />
                </div>
              </div>
              <div className="leading-tight">
                <h1 className="text-lg font-medium text-gray-900 dark:text-white tracking-tight">
                  Weather
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 tracking-wide">
                  Live Forecast
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={onSearchClick}
                className="group p-2.5 rounded-full bg-white dark:bg-gray-800 shadow-sm hover:shadow-md dark:shadow-gray-900/50 transition-all duration-300 border border-gray-200 dark:border-gray-700"
                aria-label="Search"
              >
                <FiSearch className="text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition" />
              </button>
              <button
                onClick={toggleTheme}
                className="group p-2.5 rounded-full bg-white dark:bg-gray-800 shadow-sm hover:shadow-md dark:shadow-gray-900/50 transition-all duration-300 border border-gray-200 dark:border-gray-700"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <FiMoon className="text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition" />
                ) : (
                  <FiSun className="text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-gray-300/40 dark:via-gray-600/40 to-transparent" />
    </header>
  );
};

export default Header;
