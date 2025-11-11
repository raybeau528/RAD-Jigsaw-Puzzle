import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
// Remove any './index.css' if you deleted the file, or keep it if you have it.
import { BrowserRouter } from 'react-router-dom' // <--- 1. Add Import

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 2. Wrap App with BrowserRouter */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)