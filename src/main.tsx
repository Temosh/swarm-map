import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  // Temporarily disabled React.StrictMode to prevent duplicate API calls in development.
  // Re-enable for production builds to catch potential side effects.
  // <StrictMode>
    <App />
  // </StrictMode>,
)
