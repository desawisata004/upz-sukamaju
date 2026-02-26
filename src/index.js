import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/common/ErrorBoundary';
import { isFirebaseReady, initializationError } from './services/firebase';
import './styles/globals.css';

// Cek Firebase initialization
if (!isFirebaseReady()) {
  console.error('❌ Firebase failed to initialize:', initializationError);
}

// Register service worker untuk PWA
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(error => {
      console.error('Error registering service worker:', error);
    });
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);