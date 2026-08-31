import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';
import { DataProvider } from './context/DataContext.jsx';

const updateSW = registerSW({
  onNeedRefresh() {
    // Force the app to update and reload automatically when a new version is detected
    updateSW(true);
  },
  onOfflineReady() {},
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <LanguageProvider>
        <DataProvider>
          <App />
        </DataProvider>
      </LanguageProvider>
    </AuthProvider>
  </React.StrictMode>
);
