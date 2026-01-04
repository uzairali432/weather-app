import { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import Hero from './components/Hero';
import './App.css';

function App() {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Header onSearchClick={() => setShowSearch(!showSearch)} />
        <Hero showSearch={showSearch} onSearchClose={() => setShowSearch(false)} />
      </div>
    </ThemeProvider>
  );
}

export default App;

