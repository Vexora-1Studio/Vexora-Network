import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initStorageProtection } from './utils/safeStorage';

// Activate global storage protection to prevent QuotaExceededError crashes
initStorageProtection();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
