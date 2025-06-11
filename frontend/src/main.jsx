import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';      // you can leave this even if it's empty for now
import App from './App';   // ensure the path matches: './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

