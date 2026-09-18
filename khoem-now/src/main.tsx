import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { LanguageProvider } from './i18n/LanguageContext';
import './index.css';

window.onerror = (message, source, lineno, colno, error) => {
  document.body.innerHTML =
    '<pre style="color:#fff;background:#900;padding:16px;white-space:pre-wrap;font-size:12px;">' +
    'ERROR: ' + String(message) + '\n' +
    'AT: ' + String(source) + ':' + lineno + ':' + colno + '\n' +
    (error && error.stack ? String(error.stack) : '') +
    '</pre>';
};
window.addEventListener('unhandledrejection', (e) => {
  document.body.innerHTML =
    '<pre style="color:#fff;background:#900;padding:16px;white-space:pre-wrap;font-size:12px;">' +
    'UNHANDLED PROMISE REJECTION: ' + String(e.reason) +
    '</pre>';
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>,
);
