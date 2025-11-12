import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { HashRouter } from 'react-router-dom'
import ReactGA from "react-ga4"; // <--- Import the library

// Initialize with your specific ID
ReactGA.initialize("G-6PVLQEZ9BM"); 

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
)
