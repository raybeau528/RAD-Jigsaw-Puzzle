import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
// 1. Change this import
import { HashRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 2. Change this tag */}
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
)