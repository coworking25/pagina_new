import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global handler to capture unhandled promise rejections.
// DevTools standalone/extension sometimes emits a benign error:
// "A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received"
// This originates from the browser extension messaging layer and does not indicate a problem in our app.
// We log other unhandled rejections normally so real issues are still visible.
window.addEventListener('unhandledrejection', (event) => {
  try {
    const reason = (event && (event.reason)) as any;
    const message = reason && (reason.message || String(reason));
    if (typeof message === 'string' && message.includes('A listener indicated an asynchronous response by returning true')) {
      // benign DevTools/extension messaging error — log as warning and prevent default noisy console
      // preventDefault is supported in modern browsers for unhandledrejection
      console.warn('Ignored DevTools messaging race error:', message);
      if (typeof event.preventDefault === 'function') event.preventDefault();
      return;
    }
  } catch (err) {
    // fallthrough to default logging below
  }

  // For any other unhandled rejection, keep the default behaviour but add a helpful log
  console.error('Unhandled promise rejection detected:', event.reason);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
