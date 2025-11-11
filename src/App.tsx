import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Game from './Game';
import About from './About';     // Ensure you created this file earlier
import Privacy from './Privacy'; // Ensure you created this file earlier

function App() {
  return (
    <Routes>
      {/* The Home Page ("/") loads the Game */}
      <Route path="/" element={<Game />} />
      
      {/* The About Page */}
      <Route path="/about" element={<About />} />
      
      {/* The Privacy Page */}
      <Route path="/privacy" element={<Privacy />} />
    </Routes>
  );
}

export default App;