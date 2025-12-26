
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

/**
 * Theme initializer
 * - reads localStorage.theme ('dark' or 'light')
 * - if 'dark', adds `dark` class to <html>
 * - if 'light', makes sure it's not present
 *
 * This lets you toggle theme by adding/removing `document.documentElement.classList`.
 */
function initTheme() {
  try {
    const saved = localStorage.getItem('theme'); // expected 'dark' | 'light' | null
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (saved === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // If you prefer to default to dark uncomment the next line:
      // document.documentElement.classList.add('dark');
    }
  } catch (e) {
    // ignore failures (e.g., SSR or restricted storage)
    console.warn('Theme init failed', e);
  }
}

initTheme();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
