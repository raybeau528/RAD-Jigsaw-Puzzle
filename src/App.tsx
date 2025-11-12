import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4'; 
import Game from './Game';
import About from './About';
import Privacy from './Privacy';

function App() {
  const location = useLocation();

  useEffect(() => {
    // This tells Google whenever the user switches pages
    ReactGA.send({ hitType: "pageview", page: location.pathname + location.hash });
  }, [location]);

  return (
    <Routes>
      <Route path="/" element={<Game />} />
      <Route path="/about" element={<About />} />
      <Route path="/privacy" element={<Privacy />} />
    </Routes>
  );
}

export default App;