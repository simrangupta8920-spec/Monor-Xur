import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker for offline patient data and daily plan access
if ('serviceWorker' in navigator) {
  const updateSW = registerSW({
    onNeedRefresh() {
      console.log('Monor Xur: New version available. Refreshing service worker...');
      updateSW(true);
    },
    onOfflineReady() {
      console.log('Monor Xur: Service worker active. Core patient data and daily plan ready for offline use.');
    },
    onRegisterError(error) {
      console.warn('Monor Xur: Service worker registration error:', error);
    },
  });
}

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

