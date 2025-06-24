import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import { LearningSessionProvider } from './contexts/LearningSessionContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <LearningSessionProvider>
        <App />
      </LearningSessionProvider>
    </ThemeProvider>
  </React.StrictMode>
); 