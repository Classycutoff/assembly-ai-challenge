import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AudioInterface from './components/AudioInterface';
import About from './components/About';
import Header from './components/Header';

function App() {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    // Check localStorage, but default to true if not set
    const storedDarkMode = localStorage.getItem('darkMode');
    const isDarkMode = storedDarkMode === null ? true : storedDarkMode === 'true';
    setDarkMode(isDarkMode);
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
    document.documentElement.classList.toggle('dark', newDarkMode);
  };

  return (
    <Router>
      <div className={`min-h-screen bg-background text-foreground ${darkMode ? 'dark' : ''}`}>
        <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<AudioInterface />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;