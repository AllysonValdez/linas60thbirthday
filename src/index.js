import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// This is the "spark" that starts the React engine.
// It finds the 'root' div in your HTML and injects the App logic into it.
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
